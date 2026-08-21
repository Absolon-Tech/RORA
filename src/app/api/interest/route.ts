import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Waitlist signups.
 *
 * Three destinations, attempted independently so one outage never blocks another:
 *  - Google Sheet (via an Apps Script webhook) — the real record of truth in production.
 *  - Owner notification email — to NOTIFY_TO, reply-to set to the signer so the owner can just hit reply.
 *  - Customer confirmation email — to the signer, confirming they're on the list.
 *
 * `toDisk` is a local-dev convenience only: Vercel's serverless filesystem is read-only outside
 * /tmp and nothing written there survives past the request, so it is not a substitute for the
 * sheet in production. Never bake real signup data into a committed file — see .gitignore.
 */

type Entry = {
  name: string;
  email: string;
  phone: string;
  favorite: string;
  notes: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s()\-.]{5,}$/;

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/* In-memory speed bump. Per instance, resets on deploy — enough to stop hammering, not a full
 * shield (Vercel runs many concurrent instances). Good enough for a pre-launch waitlist. */
const HITS = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (HITS.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  HITS.set(ip, recent);
  if (HITS.size > 5000) for (const [k, v] of HITS) if (!v.some((t) => now - t < 60_000)) HITS.delete(k);
  return recent.length > 5;
}

async function toDisk(payload: unknown) {
  try {
    const dir = path.join(process.cwd(), 'data');
    await fs.mkdir(dir, { recursive: true });
    await fs.appendFile(path.join(dir, 'interest.jsonl'), `${JSON.stringify(payload)}\n`, 'utf8');
  } catch (err) {
    console.error('[interest] disk write failed:', err);
  }
}

async function toSheet(e: Entry, when: Date) {
  const hook = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!hook) return false;
  try {
    const res = await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.SHEET_SECRET || undefined,
        row: [when.toISOString(), e.name, e.email, e.phone || '', e.favorite || '', e.notes || ''],
        headers: ['Timestamp', 'Name', 'Email', 'Phone', 'Favorite Piece', 'Notes'],
      }),
      // Never let a slow Apps Script hold the visitor's request open — but give it room for a
      // cold start, which can take several seconds.
      signal: AbortSignal.timeout(15000),
    });
    // Apps Script web apps always answer HTTP 200, even on internal error — the real result is in
    // the JSON body's "ok" field (see scripts/waitlist-sheet-webhook.gs).
    const data = await res.json().catch(() => null);
    return res.ok && data?.ok === true;
  } catch (err) {
    console.error('[interest] sheet failed:', err);
    return false;
  }
}

function transport() {
  const { SMTP_HOST: host, SMTP_USER: user, SMTP_PASS: pass } = process.env;
  if (!host || !user || !pass) return null;
  const port = Number(process.env.SMTP_PORT ?? 465);
  return { host, port, user, pass };
}

async function notifyOwner(e: Entry, when: Date) {
  const cfg = transport();
  if (!cfg) return false;
  try {
    const nodemailer = (await import('nodemailer')).default;
    const rows: Array<[string, string]> = [
      ['Name', e.name],
      ['Email', e.email],
      ['Phone', e.phone || '—'],
      ['Favorite piece', e.favorite || '—'],
      ['Notes', e.notes || '—'],
      ['When', when.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })],
    ];
    const info = await nodemailer
      .createTransport({ host: cfg.host, port: cfg.port, secure: cfg.port === 465, auth: { user: cfg.user, pass: cfg.pass } })
      .sendMail({
        from: `"RORA" <${cfg.user}>`,
        to: process.env.NOTIFY_TO || cfg.user,
        replyTo: e.email,
        subject: `New waitlist signup — ${e.name}`,
        text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
      });
    console.log('[interest] owner mail sent:', { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected, response: info.response });
    return info.rejected.length === 0;
  } catch (err) {
    console.error('[interest] owner mail failed:', err);
    return false;
  }
}

async function notifyCustomer(e: Entry) {
  const cfg = transport();
  if (!cfg) return false;
  try {
    const nodemailer = (await import('nodemailer')).default;
    const first = e.name.split(' ')[0];
    const info = await nodemailer
      .createTransport({ host: cfg.host, port: cfg.port, secure: cfg.port === 465, auth: { user: cfg.user, pass: cfg.pass } })
      .sendMail({
        from: `"RORA" <${cfg.user}>`,
        to: e.email,
        replyTo: process.env.NOTIFY_TO || cfg.user,
        subject: "You're on the list — RORA",
        text: [
          `Hi ${first},`,
          '',
          "You're on the RORA waitlist. We'll send you a reminder the moment we open the doors on 30 August, so you can place your order — plus early access to the first collection.",
          '',
          e.favorite ? `We've noted you're excited about: ${e.favorite}.` : '',
          '',
          'Structured · Bold · Yours',
          'RORA',
        ].filter(Boolean).join('\n'),
      });
    console.log('[interest] customer mail sent:', { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected, response: info.response });
    return info.rejected.length === 0;
  } catch (err) {
    console.error('[interest] customer mail failed:', err);
    return false;
  }
}

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') || 'unknown';

  if (limited(ip)) {
    return NextResponse.json({ error: 'Too many attempts. Please wait a moment.' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; }
  catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }

  // Honeypot: answer exactly like a success so bots learn nothing. Logged (not silent) so a
  // legitimate visitor's browser autofill tripping this is diagnosable rather than invisible.
  const honeypot = str(body.company, 80);
  if (honeypot) {
    console.warn('[interest] honeypot tripped, request short-circuited:', { ip, value: honeypot });
    return NextResponse.json({ ok: true });
  }

  const name = str(body.name, 80);
  const email = str(body.email, 160);
  const phone = str(body.phone, 24);
  const favorite = str(body.favorite, 80);
  const notes = str(body.notes, 500);
  const consent = body.consent === true;

  if (name.length < 2) return NextResponse.json({ error: 'A name, however short.' }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'That address does not look right.' }, { status: 400 });
  if (phone && !PHONE_RE.test(phone)) return NextResponse.json({ error: 'That phone number does not look right.' }, { status: 400 });
  if (!consent) return NextResponse.json({ error: 'Please confirm you want to hear from us.' }, { status: 400 });

  const entry: Entry = { name, email, phone, favorite, notes };
  const when = new Date();

  await toDisk({ ...entry, ip, at: when.toISOString() });
  const [sheet, ownerMail, customerMail] = await Promise.all([
    toSheet(entry, when),
    notifyOwner(entry, when),
    notifyCustomer(entry),
  ]);

  // Sheet or owner-mail failures are ours to fix later (both are logged server-side); the visitor
  // is confirmed either way. But if we couldn't even confirm the address is real for THEM, surface
  // it so they know to try again rather than believing they're on the list when they're not.
  return NextResponse.json({ ok: true, delivered: { sheet, ownerMail, customerMail } });
}

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Access requests.
 *
 * Written to disk FIRST, before either integration is attempted. Google Sheets and SMTP are both
 * external and both can be down or misconfigured; losing a real person's details is a far worse
 * outcome than a duplicate row.
 */

type Entry = {
  name: string; email: string; whatsapp: string; city: string;
  size: string; age?: string; pieces: string[];
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s()\-.]{6,}$/;

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/* In-memory speed bump. Per instance, resets on deploy — enough to stop hammering. */
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
        row: [when.toISOString(), e.name, e.email, e.whatsapp, e.city, e.size, e.age ?? '', e.pieces.join(', ')],
        headers: ['Timestamp', 'Name', 'Email', 'WhatsApp', 'City', 'Size', 'Age', 'Pieces'],
      }),
      // Never let a slow Apps Script hold the visitor's request open.
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch (err) {
    console.error('[interest] sheet failed:', err);
    return false;
  }
}

async function notify(e: Entry, when: Date) {
  const { SMTP_HOST: host, SMTP_USER: user, SMTP_PASS: pass } = process.env;
  if (!host || !user || !pass) return false;
  try {
    // Imported lazily so an unconfigured deployment never pays to load it.
    const nodemailer = (await import('nodemailer')).default;
    const port = Number(process.env.SMTP_PORT ?? 465);
    const rows: Array<[string, string]> = [
      ['Name', e.name], ['Email', e.email], ['WhatsApp', e.whatsapp],
      ['City', e.city], ['Size', e.size], ['Age', e.age || '—'],
      ['Pieces', e.pieces.length ? e.pieces.join(', ') : '—'],
      ['When', when.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })],
    ];
    await nodemailer
      .createTransport({ host, port, secure: port === 465, auth: { user, pass } })
      .sendMail({
        from: `"RORA" <${user}>`,
        to: process.env.NOTIFY_TO || user,
        replyTo: e.email,
        subject: `Access request — ${e.name}`,
        text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
      });
    return true;
  } catch (err) {
    console.error('[interest] mail failed:', err);
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

  // Honeypot: answer exactly like a success so bots learn nothing.
  if (str(body.company, 80)) return NextResponse.json({ ok: true });

  const name = str(body.name, 80);
  const email = str(body.email, 160);
  const whatsapp = str(body.whatsapp, 24);
  const city = str(body.city, 80);
  const size = str(body.size, 24);
  const age = str(body.age, 4);

  if (name.length < 2) return NextResponse.json({ error: 'A name, however short.' }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'That address does not look right.' }, { status: 400 });
  if (!PHONE_RE.test(whatsapp)) return NextResponse.json({ error: 'A number we can actually reach.' }, { status: 400 });
  if (age) {
    const n = Number(age);
    if (!Number.isInteger(n) || n < 13 || n > 110) {
      return NextResponse.json({ error: 'That age does not look right.' }, { status: 400 });
    }
  }

  const pieces = Array.isArray(body.pieces)
    ? (body.pieces as unknown[]).slice(0, 30).map((p) => str(p, 80)).filter(Boolean)
    : [];

  const entry: Entry = { name, email, whatsapp, city, size, age: age || undefined, pieces };
  const when = new Date();

  await toDisk({ ...entry, ip, at: when.toISOString() });
  const [sheet, mail] = await Promise.all([toSheet(entry, when), notify(entry, when)]);

  // Safely on disk either way, so the visitor is confirmed. Surfacing an integration outage to a
  // customer would only lose the request.
  return NextResponse.json({ ok: true, delivered: { sheet, mail } });
}

'use client';

import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SIZES, type Piece } from '@/lib/content';

/**
 * The request.
 *
 * Asked one question at a time, at display size, the way a person would ask it — not a stack of
 * labelled boxes. Enter moves you on. Nothing is ever more than one thought.
 *
 * Every question earns its place: a name to address them by, an email and a number to reach them
 * on, a city because the run ships nationwide and we need to know where, and a size because the
 * first run is cut in small numbers and this is what decides the ratios. Age sits beside size on
 * the same step so it costs no extra beat.
 */

type StepKey = 'name' | 'email' | 'whatsapp' | 'city' | 'fit' | 'review';

type Form = {
  name: string;
  email: string;
  whatsapp: string;
  city: string;
  size: string;
  age: string;
};

const STEPS: Array<{ key: StepKey; numeral: string; ask: string; hint?: string }> = [
  { key: 'name', numeral: 'I', ask: 'First — what should we call you?' },
  { key: 'email', numeral: 'II', ask: 'Where should the first look arrive?', hint: 'One message when the run opens. Nothing else.' },
  { key: 'whatsapp', numeral: 'III', ask: 'And a number, for the early word.', hint: 'WhatsApp. Only if something is genuinely worth telling you.' },
  { key: 'city', numeral: 'IV', ask: 'Which city are we sending it to?', hint: 'Cut in Pune. Sent anywhere in India.' },
  { key: 'fit', numeral: 'V', ask: 'And how do you usually wear it?', hint: 'This decides how many of each we cut.' },
  { key: 'review', numeral: 'VI', ask: 'That is everything.' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s()\-.]{6,}$/;

export function Interest({ pieces, selected }: { pieces: Piece[]; selected: string[] }) {
  const [i, setI] = useState(0);
  const [form, setForm] = useState<Form>({ name: '', email: '', whatsapp: '', city: '', size: '', age: '' });
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'failed'>('idle');
  const [failMsg, setFailMsg] = useState('');
  const honeypot = useRef('');

  const step = STEPS[i];
  const marked = useMemo(() => pieces.filter((p) => selected.includes(p.id)), [pieces, selected]);

  const set = (k: keyof Form, v: string) => { setForm((f) => ({ ...f, [k]: v })); setError(''); };

  function validate(): string {
    switch (step.key) {
      case 'name':
        return form.name.trim().length >= 2 ? '' : 'A name, however short.';
      case 'email':
        return EMAIL_RE.test(form.email.trim()) ? '' : 'That address does not look quite right.';
      case 'whatsapp':
        return PHONE_RE.test(form.whatsapp.trim()) ? '' : 'A number we can actually reach.';
      case 'city':
        return form.city.trim().length >= 2 ? '' : 'Just the city is enough.';
      case 'fit':
        return form.size ? '' : 'Pick the one closest to you.';
      default:
        return '';
    }
  }

  const advance = () => {
    const e = validate();
    if (e) { setError(e); return; }
    setI((n) => Math.min(n + 1, STEPS.length - 1));
  };

  const back = () => { setError(''); setI((n) => Math.max(n - 1, 0)); };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); advance(); }
  };

  async function send() {
    if (status === 'sending') return;
    setStatus('sending');
    setFailMsg('');
    try {
      const res = await fetch('/api/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          pieces: marked.map((p) => p.name),
          company: honeypot.current,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) { setStatus('failed'); setFailMsg(json.error ?? 'Something went wrong. Try once more.'); return; }
      setStatus('done');
    } catch {
      setStatus('failed');
      setFailMsg('We could not reach the studio. Check your connection.');
    }
  }

  /* ---------------- accepted ---------------- */
  if (status === 'done') {
    return (
      <section id="interest" data-ground="dark" className="flex min-h-[92svh] items-center bg-soil text-ivory">
        <div className="shell text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}>
            <p className="eyebrow text-ivory/50">Received</p>
            <h2 className="display-lg mx-auto mt-8 max-w-[18ch]">
              You are on the list, <em className="italic">{form.name.split(' ')[0]}</em>.
            </h2>
            <p className="lede mx-auto mt-8 max-w-[42ch] text-ivory/60">
              You will hear from us before the run opens — and you will have first claim on your size.
            </p>
            {marked.length > 0 && (
              <p className="eyebrow mx-auto mt-12 max-w-[52ch] text-ivory/40">
                Held for you — {marked.map((p) => p.name).join(' · ')}
              </p>
            )}
          </motion.div>
        </div>
      </section>
    );
  }

  /* ---------------- the ask ---------------- */
  return (
    <section id="interest" data-ground="dark" className="flex min-h-[100svh] items-center bg-soil text-ivory">
      <div className="shell w-full">
        {/* Progress — a hairline and a numeral. No stepper dots. */}
        <div className="mb-14 flex items-center gap-6">
          <span className="eyebrow text-ivory/40">{step.numeral} / VI</span>
          <span aria-hidden className="relative h-px flex-1 bg-ivory/15">
            <motion.span
              className="absolute inset-y-0 left-0 bg-ivory/60"
              animate={{ width: `${((i + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step.key}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="display-lg max-w-[20ch]">{step.ask}</h2>
            {step.hint && <p className="lede mt-6 max-w-[44ch] text-ivory/45">{step.hint}</p>}

            <div className="mt-14 max-w-[34rem]">
              {step.key === 'name' && (
                <input autoFocus className="field" value={form.name} onChange={(e) => set('name', e.target.value)} onKeyDown={onKey} placeholder="Your name" autoComplete="name" aria-label="Your name" />
              )}
              {step.key === 'email' && (
                <input autoFocus type="email" className="field" value={form.email} onChange={(e) => set('email', e.target.value)} onKeyDown={onKey} placeholder="you@example.com" autoComplete="email" aria-label="Email address" />
              )}
              {step.key === 'whatsapp' && (
                <input autoFocus type="tel" inputMode="tel" className="field" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} onKeyDown={onKey} placeholder="+91" autoComplete="tel" aria-label="WhatsApp number" />
              )}
              {step.key === 'city' && (
                <input autoFocus className="field" value={form.city} onChange={(e) => set('city', e.target.value)} onKeyDown={onKey} placeholder="Pune, Mumbai, Delhi…" autoComplete="address-level2" aria-label="City" />
              )}

              {step.key === 'fit' && (
                <div>
                  <div className="flex flex-wrap gap-3">
                    {SIZES.map((s) => {
                      const on = form.size === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => set('size', s)}
                          aria-pressed={on}
                          className="eyebrow border px-6 py-4 transition-colors duration-500"
                          style={{
                            borderColor: on ? 'var(--color-ivory)' : 'rgba(245,241,230,0.25)',
                            backgroundColor: on ? 'var(--color-ivory)' : 'transparent',
                            color: on ? 'var(--color-soil)' : 'inherit',
                          }}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                  <label className="mt-12 block">
                    <span className="eyebrow text-ivory/40">Age — optional</span>
                    <input
                      type="number"
                      min={13}
                      max={110}
                      inputMode="numeric"
                      className="field mt-3"
                      value={form.age}
                      onChange={(e) => set('age', e.target.value)}
                      onKeyDown={onKey}
                      placeholder="—"
                      aria-label="Age, optional"
                    />
                  </label>
                </div>
              )}

              {step.key === 'review' && (
                <dl className="grid gap-5 text-ivory/70">
                  {([['Name', form.name], ['Email', form.email], ['WhatsApp', form.whatsapp], ['City', form.city], ['Size', form.size], ['Age', form.age || '—']] as const).map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-6 border-b border-ivory/10 pb-3">
                      <dt className="eyebrow text-ivory/35">{k}</dt>
                      <dd className="text-right">{v}</dd>
                    </div>
                  ))}
                  <div className="flex items-baseline justify-between gap-6 pt-1">
                    <dt className="eyebrow text-ivory/35">Pieces</dt>
                    <dd className="text-right">{marked.length ? marked.map((p) => p.name).join(', ') : 'None marked yet'}</dd>
                  </div>
                </dl>
              )}

              {/* Honeypot — off-screen, never focusable */}
              <div className="pointer-events-none absolute left-[-9999px]" aria-hidden>
                <input tabIndex={-1} autoComplete="off" onChange={(e) => { honeypot.current = e.target.value; }} />
              </div>

              {error && <p role="alert" className="mt-5 text-sm text-[#E8B4B8]">{error}</p>}
              {status === 'failed' && <p role="alert" className="mt-5 text-sm text-[#E8B4B8]">{failMsg}</p>}

              <div className="mt-14 flex flex-wrap items-center gap-8">
                {step.key === 'review' ? (
                  <button type="button" onClick={send} disabled={status === 'sending'} className="invite invite--onDark">
                    <span>{status === 'sending' ? 'Sending' : 'Request access'}</span>
                  </button>
                ) : (
                  <button type="button" onClick={advance} className="invite invite--onDark">
                    <span>Continue</span>
                  </button>
                )}
                {i > 0 && (
                  <button type="button" onClick={back} className="eyebrow text-ivory/40 transition-opacity duration-300 hover:text-ivory/70">
                    Back
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

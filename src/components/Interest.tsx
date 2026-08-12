'use client';

import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SIZES, type Piece } from '@/lib/content';

/**
 * The Interest Request Form (Beige Theme):
 * Styled in warm beige (#EDE7DE) background with rich dark (#1C1614) typography,
 * subtle hairlines, dark buttons, and seamless input contrast.
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
      <section id="interest" data-ground="light" data-nav-bg="#EDE7DE" className="flex min-h-[92svh] items-center bg-[#EDE7DE] text-[#1C1614]">
        <div className="shell text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}>
            <p className="eyebrow text-[#1C1614]/50">Received</p>
            <h2 className="display-lg mx-auto mt-8 max-w-[18ch] text-[#1C1614]">
              You are on the list, <em className="italic">{form.name.split(' ')[0]}</em>.
            </h2>
            <p className="lede mx-auto mt-8 max-w-[42ch] text-[#1C1614]/70">
              You will hear from us before the run opens — and you will have first claim on your size.
            </p>
            {marked.length > 0 && (
              <p className="eyebrow mx-auto mt-12 max-w-[52ch] text-[#1C1614]/50">
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
    <section id="interest" data-ground="light" data-nav-bg="#EDE7DE" className="flex min-h-[100svh] items-center bg-[#EDE7DE] text-[#1C1614]">
      <div className="shell w-full">
        {/* Progress — a hairline and a numeral */}
        <div className="mb-14 flex items-center gap-6">
          <span className="eyebrow text-[#1C1614]/50">{step.numeral} / VI</span>
          <span aria-hidden className="relative h-px flex-1 bg-[#1C1614]/15">
            <motion.span
              className="absolute inset-y-0 left-0 bg-[#1C1614]/80"
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
            <h2 className="display-lg max-w-[20ch] text-[#1C1614]">{step.ask}</h2>
            {step.hint && <p className="lede mt-6 max-w-[44ch] text-[#1C1614]/65">{step.hint}</p>}

            <div className="mt-14 max-w-[34rem]">
              {step.key === 'name' && (
                <input
                  autoFocus
                  className="w-full bg-transparent border-b border-[#1C1614]/30 py-3 text-xl sm:text-2xl text-[#1C1614] placeholder-[#1C1614]/40 focus:border-[#1C1614] focus:outline-none transition-colors"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Your name"
                  autoComplete="name"
                  aria-label="Your name"
                />
              )}
              {step.key === 'email' && (
                <input
                  autoFocus
                  type="email"
                  className="w-full bg-transparent border-b border-[#1C1614]/30 py-3 text-xl sm:text-2xl text-[#1C1614] placeholder-[#1C1614]/40 focus:border-[#1C1614] focus:outline-none transition-colors"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  onKeyDown={onKey}
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-label="Email address"
                />
              )}
              {step.key === 'whatsapp' && (
                <input
                  autoFocus
                  type="tel"
                  inputMode="tel"
                  className="w-full bg-transparent border-b border-[#1C1614]/30 py-3 text-xl sm:text-2xl text-[#1C1614] placeholder-[#1C1614]/40 focus:border-[#1C1614] focus:outline-none transition-colors"
                  value={form.whatsapp}
                  onChange={(e) => set('whatsapp', e.target.value)}
                  onKeyDown={onKey}
                  placeholder="+91"
                  autoComplete="tel"
                  aria-label="WhatsApp number"
                />
              )}
              {step.key === 'city' && (
                <input
                  autoFocus
                  className="w-full bg-transparent border-b border-[#1C1614]/30 py-3 text-xl sm:text-2xl text-[#1C1614] placeholder-[#1C1614]/40 focus:border-[#1C1614] focus:outline-none transition-colors"
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Pune, Mumbai, Delhi…"
                  autoComplete="address-level2"
                  aria-label="City"
                />
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
                          className="eyebrow border px-6 py-4 transition-colors duration-500 font-medium"
                          style={{
                            borderColor: on ? '#1C1614' : 'rgba(28,22,20,0.25)',
                            backgroundColor: on ? '#1C1614' : 'transparent',
                            color: on ? '#EDE7DE' : '#1C1614',
                          }}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                  <label className="mt-12 block">
                    <span className="eyebrow text-[#1C1614]/50">Age — optional</span>
                    <input
                      type="number"
                      min={13}
                      max={110}
                      inputMode="numeric"
                      className="w-full bg-transparent border-b border-[#1C1614]/30 py-3 text-xl sm:text-2xl text-[#1C1614] placeholder-[#1C1614]/40 focus:border-[#1C1614] focus:outline-none transition-colors mt-3"
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
                <dl className="grid gap-5 text-[#1C1614]/80">
                  {([['Name', form.name], ['Email', form.email], ['WhatsApp', form.whatsapp], ['City', form.city], ['Size', form.size], ['Age', form.age || '—']] as const).map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-6 border-b border-[#1C1614]/15 pb-3">
                      <dt className="eyebrow text-[#1C1614]/45">{k}</dt>
                      <dd className="text-right text-[#1C1614] font-medium">{v}</dd>
                    </div>
                  ))}
                  <div className="flex items-baseline justify-between gap-6 pt-1">
                    <dt className="eyebrow text-[#1C1614]/45">Pieces</dt>
                    <dd className="text-right text-[#1C1614] font-medium">{marked.length ? marked.map((p) => p.name).join(', ') : 'None marked yet'}</dd>
                  </div>
                </dl>
              )}

              {/* Honeypot — off-screen */}
              <div className="pointer-events-none absolute left-[-9999px]" aria-hidden>
                <input tabIndex={-1} autoComplete="off" onChange={(e) => { honeypot.current = e.target.value; }} />
              </div>

              {error && <p role="alert" className="mt-5 text-sm text-[#8B262A] font-medium">{error}</p>}
              {status === 'failed' && <p role="alert" className="mt-5 text-sm text-[#8B262A] font-medium">{failMsg}</p>}

              <div className="mt-14 flex flex-wrap items-center gap-8">
                {step.key === 'review' ? (
                  <button
                    type="button"
                    onClick={send}
                    disabled={status === 'sending'}
                    className="inline-flex items-center justify-center bg-[#1C1614] text-[#EDE7DE] hover:bg-[#38332E] px-9 py-4 font-semibold text-xs tracking-[0.25em] uppercase transition-all shadow-xl rounded-xs"
                  >
                    <span>{status === 'sending' ? 'Sending' : 'Request access'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={advance}
                    className="inline-flex items-center justify-center bg-[#1C1614] text-[#EDE7DE] hover:bg-[#38332E] px-9 py-4 font-semibold text-xs tracking-[0.25em] uppercase transition-all shadow-xl rounded-xs"
                  >
                    <span>Continue</span>
                  </button>
                )}
                {i > 0 && (
                  <button type="button" onClick={back} className="eyebrow text-[#1C1614]/50 transition-colors duration-300 hover:text-[#1C1614]">
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

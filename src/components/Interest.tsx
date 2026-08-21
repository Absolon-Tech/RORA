'use client';

import { useState } from 'react';

const SANS = "'Inter Tight', 'Inter', sans-serif";
const SERIF = "'Cormorant Garamond', Georgia, serif";

export function Interest() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    favorite: '',
    notes: '',
    consent: false,
    company: '', // honeypot — real visitors never see or fill this
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      const existing = JSON.parse(localStorage.getItem("rora_waitlist") || "[]");
      localStorage.setItem(
        "rora_waitlist",
        JSON.stringify([
          ...existing,
          { ...form, timestamp: new Date().toISOString() },
        ]),
      );
      setSubmitted(true);
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="interest"
      data-ground="dark"
      data-nav-bg="#4D0E12"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-[#4D0E12] text-[#F5F1E6] py-16 px-6 sm:px-10 lg:px-16"
    >
      <div className="w-full max-w-3xl mx-auto">
        <img
          src="/images/logo-light.png"
          alt="RORA"
          className="h-6 sm:h-8 w-auto mb-16 sm:mb-20"
        />

        <div className="mb-12">
          <p
            className="mb-4 text-[10px] sm:text-[11px] font-medium tracking-[0.2em] uppercase text-[#F5F1E6]/80"
            style={{ fontFamily: SANS }}
          >
            Be First Through the Door
          </p>
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl mb-6 font-light tracking-tight"
            style={{ fontFamily: SERIF, lineHeight: 1.1 }}
          >
            Join the waitlist.
          </h2>
          <p
            className="text-sm sm:text-base text-[#F5F1E6]/80 leading-relaxed max-w-[54ch]"
            style={{ fontFamily: SANS }}
          >
            RORA opens its doors on 30 August 2026. Join below and we'll email you
            the moment we go live — plus early access to the first collection.
          </p>
        </div>

        {submitted ? (
          <div className="border border-[#F5F1E6]/20 py-16 px-8 text-center mt-12 max-w-2xl">
            <h3
              className="text-3xl sm:text-4xl italic font-light mb-4"
              style={{ fontFamily: SERIF }}
            >
              You're on the list.
            </h3>
            <p
              className="text-[#F5F1E6]/60 leading-relaxed max-w-[40ch] mx-auto text-sm sm:text-base"
              style={{ fontFamily: SANS }}
            >
              We'll email you the moment we open the doors on August 30. Until
              then — it's almost time.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-10 sm:gap-12 mt-12 w-full max-w-2xl">
            {/* Honeypot — hidden from real visitors, bots tend to fill every field */}
            <input
              type="text"
              name="hp_field"
              id="hp_field"
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ display: 'none' }}
            />

            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-8">
              <div className="relative">
                <label className="block text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-medium text-[#F5F1E6]/90 mb-2">
                  Full Name <span className="text-[#F5F1E6]">*</span>
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-transparent border-b border-[#F5F1E6]/30 py-2 text-[#F5F1E6] focus:border-[#F5F1E6] focus:outline-none transition-colors text-sm sm:text-base font-light rounded-none"
                  style={{ fontFamily: SANS }}
                />
              </div>
              <div className="relative">
                <label className="block text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-medium text-[#F5F1E6]/90 mb-2">
                  Email Address <span className="text-[#F5F1E6]">*</span>
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full bg-transparent border-b border-[#F5F1E6]/30 py-2 text-[#F5F1E6] focus:border-[#F5F1E6] focus:outline-none transition-colors text-sm sm:text-base font-light rounded-none"
                  style={{ fontFamily: SANS }}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="relative">
              <label className="block text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-medium text-[#F5F1E6]/90 mb-2">
                Phone Number <span className="text-[#F5F1E6]/50">(Optional)</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full bg-transparent border-b border-[#F5F1E6]/30 py-2 text-[#F5F1E6] focus:border-[#F5F1E6] focus:outline-none transition-colors text-sm sm:text-base font-light rounded-none"
                style={{ fontFamily: SANS }}
              />
            </div>

            {/* Favourite piece */}
            <div className="relative">
              <label className="block text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-medium text-[#F5F1E6]/90 mb-2">
                Which piece are you most excited about? <span className="text-[#F5F1E6]/50">(Optional)</span>
              </label>
              <select
                value={form.favorite}
                onChange={(e) => setForm((f) => ({ ...f, favorite: e.target.value }))}
                className="w-full bg-transparent border-b border-[#F5F1E6]/30 py-2 text-[#F5F1E6] focus:border-[#F5F1E6] focus:outline-none transition-colors text-sm sm:text-base font-light appearance-none cursor-pointer rounded-none"
                style={{
                  fontFamily: SANS,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23F5F1E6' stroke-width='1.2' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 4px center",
                  paddingRight: "24px",
                }}
              >
                <option value="" className="bg-[#4D0E12]"></option>
                <option value="The Audacity Suit" className="bg-[#4D0E12]">The Audacity Suit</option>
                <option value="Out of the Blue Set" className="bg-[#4D0E12]">Out of the Blue Set</option>
                <option value="Its a Wrap Suit" className="bg-[#4D0E12]">Its a Wrap Suit</option>
                <option value="Thoda Teekha Vest" className="bg-[#4D0E12]">Thoda Teekha Vest</option>
                <option value="Waist of Time Suit" className="bg-[#4D0E12]">Waist of Time Suit</option>
                <option value="The Soft Spoken Shirt" className="bg-[#4D0E12]">The Soft Spoken Shirt</option>
              </select>
            </div>

            {/* Notes */}
            <div className="relative">
              <label className="block text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-medium text-[#F5F1E6]/90 mb-2">
                Anything else you'd like us to know? <span className="text-[#F5F1E6]/50">(Optional)</span>
              </label>
              <textarea
                value={form.notes}
                rows={1}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full bg-transparent border-b border-[#F5F1E6]/30 py-2 text-[#F5F1E6] focus:border-[#F5F1E6] focus:outline-none transition-colors text-sm sm:text-base font-light resize-none rounded-none"
                style={{ fontFamily: SANS }}
              />
            </div>

            {/* Consent */}
            <label className="flex items-start gap-4 cursor-pointer group mt-2">
              <div className="relative flex items-center justify-center mt-[2px] sm:mt-1">
                <input
                  type="checkbox"
                  checked={form.consent}
                  required
                  onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
                  className="peer sr-only"
                />
                <div className="w-4 h-4 border border-[#F5F1E6]/40 peer-checked:bg-[#F5F1E6] peer-checked:border-[#F5F1E6] transition-colors rounded-sm flex items-center justify-center">
                  <svg
                    className={`w-3 h-3 text-[#4D0E12] ${form.consent ? 'opacity-100' : 'opacity-0'} transition-opacity`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
              <span
                className="text-xs sm:text-sm font-light text-[#F5F1E6]/80 leading-relaxed group-hover:text-[#F5F1E6] transition-colors"
                style={{ fontFamily: SANS }}
              >
                Email me when RORA launches on 30 August. I understand I can
                unsubscribe at any time. <span className="text-[#F5F1E6]">*</span>
              </span>
            </label>

            {error && (
              <p className="text-xs sm:text-sm text-[#F5C9C9]" style={{ fontFamily: SANS }} role="alert">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full bg-[#F5F1E6] text-[#4D0E12] py-5 sm:py-6 text-[10px] sm:text-[11px] font-medium tracking-[0.24em] uppercase hover:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ fontFamily: SANS }}
            >
              {submitting ? 'Joining…' : 'Join the Waitlist'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

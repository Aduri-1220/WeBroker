"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    n: "01",
    title: "Onboard",
    body: "You and the other party complete Aadhaar + PAN KYC in the app. We only unlock the draft once both sides are verified.",
  },
  {
    n: "02",
    title: "Align on terms",
    body: "Agree on rent, deposit, tenure, notice and any add-ons in one shared draft. Edit together until you are both comfortable.",
  },
  {
    n: "03",
    title: "Sign, stamp, file",
    body: "E-sign in minutes. We attach a valid e-Stamp and file with the Sub-Registrar — your agreement is on record. Security deposits are settled directly between you; we do not hold funds on the site.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-stone-900 py-16 text-stone-100 sm:py-24"
    >
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300/80 sm:text-xs">
            How it works
          </p>
          <h2
            className="mt-3 text-balance text-2xl font-semibold sm:text-4xl md:text-5xl"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Three calm steps from “maybe” to “done.”
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-stone-400 sm:mt-4 sm:text-base">
            You always know what happens next — whether you are letting out a
            flat or calling one home.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-14 sm:gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-7"
            >
              <div
                className="text-4xl text-amber-300/60 sm:text-5xl"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {s.n}
              </div>
              <h3 className="mt-3 text-lg font-semibold sm:mt-4 sm:text-xl">
                {s.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-stone-300 sm:text-sm">
                {s.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

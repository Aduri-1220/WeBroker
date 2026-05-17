"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "Drafted, e-signed, and had a clean PDF the same evening. No weekday mornings lost chasing counters or print shops.",
    name: "Aakash Verma",
    role: "Landlord, Bengaluru",
  },
  {
    quote:
      "The summary page let us fix notice period and escalation before paying. Felt more in control than a copy-shop template.",
    name: "Megha Iyer",
    role: "Tenant, Mumbai",
  },
  {
    quote:
      "I run several closings a month. The guided flow and e-sign step are easy to repeat — clients actually read the draft.",
    name: "Karthik Reddy",
    role: "Consultant, Hyderabad",
  },
] as const;

export function LandingTestimonialsSection() {
  return (
    <section className="border-t border-slate-200/60 bg-gradient-to-b from-white via-sky-50/20 to-white py-16 sm:py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-700 sm:text-xs">
            People first
          </p>
          <h2
            className="mt-3 text-balance text-2xl font-semibold text-stone-900 sm:text-4xl md:text-5xl"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            What early users say
          </h2>
          <p className="mt-3 text-sm text-stone-500 sm:text-base">
            Sample quotes for tone and layout — swap in verified testimonials as
            you collect them.
          </p>
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.li
              key={t.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-7 shadow-sm shadow-slate-900/5"
            >
              <Quote
                className="h-8 w-8 text-brand-200"
                strokeWidth={1.25}
                aria-hidden
              />
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-stone-700">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <footer className="mt-8 border-t border-stone-100 pt-6">
                <p className="font-semibold text-stone-900">{t.name}</p>
                <p className="mt-1 text-sm text-stone-500">{t.role}</p>
              </footer>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ClosingCTA() {
  return (
    <section
      id="get-started"
      className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 py-16 text-white sm:py-24"
    >
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <h2
          className="text-balance text-2xl font-semibold sm:text-4xl md:text-5xl"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Ready when you are.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/80 sm:mt-4 sm:text-base">
          Open a guided Leave &amp; Licence flow, invite the other party, and
          move from handshake to stamped agreement without the usual stress. No
          card needed to begin.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row">
          <Link
            href="/sign-up"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-medium text-brand-700 shadow-lg shadow-brand-900/30 transition hover:bg-amber-50 sm:w-auto"
          >
            Start free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex w-full items-center justify-center rounded-full border border-white/40 bg-white/10 px-7 py-3 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20 sm:w-auto"
          >
            I already have an account
          </Link>
        </div>
      </div>
    </section>
  );
}

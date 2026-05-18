"use client";

import { motion } from "framer-motion";
import { Copy, Fingerprint, ShieldCheck, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ADD_ONS: Array<{ icon: LucideIcon; title: string; desc: string }> = [
  {
    icon: Fingerprint,
    title: "Aadhaar e-sign",
    desc: "OTP-based signing when owner and tenant are in different places.",
  },
  {
    icon: ShieldCheck,
    title: "Notarisation",
    desc: "Optional notary attestation on your executed agreement.",
  },
  {
    icon: Truck,
    title: "Courier delivery",
    desc: "Standard or express hardcopy to the address you provide.",
  },
  {
    icon: Copy,
    title: "Extra original copy",
    desc: "Additional stamped original when you need more than one set.",
  },
];

export function LandingAddOnsStrip() {
  return (
    <div className="mt-8 sm:mt-10">
      <p className="text-center text-[10px] font-medium uppercase tracking-[0.28em] text-brand-700 sm:text-xs">
        Available add-ons
      </p>
      <p className="mx-auto mt-2 max-w-xl text-center text-xs text-stone-500 sm:text-sm">
        Choose these when you reach checkout — your summary updates with every
        toggle.
      </p>
      <ul
        className="mt-5 flex touch-pan-x gap-3 overflow-x-auto overscroll-x-contain pb-1 pt-0.5 [scrollbar-width:thin] sm:mt-6 sm:gap-4"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {ADD_ONS.map((item, i) => (
          <motion.li
            key={item.title}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.12) }}
            className="flex w-[min(17.5rem,calc(100vw-3.5rem))] shrink-0 snap-start rounded-xl border border-slate-200/90 bg-white/90 px-4 py-3 shadow-sm shadow-sky-900/[0.04]"
          >
            <div className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <item.icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 text-left">
                <span className="block text-sm font-semibold text-stone-900">
                  {item.title}
                </span>
                <span className="mt-0.5 block text-[12px] leading-snug text-stone-600 sm:text-[13px]">
                  {item.desc}
                </span>
              </span>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

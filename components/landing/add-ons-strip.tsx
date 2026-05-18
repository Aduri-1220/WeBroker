"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const ADD_ONS: Array<{
  title: string;
  desc: string;
  image: string;
  alt: string;
  /** Tint behind the photo for a more colorful, NoBroker-style card. */
  accent: string;
}> = [
  {
    title: "Aadhaar e-sign",
    desc: "OTP-based signing when owner and tenant are in different places.",
    image: "/images/add-ons/aadhaar-esign.jpg",
    alt: "Smartphone in hand — digital authentication and e-sign flow",
    accent: "from-violet-600/25 via-fuchsia-500/15 to-sky-400/20",
  },
  {
    title: "Notarisation",
    desc: "Optional notary attestation on your executed agreement.",
    image: "/images/add-ons/notarisation.png",
    alt: "Wax seal and formal scroll — official notarisation symbolism",
    accent: "from-amber-700/20 via-rose-600/20 to-red-900/15",
  },
  {
    title: "Courier delivery",
    desc: "Standard or express hardcopy to the address you provide.",
    image: "/images/add-ons/courier-delivery.jpg",
    alt: "Courier handing over a parcel for doorstep delivery",
    accent: "from-emerald-600/25 via-teal-500/15 to-brand-600/20",
  },
  {
    title: "Extra original copy",
    desc: "Additional stamped original when you need more than one set.",
    image: "/images/add-ons/extra-original-copy.jpg",
    alt: "Desk with documents and writing — extra printed agreement copies",
    accent: "from-orange-500/20 via-amber-500/15 to-yellow-600/10",
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
        className="mt-5 flex touch-pan-x gap-4 overflow-x-auto overscroll-x-contain pb-1 pt-0.5 [scrollbar-width:thin] sm:mt-6 sm:gap-5"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {ADD_ONS.map((item, i) => (
          <motion.li
            key={item.title}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.12) }}
            className="w-[min(15.5rem,calc(100vw-3rem))] shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md shadow-sky-900/10 ring-1 ring-slate-900/[0.04] sm:w-[min(14rem,calc(100vw-4rem))]"
          >
            <div
              className={`relative h-[7.25rem] w-full bg-gradient-to-br ${item.accent} sm:h-[7.75rem]`}
            >
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 70vw, 224px"
                className="object-cover mix-blend-normal"
                priority={i < 2}
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10"
                aria-hidden
              />
            </div>
            <div className="border-t border-slate-100 bg-white px-3.5 py-3 sm:px-4 sm:py-3.5">
              <span className="block text-sm font-semibold text-stone-900">
                {item.title}
              </span>
              <span className="mt-1 block text-[12px] leading-snug text-stone-600 sm:text-[13px]">
                {item.desc}
              </span>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

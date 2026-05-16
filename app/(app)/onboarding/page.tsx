"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowRight, Building2, Home, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { INDIAN_STATES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Role = "OWNER" | "TENANT" | "BROKER";

const roles: {
  id: Role;
  title: string;
  description: string;
  icon: typeof Home;
}[] = [
  {
    id: "OWNER",
    title: "I'm the Owner",
    description: "I'm renting out my property and need an agreement.",
    icon: Home,
  },
  {
    id: "TENANT",
    title: "I'm the Tenant",
    description: "I'm moving in and need a fair agreement.",
    icon: Users,
  },
  {
    id: "BROKER",
    title: "I'm a Broker",
    description: "I'm facilitating the rental on behalf of clients.",
    icon: Building2,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { update: refreshSession } = useSession();
  const [role, setRole] = useState<Role | null>(null);
  const [state, setState] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!role || !state) {
      toast.error("Please choose a role and a state");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, state }),
      });
      if (!res.ok) throw new Error("failed");
      await refreshSession();
      toast.success("All set! Let's get started.");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Could not save preferences");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container max-w-3xl py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          A few quick details
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Tell us about you
        </h1>
        <p className="mt-2 text-slate-600">
          This helps us personalise your agreement.
        </p>
      </motion.div>

      <div className="mt-10 space-y-8">
        <section>
          <Label className="text-base font-semibold">
            Which best describes you?
          </Label>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={cn(
                  "relative rounded-xl border bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                  role === r.id &&
                    "border-brand-500 ring-2 ring-brand-200 shadow-md",
                )}
              >
                <div
                  className={cn(
                    "mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg",
                    role === r.id
                      ? "bg-brand-600 text-white"
                      : "bg-brand-50 text-brand-700",
                  )}
                >
                  <r.icon className="h-5 w-5" />
                </div>
                <div className="font-semibold text-slate-900">{r.title}</div>
                <p className="mt-1 text-xs text-slate-600">{r.description}</p>
              </button>
            ))}
          </div>
        </section>

        <section>
          <Label className="text-base font-semibold" htmlFor="state">
            Which state is the property in?
          </Label>
          <p className="mt-1 text-sm text-slate-600">
            We&rsquo;ll use this to calculate stamp duty automatically.
          </p>
          <div className="mt-3 max-w-sm">
            <Select value={state} onValueChange={setState}>
              <SelectTrigger id="state" className="h-12">
                <SelectValue placeholder="Select a state" />
              </SelectTrigger>
              <SelectContent>
                {INDIAN_STATES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <div className="flex justify-end">
          <Button
            size="lg"
            variant="brand"
            onClick={submit}
            disabled={!role || !state || submitting}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

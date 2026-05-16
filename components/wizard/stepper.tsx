"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { visibleWizardStepsForEntry } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface StepperProps {
  agreementId: string;
  wizardEntry?: string | null;
  currentStep: string;
  completed: Record<string, boolean>;
}

export function Stepper({
  agreementId,
  wizardEntry,
  currentStep,
  completed,
}: StepperProps) {
  const steps = visibleWizardStepsForEntry(wizardEntry);
  const currentIndex = steps.findIndex((s) => s.id === currentStep);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const reachCutoff = currentIndex >= 0 ? currentIndex : safeIndex;
  const totalDone = steps.filter((s) => completed[s.id]).length;
  const progressPct = Math.round((totalDone / steps.length) * 100);

  return (
    <>
      <div className="md:hidden">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium text-slate-700">
            Step {safeIndex + 1} of {steps.length}:{" "}
            <span className="text-brand-700">{steps[safeIndex]?.label}</span>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {progressPct}%
          </span>
        </div>
        <Progress value={progressPct} />
      </div>

      <nav className="hidden md:block">
        <ol className="relative space-y-1">
          {steps.map((s, i) => {
            const displayStepNumber = i + 1;
            const isCurrent = s.id === currentStep;
            const isDone = !!completed[s.id];
            const isReachable = isDone || i <= reachCutoff;
            return (
              <li key={s.id} className="relative">
                {i < steps.length - 1 && (
                  <span
                    className={cn(
                      "absolute left-[19px] top-10 h-6 w-0.5",
                      isDone ? "bg-brand-500" : "bg-slate-200",
                    )}
                    aria-hidden
                  />
                )}
                <Link
                  href={isReachable ? `/agreement/${agreementId}/${s.id}` : "#"}
                  aria-disabled={!isReachable}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors",
                    isReachable
                      ? "hover:bg-white"
                      : "pointer-events-none opacity-60",
                    isCurrent && "bg-white shadow-sm",
                  )}
                >
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isCurrent ? 1.05 : 1,
                    }}
                    className={cn(
                      "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                      isDone
                        ? "border-brand-500 bg-brand-500 text-white"
                        : isCurrent
                          ? "border-brand-500 bg-white text-brand-700"
                          : "border-slate-300 bg-white text-slate-500",
                    )}
                  >
                    {isDone ? <Check className="h-5 w-5" /> : displayStepNumber}
                  </motion.div>
                  <div className="flex-1 leading-tight">
                    <div
                      className={cn(
                        "text-xs uppercase tracking-wide",
                        isCurrent ? "text-brand-700" : "text-slate-500",
                      )}
                    >
                      Step {displayStepNumber}
                    </div>
                    <div
                      className={cn(
                        "text-sm font-semibold",
                        isCurrent ? "text-slate-900" : "text-slate-700",
                      )}
                    >
                      {s.label}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

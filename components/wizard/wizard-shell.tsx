"use client";
import { motion } from "framer-motion";
import { Stepper } from "./stepper";

interface WizardShellProps {
  agreementId: string;
  wizardEntry?: string | null;
  currentStep: string;
  completed: Record<string, boolean>;
  /** When true, only the stepper + children are shown (no inner title block). */
  hideShellHeader?: boolean;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function WizardShell({
  agreementId,
  wizardEntry,
  currentStep,
  completed,
  hideShellHeader = false,
  title,
  description,
  children,
}: WizardShellProps) {
  return (
    <div className="container py-6 md:py-10">
      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        <aside className="md:sticky md:top-24 md:self-start">
          <Stepper
            agreementId={agreementId}
            wizardEntry={wizardEntry}
            currentStep={currentStep}
            completed={completed}
          />
        </aside>
        <motion.section
          key={currentStep}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border bg-white p-6 shadow-sm md:p-8"
        >
          {!hideShellHeader && (
            <header className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {title}
              </h1>
              <p className="mt-1 text-sm text-slate-600">{description}</p>
            </header>
          )}
          {children}
        </motion.section>
      </div>
    </div>
  );
}

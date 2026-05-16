"use client";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavButtonsProps {
  backHref?: string;
  submitLabel?: string;
  submitting?: boolean;
  onSkip?: () => void;
  skipLabel?: string;
}

export function NavButtons({
  backHref,
  submitLabel = "Save & continue",
  submitting,
  onSkip,
  skipLabel,
}: NavButtonsProps) {
  return (
    <div className="mt-8 flex flex-col-reverse items-stretch justify-between gap-3 border-t pt-6 sm:flex-row sm:items-center">
      {backHref ? (
        <Button asChild variant="ghost" size="lg">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      ) : (
        <span />
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        {onSkip && (
          <Button type="button" variant="outline" size="lg" onClick={onSkip}>
            {skipLabel ?? "Skip"}
          </Button>
        )}
        <Button type="submit" variant="brand" size="lg" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitLabel}
          {!submitting && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

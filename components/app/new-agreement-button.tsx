"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClipboardList, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  WIZARD_ENTRY_FULL_DETAILS,
  WIZARD_ENTRY_UPLOAD_DRAFT,
} from "@/lib/constants";

export function NewAgreementButton() {
  const router = useRouter();
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingFull, setLoadingFull] = useState(false);

  async function start(
    wizardEntry:
      | typeof WIZARD_ENTRY_UPLOAD_DRAFT
      | typeof WIZARD_ENTRY_FULL_DETAILS,
  ) {
    const setBusy =
      wizardEntry === WIZARD_ENTRY_UPLOAD_DRAFT
        ? setLoadingUpload
        : setLoadingFull;
    setBusy(true);
    try {
      const res = await fetch("/api/agreements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wizardEntry }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("failed");
      const { id } = (await res.json()) as { id: string };
      router.push(
        wizardEntry === WIZARD_ENTRY_UPLOAD_DRAFT
          ? `/agreement/${id}/draft`
          : `/agreement/${id}/property`,
      );
      router.refresh();
    } catch {
      toast.error("Could not start a new agreement");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
      <Button
        type="button"
        onClick={() => void start(WIZARD_ENTRY_UPLOAD_DRAFT)}
        variant="outline"
        size="lg"
        disabled={loadingUpload || loadingFull}
        className="border-brand-300 bg-white text-brand-800 hover:bg-brand-50"
      >
        {loadingUpload ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UploadCloud className="h-4 w-4" />
        )}
        I have a draft to upload
      </Button>
      <Button
        type="button"
        onClick={() => void start(WIZARD_ENTRY_FULL_DETAILS)}
        variant="brand"
        size="lg"
        disabled={loadingUpload || loadingFull}
      >
        {loadingFull ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ClipboardList className="h-4 w-4" />
        )}
        Fill details from scratch
      </Button>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminScannedCopyUpload({
  agreementId,
  existingFileName,
}: {
  agreementId: string;
  existingFileName: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onFileChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("File too large (max 15 MB)");
      return;
    }
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".pdf") && file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed for the scanned copy");
      return;
    }

    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(`/api/admin/agreements/${agreementId}/scanned-copy`, {
        method: "POST",
        body,
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Upload failed",
        );
      }
      toast.success("Scanned copy saved");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      {existingFileName ? (
        <p className="text-sm text-slate-600">
          Current file:{" "}
          <span className="font-medium text-slate-900">{existingFileName}</span>
        </p>
      ) : (
        <p className="text-sm text-slate-600">
          No file uploaded yet. The customer will see a download button once a
          PDF is saved.
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="sr-only"
        onChange={(e) => void onFileChange(e)}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          className="gap-2"
          onClick={() => inputRef.current?.click()}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileUp className="h-4 w-4" />
          )}
          {existingFileName ? "Replace PDF" : "Upload scanned PDF"}
        </Button>
        {existingFileName ? (
          <Button type="button" variant="ghost" size="sm" asChild>
            <a
              href={`/api/admin/agreements/${agreementId}/scanned-copy`}
              className="gap-1"
            >
              Download current
            </a>
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-slate-500">
        Use a single PDF scan of the executed agreement. Max 15 MB.
      </p>
    </div>
  );
}

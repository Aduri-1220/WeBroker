"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { STATUS_FLOW } from "@/lib/constants";

export function AdminWorkflowAdvance({
  agreementId,
  currentStatus,
  workflowPaymentOk,
}: {
  agreementId: string;
  currentStatus: string;
  workflowPaymentOk: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const flowIds = STATUS_FLOW.map((s) => s.id);
  const idx = flowIds.indexOf(currentStatus as (typeof flowIds)[number]);
  const next =
    idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;

  const canAdvanceOps =
    Boolean(next) &&
    currentStatus !== "DRAFT" &&
    currentStatus !== "COMPLETED" &&
    workflowPaymentOk;

  async function advance() {
    if (!next) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/agreements/${agreementId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next.id }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        toast.error(data.error ?? "Could not update status");
        return;
      }
      toast.success(`Marked complete: ${next.label}`);
      router.refresh();
    } catch {
      toast.error("Could not update status");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-brand-200 bg-brand-50/40 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Ops workflow</CardTitle>
        <CardDescription>
          Manually advance the customer-facing timeline after stamping, e-sign,
          or courier steps are done. Uses the same rules as the demo control on
          the agreement page (payment must be successful first).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>
          <span className="text-slate-600">Current stage:</span>{" "}
          <span className="font-semibold text-slate-900">
            {idx >= 0 ? STATUS_FLOW[idx].label : currentStatus}
          </span>
        </p>

        {currentStatus === "COMPLETED" ? (
          <p className="text-emerald-800">This agreement is fully completed.</p>
        ) : currentStatus === "DRAFT" ? (
          <p className="text-slate-700">
            Still in draft — the customer must finish the wizard and pay before
            ops can advance statuses here.
          </p>
        ) : !workflowPaymentOk ? (
          <p className="text-amber-900">
            Payment is not verified for workflow (use Razorpay capture or
            allowed mock mode). Confirm payment before moving past &quot;Payment
            received&quot;.
          </p>
        ) : next ? (
          <Button
            variant="brand"
            disabled={loading || !canAdvanceOps}
            onClick={() => void advance()}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            Advance to &quot;{next.label}&quot;
          </Button>
        ) : (
          <p className="text-slate-600">No further stages.</p>
        )}
      </CardContent>
    </Card>
  );
}

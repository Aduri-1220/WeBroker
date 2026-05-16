import { z } from "zod";

/** Canonical order for the rental agreement lifecycle */
export const AGREEMENT_STATUS_ORDER = [
  "DRAFT",
  "PAID",
  "E_STAMPING",
  "E_SIGNING",
  "DELIVERY",
  "COMPLETED",
] as const;

export type AgreementStatus = (typeof AGREEMENT_STATUS_ORDER)[number];

export const agreementStatusSchema = z.enum(AGREEMENT_STATUS_ORDER);

export function parseAgreementStatus(raw: string): AgreementStatus | null {
  const r = agreementStatusSchema.safeParse(raw);
  return r.success ? r.data : null;
}

/** Next status a signed-in user may set via POST /api/agreements/:id/status (never PAID). */
const USER_HTTP_NEXT: Record<AgreementStatus, AgreementStatus | null> = {
  DRAFT: null,
  PAID: "E_STAMPING",
  E_STAMPING: "E_SIGNING",
  E_SIGNING: "DELIVERY",
  DELIVERY: "COMPLETED",
  COMPLETED: null,
};

export type UserStatusTransitionError =
  | "PAYMENT_FIRST"
  | "PAID_VIA_PAYMENT_ONLY"
  | "TERMINAL"
  | "INVALID_TRANSITION"
  | "PAYMENT_NOT_SUCCESS";

/** Payment row fields needed to decide if workflow steps may advance. */
export type WorkflowPaymentInfo = {
  status: string;
  provider: string;
  providerPaymentId: string | null;
};

/**
 * Production workflow requires a PSP-attested payment (Razorpay capture).
 * Mock SUCCESS is allowed only in non-production, or when ENABLE_PAYMENT_SIMULATE=true (E2E / demos).
 */
export function paymentQualifiesForWorkflow(
  payment: WorkflowPaymentInfo | null | undefined,
): boolean {
  if (!payment || payment.status !== "SUCCESS") return false;
  if (payment.provider === "RAZORPAY") {
    return Boolean(payment.providerPaymentId);
  }
  if (process.env.NODE_ENV === "production") {
    return process.env.ENABLE_PAYMENT_SIMULATE === "true";
  }
  return true;
}

export function validateUserHttpStatusTransition(
  current: AgreementStatus,
  requested: AgreementStatus,
  /** Use {@link paymentQualifiesForWorkflow}, not raw `status === "SUCCESS"`. */
  paymentSuccess: boolean,
):
  | { ok: true }
  | { ok: false; code: UserStatusTransitionError; message: string } {
  if (current === "DRAFT") {
    return {
      ok: false,
      code: "PAYMENT_FIRST",
      message: "Complete payment before advancing the agreement workflow.",
    };
  }

  if (requested === "PAID") {
    return {
      ok: false,
      code: "PAID_VIA_PAYMENT_ONLY",
      message: "PAID can only be set after a successful payment.",
    };
  }

  const expectedNext = USER_HTTP_NEXT[current];
  if (expectedNext === null) {
    return {
      ok: false,
      code: "TERMINAL",
      message: "Agreement workflow is already complete.",
    };
  }

  if (requested !== expectedNext) {
    return {
      ok: false,
      code: "INVALID_TRANSITION",
      message: `Invalid status transition: the next step is ${expectedNext}.`,
    };
  }

  if (!paymentSuccess) {
    return {
      ok: false,
      code: "PAYMENT_NOT_SUCCESS",
      message:
        "Recorded payment must be successful before continuing the workflow.",
    };
  }

  return { ok: true };
}

/**
 * After a verified successful charge, move DRAFT → PAID (idempotent if already PAID).
 */
export function agreementStatusAfterSuccessfulPayment(
  current: AgreementStatus,
): AgreementStatus | "UNCHANGED" {
  if (current === "DRAFT") return "PAID";
  if (current === "PAID") return "UNCHANGED";
  return "UNCHANGED";
}

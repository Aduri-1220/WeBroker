export type PaymentProviderKind = "MOCK" | "RAZORPAY";

export function getPaymentProvider(): PaymentProviderKind {
  const raw = process.env.PAYMENT_PROVIDER?.trim().toLowerCase();
  if (raw === "razorpay") return "RAZORPAY";
  return "MOCK";
}

/** Mock simulate (success/failure) — never on in production unless explicitly enabled (e.g. E2E). */
export function isPaymentSimulateAllowed(): boolean {
  if (process.env.ENABLE_PAYMENT_SIMULATE === "true") return true;
  return process.env.NODE_ENV !== "production";
}

export function isMockCheckoutForbiddenInProduction(): boolean {
  return (
    process.env.NODE_ENV === "production" &&
    getPaymentProvider() === "MOCK" &&
    process.env.ENABLE_PAYMENT_SIMULATE !== "true"
  );
}

export function getRazorpayPublishableKey(): string | undefined {
  return process.env.RAZORPAY_KEY_ID?.trim() || undefined;
}

/** Key id + secret — required to create orders and verify client callbacks. */
export function assertRazorpayApiKeysConfigured(): void {
  if (!process.env.RAZORPAY_KEY_ID?.trim())
    throw new Error("RAZORPAY_KEY_ID is not set");
  if (!process.env.RAZORPAY_KEY_SECRET?.trim())
    throw new Error("RAZORPAY_KEY_SECRET is not set");
}

/** Full stack: API keys + webhook signing secret (needed only for `/api/webhooks/razorpay`). */
export function assertRazorpaySecretsConfigured(): void {
  assertRazorpayApiKeysConfigured();
  if (!process.env.RAZORPAY_WEBHOOK_SECRET?.trim())
    throw new Error("RAZORPAY_WEBHOOK_SECRET is not set");
}

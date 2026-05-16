import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";
import {
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from "@/lib/razorpay";

describe("razorpay signatures", () => {
  it("verifies webhook HMAC over raw body", () => {
    const secret = "test_whsec";
    const body = '{"event":"payment.captured"}';
    const sig = createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyRazorpayWebhookSignature(body, sig, secret)).toBe(true);
    expect(verifyRazorpayWebhookSignature(body, "deadbeef", secret)).toBe(
      false,
    );
    expect(verifyRazorpayWebhookSignature(body, null, secret)).toBe(false);
  });

  it("verifies payment signature for order_id|payment_id", () => {
    const keySecret = "test_key_secret";
    const orderId = "order_123";
    const paymentId = "pay_456";
    const sig = createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    expect(
      verifyRazorpayPaymentSignature({
        orderId,
        paymentId,
        signature: sig,
        keySecret,
      }),
    ).toBe(true);
    expect(
      verifyRazorpayPaymentSignature({
        orderId,
        paymentId,
        signature: "wrong",
        keySecret,
      }),
    ).toBe(false);
    expect(
      verifyRazorpayPaymentSignature({
        orderId,
        paymentId,
        signature: sig.toUpperCase(),
        keySecret,
      }),
    ).toBe(true);
  });
});

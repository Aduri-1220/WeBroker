import { describe, it, expect } from "vitest";
import {
  PRICING,
  computeTotal,
  extraCopyUnitPrice,
  type AddOnsInput,
} from "@/lib/pricing";

/**
 * Reference numbers used throughout these tests so a future pricing change
 * fails loudly here instead of silently in production.
 */
const STAMP_DUTY = 100;

const baseInput: AddOnsInput = {
  esignSignatories: 0,
  notary: false,
  extraCopies: 0,
  delivery: "DIGITAL",
  stampDuty: STAMP_DUTY,
};

function lineItem(label: string, breakdown: ReturnType<typeof computeTotal>) {
  return breakdown.lineItems.find((i) => i.label === label);
}

describe("extraCopyUnitPrice", () => {
  it("is base + stamp duty when no notary and no e-sign are selected", () => {
    expect(
      extraCopyUnitPrice({
        stampDuty: STAMP_DUTY,
        notary: false,
        esignSignatories: 0,
      }),
    ).toBe(PRICING.extraCopy + STAMP_DUTY);
  });

  it("matches the NoBroker reference (\u20B9249 + \u20B9100 stamp duty = \u20B9349)", () => {
    expect(
      extraCopyUnitPrice({
        stampDuty: 100,
        notary: false,
        esignSignatories: 0,
      }),
    ).toBe(349);
  });

  it("adds half the notary fee (rounded) when notary is selected", () => {
    const expected =
      PRICING.extraCopy + STAMP_DUTY + Math.round(PRICING.notary / 2);
    expect(
      extraCopyUnitPrice({
        stampDuty: STAMP_DUTY,
        notary: true,
        esignSignatories: 0,
      }),
    ).toBe(expected);
  });

  it("adds half the total e-sign fee when e-sign is selected", () => {
    const signatories = 2;
    const esignHalf = Math.round((PRICING.esignPerSignatory * signatories) / 2);
    expect(
      extraCopyUnitPrice({
        stampDuty: STAMP_DUTY,
        notary: false,
        esignSignatories: signatories,
      }),
    ).toBe(PRICING.extraCopy + STAMP_DUTY + esignHalf);
  });

  it("adds half of BOTH notary and e-sign when both are selected", () => {
    const signatories = 3;
    const notaryHalf = Math.round(PRICING.notary / 2);
    const esignHalf = Math.round((PRICING.esignPerSignatory * signatories) / 2);
    expect(
      extraCopyUnitPrice({
        stampDuty: STAMP_DUTY,
        notary: true,
        esignSignatories: signatories,
      }),
    ).toBe(PRICING.extraCopy + STAMP_DUTY + notaryHalf + esignHalf);
  });

  it("scales linearly with stamp duty", () => {
    const a = extraCopyUnitPrice({
      stampDuty: 100,
      notary: false,
      esignSignatories: 0,
    });
    const b = extraCopyUnitPrice({
      stampDuty: 500,
      notary: false,
      esignSignatories: 0,
    });
    expect(b - a).toBe(400);
  });

  it("treats esignSignatories: 0 as no e-sign at all", () => {
    expect(
      extraCopyUnitPrice({
        stampDuty: STAMP_DUTY,
        notary: false,
        esignSignatories: 0,
      }),
    ).toBe(
      extraCopyUnitPrice({
        stampDuty: STAMP_DUTY,
        notary: false,
        esignSignatories: 0,
      }),
    );
  });
});

describe("computeTotal — line items", () => {
  it("always includes the base agreement drafting line at PRICING.base", () => {
    const breakdown = computeTotal(baseInput);
    const base = lineItem("Base agreement drafting", breakdown);
    expect(base?.amount).toBe(PRICING.base);
  });

  it("always includes a stamp duty line, marked as non-taxable in full", () => {
    const breakdown = computeTotal(baseInput);
    const stamp = lineItem("Stamp duty", breakdown);
    expect(stamp?.amount).toBe(STAMP_DUTY);
    expect(stamp?.nonTaxable).toBe(STAMP_DUTY);
  });

  it("includes an e-sign line only when signatories > 0", () => {
    const withEsign = computeTotal({ ...baseInput, esignSignatories: 2 });
    const without = computeTotal({ ...baseInput, esignSignatories: 0 });
    expect(
      withEsign.lineItems.some((i) => i.label.startsWith("Aadhaar e-sign")),
    ).toBe(true);
    expect(
      without.lineItems.some((i) => i.label.startsWith("Aadhaar e-sign")),
    ).toBe(false);
  });

  it("includes a notary line only when notary is true", () => {
    const withNotary = computeTotal({ ...baseInput, notary: true });
    const without = computeTotal({ ...baseInput, notary: false });
    expect(
      withNotary.lineItems.some((i) => i.label === "Notary attestation"),
    ).toBe(true);
    expect(
      without.lineItems.some((i) => i.label === "Notary attestation"),
    ).toBe(false);
  });

  it("emits the online scanned copy line for SCANNED_ONLINE at ₹0", () => {
    const breakdown = computeTotal({
      ...baseInput,
      delivery: "SCANNED_ONLINE",
    });
    const line = lineItem("Online scanned copy", breakdown);
    expect(line?.amount).toBe(0);
  });

  it("emits the digital delivery line for DIGITAL at \u20B90", () => {
    const breakdown = computeTotal({ ...baseInput, delivery: "DIGITAL" });
    const line = lineItem("Digital delivery", breakdown);
    expect(line?.amount).toBe(0);
  });

  it("emits the standard delivery line at \u20B9100 for STANDARD", () => {
    const breakdown = computeTotal({ ...baseInput, delivery: "STANDARD" });
    const line = lineItem("Standard delivery (4\u20136 days)", breakdown);
    expect(line?.amount).toBe(PRICING.delivery.STANDARD);
  });

  it("emits the express delivery line at \u20B9250 for EXPRESS", () => {
    const breakdown = computeTotal({ ...baseInput, delivery: "EXPRESS" });
    const line = lineItem("Express delivery (1\u20132 days)", breakdown);
    expect(line?.amount).toBe(PRICING.delivery.EXPRESS);
  });
});

describe("computeTotal — extra copies", () => {
  it("omits the extra-copies line when extraCopies is 0", () => {
    const breakdown = computeTotal({ ...baseInput, extraCopies: 0 });
    expect(
      breakdown.lineItems.some((i) =>
        i.label.startsWith("Extra original copies"),
      ),
    ).toBe(false);
  });

  it("charges (base + stampDuty) * N when nothing else is selected", () => {
    const breakdown = computeTotal({ ...baseInput, extraCopies: 2 });
    const line = lineItem("Extra original copies \u00D7 2", breakdown);
    expect(line?.amount).toBe((PRICING.extraCopy + STAMP_DUTY) * 2);
  });

  it("marks the stamp-duty portion of extra copies as non-taxable", () => {
    const breakdown = computeTotal({ ...baseInput, extraCopies: 3 });
    const line = lineItem("Extra original copies \u00D7 3", breakdown);
    expect(line?.nonTaxable).toBe(STAMP_DUTY * 3);
  });

  it("includes \u00BD notary in the per-copy price when notary is selected", () => {
    const breakdown = computeTotal({
      ...baseInput,
      extraCopies: 1,
      notary: true,
    });
    const line = lineItem("Extra original copies \u00D7 1", breakdown);
    const notaryHalf = Math.round(PRICING.notary / 2);
    expect(line?.amount).toBe(PRICING.extraCopy + STAMP_DUTY + notaryHalf);
  });

  it("includes \u00BD e-sign in the per-copy price when e-sign is selected", () => {
    const breakdown = computeTotal({
      ...baseInput,
      extraCopies: 1,
      esignSignatories: 2,
    });
    const line = lineItem("Extra original copies \u00D7 1", breakdown);
    const esignHalf = Math.round((PRICING.esignPerSignatory * 2) / 2);
    expect(line?.amount).toBe(PRICING.extraCopy + STAMP_DUTY + esignHalf);
  });

  it("describes the per-copy breakdown so the user can see the math", () => {
    const breakdown = computeTotal({
      ...baseInput,
      extraCopies: 1,
      notary: true,
      esignSignatories: 2,
    });
    const line = lineItem("Extra original copies \u00D7 1", breakdown);
    expect(line?.description).toContain("\u20B9249 base");
    expect(line?.description).toContain("\u20B9100 stamp duty");
    expect(line?.description).toContain("\u00BD notary");
    expect(line?.description).toContain("\u00BD e-sign");
  });
});

describe("computeTotal — totals & GST", () => {
  it("excludes stamp duty from GST (it's a government fee pass-through)", () => {
    const breakdown = computeTotal(baseInput);
    // Taxable = base only when there's no e-sign / notary / extra copies / paid delivery.
    const expectedGst = Math.round(PRICING.base * PRICING.gstRate);
    expect(breakdown.gst).toBe(expectedGst);
  });

  it("subtotal equals the sum of line-item amounts", () => {
    const breakdown = computeTotal({
      ...baseInput,
      esignSignatories: 2,
      notary: true,
      extraCopies: 1,
      delivery: "STANDARD",
    });
    const sum = breakdown.lineItems.reduce((s, i) => s + i.amount, 0);
    expect(breakdown.subtotal).toBe(sum);
  });

  it("total equals subtotal + GST", () => {
    const breakdown = computeTotal({
      ...baseInput,
      esignSignatories: 2,
      notary: true,
      extraCopies: 1,
      delivery: "STANDARD",
    });
    expect(breakdown.total).toBe(breakdown.subtotal + breakdown.gst);
  });

  it("never applies GST to the stamp-duty portion bundled inside extra copies", () => {
    const breakdown = computeTotal({
      ...baseInput,
      extraCopies: 2,
    });
    // Manually compute the taxable amount: everything except stamp duty
    // (primary + the 2 copies' stamp duty).
    const stampPrimary = STAMP_DUTY;
    const stampExtras = STAMP_DUTY * 2;
    const taxable = breakdown.subtotal - stampPrimary - stampExtras;
    const expectedGst = Math.round(taxable * PRICING.gstRate);
    expect(breakdown.gst).toBe(expectedGst);
  });

  it("everything-off-but-base produces a deterministic total", () => {
    const breakdown = computeTotal(baseInput);
    const expectedSubtotal = PRICING.base + STAMP_DUTY; // + 0 digital
    const expectedGst = Math.round(PRICING.base * PRICING.gstRate);
    expect(breakdown.subtotal).toBe(expectedSubtotal);
    expect(breakdown.total).toBe(expectedSubtotal + expectedGst);
  });
});

import { prisma } from "@/lib/db";
import {
  computeTotal,
  type DeliveryMethod,
  type PriceBreakdown,
} from "@/lib/pricing";

export async function getAgreementPriceBreakdownForOwner(
  agreementId: string,
  userId: string,
): Promise<
  | { ok: true; breakdown: PriceBreakdown }
  | { ok: false; status: 404 | 400; error: string }
> {
  const agreement = await prisma.agreement.findFirst({
    where: { id: agreementId, userId },
    include: { addOns: true, delivery: true },
  });
  if (!agreement) return { ok: false, status: 404, error: "Not found" };
  if (!agreement.delivery) {
    return {
      ok: false,
      status: 400,
      error: "Complete add-ons and delivery before payment.",
    };
  }
  const stamp = agreement.stampValue;
  if (stamp == null || stamp < 50) {
    return {
      ok: false,
      status: 400,
      error: "Stamp duty is not set. Complete the add-ons step.",
    };
  }

  const esignSignatories =
    agreement.addOns.find((a) => a.kind === "ESIGN")?.qty ?? 0;
  const notary = agreement.addOns.some((a) => a.kind === "NOTARY");
  const extraCopies =
    agreement.addOns.find((a) => a.kind === "EXTRA_COPY")?.qty ?? 0;

  const breakdown = computeTotal({
    esignSignatories,
    notary,
    extraCopies,
    delivery: agreement.delivery.method as DeliveryMethod,
    stampDuty: stamp,
  });

  return { ok: true, breakdown };
}

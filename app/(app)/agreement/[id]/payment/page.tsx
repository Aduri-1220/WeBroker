import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { loadAgreement, checkoutContactDisplayName } from "@/lib/agreement";
import {
  getPaymentProvider,
  getRazorpayPublishableKey,
  isMockCheckoutForbiddenInProduction,
  isPaymentSimulateAllowed,
} from "@/lib/payment-config";
import { computeTotal, type DeliveryMethod } from "@/lib/pricing";
import { PaymentClient } from "./payment-client";

export default async function PaymentPage({
  params,
}: {
  params: { id: string };
}) {
  const parsed = await loadAgreement(params.id);

  // Load add-ons + delivery
  const [addOns, delivery] = await Promise.all([
    prisma.addOn.findMany({ where: { agreementId: params.id } }),
    prisma.delivery.findUnique({ where: { agreementId: params.id } }),
  ]);

  if (!delivery) {
    redirect(`/agreement/${params.id}/addons`);
  }

  if (parsed.agreement.stampValue == null || parsed.agreement.stampValue < 50) {
    redirect(`/agreement/${params.id}/addons`);
  }

  const esignSignatories = addOns.find((a) => a.kind === "ESIGN")?.qty ?? 0;
  const notary = addOns.some((a) => a.kind === "NOTARY");
  const extraCopies = addOns.find((a) => a.kind === "EXTRA_COPY")?.qty ?? 0;

  const breakdown = computeTotal({
    esignSignatories,
    notary,
    extraCopies,
    delivery: delivery.method as DeliveryMethod,
    stampDuty: parsed.agreement.stampValue ?? 0,
  });

  const provider = getPaymentProvider();
  const razorpayKeyId = getRazorpayPublishableKey() ?? null;
  const simulateUiAllowed = provider === "MOCK" && isPaymentSimulateAllowed();
  const checkoutMode = provider === "RAZORPAY" ? "razorpay" : "mock";

  if (isMockCheckoutForbiddenInProduction()) {
    return (
      <div className="container max-w-2xl py-12">
        <h1 className="text-2xl font-bold text-slate-900">
          Payments unavailable
        </h1>
        <p className="mt-3 text-slate-600">
          Production requires a real payment provider. Set{" "}
          <code className="rounded bg-slate-100 px-1">
            PAYMENT_PROVIDER=razorpay
          </code>{" "}
          and configure Razorpay API keys and webhook secret, or enable{" "}
          <code className="rounded bg-slate-100 px-1">
            ENABLE_PAYMENT_SIMULATE=true
          </code>{" "}
          only for non-customer environments.
        </p>
      </div>
    );
  }

  return (
    <PaymentClient
      agreementId={params.id}
      breakdown={breakdown}
      tenantName={checkoutContactDisplayName(parsed)}
      ownerName={parsed.owner?.fullName ?? ""}
      city={parsed.property?.city ?? ""}
      checkoutMode={checkoutMode}
      razorpayKeyId={razorpayKeyId}
      simulateUiAllowed={simulateUiAllowed}
    />
  );
}

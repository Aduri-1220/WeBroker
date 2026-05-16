import { redirect } from "next/navigation";
import {
  loadAgreement,
  completedSteps,
  uploadDraftCheckoutReady,
} from "@/lib/agreement";
import { WizardShell } from "@/components/wizard/wizard-shell";
import { TermsForm } from "./terms-form";

export default async function TermsStepPage({
  params,
}: {
  params: { id: string };
}) {
  const parsed = await loadAgreement(params.id);
  if (uploadDraftCheckoutReady(parsed)) {
    redirect(`/agreement/${params.id}/addons`);
  }
  return (
    <WizardShell
      agreementId={params.id}
      wizardEntry={parsed.agreement.wizardEntry}
      currentStep="terms"
      completed={completedSteps(parsed)}
      title="Rental terms"
      description="Rent, deposit, duration and other commercial terms of the lease."
    >
      <TermsForm agreementId={params.id} initial={parsed.terms} />
    </WizardShell>
  );
}

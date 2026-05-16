import { redirect } from "next/navigation";
import {
  loadAgreement,
  completedSteps,
  uploadDraftCheckoutReady,
} from "@/lib/agreement";
import { WizardShell } from "@/components/wizard/wizard-shell";
import { PartyForm } from "@/components/wizard/party-form";

export default async function OwnerStepPage({
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
      currentStep="owner"
      completed={completedSteps(parsed)}
      title="Owner / Landlord details"
      description="Capture identity and contact details for the property owner. This appears as the First Party in the agreement."
    >
      <PartyForm
        agreementId={params.id}
        kind="owner"
        initial={parsed.owner}
        nextStep="tenant"
        backStep="property"
      />
    </WizardShell>
  );
}

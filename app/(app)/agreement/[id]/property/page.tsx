import { redirect } from "next/navigation";
import {
  loadAgreement,
  completedSteps,
  uploadDraftCheckoutReady,
} from "@/lib/agreement";
import { WIZARD_ENTRY_FULL_DETAILS } from "@/lib/constants";
import { WizardShell } from "@/components/wizard/wizard-shell";
import { PropertyForm } from "./property-form";

export default async function PropertyStepPage({
  params,
}: {
  params: { id: string };
}) {
  const parsed = await loadAgreement(params.id);
  if (uploadDraftCheckoutReady(parsed)) {
    redirect(`/agreement/${params.id}/addons`);
  }
  if (!completedSteps(parsed).draft) {
    redirect(`/agreement/${params.id}/draft`);
  }
  const stepBackHref =
    parsed.agreement.wizardEntry === WIZARD_ENTRY_FULL_DETAILS
      ? "/dashboard"
      : `/agreement/${params.id}/draft`;
  return (
    <WizardShell
      agreementId={params.id}
      wizardEntry={parsed.agreement.wizardEntry}
      currentStep="property"
      completed={completedSteps(parsed)}
      title="Tell us about the property"
      description="Share the address, configuration and amenities. This information goes into the agreement."
    >
      <PropertyForm
        agreementId={params.id}
        initial={parsed.property}
        stepBackHref={stepBackHref}
      />
    </WizardShell>
  );
}

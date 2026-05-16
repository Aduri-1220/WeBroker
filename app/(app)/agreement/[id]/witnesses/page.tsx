import { redirect } from "next/navigation";
import {
  loadAgreement,
  completedSteps,
  uploadDraftCheckoutReady,
} from "@/lib/agreement";
import { WizardShell } from "@/components/wizard/wizard-shell";
import { WitnessesForm } from "./witnesses-form";

export default async function WitnessesStepPage({
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
      currentStep="witnesses"
      completed={completedSteps(parsed)}
      title="Witnesses"
      description="Optional. Up to two witnesses who can sign alongside the parties. Most 11-month leases don't need witnesses."
    >
      <WitnessesForm agreementId={params.id} initial={parsed.witnesses} />
    </WizardShell>
  );
}

import { redirect } from "next/navigation";
import {
  loadAgreement,
  completedSteps,
  uploadDraftCheckoutReady,
} from "@/lib/agreement";
import { WizardShell } from "@/components/wizard/wizard-shell";
import { TenantForm } from "./tenant-form";

export default async function TenantStepPage({
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
      currentStep="tenant"
      completed={completedSteps(parsed)}
      title="Tenant details"
      description="Tenant identity, contact and family members. This appears as the Second Party in the agreement."
    >
      <TenantForm agreementId={params.id} initial={parsed.tenant} />
    </WizardShell>
  );
}

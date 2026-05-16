import { redirect } from "next/navigation";
import {
  loadAgreement,
  completedSteps,
  uploadDraftCheckoutReady,
} from "@/lib/agreement";
import { WizardShell } from "@/components/wizard/wizard-shell";
import { ClausesForm } from "./clauses-form";
import { CLAUSE_TEMPLATES } from "@/lib/clauses";

export default async function ClausesStepPage({
  params,
}: {
  params: { id: string };
}) {
  const parsed = await loadAgreement(params.id);
  if (uploadDraftCheckoutReady(parsed)) {
    redirect(`/agreement/${params.id}/addons`);
  }
  const initial = parsed.clauses ?? {
    clauses: CLAUSE_TEMPLATES.map((c) => ({
      id: c.id,
      label: c.label,
      enabled: c.defaultEnabled,
      text: c.defaultText,
      custom: false,
    })),
  };
  return (
    <WizardShell
      agreementId={params.id}
      wizardEntry={parsed.agreement.wizardEntry}
      currentStep="clauses"
      completed={completedSteps(parsed)}
      title="Clauses & conditions"
      description="Pick which standard clauses apply and edit the wording if you need to."
    >
      <ClausesForm agreementId={params.id} initial={initial} />
    </WizardShell>
  );
}

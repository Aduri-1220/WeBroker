"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { GripVertical, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { NavButtons } from "@/components/wizard/nav-buttons";
import { persistStep } from "@/components/wizard/persist";
import { clausesSchema, type ClausesData } from "@/lib/schemas";
import { CLAUSE_TEMPLATES } from "@/lib/clauses";
import { cn } from "@/lib/utils";

type Clause = ClausesData["clauses"][number];

export function ClausesForm({
  agreementId,
  initial,
}: {
  agreementId: string;
  initial: ClausesData;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const {
    handleSubmit,
    setValue,
    watch,
    reset: resetForm,
    formState: { isDirty },
  } = useForm<ClausesData>({
    resolver: zodResolver(clausesSchema),
    defaultValues: initial,
  });

  useUnsavedChangesWarning(isDirty);

  const clauses = watch("clauses");

  function updateClauses(next: Clause[]) {
    setValue("clauses", next, { shouldDirty: true });
  }

  function toggle(id: string) {
    updateClauses(
      clauses.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)),
    );
  }

  function updateText(id: string, text: string) {
    updateClauses(clauses.map((c) => (c.id === id ? { ...c, text } : c)));
  }

  function updateLabel(id: string, label: string) {
    updateClauses(clauses.map((c) => (c.id === id ? { ...c, label } : c)));
  }

  function reset(id: string) {
    const tmpl = CLAUSE_TEMPLATES.find((c) => c.id === id);
    if (!tmpl) return;
    updateText(id, tmpl.defaultText);
    toast.success(`Restored default for "${tmpl.label}"`);
  }

  function addCustom() {
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newClause: Clause = {
      id,
      label: "Custom clause",
      text: "",
      enabled: true,
      custom: true,
    };
    updateClauses([...clauses, newClause]);
    setEditing(id);
  }

  function removeCustom(id: string) {
    updateClauses(clauses.filter((c) => c.id !== id));
    if (editing === id) setEditing(null);
    toast.success("Custom clause removed");
  }

  async function onSubmit(data: ClausesData) {
    setSubmitting(true);
    const ok = await persistStep(agreementId, "clauses", data);
    setSubmitting(false);
    if (ok) {
      resetForm(data);
      toast.success("Clauses saved");
      router.push(`/agreement/${agreementId}/witnesses`);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-3">
        {clauses.map((c) => {
          const isEditing = editing === c.id;
          return (
            <div
              key={c.id}
              className={cn(
                "rounded-xl border bg-white p-4 shadow-sm transition-colors",
                c.enabled ? "border-slate-200" : "border-slate-200 opacity-60",
                c.custom && "border-brand-200 bg-brand-50/30",
              )}
            >
              <div className="flex items-start gap-3">
                <GripVertical className="mt-1 h-5 w-5 shrink-0 text-slate-300" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    {isEditing && c.custom ? (
                      <Input
                        value={c.label}
                        onChange={(e) => updateLabel(c.id, e.target.value)}
                        placeholder="Clause title"
                        className="h-9 max-w-sm font-semibold"
                      />
                    ) : (
                      <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                        {c.label}
                        {c.custom && (
                          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-700">
                            Custom
                          </span>
                        )}
                      </h3>
                    )}
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditing(isEditing ? null : c.id)}
                        disabled={!c.enabled}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        {isEditing ? "Done" : "Edit"}
                      </Button>
                      <Switch
                        checked={c.enabled}
                        onCheckedChange={() => toggle(c.id)}
                        aria-label={`Toggle ${c.label}`}
                      />
                    </div>
                  </div>
                  {isEditing ? (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        rows={4}
                        value={c.text}
                        onChange={(e) => updateText(c.id, e.target.value)}
                        placeholder={
                          c.custom
                            ? "Write the clause wording here..."
                            : undefined
                        }
                      />
                      <div className="flex items-center justify-between">
                        {c.custom ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCustom(c.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            Remove clause
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => reset(c.id)}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Restore default
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {c.text || (
                        <span className="italic text-slate-400">
                          No wording added yet. Click Edit to write this clause.
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <Button
          type="button"
          variant="outline"
          onClick={addCustom}
          className="w-full justify-center border-dashed"
        >
          <Plus className="h-4 w-4" />
          Add custom clause
        </Button>
      </div>

      <NavButtons
        backHref={`/agreement/${agreementId}/terms`}
        submitting={submitting}
        unsavedChanges={isDirty}
      />
    </form>
  );
}

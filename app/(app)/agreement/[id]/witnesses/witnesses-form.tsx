"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/wizard/field";
import { NavButtons } from "@/components/wizard/nav-buttons";
import { persistStep } from "@/components/wizard/persist";
import { witnessesSchema, type WitnessesData } from "@/lib/schemas";

export function WitnessesForm({
  agreementId,
  initial,
}: {
  agreementId: string;
  initial: WitnessesData | null;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<WitnessesData>({
    resolver: zodResolver(witnessesSchema),
    defaultValues: initial ?? { witnesses: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "witnesses",
  });

  async function onSubmit(data: WitnessesData) {
    setSubmitting(true);
    const ok = await persistStep(agreementId, "witnesses", data);
    setSubmitting(false);
    if (ok) {
      toast.success("Witnesses saved");
      router.push(`/agreement/${agreementId}/preview`);
    }
  }

  async function skip() {
    setSubmitting(true);
    const ok = await persistStep(agreementId, "witnesses", { witnesses: [] });
    setSubmitting(false);
    if (ok) router.push(`/agreement/${agreementId}/preview`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {fields.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed bg-slate-50 p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-700 shadow-sm">
            <UserCheck className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-base font-semibold text-slate-900">
            No witnesses required
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">
            For 11-month leases, most states don&rsquo;t require witnesses. You
            can add them if you want extra security.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-5"
            onClick={() => append({ fullName: "", address: "", phone: "" })}
          >
            <Plus className="h-4 w-4" />
            Add a witness
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((f, i) => (
            <div
              key={f.id}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900">
                  Witness {i + 1}
                </h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(i)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                  Remove
                </Button>
              </div>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <Field
                  label="Full name"
                  htmlFor={`witnesses.${i}.fullName`}
                  error={errors.witnesses?.[i]?.fullName}
                >
                  <Input
                    id={`witnesses.${i}.fullName`}
                    {...register(`witnesses.${i}.fullName` as const)}
                  />
                </Field>
                <Field
                  label="Phone"
                  htmlFor={`witnesses.${i}.phone`}
                  error={errors.witnesses?.[i]?.phone}
                >
                  <Input
                    id={`witnesses.${i}.phone`}
                    inputMode="numeric"
                    maxLength={10}
                    {...register(`witnesses.${i}.phone` as const)}
                  />
                </Field>
                <Field
                  label="Address"
                  htmlFor={`witnesses.${i}.address`}
                  error={errors.witnesses?.[i]?.address}
                  className="md:col-span-2"
                >
                  <Input
                    id={`witnesses.${i}.address`}
                    {...register(`witnesses.${i}.address` as const)}
                  />
                </Field>
              </div>
            </div>
          ))}
          {fields.length < 2 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ fullName: "", address: "", phone: "" })}
            >
              <Plus className="h-4 w-4" />
              Add another witness
            </Button>
          )}
        </div>
      )}

      <NavButtons
        backHref={`/agreement/${agreementId}/clauses`}
        submitLabel="Review draft"
        submitting={submitting}
        onSkip={skip}
        skipLabel="Skip witnesses"
      />
    </form>
  );
}

"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Sofa, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/wizard/field";
import { NavButtons } from "@/components/wizard/nav-buttons";
import { persistStep } from "@/components/wizard/persist";
import { propertySchema, type PropertyData } from "@/lib/schemas";
import {
  AMENITIES,
  BHK_OPTIONS,
  FURNISHING_OPTIONS,
  INDIAN_STATES,
  PROPERTY_TYPES,
} from "@/lib/constants";

export function PropertyForm({
  agreementId,
  initial,
  stepBackHref,
}: {
  agreementId: string;
  initial: PropertyData | null;
  /** Property is usually preceded by the draft step; full-details flow skips draft and backs out to the dashboard. */
  stepBackHref?: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
    watch,
    setValue,
  } = useForm<PropertyData>({
    resolver: zodResolver(propertySchema),
    defaultValues:
      initial ??
      ({
        type: "",
        bhk: "",
        bathrooms: 1,
        furnishing: "",
        flatNumber: "",
        floorNumber: "",
        buildingName: "",
        addressLine1: "",
        addressLine2: "",
        locality: "",
        city: "",
        state: "",
        pincode: "",
        carpetArea: 0,
        amenities: [],
        furnitureSchedule: [],
      } as PropertyData),
  });

  useUnsavedChangesWarning(isDirty);

  const {
    fields: furnitureFields,
    append: appendFurniture,
    remove: removeFurniture,
  } = useFieldArray({
    control,
    name: "furnitureSchedule",
  });

  const amenities = watch("amenities") || [];

  async function onSubmit(data: PropertyData) {
    setSubmitting(true);
    const ok = await persistStep(agreementId, "property", data);
    setSubmitting(false);
    if (ok) {
      reset(data);
      toast.success("Property details saved");
      router.push(`/agreement/${agreementId}/owner`);
    }
  }

  function setAmenityChecked(value: string, checked: boolean) {
    const set = new Set(amenities);
    if (checked) set.add(value);
    else set.delete(value);
    setValue("amenities", Array.from(set), { shouldDirty: true });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Property type"
          htmlFor="type"
          required
          error={errors.type}
        >
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field label="Bedrooms (BHK)" htmlFor="bhk" required error={errors.bhk}>
          <Controller
            name="bhk"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="bhk">
                  <SelectValue placeholder="BHK" />
                </SelectTrigger>
                <SelectContent>
                  {BHK_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field
          label="Number of bathrooms"
          htmlFor="bathrooms"
          required
          error={errors.bathrooms}
        >
          <Input
            id="bathrooms"
            type="number"
            min={1}
            max={20}
            placeholder="e.g. 2"
            {...register("bathrooms")}
          />
        </Field>

        <Field
          label="Furnishing"
          htmlFor="furnishing"
          required
          error={errors.furnishing}
        >
          <Controller
            name="furnishing"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="furnishing">
                  <SelectValue placeholder="Furnishing status" />
                </SelectTrigger>
                <SelectContent>
                  {FURNISHING_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field
          label="Carpet area (sq. ft.)"
          htmlFor="carpetArea"
          required
          error={errors.carpetArea}
        >
          <Input
            id="carpetArea"
            type="number"
            placeholder="e.g. 950"
            {...register("carpetArea")}
          />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Flat / House no." htmlFor="flatNumber">
          <Input
            id="flatNumber"
            placeholder="e.g. A-302"
            {...register("flatNumber")}
          />
        </Field>
        <Field label="Floor" htmlFor="floorNumber">
          <Input
            id="floorNumber"
            placeholder="e.g. 3rd"
            {...register("floorNumber")}
          />
        </Field>
        <Field label="Building name" htmlFor="buildingName">
          <Input
            id="buildingName"
            placeholder="e.g. Lotus Heights"
            {...register("buildingName")}
          />
        </Field>
      </div>

      <Field
        label="Street / Address line 1"
        htmlFor="addressLine1"
        required
        error={errors.addressLine1}
      >
        <Input
          id="addressLine1"
          placeholder="Street, road, plot"
          {...register("addressLine1")}
        />
      </Field>

      <Field label="Address line 2 (optional)" htmlFor="addressLine2">
        <Input
          id="addressLine2"
          placeholder="Landmark, area"
          {...register("addressLine2")}
        />
      </Field>

      <div className="grid gap-5 md:grid-cols-4">
        <Field
          label="Locality"
          htmlFor="locality"
          required
          error={errors.locality}
          className="md:col-span-2"
        >
          <Input
            id="locality"
            placeholder="e.g. Indiranagar"
            {...register("locality")}
          />
        </Field>
        <Field label="City" htmlFor="city" required error={errors.city}>
          <Input id="city" placeholder="e.g. Bengaluru" {...register("city")} />
        </Field>
        <Field
          label="PIN code"
          htmlFor="pincode"
          required
          error={errors.pincode}
        >
          <Input
            id="pincode"
            inputMode="numeric"
            maxLength={6}
            placeholder="6-digit"
            {...register("pincode")}
          />
        </Field>
      </div>

      <Field label="State" htmlFor="state" required error={errors.state}>
        <Controller
          name="state"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger id="state" className="md:max-w-sm">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {INDIAN_STATES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      <div>
        <div className="text-sm font-medium text-slate-800">Amenities</div>
        <p className="mt-1 text-xs text-slate-500">
          Optional — select all that apply. These show up in the inventory
          section of the agreement.
        </p>
        <div
          className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3"
          role="group"
          aria-label="Property amenities"
        >
          {AMENITIES.map((a) => {
            const id = `amenity-${a.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}`;
            const checked = amenities.includes(a);
            return (
              <div
                key={a}
                className="flex cursor-pointer items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm transition-colors hover:border-brand-300 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
              >
                <Checkbox
                  id={id}
                  className="size-5 rounded-none [&_svg]:size-3.5"
                  checked={checked}
                  onCheckedChange={(next) => {
                    if (next === "indeterminate") return;
                    setAmenityChecked(a, next);
                  }}
                />
                <label htmlFor={id} className="cursor-pointer leading-none">
                  {a}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border bg-slate-50 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sofa className="h-5 w-5 text-brand-700" />
            <h3 className="text-sm font-semibold text-slate-900">
              Schedule I — Furniture &amp; appliances handed over
            </h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendFurniture({ item: "", units: 1 })}
          >
            <Plus className="h-4 w-4" />
            Add row
          </Button>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Optional — lists everything the Owner hands over to the Tenant on
          move-in.
        </p>

        {furnitureFields.length > 0 && (
          <div className="mt-4 space-y-3">
            {furnitureFields.map((f, i) => (
              <div
                key={f.id}
                className="grid items-end gap-3 rounded-lg border bg-white p-3 sm:grid-cols-[1fr_120px_auto]"
              >
                <Field
                  label="Item"
                  htmlFor={`furnitureSchedule.${i}.item`}
                  required
                  error={errors.furnitureSchedule?.[i]?.item}
                >
                  <Input
                    id={`furnitureSchedule.${i}.item`}
                    placeholder="e.g. Ceiling fan"
                    {...register(`furnitureSchedule.${i}.item` as const)}
                  />
                </Field>
                <Field
                  label="Units"
                  htmlFor={`furnitureSchedule.${i}.units`}
                  required
                  error={errors.furnitureSchedule?.[i]?.units}
                >
                  <Input
                    id={`furnitureSchedule.${i}.units`}
                    type="number"
                    min={1}
                    {...register(`furnitureSchedule.${i}.units` as const)}
                  />
                </Field>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFurniture(i)}
                  aria-label="Remove row"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <NavButtons
        backHref={stepBackHref ?? `/agreement/${agreementId}/draft`}
        submitLabel="Save & continue"
        submitting={submitting}
        unsavedChanges={isDirty}
      />
    </form>
  );
}

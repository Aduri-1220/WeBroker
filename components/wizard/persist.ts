import { toast } from "sonner";

export async function persistStep<T>(
  agreementId: string,
  step: string,
  data: T,
): Promise<boolean> {
  try {
    const res = await fetch(`/api/agreements/${agreementId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step, data }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: unknown };
      console.error("[persist]", body);
      toast.error("Could not save your changes");
      return false;
    }
    return true;
  } catch (e) {
    console.error(e);
    toast.error("Network error saving changes");
    return false;
  }
}

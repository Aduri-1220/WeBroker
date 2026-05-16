import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const map: Record<
    string,
    {
      variant: "secondary" | "info" | "warning" | "success" | "brand";
      label: string;
    }
  > = {
    DRAFT: { variant: "secondary", label: "Draft" },
    PAID: { variant: "info", label: "Paid" },
    E_STAMPING: { variant: "warning", label: "E-Stamping" },
    E_SIGNING: { variant: "warning", label: "E-Signing" },
    DELIVERY: { variant: "brand", label: "Out for delivery" },
    COMPLETED: { variant: "success", label: "Completed" },
  };
  const it = map[status] ?? { variant: "secondary" as const, label: status };
  return <Badge variant={it.variant}>{it.label}</Badge>;
}

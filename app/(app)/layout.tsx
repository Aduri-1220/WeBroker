import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AppNav } from "@/components/app/app-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}

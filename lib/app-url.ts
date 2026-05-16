/**
 * Absolute origin for links in emails and redirects. Prefer NEXTAUTH_URL in production.
 */
export function getAppOrigin(req: Request): string {
  const configured = process.env.NEXTAUTH_URL?.replace(/\/$/, "");
  if (configured) return configured;
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  if (!host) return "http://localhost:3000";
  const proto =
    req.headers.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.")
      ? "http"
      : "https");
  return `${proto}://${host}`;
}

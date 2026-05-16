import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agreement = await prisma.agreement.findFirst({
    where: { id: params.id, userId: user.id },
    select: {
      sourceDraftBlob: true,
      sourceDraftMime: true,
      sourceDraftOriginalName: true,
    },
  });
  if (!agreement?.sourceDraftBlob) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const name = agreement.sourceDraftOriginalName ?? "rental-draft.pdf";
  const mime = agreement.sourceDraftMime ?? "application/octet-stream";

  const body = new Uint8Array(agreement.sourceDraftBlob);

  return new NextResponse(body, {
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(name)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

import { NextResponse } from "next/server";
import { agreementStatusAllowsExecutedCopyDownload } from "@/lib/delivery-executed-copy";
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
    select: { id: true, status: true },
  });
  if (!agreement) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!agreementStatusAllowsExecutedCopyDownload(agreement.status)) {
    return NextResponse.json(
      {
        error:
          "Executed PDF is available from Out for Delivery onward, once e-stamping and e-signing are complete.",
      },
      { status: 403 },
    );
  }

  const row = await prisma.delivery.findFirst({
    where: {
      agreementId: params.id,
      method: { in: ["DIGITAL", "SCANNED_ONLINE"] },
      scannedCopyBlob: { not: null },
    },
    select: {
      scannedCopyBlob: true,
      scannedCopyMime: true,
      scannedCopyOriginalName: true,
    },
  });
  if (!row?.scannedCopyBlob) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const name = row.scannedCopyOriginalName ?? "scanned-agreement.pdf";
  const mime = row.scannedCopyMime ?? "application/pdf";

  return new NextResponse(new Uint8Array(row.scannedCopyBlob), {
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(name)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

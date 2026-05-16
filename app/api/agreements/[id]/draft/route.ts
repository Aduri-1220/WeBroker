import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { WIZARD_ENTRY_UPLOAD_DRAFT } from "@/lib/constants";
import { getCurrentUser } from "@/lib/session";

const MAX_BYTES = 5 * 1024 * 1024;

function isAllowedDoc(file: File): boolean {
  const mime = file.type;
  if (
    mime === "application/pdf" ||
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return true;
  }
  const n = file.name.toLowerCase();
  return n.endsWith(".pdf") || n.endsWith(".docx");
}

function inferMime(file: File): string {
  if (file.type) return file.type;
  return file.name.toLowerCase().endsWith(".pdf")
    ? "application/pdf"
    : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agreement = await prisma.agreement.findFirst({
    where: { id: params.id, userId: user.id },
  });
  if (!agreement)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ctype = req.headers.get("content-type") ?? "";

  if (ctype.includes("application/json")) {
    const raw = await req.json().catch(() => null);
    const skip =
      raw &&
      typeof raw === "object" &&
      (raw as { skip?: unknown }).skip === true;
    if (!skip)
      return NextResponse.json(
        { error: "Expected { skip: true }" },
        { status: 400 },
      );

    if (agreement.wizardEntry === WIZARD_ENTRY_UPLOAD_DRAFT) {
      return NextResponse.json(
        {
          error:
            "This agreement was started with an upload. Please attach your PDF or DOCX before continuing.",
        },
        { status: 400 },
      );
    }

    await prisma.agreement.update({
      where: { id: params.id },
      data: {
        sourceDraftSkipped: true,
        sourceDraftBlob: null,
        sourceDraftMime: null,
        sourceDraftOriginalName: null,
      },
    });
    return NextResponse.json({ ok: true });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File))
    return NextResponse.json({ error: "Missing file" }, { status: 400 });

  if (file.size > MAX_BYTES)
    return NextResponse.json(
      { error: "File too large (max 5 MB)" },
      { status: 400 },
    );

  if (!isAllowedDoc(file))
    return NextResponse.json(
      { error: "Only PDF or DOCX files are allowed" },
      { status: 400 },
    );

  const buf = Buffer.from(await file.arrayBuffer());

  await prisma.agreement.update({
    where: { id: params.id },
    data: {
      sourceDraftBlob: buf,
      sourceDraftMime: inferMime(file),
      sourceDraftOriginalName: file.name,
      sourceDraftSkipped: false,
    },
  });

  return NextResponse.json({ ok: true });
}

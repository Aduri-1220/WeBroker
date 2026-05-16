import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAppOrigin } from "@/lib/app-url";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const origin = getAppOrigin(req);

  if (!token) {
    return NextResponse.redirect(`${origin}/sign-in?error=verify_invalid`);
  }

  const row = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!row || row.expires < new Date()) {
    return NextResponse.redirect(`${origin}/sign-in?error=verify_expired`);
  }

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { email: row.identifier },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.delete({ where: { token } }),
    ]);
  } catch {
    return NextResponse.redirect(`${origin}/sign-in?error=verify_failed`);
  }

  return NextResponse.redirect(`${origin}/sign-in?verified=1`);
}

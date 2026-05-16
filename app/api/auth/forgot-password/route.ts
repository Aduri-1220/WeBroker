import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { generateTokenHex, hashToken } from "@/lib/auth-tokens";
import { sendEmail } from "@/lib/email";
import { getAppOrigin } from "@/lib/app-url";

const bodySchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: true });
    }
    const email = parsed.data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email } });

    if (user?.passwordHash) {
      const raw = generateTokenHex();
      const tokenHash = hashToken(raw);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });
      await prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      });

      const origin = getAppOrigin(req);
      const link = `${origin}/reset-password?token=${encodeURIComponent(raw)}`;

      try {
        await sendEmail({
          to: email,
          subject: "Reset your WeBroker password",
          text: `Reset your password using this link (expires in 1 hour):\n${link}\n`,
          html: `<p>Hi${user.name ? ` ${user.name.split(" ")[0]}` : ""},</p>
<p>We received a request to reset your WeBroker password. This link expires in one hour.</p>
<p><a href="${link}">Reset password</a></p>
<p>If you did not request this, you can ignore this email.</p>`,
        });
      } catch (e) {
        console.error("[forgot-password] send failed:", e);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ ok: true });
  }
}

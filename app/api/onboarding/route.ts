import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const bodySchema = z.object({
  role: z.enum(["OWNER", "TENANT", "BROKER"]),
  state: z.string().min(1),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );

  await prisma.user.update({
    where: { id: user.id },
    data: { role: parsed.data.role, state: parsed.data.state },
  });

  return NextResponse.json({ ok: true });
}

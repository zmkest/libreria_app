"use server";

import { hash, verify } from "@node-rs/argon2";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { changePasswordSchema } from "./schemas";

type ActionResult = { success: true } | { success: false; error: string };

export async function changePassword(data: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "No autorizado" };
  }

  const parsed = changePasswordSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) return { success: false, error: "Usuario no encontrado" };

    const valid = await verify(user.password, parsed.data.currentPassword);
    if (!valid) {
      return { success: false, error: "La contraseña actual es incorrecta" };
    }

    const newHash = await hash(parsed.data.newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newHash },
    });

    return { success: true };
  } catch {
    return { success: false, error: "Error al cambiar la contraseña" };
  }
}

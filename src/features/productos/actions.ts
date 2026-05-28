"use server";

import { prisma } from "@/lib/prisma";
import { createProductSchema, updateProductSchema } from "./schemas";
import type { CreateProductInput, UpdateProductInput } from "./schemas";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createProduct(
  input: CreateProductInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = createProductSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { code, name, purchasePrice, salePrice } = parsed.data;

  const existing = await prisma.product.findUnique({ where: { code } });
  if (existing) {
    return { success: false, error: "Ya existe un producto con ese código" };
  }

  const product = await prisma.product.create({
    data: { code, name, purchasePrice, salePrice },
    select: { id: true },
  });

  return { success: true, data: { id: product.id } };
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = updateProductSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { code, name, purchasePrice, salePrice } = parsed.data;

  if (code) {
    const existing = await prisma.product.findFirst({
      where: { code, NOT: { id } },
    });
    if (existing) {
      return { success: false, error: "Ya existe otro producto con ese código" };
    }
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(purchasePrice !== undefined && { purchasePrice }),
        ...(salePrice !== undefined && { salePrice }),
      },
      select: { id: true },
    });
    return { success: true, data: { id: product.id } };
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "P2025") {
      return { success: false, error: "El producto ya no existe. Puede haber sido eliminado." };
    }
    throw e;
  }
}

export async function deleteProduct(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  const salesCount = await prisma.sale.count({ where: { productId: id } });
  if (salesCount > 0) {
    return {
      success: false,
      error: `No se puede eliminar: el producto tiene ${salesCount} venta(s) asociada(s)`,
    };
  }

  await prisma.product.delete({ where: { id } });
  return { success: true, data: { id } };
}

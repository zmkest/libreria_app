"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { calculateSaleTotal } from "@/lib/money";
import { createSaleSchema, cancelSaleSchema } from "./schemas";
import type { CreateSaleInput, CancelSaleInput } from "./schemas";
import Decimal from "decimal.js";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createSale(
  input: CreateSaleInput,
): Promise<ActionResult<{ id: string; saleNumber: number }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Sesión no válida. Vuelva a iniciar sesión." };
  }

  const parsed = createSaleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { productId, quantity, customerId } = parsed.data;

  const product = await prisma.product.findUnique({
    where:  { id: productId },
    select: { id: true, name: true, salePrice: true },
  });
  if (!product) {
    return { success: false, error: "El producto seleccionado no existe." };
  }

  const unitPrice = new Decimal(product.salePrice.toString());
  const total     = calculateSaleTotal(unitPrice, quantity);

  const sale = await prisma.sale.create({
    data: {
      userId:      session.user.id,
      productId:   product.id,
      productName: product.name,
      unitPrice,
      quantity,
      total,
      customerId:  customerId ?? null,
    },
    select: { id: true, saleNumber: true },
  });

  return { success: true, data: { id: sale.id, saleNumber: sale.saleNumber } };
}

export async function cancelSale(
  id: string,
  input: CancelSaleInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = cancelSaleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const sale = await prisma.sale.findUnique({
    where:  { id },
    select: { id: true, status: true },
  });

  if (!sale) {
    return { success: false, error: "La venta no existe." };
  }
  if (sale.status === "CANCELADA") {
    return { success: false, error: "La venta ya está cancelada." };
  }

  await prisma.sale.update({
    where: { id },
    data: {
      status:       "CANCELADA",
      cancelReason: parsed.data.cancelReason,
      cancelledAt:  new Date(),
    },
  });

  return { success: true, data: { id } };
}

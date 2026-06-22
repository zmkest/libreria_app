"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createSaleSchema, cancelSaleSchema } from "./schemas";
import type { CreateSaleInput } from "./schemas";
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

  const { items, paymentMethod, customerId } = parsed.data;

  const uniqueIds = [...new Set(items.map((i) => i.productId))];
  const products  = await prisma.product.findMany({
    where:  { id: { in: uniqueIds } },
    select: { id: true, salePrice: true },
  });

  if (products.length !== uniqueIds.length) {
    return { success: false, error: "Uno o más productos no fueron encontrados." };
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  const resolvedItems = items.map((item) => {
    const p         = productMap.get(item.productId)!;
    const unitPrice = new Decimal(p.salePrice.toString());
    const subtotal  = unitPrice.times(item.quantity);
    return {
      productId: item.productId,
      quantity:  item.quantity,
      unitPrice: unitPrice.toFixed(2),
      subtotal:  subtotal.toFixed(2),
    };
  });

  const grandTotal = resolvedItems.reduce(
    (acc, item) => acc.plus(item.subtotal),
    new Decimal(0),
  );

  // Crear borrador: sin tocar stock, estado BORRADOR
  const sale = await prisma.sale.create({
    data: {
      userId:        session.user.id,
      customerId:    customerId ?? null,
      paymentMethod,
      total:         grandTotal.toFixed(2),
      status:        "BORRADOR",
      details: {
        create: resolvedItems.map((item) => ({
          productId: item.productId,
          quantity:  item.quantity,
          unitPrice: item.unitPrice,
          subtotal:  item.subtotal,
        })),
      },
    },
    select: { id: true, saleNumber: true },
  });

  return { success: true, data: { id: sale.id, saleNumber: sale.saleNumber } };
}

export async function confirmSale(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Sesión no válida. Vuelva a iniciar sesión." };
  }

  const sale = await prisma.sale.findUnique({
    where:  { id },
    select: {
      id:      true,
      status:  true,
      details: { select: { productId: true, quantity: true } },
    },
  });

  if (!sale) {
    return { success: false, error: "Venta no encontrada." };
  }
  if (sale.status !== "BORRADOR") {
    return { success: false, error: "Solo se puede confirmar una venta en estado BORRADOR." };
  }

  // Descontar stock y marcar como PAGADA en una sola transacción
  await prisma.$transaction(async (tx) => {
    await tx.sale.update({
      where: { id },
      data:  { status: "PAGADA", paidAt: new Date() },
    });

    for (const detail of sale.details) {
      await tx.product.update({
        where: { id: detail.productId },
        data:  { stock: { decrement: detail.quantity } },
      });
    }
  });

  return { success: true, data: { id } };
}

export async function cancelSale(
  id: string,
  cancellationReason: string,
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Sesión no válida. Vuelva a iniciar sesión." };
  }

  const parsed = cancelSaleSchema.safeParse({ cancellationReason });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const sale = await prisma.sale.findUnique({
    where:  { id },
    select: {
      id:      true,
      status:  true,
      details: { select: { productId: true, quantity: true } },
    },
  });

  if (!sale) {
    return { success: false, error: "Venta no encontrada." };
  }
  if (sale.status === "ANULADA") {
    return { success: false, error: "La venta ya está anulada." };
  }

  const wasPagada = sale.status === "PAGADA";

  // Anular y revertir stock (solo si venía de PAGADA) en una sola transacción
  await prisma.$transaction(async (tx) => {
    await tx.sale.update({
      where: { id },
      data: {
        status:             "ANULADA",
        cancellationReason: cancellationReason.trim(),
        cancelledById:      session.user.id,
        cancelledAt:        new Date(),
      },
    });

    if (wasPagada) {
      for (const detail of sale.details) {
        await tx.product.update({
          where: { id: detail.productId },
          data:  { stock: { increment: detail.quantity } },
        });
      }
    }
  });

  return { success: true, data: { id } };
}

"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createSaleSchema } from "./schemas";
import type { CreateSaleInput } from "./schemas";
import Decimal from "decimal.js";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createSale(
  input: CreateSaleInput,
): Promise<ActionResult<{ id: string; saleNumber: number; lowStockWarnings: string[] }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Sesión no válida. Vuelva a iniciar sesión." };
  }

  const parsed = createSaleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { items, paymentMethod, customerId } = parsed.data;

  // Una sola consulta para todos los productos del carrito
  const uniqueIds = [...new Set(items.map((i) => i.productId))];
  const products  = await prisma.product.findMany({
    where:  { id: { in: uniqueIds } },
    select: { id: true, name: true, salePrice: true, stock: true },
  });

  if (products.length !== uniqueIds.length) {
    return { success: false, error: "Uno o más productos no fueron encontrados." };
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  // Calcular subtotales con Decimal
  const resolvedItems = items.map((item) => {
    const p         = productMap.get(item.productId)!;
    const unitPrice = new Decimal(p.salePrice.toString());
    const subtotal  = unitPrice.times(item.quantity);
    return {
      productId:    item.productId,
      productName:  p.name,
      productStock: p.stock,
      quantity:     item.quantity,
      unitPrice:    unitPrice.toFixed(2),
      subtotal:     subtotal.toFixed(2),
    };
  });

  const grandTotal = resolvedItems.reduce(
    (acc, item) => acc.plus(item.subtotal),
    new Decimal(0),
  );

  // Productos cuyo stock no alcanza para la cantidad pedida (advertencia, no bloqueo)
  const lowStockWarnings = resolvedItems
    .filter((item) => item.productStock < item.quantity)
    .map((item) => item.productName);

  // Crear venta + detalles + decrementar stock en una sola transacción
  const sale = await prisma.$transaction(async (tx) => {
    const created = await tx.sale.create({
      data: {
        userId:        session.user.id,
        customerId:    customerId ?? null,
        paymentMethod,
        total:         grandTotal.toFixed(2),
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

    for (const item of resolvedItems) {
      await tx.product.update({
        where: { id: item.productId },
        data:  { stock: { decrement: item.quantity } },
      });
    }

    return created;
  });

  return {
    success: true,
    data: { id: sale.id, saleNumber: sale.saleNumber, lowStockWarnings },
  };
}

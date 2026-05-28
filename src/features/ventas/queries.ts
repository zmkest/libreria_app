import { prisma } from "@/lib/prisma";
import { SaleStatus, Prisma } from "@/generated/prisma/client";
import { startOfDay, endOfDay } from "date-fns";

export interface SaleRow {
  id:           string;
  saleNumber:   number;
  createdAt:    string;
  customer:     { id: string; firstName: string; lastName: string } | null;
  user:         { id: string; name: string };
  productId:    string;
  productName:  string;
  unitPrice:    string;
  quantity:     number;
  total:        string;
  status:       SaleStatus;
  cancelReason: string | null;
  cancelledAt:  string | null;
}

function serializeSale(s: {
  id: string;
  saleNumber: number;
  createdAt: Date;
  customer: { id: string; firstName: string; lastName: string } | null;
  user: { id: string; name: string };
  productId: string;
  productName: string;
  unitPrice: { toString(): string };
  quantity: number;
  total: { toString(): string };
  status: SaleStatus;
  cancelReason: string | null;
  cancelledAt: Date | null;
}): SaleRow {
  return {
    ...s,
    unitPrice:   s.unitPrice.toString(),
    total:       s.total.toString(),
    createdAt:   s.createdAt.toISOString(),
    cancelledAt: s.cancelledAt ? s.cancelledAt.toISOString() : null,
  };
}

const saleSelect = {
  id:           true,
  saleNumber:   true,
  createdAt:    true,
  productId:    true,
  productName:  true,
  unitPrice:    true,
  quantity:     true,
  total:        true,
  status:       true,
  cancelReason: true,
  cancelledAt:  true,
  customer: { select: { id: true, firstName: true, lastName: true } },
  user:     { select: { id: true, name: true } },
} as const;

export async function listSales({
  from,
  to,
  status,
  search   = "",
  page     = 1,
  pageSize = 15,
}: {
  from?:     string;
  to?:       string;
  status?:   SaleStatus | "TODAS";
  search?:   string;
  page?:     number;
  pageSize?: number;
}) {
  const where: Prisma.SaleWhereInput = {};

  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to   ? { lte: new Date(to)   } : {}),
    };
  }

  if (status && status !== "TODAS") {
    where.status = status;
  }

  if (search) {
    const num = parseInt(search, 10);
    where.OR = [
      { productName: { contains: search, mode: "insensitive" } },
      ...(!isNaN(num) ? [{ saleNumber: num }] : []),
    ];
  }

  const [items, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * pageSize,
      take:    pageSize,
      select:  saleSelect,
    }),
    prisma.sale.count({ where }),
  ]);

  return {
    items: items.map(serializeSale),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getSaleById(id: string): Promise<SaleRow | null> {
  const s = await prisma.sale.findUnique({ where: { id }, select: saleSelect });
  if (!s) return null;
  return serializeSale(s);
}

export async function getSalesByCustomer(customerId: string): Promise<SaleRow[]> {
  const items = await prisma.sale.findMany({
    where:   { customerId },
    orderBy: { createdAt: "desc" },
    select:  saleSelect,
  });
  return items.map(serializeSale);
}

export async function getDailySummary() {
  const now  = new Date();
  const from = startOfDay(now);
  const to   = endOfDay(now);

  const where = {
    status:    "COMPLETADA" as SaleStatus,
    createdAt: { gte: from, lte: to },
  };

  const [agg, cancelled] = await Promise.all([
    prisma.sale.aggregate({
      where,
      _sum:   { total: true },
      _count: true,
    }),
    prisma.sale.count({
      where: { status: "CANCELADA", createdAt: { gte: from, lte: to } },
    }),
  ]);

  return {
    total:     agg._sum.total?.toString() ?? "0",
    count:     agg._count,
    cancelled,
  };
}

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

// Ecuador es UTC-5 sin horario de verano
const TZ = "America/Guayaquil";

function dayStart(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00-05:00`);
}
function dayEnd(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59.999-05:00`);
}
function todayInEcuador(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

export interface SaleDetailRow {
  id:        string;
  productId: string;
  product:   { name: string; code: string };
  quantity:  number;
  unitPrice: string;
  subtotal:  string;
}

export interface SaleRow {
  id:            string;
  saleNumber:    number;
  createdAt:     string;
  paymentMethod: string;
  total:         string;
  customer:      { id: string; firstName: string; lastName: string } | null;
  user:          { id: string; name: string };
  details:       SaleDetailRow[];
}

const saleSelect = {
  id:            true,
  saleNumber:    true,
  createdAt:     true,
  paymentMethod: true,
  total:         true,
  customer: { select: { id: true, firstName: true, lastName: true } },
  user:     { select: { id: true, name: true } },
  details:  {
    select: {
      id:        true,
      productId: true,
      product:   { select: { name: true, code: true } },
      quantity:  true,
      unitPrice: true,
      subtotal:  true,
    },
    orderBy: { createdAt: "asc" as const },
  },
} as const;

function serializeSale(s: {
  id:            string;
  saleNumber:    number;
  createdAt:     Date;
  paymentMethod: string;
  total:         { toString(): string };
  customer:      { id: string; firstName: string; lastName: string } | null;
  user:          { id: string; name: string };
  details: {
    id:        string;
    productId: string;
    product:   { name: string; code: string };
    quantity:  number;
    unitPrice: { toString(): string };
    subtotal:  { toString(): string };
  }[];
}): SaleRow {
  return {
    id:            s.id,
    saleNumber:    s.saleNumber,
    createdAt:     s.createdAt.toISOString(),
    paymentMethod: s.paymentMethod,
    total:         s.total.toString(),
    customer:      s.customer,
    user:          s.user,
    details: s.details.map((d) => ({
      id:        d.id,
      productId: d.productId,
      product:   d.product,
      quantity:  d.quantity,
      unitPrice: d.unitPrice.toString(),
      subtotal:  d.subtotal.toString(),
    })),
  };
}

export async function listSales({
  from,
  to,
  search   = "",
  page     = 1,
  pageSize = 15,
}: {
  from?:     string;
  to?:       string;
  search?:   string;
  page?:     number;
  pageSize?: number;
}) {
  const where: Prisma.SaleWhereInput = {};

  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: dayStart(from) } : {}),
      ...(to   ? { lte: dayEnd(to)     } : {}),
    };
  }

  if (search) {
    const num = parseInt(search, 10);
    where.OR = [
      { details: { some: { product: { name: { contains: search, mode: "insensitive" } } } } },
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
  const today   = todayInEcuador();          // "YYYY-MM-DD" en hora Ecuador
  const dayFrom = dayStart(today);
  const dayTo   = dayEnd(today);

  // Primer y último día del mes actual en Ecuador
  const [y, m]  = today.split("-").map(Number);
  const firstDay = `${y}-${String(m).padStart(2, "0")}-01`;
  const lastDay  = new Date(y, m, 0).getDate();
  const lastDayStr = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  const monFrom = dayStart(firstDay);
  const monTo   = dayEnd(lastDayStr);

  const [dayAgg, monAgg] = await Promise.all([
    prisma.sale.aggregate({
      where: { createdAt: { gte: dayFrom, lte: dayTo } },
      _sum:  { total: true },
      _count: true,
    }),
    prisma.sale.aggregate({
      where: { createdAt: { gte: monFrom, lte: monTo } },
      _sum:  { total: true },
      _count: true,
    }),
  ]);

  return {
    dayTotal:  dayAgg._sum.total?.toString()  ?? "0",
    dayCount:  dayAgg._count,
    monTotal:  monAgg._sum.total?.toString()  ?? "0",
    monCount:  monAgg._count,
  };
}

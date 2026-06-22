import { prisma } from "@/lib/prisma";
import Decimal from "decimal.js";

export type PeriodType = "dia" | "mes" | "anio";

const TZ = "America/Guayaquil";

function dayStart(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00-05:00`);
}
function dayEnd(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59.999-05:00`);
}
function nowInEcuador(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

export function defaultPeriodValue(type: PeriodType): string {
  const today = nowInEcuador(); // "YYYY-MM-DD"
  if (type === "dia")  return today;
  if (type === "mes")  return today.slice(0, 7);
  return today.slice(0, 4);
}

function getDateRange(type: PeriodType, value: string): { from: Date; to: Date } {
  if (type === "dia") {
    return { from: dayStart(value), to: dayEnd(value) };
  }
  if (type === "mes") {
    const [y, m] = value.split("-").map(Number);
    const firstDay   = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay    = new Date(y, m, 0).getDate();
    const lastDayStr = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    return { from: dayStart(firstDay), to: dayEnd(lastDayStr) };
  }
  // anio
  return { from: dayStart(`${value}-01-01`), to: dayEnd(`${value}-12-31`) };
}

export interface SaleDetailReportRow {
  productName: string;
  quantity:    number;
  unitPrice:   string;
  subtotal:    string;
}

export interface SaleReportRow {
  id:         string;
  saleNumber: number;
  createdAt:  string;
  status:     string;
  customer:   { firstName: string; lastName: string } | null;
  details:    SaleDetailReportRow[];
  total:      string;
  investment: string;
  profit:     string;
}

export interface ReportSummary {
  totalSales:      string;
  totalInvestment: string;
  netProfit:       string;
  count:           number;
  sales:           SaleReportRow[];
}

export async function getReport(
  periodType:  PeriodType,
  periodValue: string,
): Promise<ReportSummary> {
  const { from, to } = getDateRange(periodType, periodValue);

  const sales = await prisma.sale.findMany({
    where:   { createdAt: { gte: from, lte: to } },
    orderBy: { createdAt: "desc" },
    select: {
      id:         true,
      saleNumber: true,
      createdAt:  true,
      status:     true,
      total:      true,
      customer:   { select: { firstName: true, lastName: true } },
      details: {
        select: {
          quantity:  true,
          unitPrice: true,
          subtotal:  true,
          product:   { select: { name: true, purchasePrice: true } },
        },
      },
    },
  });

  let totalSales      = new Decimal(0);
  let totalInvestment = new Decimal(0);

  const rows: SaleReportRow[] = sales.map((s) => {
    let investment = new Decimal(0);
    for (const d of s.details) {
      investment = investment.plus(
        new Decimal(d.product.purchasePrice.toString()).times(d.quantity),
      );
    }

    const saleTotal = new Decimal(s.total.toString());
    const profit    = saleTotal.minus(investment);

    // Solo las ventas PAGADAS suman a los totales
    if (s.status === "PAGADA") {
      totalSales      = totalSales.plus(saleTotal);
      totalInvestment = totalInvestment.plus(investment);
    }

    return {
      id:         s.id,
      saleNumber: s.saleNumber,
      createdAt:  s.createdAt.toISOString(),
      status:     s.status,
      customer:   s.customer,
      details:    s.details.map((d) => ({
        productName: d.product.name,
        quantity:    d.quantity,
        unitPrice:   d.unitPrice.toString(),
        subtotal:    d.subtotal.toString(),
      })),
      total:      s.total.toString(),
      investment: investment.toFixed(2),
      profit:     profit.toFixed(2),
    };
  });

  return {
    totalSales:      totalSales.toFixed(2),
    totalInvestment: totalInvestment.toFixed(2),
    netProfit:       totalSales.minus(totalInvestment).toFixed(2),
    count:           rows.filter((r) => r.status === "PAGADA").length,
    sales:           rows,
  };
}

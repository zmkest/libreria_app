import { prisma } from "@/lib/prisma";
import {
  startOfDay, endOfDay,
  startOfMonth, endOfMonth,
  startOfYear, endOfYear,
  parseISO,
} from "date-fns";
import Decimal from "decimal.js";

export type PeriodType = "dia" | "mes" | "anio";

export interface SaleReportRow {
  id:          string;
  saleNumber:  number;
  createdAt:   string;
  customer:    { firstName: string; lastName: string } | null;
  productName: string;
  quantity:    number;
  unitPrice:   string;
  total:       string;
  investment:  string;
  profit:      string;
}

export interface ReportSummary {
  totalSales:      string;
  totalInvestment: string;
  netProfit:       string;
  count:           number;
  sales:           SaleReportRow[];
}

function getDateRange(type: PeriodType, value: string): { from: Date; to: Date } {
  if (type === "dia") {
    const d = parseISO(value);
    return { from: startOfDay(d), to: endOfDay(d) };
  }
  if (type === "mes") {
    const d = parseISO(`${value}-01`);
    return { from: startOfMonth(d), to: endOfMonth(d) };
  }
  const d = parseISO(`${value}-01-01`);
  return { from: startOfYear(d), to: endOfYear(d) };
}

export async function getReport(
  periodType:  PeriodType,
  periodValue: string,
): Promise<ReportSummary> {
  const { from, to } = getDateRange(periodType, periodValue);

  const sales = await prisma.sale.findMany({
    where:   { status: "COMPLETADA", createdAt: { gte: from, lte: to } },
    orderBy: { createdAt: "desc" },
    select: {
      id:          true,
      saleNumber:  true,
      createdAt:   true,
      productName: true,
      quantity:    true,
      unitPrice:   true,
      total:       true,
      customer: { select: { firstName: true, lastName: true } },
      product:  { select: { purchasePrice: true } },
    },
  });

  let totalSales      = new Decimal(0);
  let totalInvestment = new Decimal(0);

  const rows: SaleReportRow[] = sales.map((s) => {
    const investment = new Decimal(s.product.purchasePrice.toString()).times(s.quantity);
    const saleTotal  = new Decimal(s.total.toString());
    const profit     = saleTotal.minus(investment);

    totalSales      = totalSales.plus(saleTotal);
    totalInvestment = totalInvestment.plus(investment);

    return {
      id:          s.id,
      saleNumber:  s.saleNumber,
      createdAt:   s.createdAt.toISOString(),
      customer:    s.customer,
      productName: s.productName,
      quantity:    s.quantity,
      unitPrice:   s.unitPrice.toString(),
      total:       s.total.toString(),
      investment:  investment.toFixed(2),
      profit:      profit.toFixed(2),
    };
  });

  return {
    totalSales:      totalSales.toFixed(2),
    totalInvestment: totalInvestment.toFixed(2),
    netProfit:       totalSales.minus(totalInvestment).toFixed(2),
    count:           sales.length,
    sales:           rows,
  };
}

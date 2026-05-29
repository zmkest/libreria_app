import { format } from "date-fns";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { getReport } from "@/features/reportes/queries";
import { ReporteFiltros } from "@/features/reportes/components/reporte-filtros";
import { ReporteTabla } from "@/features/reportes/components/reporte-tabla";
import { formatCurrency } from "@/lib/money";
import Decimal from "decimal.js";
import type { PeriodType } from "@/features/reportes/queries";

type SearchParams = Promise<{ tipo?: string; valor?: string }>;

export default async function ReportesPage({ searchParams }: { searchParams: SearchParams }) {
  const { tipo, valor } = await searchParams;

  const periodType: PeriodType =
    tipo === "dia" || tipo === "mes" || tipo === "anio" ? tipo : "mes";

  const now = new Date();
  const defaultValor =
    periodType === "dia"  ? format(now, "yyyy-MM-dd") :
    periodType === "mes"  ? format(now, "yyyy-MM") :
                            format(now, "yyyy");

  const periodValue = valor ?? defaultValor;
  const report = await getReport(periodType, periodValue);

  const netProfitDecimal = new Decimal(report.netProfit);
  const isLoss = netProfitDecimal.isNegative();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand">Reportes</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Resumen de ventas, inversión y ganancia
        </p>
      </div>

      <ReporteFiltros currentTipo={periodType} currentValor={periodValue} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-md px-6 py-5 flex items-center gap-4 border-l-4 border-brand">
          <div className="p-3 rounded-xl bg-brand-bg">
            <DollarSign size={22} className="text-brand" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total ventas</p>
            <p className="text-2xl font-bold text-brand mt-0.5">
              {formatCurrency(new Decimal(report.totalSales))}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {report.count} venta{report.count !== 1 ? "s" : ""} completada{report.count !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md px-6 py-5 flex items-center gap-4 border-l-4 border-amber-400">
          <div className="p-3 rounded-xl bg-amber-50">
            <TrendingDown size={22} className="text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total inversión</p>
            <p className="text-2xl font-bold text-amber-600 mt-0.5">
              {formatCurrency(new Decimal(report.totalInvestment))}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Precio de compra × cantidad</p>
          </div>
        </div>

        <div className={`bg-white rounded-2xl shadow-md px-6 py-5 flex items-center gap-4 border-l-4 ${isLoss ? "border-danger" : "border-green-400"}`}>
          <div className={`p-3 rounded-xl ${isLoss ? "bg-red-50" : "bg-green-50"}`}>
            <TrendingUp size={22} className={isLoss ? "text-danger" : "text-green-500"} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Ganancia neta</p>
            <p className={`text-2xl font-bold mt-0.5 ${isLoss ? "text-danger" : "text-green-600"}`}>
              {formatCurrency(netProfitDecimal)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Total ventas − inversión</p>
          </div>
        </div>
      </div>

      <ReporteTabla sales={report.sales} />
    </div>
  );
}

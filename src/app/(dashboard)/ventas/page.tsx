import Link from "next/link";
import { Plus, ShoppingCart, TrendingUp } from "lucide-react";
import { listSales, getDailySummary } from "@/features/ventas/queries";
import { VentasFiltros } from "@/features/ventas/components/ventas-filtros";
import { VentasTabla } from "@/features/ventas/components/ventas-tabla";
import { formatCurrency } from "@/lib/money";
import Decimal from "decimal.js";

type SearchParams = Promise<{
  from?:   string;
  to?:     string;
  search?: string;
  status?: string;
  page?:   string;
}>;

export default async function VentasPage({ searchParams }: { searchParams: SearchParams }) {
  const { from, to, search, status, page } = await searchParams;

  const [{ items, total, totalPages, page: currentPage }, daily] = await Promise.all([
    listSales({
      from,
      to,
      search,
      status,
      page:     Number(page) || 1,
      pageSize: 15,
    }),
    getDailySummary(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand">Ventas</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} venta(s) encontrada(s)</p>
        </div>
        <Link
          href="/ventas/nueva"
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white bg-brand hover:bg-brand-dark hover:-translate-y-0.5 transition-all"
        >
          <Plus size={16} />
          Nueva venta
        </Link>
      </div>

      {/* Resumen — solo ventas PAGADAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-md px-6 py-5 flex items-center gap-4 border-l-4 border-brand">
          <div className="p-3 rounded-xl bg-brand-bg">
            <ShoppingCart size={22} className="text-brand" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total del día</p>
            <p className="text-2xl font-bold text-brand mt-0.5">
              {formatCurrency(new Decimal(daily.dayTotal))}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {daily.dayCount} venta{daily.dayCount !== 1 ? "s" : ""} pagada{daily.dayCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md px-6 py-5 flex items-center gap-4 border-l-4 border-green-400">
          <div className="p-3 rounded-xl bg-green-50">
            <TrendingUp size={22} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total del mes</p>
            <p className="text-2xl font-bold text-brand mt-0.5">
              {formatCurrency(new Decimal(daily.monTotal))}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {daily.monCount} venta{daily.monCount !== 1 ? "s" : ""} este mes
            </p>
          </div>
        </div>
      </div>

      <VentasFiltros
        currentFrom={from ?? ""}
        currentTo={to ?? ""}
        currentSearch={search ?? ""}
        currentStatus={status ?? ""}
      />

      <VentasTabla
        sales={items}
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </div>
  );
}

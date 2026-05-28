import Link from "next/link";
import { Plus, ShoppingCart, XCircle } from "lucide-react";
import { listSales, getDailySummary } from "@/features/ventas/queries";
import { SaleStatus } from "@/generated/prisma/client";
import { VentasFiltros } from "@/features/ventas/components/ventas-filtros";
import { VentasTabla } from "@/features/ventas/components/ventas-tabla";
import { formatCurrency } from "@/lib/money";
import Decimal from "decimal.js";

type SearchParams = Promise<{
  from?:   string;
  to?:     string;
  status?: string;
  search?: string;
  page?:   string;
}>;

export default async function VentasPage({ searchParams }: { searchParams: SearchParams }) {
  const { from, to, status, search, page } = await searchParams;

  const statusFilter =
    status === "COMPLETADA" || status === "CANCELADA"
      ? (status as SaleStatus)
      : "TODAS";

  const [{ items, total, totalPages, page: currentPage }, daily] = await Promise.all([
    listSales({
      from,
      to,
      status: statusFilter,
      search,
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

      {/* Resumen del día */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-md px-6 py-5 flex items-center gap-4 border-l-4 border-brand">
          <div className="p-3 rounded-xl bg-brand-bg">
            <ShoppingCart size={22} className="text-brand" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total del día</p>
            <p className="text-2xl font-bold text-brand mt-0.5">
              {formatCurrency(new Decimal(daily.total))}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {daily.count} venta{daily.count !== 1 ? "s" : ""} completada{daily.count !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md px-6 py-5 flex items-center gap-4 border-l-4 border-red-300">
          <div className="p-3 rounded-xl bg-red-50">
            <XCircle size={22} className="text-danger" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Canceladas hoy</p>
            <p className="text-2xl font-bold text-brand-dark mt-0.5">{daily.cancelled}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              venta{daily.cancelled !== 1 ? "s" : ""} cancelada{daily.cancelled !== 1 ? "s" : ""} hoy
            </p>
          </div>
        </div>
      </div>

      <VentasFiltros
        currentFrom={from ?? ""}
        currentTo={to ?? ""}
        currentStatus={status ?? "TODAS"}
        currentSearch={search ?? ""}
      />

      <VentasTabla
        sales={items}
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </div>
  );
}

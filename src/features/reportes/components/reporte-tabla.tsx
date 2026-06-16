"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/money";
import Decimal from "decimal.js";
import type { SaleReportRow } from "@/features/reportes/queries";

const PAGE_SIZE = 10;

interface Props {
  sales: SaleReportRow[];
}

export function ReporteTabla({ sales }: Props) {
  const [page, setPage] = useState(1);

  if (sales.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md px-6 py-12 text-center text-sm text-gray-400">
        No hay ventas en el período seleccionado
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(sales.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageRows   = sales.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function goToPage(p: number) {
    setPage(Math.min(Math.max(1, p), totalPages));
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-brand-border">
        <h2 className="text-base font-bold text-brand">Detalle de ventas</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {sales.length} venta{sales.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {["N°", "Fecha", "Cliente", "Productos", "Total", "Inversión", "Ganancia", ""].map((h) => (
                <th
                  key={h}
                  className="bg-brand text-white px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((sale) => {
              const profit = new Decimal(sale.profit);
              const isLoss = profit.isNegative();
              return (
                <tr
                  key={sale.id}
                  className="border-t border-brand-border even:bg-brand-bg/40 hover:bg-brand-bg transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-bold text-brand whitespace-nowrap">
                    #{String(sale.saleNumber).padStart(3, "0")}
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-dark whitespace-nowrap">
                    {format(new Date(sale.createdAt), "dd/MM/yyyy · HH:mm", { locale: es })}
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-dark">
                    {sale.customer
                      ? `${sale.customer.firstName} ${sale.customer.lastName}`
                      : <span className="text-gray-400 italic">Consumidor final</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-dark max-w-[200px]">
                    {sale.details.length === 1 ? (
                      <span className="block truncate" title={sale.details[0].productName}>
                        {sale.details[0].productName}
                      </span>
                    ) : (
                      <span className="text-brand font-medium">
                        {sale.details.length} productos
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-brand-dark whitespace-nowrap">
                    {formatCurrency(new Decimal(sale.total))}
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-dark whitespace-nowrap">
                    {formatCurrency(new Decimal(sale.investment))}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold whitespace-nowrap">
                    <span className={isLoss ? "text-danger" : "text-green-600"}>
                      {formatCurrency(profit)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/ventas/${sale.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg font-medium text-brand border border-brand-border hover:bg-brand hover:text-white transition-all whitespace-nowrap"
                    >
                      <Eye size={12} />
                      Ver
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-brand-border">
          <span className="text-sm text-gray-500">
            Página {safePage} de {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage <= 1}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-brand border border-brand-border hover:bg-brand-bg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
              Anterior
            </button>
            <button
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage >= totalPages}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-brand border border-brand-border hover:bg-brand-bg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

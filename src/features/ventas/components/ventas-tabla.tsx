"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatCurrency } from "@/lib/money";
import Decimal from "decimal.js";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import type { SaleRow } from "@/features/ventas/queries";

interface Props {
  sales:       SaleRow[];
  totalPages:  number;
  currentPage: number;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "COMPLETADA") {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 whitespace-nowrap">
        Completada
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
      Cancelada
    </span>
  );
}

export function VentasTabla({ sales, totalPages, currentPage }: Props) {
  const router = useRouter();

  function goToPage(page: number) {
    const url = new URL(window.location.href);
    url.searchParams.set("page", page.toString());
    router.push(url.pathname + url.search);
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {["N°", "Fecha", "Cliente", "Producto", "Cant.", "P. Unitario", "Total", "Estado", ""].map((h) => (
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
            {sales.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400">
                  No hay ventas con los filtros aplicados
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
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
                    {sale.customer ? (
                      `${sale.customer.firstName} ${sale.customer.lastName}`
                    ) : (
                      <span className="text-gray-400 italic">Consumidor final</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-dark max-w-[180px]">
                    <span className="block truncate" title={sale.productName}>
                      {sale.productName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-dark text-center">
                    {sale.quantity}
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-dark whitespace-nowrap">
                    {formatCurrency(new Decimal(sale.unitPrice))}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-brand-dark whitespace-nowrap">
                    {formatCurrency(new Decimal(sale.total))}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={sale.status} />
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-brand-border">
          <span className="text-sm text-gray-500">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-brand border border-brand-border hover:bg-brand-bg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
              Anterior
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
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

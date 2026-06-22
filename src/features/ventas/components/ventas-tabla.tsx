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

const PAYMENT_STYLES: Record<string, string> = {
  EFECTIVO:      "bg-green-50 text-green-700 border-green-200",
  TRANSFERENCIA: "bg-blue-50 text-blue-700 border-blue-200",
  TARJETA:       "bg-purple-50 text-purple-700 border-purple-200",
};
const PAYMENT_LABELS: Record<string, string> = {
  EFECTIVO:      "Efectivo",
  TRANSFERENCIA: "Transferencia",
  TARJETA:       "Tarjeta",
};
const STATUS_STYLES: Record<string, string> = {
  BORRADOR: "bg-yellow-50 text-yellow-700 border-yellow-300",
  PAGADA:   "bg-green-50 text-green-700 border-green-200",
  ANULADA:  "bg-red-50 text-red-700 border-red-200",
};
const STATUS_LABELS: Record<string, string> = {
  BORRADOR: "Borrador",
  PAGADA:   "Pagada",
  ANULADA:  "Anulada",
};

function PaymentBadge({ method }: { method: string }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${
        PAYMENT_STYLES[method] ?? "bg-gray-50 text-gray-600 border-gray-200"
      }`}
    >
      {PAYMENT_LABELS[method] ?? method}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap ${
        STATUS_STYLES[status] ?? "bg-gray-50 text-gray-600 border-gray-200"
      }`}
    >
      {STATUS_LABELS[status] ?? status}
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
              {["N°", "Fecha", "Cliente", "Productos", "Estado", "Método", "Total", ""].map((h) => (
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
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                  No hay ventas con los filtros aplicados
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr
                  key={sale.id}
                  className={`border-t border-brand-border transition-colors ${
                    sale.status === "ANULADA"
                      ? "bg-red-50/40 opacity-70"
                      : "even:bg-brand-bg/40 hover:bg-brand-bg"
                  }`}
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
                  <td className="px-4 py-3 text-sm text-brand-dark max-w-[200px]">
                    {sale.details.length === 1 ? (
                      <span className="block truncate" title={sale.details[0].product.name}>
                        {sale.details[0].product.name}
                      </span>
                    ) : (
                      <span className="text-brand font-medium">
                        {sale.details.length} productos
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={sale.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PaymentBadge method={sale.paymentMethod} />
                  </td>
                  <td className={`px-4 py-3 text-sm font-bold whitespace-nowrap ${
                    sale.status === "ANULADA" ? "text-gray-400 line-through" : "text-brand-dark"
                  }`}>
                    {formatCurrency(new Decimal(sale.total))}
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

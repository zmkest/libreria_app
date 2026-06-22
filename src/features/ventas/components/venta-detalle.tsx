"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/money";
import Decimal from "decimal.js";
import { confirmSale } from "@/features/ventas/actions";
import { AnularVentaDialog } from "./anular-venta-dialog";
import type { SaleRow } from "@/features/ventas/queries";

interface Props {
  sale: SaleRow;
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

export function VentaDetalle({ sale }: Props) {
  const router = useRouter();
  const [confirming, setConfirming]   = useState(false);
  const [showAnular, setShowAnular]   = useState(false);

  async function handleConfirm() {
    setConfirming(true);
    const result = await confirmSale(sale.id);
    setConfirming(false);

    if (result.success) {
      toast.success(`Venta #${String(sale.saleNumber).padStart(3, "0")} confirmada como pagada`);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <Link
          href="/ventas"
          className="flex items-center gap-1.5 text-sm text-brand hover:text-brand-dark transition-colors w-fit"
        >
          <ArrowLeft size={15} />
          Volver a ventas
        </Link>

        <div className="bg-white rounded-2xl shadow-md p-8">
          {/* Cabecera */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-brand">
                Venta #{String(sale.saleNumber).padStart(3, "0")}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {format(new Date(sale.createdAt), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-bold border ${
                  STATUS_STYLES[sale.status] ?? "bg-gray-50 text-gray-600 border-gray-200"
                }`}
              >
                {STATUS_LABELS[sale.status] ?? sale.status}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${
                  PAYMENT_STYLES[sale.paymentMethod] ?? "bg-gray-50 text-gray-600 border-gray-200"
                }`}
              >
                {PAYMENT_LABELS[sale.paymentMethod] ?? sale.paymentMethod}
              </span>
            </div>
          </div>

          {/* Info general */}
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
            <div>
              <dt className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Cliente</dt>
              <dd className="text-sm font-medium text-brand-dark">
                {sale.customer
                  ? `${sale.customer.firstName} ${sale.customer.lastName}`
                  : <span className="text-gray-400 italic">Consumidor final</span>}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Registrada por</dt>
              <dd className="text-sm font-medium text-brand-dark">{sale.user.name}</dd>
            </div>
            {sale.paidAt && (
              <div>
                <dt className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Fecha de pago</dt>
                <dd className="text-sm font-medium text-brand-dark">
                  {format(new Date(sale.paidAt), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                </dd>
              </div>
            )}
          </dl>

          {/* Info de anulación */}
          {sale.status === "ANULADA" && (
            <div className="mb-6 px-4 py-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2">Información de anulación</p>
              <dl className="flex flex-col gap-2">
                <div>
                  <dt className="text-xs text-red-500 font-medium">Motivo</dt>
                  <dd className="text-sm text-red-800">{sale.cancellationReason}</dd>
                </div>
                {sale.cancelledBy && (
                  <div>
                    <dt className="text-xs text-red-500 font-medium">Anulada por</dt>
                    <dd className="text-sm text-red-800">{sale.cancelledBy.name}</dd>
                  </div>
                )}
                {sale.cancelledAt && (
                  <div>
                    <dt className="text-xs text-red-500 font-medium">Fecha de anulación</dt>
                    <dd className="text-sm text-red-800">
                      {format(new Date(sale.cancelledAt), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Tabla de detalles */}
          <div className="border border-brand-border rounded-xl overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-bg">
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wide">
                    Producto
                  </th>
                  <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-400 uppercase tracking-wide w-16">
                    Cant.
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-bold text-gray-400 uppercase tracking-wide">
                    P. Unit.
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-bold text-gray-400 uppercase tracking-wide">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {sale.details.map((d) => (
                  <tr key={d.id} className="border-t border-brand-border">
                    <td className="px-4 py-3 text-brand-dark">
                      <span className="font-medium">{d.product.name}</span>
                      <span className="ml-2 text-xs text-gray-400">{d.product.code}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-brand-dark">{d.quantity}</td>
                    <td className="px-4 py-3 text-right text-brand-dark whitespace-nowrap">
                      {formatCurrency(new Decimal(d.unitPrice))}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-brand-dark whitespace-nowrap">
                      {formatCurrency(new Decimal(d.subtotal))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="flex justify-end mb-6">
            <div className="flex items-center gap-6 px-5 py-3 rounded-xl bg-brand-bg border-2 border-brand">
              <span className="text-sm font-bold text-brand-dark">Total</span>
              <span className="text-2xl font-bold text-brand">
                {formatCurrency(new Decimal(sale.total))}
              </span>
            </div>
          </div>

          {/* Acciones según estado */}
          {sale.status === "BORRADOR" && (
            <div className="flex gap-3 pt-4 border-t border-brand-border">
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                <CheckCircle size={16} />
                {confirming ? "Confirmando..." : "Confirmar pago"}
              </button>
              <button
                onClick={() => setShowAnular(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-danger border-2 border-red-200 hover:bg-red-50 transition-all cursor-pointer"
              >
                <XCircle size={16} />
                Anular
              </button>
            </div>
          )}

          {sale.status === "PAGADA" && (
            <div className="flex gap-3 pt-4 border-t border-brand-border">
              <button
                onClick={() => setShowAnular(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-danger border-2 border-red-200 hover:bg-red-50 transition-all cursor-pointer"
              >
                <XCircle size={16} />
                Anular venta
              </button>
            </div>
          )}
        </div>
      </div>

      {showAnular && (
        <AnularVentaDialog
          saleId={sale.id}
          saleNumber={sale.saleNumber}
          wasPagada={sale.status === "PAGADA"}
          onClose={() => setShowAnular(false)}
        />
      )}
    </>
  );
}

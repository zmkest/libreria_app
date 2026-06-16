"use client";

import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/money";
import Decimal from "decimal.js";
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

export function VentaDetalle({ sale }: Props) {
  return (
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
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium border ${
              PAYMENT_STYLES[sale.paymentMethod] ?? "bg-gray-50 text-gray-600 border-gray-200"
            }`}
          >
            {PAYMENT_LABELS[sale.paymentMethod] ?? sale.paymentMethod}
          </span>
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
        </dl>

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
        <div className="flex justify-end">
          <div className="flex items-center gap-6 px-5 py-3 rounded-xl bg-brand-bg border-2 border-brand">
            <span className="text-sm font-bold text-brand-dark">Total</span>
            <span className="text-2xl font-bold text-brand">
              {formatCurrency(new Decimal(sale.total))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

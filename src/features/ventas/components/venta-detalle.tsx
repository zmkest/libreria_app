"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/money";
import Decimal from "decimal.js";
import { cancelSale } from "@/features/ventas/actions";
import type { SaleRow } from "@/features/ventas/queries";

interface Props {
  sale: SaleRow;
}

export function VentaDetalle({ sale }: Props) {
  const router = useRouter();
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason,   setCancelReason]   = useState("");
  const [submitting,     setSubmitting]     = useState(false);

  const isCompleted = sale.status === "COMPLETADA";

  async function handleCancel(e: React.FormEvent) {
    e.preventDefault();
    if (cancelReason.trim().length < 3) {
      toast.error("El motivo debe tener al menos 3 caracteres");
      return;
    }
    setSubmitting(true);
    const result = await cancelSale(sale.id, { cancelReason: cancelReason.trim() });
    setSubmitting(false);

    if (result.success) {
      toast.success("Venta cancelada");
      setShowCancelForm(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

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
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-brand">
              Venta #{String(sale.saleNumber).padStart(3, "0")}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {format(new Date(sale.createdAt), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
            </p>
          </div>
          {isCompleted ? (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
              Completada
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-200">
              Cancelada
            </span>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
          <div>
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Producto</dt>
            <dd className="text-sm font-medium text-brand-dark">{sale.productName}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Cliente</dt>
            <dd className="text-sm font-medium text-brand-dark">
              {sale.customer
                ? `${sale.customer.firstName} ${sale.customer.lastName}`
                : <span className="text-gray-400 italic">Consumidor final</span>}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Cantidad</dt>
            <dd className="text-sm font-medium text-brand-dark">{sale.quantity}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Precio unitario</dt>
            <dd className="text-sm font-medium text-brand-dark">
              {formatCurrency(new Decimal(sale.unitPrice))}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Total</dt>
            <dd className="text-lg font-bold text-brand">
              {formatCurrency(new Decimal(sale.total))}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Registrada por</dt>
            <dd className="text-sm font-medium text-brand-dark">{sale.user.name}</dd>
          </div>
        </dl>

        {!isCompleted && sale.cancelReason && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1">
              Motivo de cancelación
            </p>
            <p className="text-sm text-red-700">{sale.cancelReason}</p>
            {sale.cancelledAt && (
              <p className="text-xs text-red-400 mt-1">
                Cancelada el{" "}
                {format(new Date(sale.cancelledAt), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
              </p>
            )}
          </div>
        )}

        {isCompleted && !showCancelForm && (
          <button
            onClick={() => setShowCancelForm(true)}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-danger border-2 border-red-200 hover:bg-danger hover:text-white transition-all cursor-pointer"
          >
            Cancelar venta
          </button>
        )}

        {showCancelForm && (
          <form onSubmit={handleCancel} noValidate className="border-t border-brand-border pt-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-brand-dark">Motivo de cancelación</h3>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Describa el motivo de la cancelación..."
              rows={3}
              className="w-full px-3 py-3 rounded-xl text-sm text-brand-dark bg-brand-input border-2 border-brand-border outline-none transition-all focus:border-brand focus:shadow-[0_0_5px_rgba(40,85,141,0.2)] resize-none"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-danger hover:bg-red-700 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Cancelando..." : "Confirmar cancelación"}
              </button>
              <button
                type="button"
                onClick={() => { setShowCancelForm(false); setCancelReason(""); }}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-brand-dark border-2 border-brand-border hover:bg-brand-bg transition-all cursor-pointer"
              >
                Volver
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

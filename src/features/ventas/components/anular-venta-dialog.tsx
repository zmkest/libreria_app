"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cancelSale } from "@/features/ventas/actions";

interface Props {
  saleId:     string;
  saleNumber: number;
  wasPagada:  boolean;
  onClose:    () => void;
}

export function AnularVentaDialog({ saleId, saleNumber, wasPagada, onClose }: Props) {
  const router = useRouter();
  const [reason, setReason]       = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    if (!reason.trim()) {
      toast.error("Debe ingresar el motivo de anulación");
      return;
    }

    setSubmitting(true);
    const result = await cancelSale(saleId, reason);
    setSubmitting(false);

    if (result.success) {
      toast.success(`Venta #${String(saleNumber).padStart(3, "0")} anulada`);
      onClose();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-50">
              <AlertTriangle size={20} className="text-danger" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">
                Anular venta #{String(saleNumber).padStart(3, "0")}
              </h3>
              {wasPagada && (
                <p className="text-xs text-yellow-700 mt-0.5">
                  El stock de los productos será revertido automáticamente.
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-dark hover:bg-brand-bg transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-brand-dark">
            Motivo de anulación <span className="text-danger">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe el motivo de la anulación..."
            rows={3}
            maxLength={500}
            className="w-full px-3 py-3 rounded-xl text-sm text-brand-dark bg-brand-input border-2 border-brand-border outline-none transition-all focus:border-brand focus:shadow-[0_0_5px_rgba(40,85,141,0.2)] resize-none"
          />
          <p className="text-xs text-gray-400 text-right">{reason.length}/500</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={submitting || !reason.trim()}
            className="flex-1 py-2.5 rounded-xl font-bold text-white bg-danger hover:bg-red-700 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Anulando..." : "Confirmar anulación"}
          </button>
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl font-bold text-brand-dark border-2 border-brand-border hover:bg-brand-bg transition-all cursor-pointer disabled:opacity-60"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

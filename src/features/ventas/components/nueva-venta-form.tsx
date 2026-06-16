"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Plus, X } from "lucide-react";
import { createSale } from "@/features/ventas/actions";
import { formatCurrency } from "@/lib/money";
import Decimal from "decimal.js";
import { SearchableSelect } from "./searchable-select";
import type { SelectOption } from "./searchable-select";

interface ProductOption {
  id:        string;
  code:      string;
  name:      string;
  salePrice: string;
  stock:     number;
}

interface CustomerOption {
  id:        string;
  firstName: string;
  lastName:  string;
  idNumber:  string | null;
}

interface Props {
  productos: ProductOption[];
  clientes:  CustomerOption[];
}

type ItemState = { uid: string; productId: string | null; quantity: string };

const CONSUMER_FINAL = "__none__";

const PAYMENT_LABELS: Record<string, string> = {
  EFECTIVO:      "Efectivo",
  TRANSFERENCIA: "Transferencia",
  TARJETA:       "Tarjeta",
};

export function NuevaVentaForm({ productos, clientes }: Props) {
  const router = useRouter();

  const [items, setItems] = useState<ItemState[]>([
    { uid: "0", productId: null, quantity: "1" },
  ]);
  const [paymentMethod, setPaymentMethod] = useState<"EFECTIVO" | "TRANSFERENCIA" | "TARJETA">(
    "EFECTIVO",
  );
  const [customerId, setCustomerId] = useState<string>(CONSUMER_FINAL);
  const [submitting, setSubmitting] = useState(false);

  function addItem() {
    setItems((prev) => [...prev, { uid: Date.now().toString(), productId: null, quantity: "1" }]);
  }

  function removeItem(uid: string) {
    setItems((prev) => prev.filter((i) => i.uid !== uid));
  }

  function updateItem(uid: string, patch: Partial<Omit<ItemState, "uid">>) {
    setItems((prev) => prev.map((i) => (i.uid === uid ? { ...i, ...patch } : i)));
  }

  const productoOptions: SelectOption[] = productos.map((p) => ({
    value:    p.id,
    label:    p.name,
    sublabel: `${p.code}  ·  ${formatCurrency(new Decimal(p.salePrice))}  ·  Stock: ${p.stock}`,
  }));

  const clienteOptions: SelectOption[] = [
    { value: CONSUMER_FINAL, label: "Consumidor final", sublabel: "Sin cliente asignado" },
    ...clientes.map((c) => ({
      value:    c.id,
      label:    `${c.firstName} ${c.lastName}`,
      sublabel: c.idNumber ?? undefined,
    })),
  ];

  const grandTotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const prod = productos.find((p) => p.id === item.productId);
      const qty  = parseInt(item.quantity, 10);
      if (prod && !isNaN(qty) && qty >= 1) {
        return acc.plus(new Decimal(prod.salePrice).times(qty));
      }
      return acc;
    }, new Decimal(0));
  }, [items, productos]);

  const hasValidItems = items.some((item) => {
    const qty = parseInt(item.quantity, 10);
    return item.productId !== null && !isNaN(qty) && qty >= 1;
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validItems = items.filter((item) => {
      const qty = parseInt(item.quantity, 10);
      return item.productId !== null && !isNaN(qty) && qty >= 1;
    });

    if (validItems.length === 0) {
      toast.error("Debe agregar al menos un producto válido");
      return;
    }

    setSubmitting(true);
    const result = await createSale({
      items: validItems.map((item) => ({
        productId: item.productId!,
        quantity:  parseInt(item.quantity, 10),
      })),
      paymentMethod,
      customerId: customerId !== CONSUMER_FINAL ? customerId : undefined,
    });
    setSubmitting(false);

    if (result.success) {
      const saleNum = String(result.data.saleNumber).padStart(3, "0");
      if (result.data.lowStockWarnings.length > 0) {
        toast.warning(
          `Venta #${saleNum} registrada. Stock insuficiente en: ${result.data.lowStockWarnings.join(", ")}`,
        );
      } else {
        toast.success(`Venta #${saleNum} registrada`);
      }
      router.push(`/ventas/${result.data.id}`);
    } else {
      toast.error(result.error);
    }
  }

  const inputClass =
    "w-full px-3 py-3 rounded-xl text-sm text-brand-dark bg-brand-input border-2 border-brand-border outline-none transition-all focus:border-brand focus:shadow-[0_0_5px_rgba(40,85,141,0.2)]";
  const labelClass = "block mb-2 text-sm font-bold text-brand-dark";

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <Link
        href="/ventas"
        className="flex items-center gap-1.5 text-sm text-brand hover:text-brand-dark transition-colors w-fit"
      >
        <ArrowLeft size={15} />
        Volver a ventas
      </Link>

      <div className="bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-xl font-bold text-brand mb-6">Registrar Venta</h2>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

          {/* ── Productos ─────────────────────────────────────── */}
          <div>
            <label className={labelClass}>Productos</label>
            <div className="flex flex-col gap-3">
              {items.map((item) => {
                const prod = productos.find((p) => p.id === item.productId);
                const qty  = parseInt(item.quantity, 10);
                const sub  = prod && !isNaN(qty) && qty >= 1
                  ? new Decimal(prod.salePrice).times(qty)
                  : null;
                const lowStock = prod && prod.stock < (isNaN(qty) ? 0 : qty);

                return (
                  <div key={item.uid} className="flex gap-2 items-start">
                    <div className="flex-1 min-w-0">
                      <SearchableSelect
                        options={productoOptions}
                        value={item.productId}
                        onChange={(v) => updateItem(item.uid, { productId: v })}
                        placeholder="Buscar producto..."
                      />
                      {lowStock && (
                        <p className="mt-1 text-xs text-yellow-600">
                          Stock insuficiente (disponible: {prod!.stock})
                        </p>
                      )}
                    </div>

                    <div className="w-24 shrink-0">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.uid, { quantity: e.target.value })}
                        placeholder="Cant."
                        className={inputClass}
                      />
                    </div>

                    <div className="w-28 shrink-0 pt-3 text-right">
                      {sub ? (
                        <span className="text-sm font-semibold text-brand-dark">
                          {formatCurrency(sub)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-300">—</span>
                      )}
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.uid)}
                        className="mt-2 p-1.5 rounded-lg text-gray-400 hover:text-danger hover:bg-red-50 transition-all cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={addItem}
              className="mt-3 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-brand border-2 border-dashed border-brand-border hover:border-brand hover:bg-brand-bg transition-all cursor-pointer"
            >
              <Plus size={14} />
              Agregar producto
            </button>
          </div>

          {/* ── Total preview ─────────────────────────────────── */}
          {hasValidItems && (
            <div className="rounded-xl border-2 border-brand bg-brand-bg px-5 py-3 flex justify-between items-center">
              <span className="text-sm font-bold text-brand-dark">Total</span>
              <span className="text-2xl font-bold text-brand">{formatCurrency(grandTotal)}</span>
            </div>
          )}

          {/* ── Método de pago ────────────────────────────────── */}
          <div>
            <label className={labelClass}>Método de pago</label>
            <div className="flex gap-2">
              {(["EFECTIVO", "TRANSFERENCIA", "TARJETA"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer ${
                    paymentMethod === m
                      ? "bg-brand text-white border-brand"
                      : "text-brand-dark border-brand-border hover:border-brand hover:bg-brand-bg"
                  }`}
                >
                  {PAYMENT_LABELS[m]}
                </button>
              ))}
            </div>
          </div>

          {/* ── Cliente ──────────────────────────────────────── */}
          <div>
            <label className={labelClass}>
              Cliente <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <SearchableSelect
              options={clienteOptions}
              value={customerId}
              onChange={(v) => setCustomerId(v ?? CONSUMER_FINAL)}
              placeholder="Seleccionar cliente..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !hasValidItems}
            className="w-full py-3 rounded-xl font-bold text-white bg-brand hover:bg-brand-dark hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {submitting ? "Registrando..." : "Registrar venta"}
          </button>
        </form>
      </div>
    </div>
  );
}

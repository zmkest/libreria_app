"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createSale } from "@/features/ventas/actions";
import { formatCurrency, calculateSaleTotal } from "@/lib/money";
import Decimal from "decimal.js";
import { SearchableSelect } from "./searchable-select";
import type { SelectOption } from "./searchable-select";

interface ProductOption {
  id:        string;
  code:      string;
  name:      string;
  salePrice: string;
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

const CONSUMER_FINAL = "__none__";

export function NuevaVentaForm({ productos, clientes }: Props) {
  const router = useRouter();
  const [productId,  setProductId]  = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string>(CONSUMER_FINAL);
  const [quantity,   setQuantity]   = useState("1");
  const [submitting, setSubmitting] = useState(false);

  const productoOptions: SelectOption[] = productos.map((p) => ({
    value:    p.id,
    label:    p.name,
    sublabel: `${p.code}  ·  ${formatCurrency(new Decimal(p.salePrice))}`,
  }));

  const clienteOptions: SelectOption[] = [
    { value: CONSUMER_FINAL, label: "Consumidor final", sublabel: "Sin cliente asignado" },
    ...clientes.map((c) => ({
      value:    c.id,
      label:    `${c.firstName} ${c.lastName}`,
      sublabel: c.idNumber ?? undefined,
    })),
  ];

  const selectedProduct = productos.find((p) => p.id === productId) ?? null;
  const qty = parseInt(quantity, 10);
  const validQty = !isNaN(qty) && qty >= 1;

  const total = useMemo(() => {
    if (!selectedProduct || !validQty) return null;
    return calculateSaleTotal(new Decimal(selectedProduct.salePrice), qty);
  }, [selectedProduct, qty, validQty]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId)  { toast.error("Debe seleccionar un producto"); return; }
    if (!validQty)   { toast.error("La cantidad debe ser un número mayor a 0"); return; }

    setSubmitting(true);
    const result = await createSale({
      productId,
      quantity: qty,
      customerId: customerId !== CONSUMER_FINAL ? customerId : undefined,
    });
    setSubmitting(false);

    if (result.success) {
      toast.success(`Venta #${String(result.data.saleNumber).padStart(3, "0")} registrada`);
      router.push(`/ventas/${result.data.id}`);
    } else {
      toast.error(result.error);
    }
  }

  const inputClass =
    "w-full px-3 py-3 rounded-xl text-sm text-brand-dark bg-brand-input border-2 border-brand-border outline-none transition-all focus:border-brand focus:shadow-[0_0_5px_rgba(40,85,141,0.2)]";
  const labelClass = "block mb-2 text-sm font-bold text-brand-dark";

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
        <h2 className="text-xl font-bold text-brand mb-6">Registrar Venta</h2>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <div>
            <label className={labelClass}>Producto</label>
            <SearchableSelect
              options={productoOptions}
              value={productId}
              onChange={setProductId}
              placeholder="Buscar por nombre o código..."
            />
          </div>

          <div>
            <label className={labelClass}>Cantidad</label>
            <input
              type="text"
              inputMode="numeric"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1"
              className={inputClass}
            />
          </div>

          {selectedProduct && validQty && total && (
            <div className="rounded-xl border-2 border-brand-border bg-brand-bg p-4 flex flex-col gap-2">
              <div className="flex justify-between text-sm text-brand-dark">
                <span>Precio unitario</span>
                <span>{formatCurrency(new Decimal(selectedProduct.salePrice))}</span>
              </div>
              <div className="flex justify-between text-sm text-brand-dark">
                <span>Cantidad</span>
                <span>{qty}</span>
              </div>
              <div className="border-t border-brand-border pt-2 flex justify-between font-bold text-brand">
                <span>Total</span>
                <span className="text-lg">{formatCurrency(total)}</span>
              </div>
            </div>
          )}

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
            disabled={submitting || !productId || !validQty}
            className="w-full py-3 rounded-xl font-bold text-white bg-brand hover:bg-brand-dark hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {submitting ? "Registrando..." : "Registrar venta"}
          </button>
        </form>
      </div>
    </div>
  );
}

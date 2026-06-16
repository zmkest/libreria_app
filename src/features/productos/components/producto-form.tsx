"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createProductSchema, type CreateProductInput } from "@/features/productos/schemas";
import { createProduct, updateProduct } from "@/features/productos/actions";
import type { ProductRow } from "./productos-client";

interface Props {
  editingProduct: ProductRow | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductoForm({ editingProduct, onSuccess, onCancel }: Props) {
  const isEditing = editingProduct !== null;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: { code: "", name: "", purchasePrice: "", salePrice: "", stock: 0 },
  });

  useEffect(() => {
    if (editingProduct) {
      reset({
        code: editingProduct.code,
        name: editingProduct.name,
        purchasePrice: editingProduct.purchasePrice,
        salePrice: editingProduct.salePrice,
        stock: editingProduct.stock,
      });
    } else {
      reset({ code: "", name: "", purchasePrice: "", salePrice: "", stock: 0 });
    }
  }, [editingProduct, reset]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const purchaseVal = parseFloat(watch("purchasePrice") || "0");
  const saleVal = parseFloat(watch("salePrice") || "0");
  const showWarning = saleVal > 0 && purchaseVal > 0 && saleVal < purchaseVal;

  async function onSubmit(data: CreateProductInput) {
    const result = isEditing
      ? await updateProduct(editingProduct!.id, data)
      : await createProduct(data);

    if (result.success) {
      toast.success(isEditing ? "Producto actualizado" : "Producto creado");
      reset({ code: "", name: "", purchasePrice: "", salePrice: "", stock: 0 });
      onSuccess();
    } else {
      toast.error(result.error);
    }
  }

  const inputClass =
    "w-full px-3 py-3 rounded-xl text-sm text-brand-dark bg-brand-input border-2 border-brand-border outline-none transition-all focus:border-brand focus:shadow-[0_0_5px_rgba(40,85,141,0.2)]";
  const labelClass = "block mb-2 text-sm font-bold text-brand-dark";

  return (
    <div className="bg-white rounded-2xl shadow-md p-8">
      <h2 className="text-xl font-bold text-brand mb-6">
        {isEditing ? `Editando: ${editingProduct!.name}` : "Nuevo Producto"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className={labelClass}>Código</label>
            <input
              {...register("code")}
              type="text"
              placeholder="Ej: CNAD-001"
              className={inputClass}
            />
            {errors.code && (
              <p className="mt-1 text-xs text-danger">{errors.code.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Nombre del producto</label>
            <input
              {...register("name")}
              type="text"
              placeholder="Ej: Cuaderno universitario 100 hojas"
              className={inputClass}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-danger">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Precio de compra (USD)</label>
            <input
              {...register("purchasePrice")}
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              className={inputClass}
            />
            {errors.purchasePrice && (
              <p className="mt-1 text-xs text-danger">{errors.purchasePrice.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Precio de venta (USD)</label>
            <input
              {...register("salePrice")}
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              className={inputClass}
            />
            {errors.salePrice && (
              <p className="mt-1 text-xs text-danger">{errors.salePrice.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>
              {isEditing ? "Stock actual (unidades)" : "Stock inicial (unidades)"}
            </label>
            <input
              {...register("stock", { valueAsNumber: true })}
              type="number"
              min="0"
              step="1"
              placeholder="0"
              className={inputClass}
            />
            {errors.stock && (
              <p className="mt-1 text-xs text-danger">{errors.stock.message}</p>
            )}
          </div>
        </div>

        {showWarning && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm bg-yellow-50 border-2 border-yellow-300 text-yellow-800">
            Advertencia: el precio de venta es menor que el precio de compra. El producto generará pérdida.
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-xl font-bold text-white bg-brand hover:bg-brand-dark hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {isSubmitting
              ? isEditing ? "Actualizando..." : "Guardando..."
              : isEditing ? "Guardar cambios" : "Guardar producto"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-3 rounded-xl font-bold text-brand-dark border-2 border-brand-border hover:bg-brand-bg transition-all cursor-pointer"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

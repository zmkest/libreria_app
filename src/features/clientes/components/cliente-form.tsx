"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createCustomerSchema, type CreateCustomerInput } from "@/features/clientes/schemas";
import { createCustomer, updateCustomer } from "@/features/clientes/actions";
import type { CustomerRow } from "./clientes-client";

interface Props {
  editingCustomer: CustomerRow | null;
  onSuccess: () => void;
  onCancel:  () => void;
}

export function ClienteForm({ editingCustomer, onSuccess, onCancel }: Props) {
  const isEditing = editingCustomer !== null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: { firstName: "", lastName: "", idNumber: "", phone: "", address: "" },
  });

  useEffect(() => {
    if (editingCustomer) {
      reset({
        firstName: editingCustomer.firstName,
        lastName:  editingCustomer.lastName,
        idNumber:  editingCustomer.idNumber  ?? "",
        phone:     editingCustomer.phone     ?? "",
        address:   editingCustomer.address   ?? "",
      });
    } else {
      reset({ firstName: "", lastName: "", idNumber: "", phone: "", address: "" });
    }
  }, [editingCustomer, reset]);

  async function onSubmit(data: CreateCustomerInput) {
    const result = isEditing
      ? await updateCustomer(editingCustomer!.id, data)
      : await createCustomer(data);

    if (result.success) {
      toast.success(isEditing ? "Cliente actualizado" : "Cliente registrado");
      if (!isEditing) reset({ firstName: "", lastName: "", idNumber: "", phone: "", address: "" });
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
        {isEditing
          ? `Editando: ${editingCustomer!.firstName} ${editingCustomer!.lastName}`
          : "Nuevo Cliente"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className={labelClass}>Nombres</label>
            <input
              {...register("firstName")}
              type="text"
              placeholder="Ej: Juan Carlos"
              className={inputClass}
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-danger">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Apellidos</label>
            <input
              {...register("lastName")}
              type="text"
              placeholder="Ej: Pérez Gómez"
              className={inputClass}
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-danger">{errors.lastName.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>
              Cédula <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <input
              {...register("idNumber")}
              type="text"
              inputMode="numeric"
              maxLength={10}
              placeholder="Ej: 1712345678"
              className={inputClass}
            />
            {errors.idNumber && (
              <p className="mt-1 text-xs text-danger">{errors.idNumber.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>
              Celular <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <input
              {...register("phone")}
              type="text"
              inputMode="numeric"
              maxLength={10}
              placeholder="Ej: 0991234567"
              className={inputClass}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-danger">{errors.phone.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>
              Dirección <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <input
              {...register("address")}
              type="text"
              placeholder="Ej: Av. 6 de Diciembre N24-50"
              className={inputClass}
            />
            {errors.address && (
              <p className="mt-1 text-xs text-danger">{errors.address.message}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-xl font-bold text-white bg-brand hover:bg-brand-dark hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {isSubmitting
              ? isEditing ? "Actualizando..." : "Guardando..."
              : isEditing ? "Guardar cambios" : "Guardar cliente"}
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

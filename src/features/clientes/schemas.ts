import { z } from "zod";

export const createCustomerSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido").max(100),
  lastName:  z.string().min(1, "El apellido es requerido").max(100),
  idNumber:  z.string().refine(
    (v) => v === "" || /^\d{10}$/.test(v),
    "La cédula debe tener exactamente 10 dígitos numéricos",
  ),
  phone: z.string().refine(
    (v) => v === "" || /^\d{10}$/.test(v),
    "El celular debe tener exactamente 10 dígitos numéricos",
  ),
  address: z.string().max(300, "La dirección no puede superar 300 caracteres"),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

import { z } from "zod";

const saleItemSchema = z.object({
  productId: z.string().min(1, "Debe seleccionar un producto"),
  quantity:  z.coerce.number().int().min(1, "La cantidad mínima es 1"),
});

export const createSaleSchema = z.object({
  items: z
    .array(saleItemSchema)
    .min(1, "Debe agregar al menos un producto"),
  paymentMethod: z.enum(["EFECTIVO", "TRANSFERENCIA", "TARJETA"], {
    required_error:    "Debe seleccionar un método de pago",
    invalid_type_error: "Método de pago no válido",
  }),
  customerId: z.string().optional(),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type SaleItemInput   = z.infer<typeof saleItemSchema>;

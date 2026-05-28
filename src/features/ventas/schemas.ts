import { z } from "zod";

export const createSaleSchema = z.object({
  productId:  z.string().min(1, "Debe seleccionar un producto"),
  quantity:   z.coerce.number().int().min(1, "La cantidad mínima es 1"),
  customerId: z.string().optional(),
});

export const cancelSaleSchema = z.object({
  cancelReason: z.string().min(3, "El motivo debe tener al menos 3 caracteres").max(300),
});

export type CreateSaleInput  = z.infer<typeof createSaleSchema>;
export type CancelSaleInput  = z.infer<typeof cancelSaleSchema>;

import { z } from "zod";

const priceField = z
  .string()
  .min(1, "El precio es requerido")
  .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, {
    message: "El precio debe ser un número positivo",
  });

export const createProductSchema = z.object({
  code: z.string().min(1, "El código es requerido").max(50),
  name: z.string().min(1, "El nombre es requerido").max(200),
  purchasePrice: priceField,
  salePrice: priceField,
  stock: z
    .number({ error: "El stock debe ser un número" })
    .int("El stock debe ser un número entero")
    .min(0, "El stock no puede ser negativo"),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

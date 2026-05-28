"use server";

import { prisma } from "@/lib/prisma";
import { createCustomerSchema, updateCustomerSchema } from "./schemas";
import type { CreateCustomerInput, UpdateCustomerInput } from "./schemas";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function emptyToNull(value: string | undefined): string | null {
  if (!value || value.trim() === "") return null;
  return value.trim();
}

export async function createCustomer(
  input: CreateCustomerInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = createCustomerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { firstName, lastName, idNumber, phone, address } = parsed.data;

  const customer = await prisma.customer.create({
    data: {
      firstName: firstName.trim(),
      lastName:  lastName.trim(),
      idNumber:  emptyToNull(idNumber),
      phone:     emptyToNull(phone),
      address:   emptyToNull(address),
    },
    select: { id: true },
  });

  return { success: true, data: { id: customer.id } };
}

export async function updateCustomer(
  id: string,
  input: UpdateCustomerInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = updateCustomerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { firstName, lastName, idNumber, phone, address } = parsed.data;

  try {
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(firstName && { firstName: firstName.trim() }),
        ...(lastName  && { lastName:  lastName.trim()  }),
        ...(idNumber  !== undefined && { idNumber: emptyToNull(idNumber) }),
        ...(phone     !== undefined && { phone:    emptyToNull(phone)    }),
        ...(address   !== undefined && { address:  emptyToNull(address)  }),
      },
      select: { id: true },
    });
    return { success: true, data: { id: customer.id } };
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "P2025") {
      return { success: false, error: "El cliente ya no existe. Puede haber sido eliminado." };
    }
    throw e;
  }
}

export async function deleteCustomer(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  const salesCount = await prisma.sale.count({ where: { customerId: id } });
  if (salesCount > 0) {
    return {
      success: false,
      error: `No se puede eliminar: el cliente tiene ${salesCount} venta(s) asociada(s)`,
    };
  }

  await prisma.customer.delete({ where: { id } });
  return { success: true, data: { id } };
}

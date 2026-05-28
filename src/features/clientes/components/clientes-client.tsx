"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteCustomer } from "@/features/clientes/actions";
import { ClienteForm } from "./cliente-form";
import { ClientesTable } from "./clientes-table";

export interface CustomerRow {
  id:        string;
  firstName: string;
  lastName:  string;
  idNumber:  string | null;
  phone:     string | null;
  address:   string | null;
  createdAt: string;
}

interface Props {
  customers: CustomerRow[];
}

export function ClientesClient({ customers }: Props) {
  const router = useRouter();
  const [editingCustomer, setEditingCustomer] = useState<CustomerRow | null>(null);

  async function handleDelete(id: string, name: string) {
    const result = await deleteCustomer(id);
    if (result.success) {
      toast.success(`Cliente "${name}" eliminado`);
      if (editingCustomer?.id === id) setEditingCustomer(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  function handleEdit(customer: CustomerRow) {
    setEditingCustomer(customer);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleFormSuccess() {
    setEditingCustomer(null);
    router.refresh();
  }

  function handleCancel() {
    setEditingCustomer(null);
  }

  return (
    <div className="flex flex-col gap-8">
      <ClienteForm
        editingCustomer={editingCustomer}
        onSuccess={handleFormSuccess}
        onCancel={handleCancel}
      />
      <ClientesTable
        customers={customers}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

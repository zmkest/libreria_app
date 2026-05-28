import { listCustomers } from "@/features/clientes/queries";
import { ClientesClient } from "@/features/clientes/components/clientes-client";

export default async function ClientesPage() {
  const { items } = await listCustomers({ pageSize: 500 });
  return <ClientesClient customers={items} />;
}

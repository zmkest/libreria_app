import { listProducts } from "@/features/productos/queries";
import { listCustomers } from "@/features/clientes/queries";
import { NuevaVentaForm } from "@/features/ventas/components/nueva-venta-form";

export default async function NuevaVentaPage() {
  const [productosData, clientesData] = await Promise.all([
    listProducts({ pageSize: 500 }),
    listCustomers({ pageSize: 500 }),
  ]);

  const productos = productosData.items.map((p) => ({
    id:        p.id,
    code:      p.code,
    name:      p.name,
    salePrice: p.salePrice.toString(),
  }));

  const clientes = clientesData.items.map((c) => ({
    id:        c.id,
    firstName: c.firstName,
    lastName:  c.lastName,
    idNumber:  c.idNumber,
  }));

  return <NuevaVentaForm productos={productos} clientes={clientes} />;
}

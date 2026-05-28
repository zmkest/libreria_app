import { notFound } from "next/navigation";
import { getSaleById } from "@/features/ventas/queries";
import { VentaDetalle } from "@/features/ventas/components/venta-detalle";

type Props = { params: Promise<{ id: string }> };

export default async function VentaDetallePage({ params }: Props) {
  const { id } = await params;
  const sale = await getSaleById(id);
  if (!sale) notFound();
  return <VentaDetalle sale={sale} />;
}

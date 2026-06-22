import { notFound } from "next/navigation";
import { getSaleById } from "@/features/ventas/queries";
import { VentaDetalle } from "@/features/ventas/components/venta-detalle";

type Props = {
  params:       Promise<{ id: string }>;
  searchParams: Promise<{ back?: string }>;
};

export default async function VentaDetallePage({ params, searchParams }: Props) {
  const [{ id }, { back }] = await Promise.all([params, searchParams]);
  const sale = await getSaleById(id);
  if (!sale) notFound();
  return <VentaDetalle sale={sale} backUrl={back ?? "/ventas"} />;
}

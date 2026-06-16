import { listProducts } from "@/features/productos/queries";
import { ProductosClient } from "@/features/productos/components/productos-client";

export default async function ProductosPage() {
  const { items } = await listProducts({ pageSize: 500 });

  const products = items.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    purchasePrice: p.purchasePrice.toString(),
    salePrice: p.salePrice.toString(),
    profit: p.profit.toString(),
    stock: p.stock,
    createdAt: p.createdAt.toISOString(),
  }));

  return <ProductosClient products={products} />;
}

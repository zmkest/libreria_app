"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteProduct } from "@/features/productos/actions";
import { ProductoForm } from "./producto-form";
import { ProductosTable } from "./productos-table";

export interface ProductRow {
  id: string;
  code: string;
  name: string;
  purchasePrice: string;
  salePrice: string;
  profit: string;
  createdAt: string;
}

interface Props {
  products: ProductRow[];
}

export function ProductosClient({ products }: Props) {
  const router = useRouter();
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);

  async function handleDelete(id: string, name: string) {
    const result = await deleteProduct(id);
    if (result.success) {
      toast.success(`Producto "${name}" eliminado`);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  function handleEdit(product: ProductRow) {
    setEditingProduct(product);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleFormSuccess() {
    setEditingProduct(null);
    router.refresh();
  }

  function handleCancel() {
    setEditingProduct(null);
  }

  return (
    <div className="flex flex-col gap-8">
      <ProductoForm
        editingProduct={editingProduct}
        onSuccess={handleFormSuccess}
        onCancel={handleCancel}
      />
      <ProductosTable
        products={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

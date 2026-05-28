"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown, Pencil, Trash2, Search } from "lucide-react";
import { formatCurrency } from "@/lib/money";
import Decimal from "decimal.js";
import type { ProductRow } from "./productos-client";

interface Props {
  products: ProductRow[];
  onEdit: (product: ProductRow) => void;
  onDelete: (id: string, name: string) => Promise<void>;
}

export function ProductosTable({ products, onEdit, onDelete }: Props) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const columns = useMemo<ColumnDef<ProductRow>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Código",
        size: 120,
      },
      {
        accessorKey: "name",
        header: "Nombre",
      },
      {
        accessorKey: "purchasePrice",
        header: "Precio compra",
        cell: ({ getValue }) => formatCurrency(new Decimal(getValue() as string)),
        sortingFn: (a, b) =>
          parseFloat(a.original.purchasePrice) - parseFloat(b.original.purchasePrice),
        size: 140,
      },
      {
        accessorKey: "salePrice",
        header: "Precio venta",
        cell: ({ getValue }) => formatCurrency(new Decimal(getValue() as string)),
        sortingFn: (a, b) =>
          parseFloat(a.original.salePrice) - parseFloat(b.original.salePrice),
        size: 140,
      },
      {
        accessorKey: "profit",
        header: "Ganancia",
        cell: ({ getValue }) => {
          const val = parseFloat(getValue() as string);
          return (
            <span className={val >= 0 ? "text-green-600 font-medium" : "text-danger font-medium"}>
              {formatCurrency(new Decimal(getValue() as string))}
            </span>
          );
        },
        sortingFn: (a, b) =>
          parseFloat(a.original.profit) - parseFloat(b.original.profit),
        size: 120,
      },
      {
        id: "acciones",
        header: "Acciones",
        size: 180,
        cell: ({ row }) => {
          const product = row.original;
          if (deletingId === product.id) {
            return (
              <div className="flex items-center gap-2">
                <span className="text-xs text-brand-dark font-medium">Confirmar:</span>
                <button
                  onClick={async () => {
                    setDeletingId(null);
                    await onDelete(product.id, product.name);
                  }}
                  className="px-2 py-1 text-xs rounded-lg font-bold text-white bg-danger hover:bg-red-700 transition-all cursor-pointer"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => setDeletingId(null)}
                  className="px-2 py-1 text-xs rounded-lg font-bold text-brand-dark border border-brand-border hover:bg-brand-bg transition-all cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            );
          }
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(product)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg font-medium text-brand border border-brand-border hover:bg-brand hover:text-white transition-all cursor-pointer"
              >
                <Pencil size={12} />
                Editar
              </button>
              <button
                onClick={() => setDeletingId(product.id)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg font-medium text-danger border border-red-200 hover:bg-danger hover:text-white transition-all cursor-pointer"
              >
                <Trash2 size={12} />
                Eliminar
              </button>
            </div>
          );
        },
      },
    ],
    [deletingId, onEdit, onDelete],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: products,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
        <div>
          <h2 className="text-xl font-bold text-brand">Productos registrados</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {table.getFilteredRowModel().rows.length} de {products.length} productos
          </p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-border" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar por código o nombre..."
            className="pl-9 pr-4 py-2.5 rounded-xl text-sm text-brand-dark bg-brand-input border-2 border-brand-border outline-none transition-all focus:border-brand focus:shadow-[0_0_5px_rgba(40,85,141,0.2)] w-72"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {table.getFlatHeaders().map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="bg-brand text-white px-4 py-3 text-left text-sm font-semibold select-none"
                  style={{ width: header.getSize() }}
                >
                  <div
                    className={`flex items-center gap-1.5 ${
                      header.column.getCanSort() ? "cursor-pointer hover:opacity-80" : ""
                    }`}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <span className="opacity-70">
                        {header.column.getIsSorted() === "asc" ? (
                          <ChevronUp size={14} />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <ChevronDown size={14} />
                        ) : (
                          <ChevronsUpDown size={14} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm text-gray-400"
                >
                  {globalFilter
                    ? "No se encontraron productos con esa búsqueda"
                    : "No hay productos registrados aún"}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-brand-border even:bg-brand-bg/40 hover:bg-brand-bg transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm text-brand-dark">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-brand-border">
          <span className="text-sm text-gray-500">
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-4 py-2 rounded-lg text-sm font-medium text-brand border border-brand-border hover:bg-brand-bg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-4 py-2 rounded-lg text-sm font-medium text-brand border border-brand-border hover:bg-brand-bg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

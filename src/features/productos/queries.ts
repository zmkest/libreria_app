import { prisma } from "@/lib/prisma";
import { calculateProfit } from "@/lib/money";
import Decimal from "decimal.js";

export interface ProductWithProfit {
  id: string;
  code: string;
  name: string;
  purchasePrice: Decimal;
  salePrice: Decimal;
  profit: Decimal;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

function attachProfit(product: {
  id: string;
  code: string;
  name: string;
  purchasePrice: { toFixed: (n: number) => string } | string | number;
  salePrice: { toFixed: (n: number) => string } | string | number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}): ProductWithProfit {
  const purchase = new Decimal(product.purchasePrice.toString());
  const sale = new Decimal(product.salePrice.toString());
  return {
    id: product.id,
    code: product.code,
    name: product.name,
    purchasePrice: purchase,
    salePrice: sale,
    profit: calculateProfit(sale, purchase),
    stock: product.stock,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export async function listProducts({
  search = "",
  page = 1,
  pageSize = 10,
}: {
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const where = search
    ? {
        OR: [
          { code: { contains: search, mode: "insensitive" as const } },
          { name: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        code: true,
        name: true,
        purchasePrice: true,
        salePrice: true,
        stock: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: items.map(attachProfit),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getProductById(id: string): Promise<ProductWithProfit | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      code: true,
      name: true,
      purchasePrice: true,
      salePrice: true,
      stock: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!product) return null;
  return attachProfit(product);
}

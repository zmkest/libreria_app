import { prisma } from "@/lib/prisma";

export interface CustomerRow {
  id:        string;
  firstName: string;
  lastName:  string;
  idNumber:  string | null;
  phone:     string | null;
  address:   string | null;
  createdAt: string;
}

export async function listCustomers({
  search   = "",
  page     = 1,
  pageSize = 10,
}: {
  search?:   string;
  page?:     number;
  pageSize?: number;
}) {
  const where = search
    ? {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName:  { contains: search, mode: "insensitive" as const } },
          { idNumber:  { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id:        true,
        firstName: true,
        lastName:  true,
        idNumber:  true,
        phone:     true,
        address:   true,
        createdAt: true,
      },
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    items: items.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getCustomerById(id: string): Promise<CustomerRow | null> {
  const c = await prisma.customer.findUnique({
    where: { id },
    select: {
      id:        true,
      firstName: true,
      lastName:  true,
      idNumber:  true,
      phone:     true,
      address:   true,
      createdAt: true,
    },
  });
  if (!c) return null;
  return { ...c, createdAt: c.createdAt.toISOString() };
}

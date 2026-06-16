import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "@node-rs/argon2";
import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Limpieza completa en orden de dependencias FK
  // await prisma.saleDetail.deleteMany();
  // await prisma.sale.deleteMany();
  // await prisma.product.deleteMany();
  // await prisma.customer.deleteMany();
  // await prisma.user.deleteMany();

  console.log("Base de datos limpiada.");

  // ── Usuario admin ──────────────────────────────────────────────
  const password = await hash("admin123");
  const user = await prisma.user.create({
    data: { username: "admin", password, name: "Administrador" },
  });

  console.log("Seed completado. Usuario: admin / admin123");
  console.log("IMPORTANTE: cambie la contraseña en el primer uso.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

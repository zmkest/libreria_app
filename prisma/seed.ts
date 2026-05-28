import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "@node-rs/argon2";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await hash("admin123");

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password,
      name: "Administrador",
    },
  });

  const productos = [
    { code: "CNAD-001", name: "Cuaderno universitario 100 hojas", purchasePrice: "1.20", salePrice: "1.75" },
    { code: "CNAD-002", name: "Cuaderno cuadriculado 50 hojas", purchasePrice: "0.80", salePrice: "1.20" },
    { code: "CNAD-003", name: "Cuaderno espiral A4 200 hojas", purchasePrice: "2.50", salePrice: "3.50" },
    { code: "LPIZ-001", name: "Lápiz HB Faber-Castell x12", purchasePrice: "1.80", salePrice: "2.50" },
    { code: "LPIZ-002", name: "Lápiz de color x24", purchasePrice: "3.00", salePrice: "4.25" },
    { code: "BOLI-001", name: "Bolígrafo azul BIC x10", purchasePrice: "1.50", salePrice: "2.20" },
    { code: "BOLI-002", name: "Bolígrafo negro BIC x10", purchasePrice: "1.50", salePrice: "2.20" },
    { code: "BOLI-003", name: "Bolígrafo rojo BIC x10", purchasePrice: "1.50", salePrice: "2.20" },
    { code: "MOCH-001", name: "Mochila escolar mediana", purchasePrice: "12.00", salePrice: "18.00" },
    { code: "MOCH-002", name: "Mochila escolar grande con ruedas", purchasePrice: "22.00", salePrice: "32.00" },
    { code: "REGL-001", name: "Regla 30 cm plástico", purchasePrice: "0.40", salePrice: "0.75" },
    { code: "COMP-001", name: "Compás metálico escolar", purchasePrice: "1.20", salePrice: "2.00" },
    { code: "TIJR-001", name: "Tijera escolar punta redonda", purchasePrice: "0.90", salePrice: "1.50" },
    { code: "PEGA-001", name: "Pegamento en barra UHU 21g", purchasePrice: "0.80", salePrice: "1.25" },
    { code: "PEGA-002", name: "Goma de pegar líquida 250ml", purchasePrice: "1.10", salePrice: "1.75" },
    { code: "CARP-001", name: "Carpeta plástica A4 con gancho", purchasePrice: "1.80", salePrice: "2.75" },
    { code: "CARP-002", name: "Carpeta de cartón oficio", purchasePrice: "0.60", salePrice: "1.00" },
    { code: "TEXT-001", name: "Texto de Matemáticas 8vo grado", purchasePrice: "6.50", salePrice: "9.50" },
    { code: "TEXT-002", name: "Texto de Lenguaje 6to grado", purchasePrice: "5.80", salePrice: "8.50" },
    { code: "BORR-001", name: "Borrador blanco Pelikan x5", purchasePrice: "0.70", salePrice: "1.10" },
  ];

  for (const p of productos) {
    await prisma.product.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
  }

  console.log(`${productos.length} productos sembrados.`);
  console.log("Seed completado. Usuario: admin / admin123");
  console.log("IMPORTANTE: cambie la contraseña en el primer uso.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

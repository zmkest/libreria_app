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

  const clientes = [
    { firstName: "Carlos",    lastName: "Mendoza Vera",     idNumber: "1701234560", phone: "0991234560", address: "Av. América N32-15" },
    { firstName: "María",     lastName: "Torres Salazar",   idNumber: "1702345671", phone: "0982345671", address: "Calle Sucre 4-21" },
    { firstName: "Luis",      lastName: "Paredes Ortiz",    idNumber: "1703456782", phone: "0973456782", address: "Jr. Bolívar 8-45" },
    { firstName: "Ana",       lastName: "Suárez Lema",      idNumber: "1704567893", phone: "0964567893", address: "Calle Guayaquil 12-08" },
    { firstName: "Jorge",     lastName: "Rosero Pinto",     idNumber: "1705678904", phone: "0985678904", address: "Av. Colón E4-30" },
    { firstName: "Patricia",  lastName: "Vega Mora",        idNumber: "1706789015", phone: "0996789015", address: "Pasaje Imbabura 3-12" },
    { firstName: "Andrés",    lastName: "Cárdenas Ríos",    idNumber: "1707890126", phone: "0987890126", address: "Calle Espejo 7-55" },
    { firstName: "Gabriela",  lastName: "Flores Naranjo",   idNumber: "1708901237", phone: "0998901237", address: "Av. 10 de Agosto N22-66" },
    { firstName: "Diego",     lastName: "Hidalgo Ramos",    idNumber: "1709012348", phone: "0979012348", address: "Calle Pichincha 9-34" },
    { firstName: "Verónica",  lastName: "Castillo Díaz",    idNumber: "1710123459", phone: "0990123459", address: "Av. La Prensa N48-10" },
    { firstName: "Fernando",  lastName: "Almeida Ponce",    idNumber: "1711234560", phone: "0981234560", address: "Jr. Cuenca 2-88" },
    { firstName: "Lucía",     lastName: "Benítez Quito",    idNumber: "1712345671", phone: "0972345671", address: "Calle Chile 5-43" },
    { firstName: "Roberto",   lastName: "Vargas Cabrera",   idNumber: "1713456782", phone: "0963456782", address: "Av. Real Audiencia N2-55" },
    { firstName: "Susana",    lastName: "Molina Espinoza",  idNumber: "1714567893", phone: "0994567893", address: "Pasaje Versalles 1-19" },
    { firstName: "Miguel",    lastName: "Guerrero León",    idNumber: "1715678904", phone: "0985678905", address: "Calle Ambato 6-77" },
    { firstName: "Carmen",    lastName: "Pacheco Andrade",  idNumber: "1716789015", phone: "0976789015", address: "Av. Naciones Unidas E3-21" },
    { firstName: "Ricardo",   lastName: "Jiménez Salinas",  idNumber: "1717890126", phone: "0997890126", address: "Calle Venezuela 11-02" },
    { firstName: "Elena",     lastName: "Acosta Freire",    idNumber: null,         phone: "0988901237", address: null },
    { firstName: "Pablo",     lastName: "Delgado Mena",     idNumber: null,         phone: null,         address: "Calle Roca 3-67" },
    { firstName: "Margarita", lastName: "Ulloa Chávez",     idNumber: "1719012348", phone: "0979012349", address: "Av. Shyris N41-80" },
    { firstName: "Consumidor",lastName: "Final",            idNumber: null,         phone: null,         address: null },
  ];

  for (const c of clientes) {
    await prisma.customer.upsert({
      where: { id: `seed-cliente-${c.lastName.replace(/\s/g, "-").toLowerCase()}` },
      update: {},
      create: { id: `seed-cliente-${c.lastName.replace(/\s/g, "-").toLowerCase()}`, ...c },
    });
  }

  console.log(`${clientes.length} clientes sembrados.`);
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

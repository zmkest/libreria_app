import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "@node-rs/argon2";
import Decimal from "decimal.js";
import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(9 + (n % 8), (n * 7) % 60, 0, 0);
  return d;
}

async function main() {
  // Limpieza completa en orden de dependencias FK
  await prisma.saleDetail.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  console.log("Base de datos limpiada.");

  // ── Usuario admin ──────────────────────────────────────────────
  const password = await hash("admin123");
  const user = await prisma.user.create({
    data: { username: "admin", password, name: "Administrador" },
  });

  // ── Productos ──────────────────────────────────────────────────
  const productosData = [
    { code: "CNAD-001", name: "Cuaderno universitario 100 hojas", purchasePrice: "1.20", salePrice: "1.75", stock: 120 },
    { code: "CNAD-002", name: "Cuaderno cuadriculado 50 hojas",   purchasePrice: "0.80", salePrice: "1.20", stock: 85  },
    { code: "CNAD-003", name: "Cuaderno espiral A4 200 hojas",    purchasePrice: "2.50", salePrice: "3.50", stock: 60  },
    { code: "LPIZ-001", name: "Lápiz HB Faber-Castell x12",       purchasePrice: "1.80", salePrice: "2.50", stock: 200 },
    { code: "LPIZ-002", name: "Lápiz de color x24",               purchasePrice: "3.00", salePrice: "4.25", stock: 75  },
    { code: "BOLI-001", name: "Bolígrafo azul BIC x10",           purchasePrice: "1.50", salePrice: "2.20", stock: 150 },
    { code: "BOLI-002", name: "Bolígrafo negro BIC x10",          purchasePrice: "1.50", salePrice: "2.20", stock: 130 },
    { code: "BOLI-003", name: "Bolígrafo rojo BIC x10",           purchasePrice: "1.50", salePrice: "2.20", stock: 90  },
    { code: "MOCH-001", name: "Mochila escolar mediana",           purchasePrice: "12.00", salePrice: "18.00", stock: 30 },
    { code: "MOCH-002", name: "Mochila escolar grande con ruedas", purchasePrice: "22.00", salePrice: "32.00", stock: 15 },
    { code: "REGL-001", name: "Regla 30 cm plástico",             purchasePrice: "0.40", salePrice: "0.75", stock: 300 },
    { code: "COMP-001", name: "Compás metálico escolar",          purchasePrice: "1.20", salePrice: "2.00", stock: 50  },
    { code: "TIJR-001", name: "Tijera escolar punta redonda",     purchasePrice: "0.90", salePrice: "1.50", stock: 80  },
    { code: "PEGA-001", name: "Pegamento en barra UHU 21g",       purchasePrice: "0.80", salePrice: "1.25", stock: 110 },
    { code: "PEGA-002", name: "Goma de pegar líquida 250ml",      purchasePrice: "1.10", salePrice: "1.75", stock: 70  },
    { code: "CARP-001", name: "Carpeta plástica A4 con gancho",   purchasePrice: "1.80", salePrice: "2.75", stock: 95  },
    { code: "CARP-002", name: "Carpeta de cartón oficio",         purchasePrice: "0.60", salePrice: "1.00", stock: 120 },
    { code: "TEXT-001", name: "Texto de Matemáticas 8vo grado",   purchasePrice: "6.50", salePrice: "9.50", stock: 40  },
    { code: "TEXT-002", name: "Texto de Lenguaje 6to grado",      purchasePrice: "5.80", salePrice: "8.50", stock: 35  },
    { code: "BORR-001", name: "Borrador blanco Pelikan x5",       purchasePrice: "0.70", salePrice: "1.10", stock: 180 },
  ];

  const productos = await Promise.all(
    productosData.map((p) => prisma.product.create({ data: p }))
  );

  // ── Clientes ───────────────────────────────────────────────────
  const clientesData = [
    { firstName: "Carlos",    lastName: "Mendoza Vera",    idNumber: "1701234560", phone: "0991234560", address: "Av. América N32-15"          },
    { firstName: "María",     lastName: "Torres Salazar",  idNumber: "1702345671", phone: "0982345671", address: "Calle Sucre 4-21"             },
    { firstName: "Luis",      lastName: "Paredes Ortiz",   idNumber: "1703456782", phone: "0973456782", address: "Jr. Bolívar 8-45"             },
    { firstName: "Ana",       lastName: "Suárez Lema",     idNumber: "1704567893", phone: "0964567893", address: "Calle Guayaquil 12-08"        },
    { firstName: "Jorge",     lastName: "Rosero Pinto",    idNumber: "1705678904", phone: "0985678904", address: "Av. Colón E4-30"              },
    { firstName: "Patricia",  lastName: "Vega Mora",       idNumber: "1706789015", phone: "0996789015", address: "Pasaje Imbabura 3-12"         },
    { firstName: "Andrés",    lastName: "Cárdenas Ríos",   idNumber: "1707890126", phone: "0987890126", address: "Calle Espejo 7-55"            },
    { firstName: "Gabriela",  lastName: "Flores Naranjo",  idNumber: "1708901237", phone: "0998901237", address: "Av. 10 de Agosto N22-66"      },
    { firstName: "Diego",     lastName: "Hidalgo Ramos",   idNumber: "1709012348", phone: "0979012348", address: "Calle Pichincha 9-34"         },
    { firstName: "Verónica",  lastName: "Castillo Díaz",   idNumber: "1710123459", phone: "0990123459", address: "Av. La Prensa N48-10"         },
    { firstName: "Fernando",  lastName: "Almeida Ponce",   idNumber: "1711234560", phone: "0981234560", address: "Jr. Cuenca 2-88"              },
    { firstName: "Lucía",     lastName: "Benítez Quito",   idNumber: "1712345671", phone: "0972345671", address: "Calle Chile 5-43"             },
    { firstName: "Roberto",   lastName: "Vargas Cabrera",  idNumber: "1713456782", phone: "0963456782", address: "Av. Real Audiencia N2-55"     },
    { firstName: "Susana",    lastName: "Molina Espinoza", idNumber: "1714567893", phone: "0994567893", address: "Pasaje Versalles 1-19"        },
    { firstName: "Miguel",    lastName: "Guerrero León",   idNumber: "1715678904", phone: "0985678905", address: "Calle Ambato 6-77"            },
    { firstName: "Carmen",    lastName: "Pacheco Andrade", idNumber: "1716789015", phone: "0976789015", address: "Av. Naciones Unidas E3-21"    },
    { firstName: "Ricardo",   lastName: "Jiménez Salinas", idNumber: "1717890126", phone: "0997890126", address: "Calle Venezuela 11-02"        },
    { firstName: "Elena",     lastName: "Acosta Freire",   idNumber: null,         phone: "0988901237", address: null                           },
    { firstName: "Pablo",     lastName: "Delgado Mena",    idNumber: null,         phone: null,         address: "Calle Roca 3-67"              },
    { firstName: "Margarita", lastName: "Ulloa Chávez",    idNumber: "1719012348", phone: "0979012349", address: "Av. Shyris N41-80"            },
    { firstName: "Consumidor",lastName: "Final",           idNumber: null,         phone: null,         address: null                           },
  ];

  const clientes = await Promise.all(
    clientesData.map((c) => prisma.customer.create({ data: c }))
  );

  // ── Helpers ────────────────────────────────────────────────────
  const prod = (code: string) => productos.find((p) => p.code === code)!;
  const cust = (idx: number) => clientes[idx % clientes.length].id;
  const METODOS = ["EFECTIVO", "EFECTIVO", "EFECTIVO", "TRANSFERENCIA", "TARJETA"] as const;
  const metodo = (n: number) => METODOS[n % METODOS.length];

  type DetalleSeed = { productId: string; quantity: number; unitPrice: string; subtotal: string };

  function detalle(code: string, qty: number): DetalleSeed {
    const p = prod(code);
    const up = new Decimal(p.salePrice.toString());
    const sub = up.mul(qty);
    return { productId: p.id, quantity: qty, unitPrice: up.toFixed(2), subtotal: sub.toFixed(2) };
  }

  async function crearVenta(
    detalles: DetalleSeed[],
    custId: string | null,
    diasAtras: number,
    metodoPago: (typeof METODOS)[number]
  ) {
    const total = detalles
      .reduce((acc, d) => acc.plus(d.subtotal), new Decimal(0))
      .toFixed(2);

    const createdAt = daysAgo(diasAtras);

    await prisma.sale.create({
      data: {
        userId: user.id,
        customerId: custId,
        paymentMethod: metodoPago,
        total,
        createdAt,
        details: { create: detalles },
      },
    });
  }

  // ── Ventas ─────────────────────────────────────────────────────
  // Hoy
  await crearVenta([detalle("CNAD-001", 3), detalle("LPIZ-001", 2)], cust(0), 0, metodo(0));
  await crearVenta([detalle("BOLI-001", 5)], null, 0, metodo(1));
  await crearVenta([detalle("REGL-001", 1), detalle("COMP-001", 1), detalle("TIJR-001", 1)], cust(1), 0, metodo(2));

  // Ayer
  await crearVenta([detalle("MOCH-001", 1)], cust(2), 1, metodo(3));
  await crearVenta([detalle("CNAD-002", 4), detalle("PEGA-001", 2)], cust(3), 1, metodo(4));

  // Hace 2 días
  await crearVenta([detalle("TEXT-001", 1), detalle("TEXT-002", 1)], cust(4), 2, metodo(0));
  await crearVenta([detalle("LPIZ-002", 2), detalle("BORR-001", 3)], cust(5), 2, metodo(1));

  // Hace 3 días
  await crearVenta([detalle("CARP-001", 2), detalle("CARP-002", 3)], cust(6), 3, metodo(2));
  await crearVenta([detalle("BOLI-002", 10)], null, 3, metodo(3));

  // Hace 5 días
  await crearVenta([detalle("MOCH-002", 1), detalle("CNAD-001", 5)], cust(7), 5, metodo(4));
  await crearVenta([detalle("PEGA-002", 3), detalle("TIJR-001", 2)], cust(8), 5, metodo(0));

  // Hace 7 días
  await crearVenta([detalle("TEXT-001", 2), detalle("LPIZ-001", 4)], cust(9), 7, metodo(1));
  await crearVenta([detalle("BOLI-003", 8), detalle("BORR-001", 5)], null, 7, metodo(2));

  // Hace 10 días
  await crearVenta([detalle("CNAD-003", 2), detalle("REGL-001", 4)], cust(10), 10, metodo(3));
  await crearVenta([detalle("MOCH-001", 2)], cust(11), 10, metodo(4));

  // Hace 15 días
  await crearVenta([detalle("TEXT-002", 2), detalle("CARP-001", 4)], cust(12), 15, metodo(0));
  await crearVenta([detalle("LPIZ-002", 3), detalle("BOLI-001", 6)], null, 15, metodo(1));

  // Hace 20 días
  await crearVenta([detalle("COMP-001", 2), detalle("PEGA-001", 5), detalle("REGL-001", 4)], cust(13), 20, metodo(2));

  // Hace 25 días
  await crearVenta([detalle("MOCH-001", 2), detalle("CNAD-002", 6)], cust(14), 25, metodo(3));

  // Hace 30 días
  await crearVenta([detalle("LPIZ-002", 3), detalle("CARP-001", 4), detalle("BORR-001", 10)], cust(15), 30, metodo(4));

  console.log(`${productosData.length} productos sembrados.`);
  console.log(`${clientesData.length} clientes sembrados.`);
  console.log("20 ventas sembradas.");
  console.log("Seed completado. Usuario: admin / admin123");
  console.log("IMPORTANTE: cambie la contraseña en el primer uso.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

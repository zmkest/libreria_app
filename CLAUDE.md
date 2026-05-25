# CLAUDE.md — Sistema de Gestión de Inventario para Librería Escolar

> Este archivo es leído automáticamente por **Claude Code** al iniciar en el directorio raíz del proyecto. Contiene el contexto, las reglas, las convenciones y las decisiones arquitectónicas que debes respetar en TODO momento. **Léelo completo antes de ejecutar cualquier acción.**

---

## 1. Contexto del Proyecto

**Nombre:** Sistema de Gestión de Inventario para Librería Escolar
**Tipo de negocio:** Librería / papelería dedicada a productos escolares y educativos (cuadernos, lápices, mochilas, textos escolares, útiles, etc.). **NO es una librería de libros literarios**, por lo tanto el modelo de datos NO debe centrarse en ISBN, autores ni editoriales.
**Ubicación del negocio:** Ecuador (moneda USD, IVA configurable, actualmente 15%).
**Modalidad de uso:** Aplicación de escritorio (Tauri) con base de datos PostgreSQL local en la misma máquina. **Uso offline garantizado** por diseño (no depende de internet).

### Objetivos funcionales
1. Gestión de **inventario** de productos escolares con alertas de stock bajo.
2. **Ventas** (punto de venta sencillo, solo efectivo, sin emisión fiscal SRI por ahora).
3. Gestión de **clientes** (datos básicos + historial de compras).
4. **Reportes** y **dashboard** con métricas de ventas, productos más vendidos, stock crítico, etc.
5. Sistema de **usuarios y roles** (admin / empleado).

### Lo que NO incluye este proyecto (NO implementar)
- ❌ Facturación electrónica con SRI (XML, firma .p12, web services). El sistema queda **preparado estructuralmente** para migrar en el futuro, pero NO se implementa la emisión fiscal.
- ❌ Escaneo de códigos de barras (búsqueda manual por nombre y SKU).
- ❌ Múltiples métodos de pago (solo efectivo).
- ❌ Múltiples bodegas/ubicaciones (stock único por producto).
- ❌ Exportación a CSV/Excel/PDF.
- ❌ Búsqueda de productos en APIs externas (Google Books, Open Library).
- ❌ Internacionalización i18n (solo español).
- ❌ Soporte multimoneda (solo USD).
- ❌ Backend remoto compartido (la BD es siempre local en la misma máquina).
- ❌ Tarjetas, transferencias, crédito o fiado al cliente.
- ❌ **Tests automatizados** (Vitest, Playwright, Jest, etc.). No instalar ni configurar frameworks de testing. La calidad se asegura con TypeScript estricto, validación Zod y revisión manual.

> **Regla:** Si te piden agregar alguna de las funciones excluidas, **detente y pregúntale al usuario antes de implementarlas.** No las añadas por iniciativa propia "por si acaso".

---

## 2. Stack Tecnológico

| Capa | Tecnología | Notas |
|------|------------|-------|
| Gestor de paquetes | **pnpm** | Obligatorio. NO usar npm ni yarn. |
| Runtime / Framework | **Next.js 15+ (App Router)** con **API Routes** | Server Components por defecto, Client Components solo cuando sea necesario. |
| Lenguaje | **TypeScript estricto** | `strict: true` en tsconfig. Prohibido `any` salvo justificación documentada. |
| Aplicación de escritorio | **Tauri 2.x** | Empaqueta el Next.js como app nativa. |
| Base de datos | **PostgreSQL** (local) | Versión 16+ recomendada. |
| ORM | **Prisma** | Migraciones versionadas en `prisma/migrations`. |
| Validación | **Zod** | Schemas compartidos entre cliente y servidor. |
| Formularios | **react-hook-form** + `@hookform/resolvers/zod` | |
| Estilos | **Tailwind CSS v4** | |
| Componentes UI | **shadcn/ui** | Instalación CLI bajo demanda en `components/ui`. |
| Iconos | **lucide-react** | |
| Tablas | **TanStack Table v8** | |
| Fechas | **date-fns** con `locale: es` | NO usar moment.js. |
| Dinero | **Prisma `Decimal`** + **`decimal.js`** en lógica | **PROHIBIDO `Float` o `Number` para montos.** |
| Autenticación | **Auth.js (NextAuth v5)** | Adapter de Prisma, credenciales, sesiones en BD. |
| Hashing de password | **argon2** o **bcrypt** | Preferir argon2id. |
| Lint | **ESLint** + plugin de Next.js | |
| Formateo | **Prettier** | |
| Commits | **Conventional Commits** en español | Ej: `feat: agregar listado de productos`. |
| Charts (dashboard) | **Recharts** | |
| Toast / notificaciones | **sonner** | |

### Decisiones explícitas a respetar
- **`pnpm` siempre.** Si encuentras `package-lock.json` o `yarn.lock`, elimínalos.
- **App Router de Next.js**, NO Pages Router.
- **Server Actions** para mutaciones simples desde formularios; **API Routes** (`app/api/.../route.ts`) cuando se requiera consumo externo o integración con Tauri.
- **Server Components por defecto.** Marca `"use client"` solo donde sea estrictamente necesario.
- Nunca uses `localStorage` o `sessionStorage` para datos de negocio. Estado de UI puede ir en cookies/estado React.
- Nunca expongas la conexión de Prisma al cliente. Toda consulta vive en servidor (Server Components, Server Actions, Route Handlers).
- **No se incluyen frameworks de testing.** No instalar Vitest, Jest, Playwright ni similares.

---

## 3. Estructura de Carpetas

```
libreria/
├── CLAUDE.md                    ← este archivo (no modificar sin permiso explícito)
├── PLAN.md                      ← roadmap por features (no modificar sin permiso)
├── README.md                    ← documentación de instalación y uso
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── .env.example                 ← plantilla de variables
├── .env                         ← (gitignored)
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src-tauri/                   ← código y configuración de Tauri
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── src/
│       └── main.rs
└── src/
    ├── app/                     ← Next.js App Router
    │   ├── (auth)/              ← rutas públicas (login)
    │   │   └── login/
    │   ├── (dashboard)/         ← rutas protegidas
    │   │   ├── layout.tsx       ← sidebar + topbar
    │   │   ├── page.tsx         ← dashboard
    │   │   ├── productos/
    │   │   ├── ventas/
    │   │   ├── clientes/
    │   │   ├── reportes/
    │   │   ├── usuarios/        ← solo admin
    │   │   └── ajustes/         ← solo admin
    │   ├── api/                 ← Route Handlers
    │   │   └── auth/[...nextauth]/route.ts
    │   ├── layout.tsx
    │   └── globals.css
    ├── components/
    │   ├── ui/                  ← shadcn/ui (generados por CLI)
    │   └── shared/              ← componentes propios reutilizables
    ├── features/                ← lógica por dominio (ver §5)
    │   ├── productos/
    │   ├── ventas/
    │   ├── clientes/
    │   ├── reportes/
    │   ├── usuarios/
    │   └── ajustes/
    ├── lib/
    │   ├── prisma.ts            ← singleton de PrismaClient
    │   ├── auth.ts              ← config de Auth.js
    │   ├── money.ts             ← helpers para Decimal
    │   ├── tax.ts               ← cálculo de IVA usando Settings
    │   ├── permissions.ts       ← chequeos de rol
    │   └── utils.ts             ← cn() y utilidades
    ├── server/
    │   └── actions/             ← Server Actions agrupadas
    ├── hooks/
    ├── types/
    └── middleware.ts            ← protección de rutas
```

> **Regla:** Cada feature vive en `src/features/<nombre>/` con esta estructura interna:
> ```
> features/productos/
> ├── schemas.ts        ← Zod schemas
> ├── types.ts          ← tipos derivados
> ├── queries.ts        ← lectura (Server, usa prisma)
> ├── actions.ts        ← Server Actions (escritura)
> └── components/       ← componentes específicos de productos
> ```

---

## 4. Modelo de Datos (Prisma — referencia inicial)

Este es el modelo base que debe implementarse en `prisma/schema.prisma`. Si necesitas agregar campos, **documenta el por qué en el commit**.

```prisma
// Datasource y generator
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ============ USUARIOS Y AUTH ============

enum Role {
  ADMIN
  EMPLEADO
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String   // hash argon2
  role      Role     @default(EMPLEADO)
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  sales     Sale[]
}

// ============ CATÁLOGO ============

model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  description String?
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Product {
  id           String      @id @default(cuid())
  sku          String      @unique           // código interno único
  name         String
  description  String?
  categoryId   String
  category     Category    @relation(fields: [categoryId], references: [id])
  price        Decimal     @db.Decimal(10, 2) // precio de venta (sin IVA o con IVA según taxIncluded)
  cost         Decimal     @db.Decimal(10, 2) // costo
  taxable      Boolean     @default(true)     // si aplica IVA (algunos útiles pueden estar exentos)
  stock        Int         @default(0)
  minStock     Int         @default(5)        // umbral de alerta
  active       Boolean     @default(true)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  saleItems    SaleItem[]
  movements    StockMovement[]

  @@index([name])
  @@index([sku])
  @@index([categoryId])
}

model StockMovement {
  id        String              @id @default(cuid())
  productId String
  product   Product             @relation(fields: [productId], references: [id])
  type      StockMovementType
  quantity  Int                 // positivo o negativo según el tipo
  reason    String?
  saleId    String?             // si fue por venta
  userId    String              // quién lo hizo
  createdAt DateTime            @default(now())
}

enum StockMovementType {
  ENTRADA     // compra/ingreso manual
  SALIDA      // ajuste por pérdida/daño
  VENTA       // descuento por venta
  DEVOLUCION  // reversión de venta
  AJUSTE      // ajuste manual de inventario
}

// ============ CLIENTES ============

model Customer {
  id            String   @id @default(cuid())
  // Campos preparados para futura facturación SRI:
  idType        IdType   @default(CEDULA)     // CEDULA | RUC | PASAPORTE | CONSUMIDOR_FINAL
  idNumber      String?                       // opcional, "consumidor final" no lo necesita
  name          String
  email         String?
  phone         String?
  address       String?
  notes         String?
  active        Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  sales         Sale[]

  @@index([idNumber])
  @@index([name])
}

enum IdType {
  CEDULA
  RUC
  PASAPORTE
  CONSUMIDOR_FINAL
}

// ============ VENTAS ============

model Sale {
  id           String     @id @default(cuid())
  saleNumber   Int        @unique @default(autoincrement())  // correlativo legible
  customerId   String?
  customer     Customer?  @relation(fields: [customerId], references: [id])
  userId       String                                        // empleado que vendió
  user         User       @relation(fields: [userId], references: [id])

  // Importes (todos en USD, Decimal 10,2)
  subtotal     Decimal    @db.Decimal(10, 2)   // suma de líneas SIN IVA
  taxRate      Decimal    @db.Decimal(5, 2)    // % IVA congelado en el momento (ej: 15.00)
  taxAmount    Decimal    @db.Decimal(10, 2)
  total        Decimal    @db.Decimal(10, 2)

  paymentMethod PaymentMethod @default(EFECTIVO)
  cashReceived  Decimal?      @db.Decimal(10, 2)   // efectivo recibido
  cashChange    Decimal?      @db.Decimal(10, 2)   // vuelto

  status        SaleStatus    @default(COMPLETADA)
  notes         String?
  createdAt     DateTime      @default(now())
  cancelledAt   DateTime?
  cancelReason  String?

  items         SaleItem[]

  @@index([createdAt])
  @@index([customerId])
  @@index([userId])
}

enum PaymentMethod {
  EFECTIVO
  // Reservado para futuro: TRANSFERENCIA, TARJETA
}

enum SaleStatus {
  COMPLETADA
  CANCELADA
}

model SaleItem {
  id          String   @id @default(cuid())
  saleId      String
  sale        Sale     @relation(fields: [saleId], references: [id], onDelete: Cascade)
  productId   String
  product     Product  @relation(fields: [productId], references: [id])

  // Snapshot del producto en el momento de la venta:
  productName String                            // congelado por si el producto cambia de nombre
  unitPrice   Decimal  @db.Decimal(10, 2)       // precio sin IVA al momento de venta
  quantity    Int
  taxable     Boolean  @default(true)           // si esa línea aplica IVA
  lineSubtotal Decimal @db.Decimal(10, 2)       // unitPrice * quantity
  lineTax      Decimal @db.Decimal(10, 2)
  lineTotal    Decimal @db.Decimal(10, 2)

  @@index([saleId])
  @@index([productId])
}

// ============ CONFIGURACIÓN GLOBAL ============

model Settings {
  id              Int      @id @default(1)      // singleton: siempre id=1
  businessName    String   @default("Librería")
  businessRuc     String?
  businessAddress String?
  businessPhone   String?
  taxRate         Decimal  @db.Decimal(5, 2) @default(15.00)   // IVA global
  taxIncluded     Boolean  @default(false)      // si los precios YA incluyen IVA
  currency        String   @default("USD")
  updatedAt       DateTime @updatedAt
}
```

### Reglas críticas del modelo
1. **Toda venta** debe descontar stock y crear un `StockMovement` con `type: VENTA` en la misma transacción de Prisma (`prisma.$transaction`). **Nunca** descuentes stock sin movimiento.
2. **El IVA se lee de `Settings.taxRate` en el momento de crear la venta y se CONGELA en `Sale.taxRate`.** No volver a calcular después.
3. Si un producto tiene `taxable: false`, su línea de venta debe registrar `lineTax = 0` aunque `Settings.taxRate > 0`.
4. **Cancelar una venta** = `status = CANCELADA` + crear `StockMovement` con `type: DEVOLUCION` que regresa el stock. **Nunca** borrar ventas físicamente.
5. `Settings` es **singleton** con `id = 1`. El seed debe crear esta fila. Toda consulta de configuración es `findUnique({ where: { id: 1 } })`.
6. **Decimal**: en código TypeScript, los `Decimal` de Prisma son objetos `Decimal.js`. **NO los conviertas a `Number`** para operar; usa los métodos del SDK (`.plus()`, `.times()`, `.mul()`).

---

## 5. Plan de Desarrollo — Feature por Feature

El usuario eligió **estrategia feature-driven**: cada feature se entrega completa (modelo + Server Actions + UI) antes de pasar a la siguiente. Ver `PLAN.md` para detalles. Orden estricto:

1. **Setup inicial** (Tauri + Next.js + Prisma + Tailwind + shadcn/ui + Auth.js).
2. **Autenticación y usuarios** (login, sesiones, middleware, roles).
3. **Configuración global** (Settings, ajustes de IVA y negocio).
4. **Categorías**.
5. **Productos** (con stock y movimientos).
6. **Clientes**.
7. **Ventas (POS)** — el feature más crítico.
8. **Dashboard** (KPIs en tiempo real).
9. **Reportes** (filtros, agregaciones).
10. **Alertas de stock bajo**.
11. **Empaquetado Tauri** y release.

> **No saltes pasos. No empieces el feature N+1 hasta que N esté completo y commiteado.**

---

## 6. Reglas Inquebrantables para Claude Code

### Antes de empezar cualquier tarea
1. **Lee este archivo completo y `PLAN.md`** si existe.
2. **Confirma con el usuario qué feature vas a trabajar.**
3. **Si encuentras ambigüedad, pregunta. NO inventes.**

### Antes de escribir código
1. Revisa qué ya existe en el repo (`view` de directorios relevantes).
2. Si vas a crear una migración de Prisma, **describe primero qué cambia y por qué**.
3. Si vas a instalar una dependencia nueva no listada en §2, **pide autorización primero**.

### Al escribir código
1. **TypeScript estricto**, sin `any` salvo comentario `// eslint-disable-next-line` con justificación.
2. **Validación con Zod en TODA entrada** (Server Action, Route Handler, formulario). Esta es la principal línea de defensa: como no hay tests, la validación debe ser exhaustiva.
3. **Manejo de errores con `try/catch` y respuestas tipadas**. Para Server Actions, devolver `{ success: true, data } | { success: false, error }`.
4. **Mensajes de error al usuario en español**.
5. **Comentarios técnicos en español** cuando aclaren lógica de negocio (cálculo de IVA, descuento de stock, etc.). Los nombres de variables, funciones y archivos van en **inglés**.
6. **Componentes UI**: cada uno con su prop tipada por interface. Evitar prop drilling profundo (>2 niveles); usar composición.
7. **Server Actions** marcadas con `"use server"` al inicio del archivo o función.
8. **Nunca consultes Prisma desde Client Components**.

### Al manejar dinero
1. **Siempre `Decimal`** en BD (Prisma `@db.Decimal(10, 2)`).
2. **Operaciones con `Decimal.js`** (`.plus`, `.minus`, `.mul`, `.div`), nunca operadores `+ - * /`.
3. Helpers en `src/lib/money.ts` para formatear (`$ 1,234.56`), parsear, sumar líneas, calcular IVA.

### Verificación manual (reemplaza a los tests)
Antes de cerrar una feature, **prueba manualmente en el navegador / app Tauri** los siguientes escenarios cuando aplique:
- Caso feliz: el flujo principal funciona.
- Caso de error: el sistema responde con mensajes claros cuando la entrada es inválida.
- Permisos: el rol incorrecto no puede acceder a la acción.
- Persistencia: al recargar, los datos siguen ahí.
- Concurrencia básica: dos pestañas no rompen el estado.

Documentar en el PR o commit qué se probó manualmente.

### Migraciones
1. Toda modificación de `schema.prisma` se acompaña de `pnpm prisma migrate dev --name <nombre_descriptivo>`.
2. Nombres de migración en español kebab-case: `agregar-tabla-productos`, `cambiar-iva-a-decimal`.

### Commits
- **Conventional Commits en español**:
  - `feat: agregar formulario de creación de productos`
  - `fix: corregir cálculo de IVA cuando producto es exento`
  - `refactor: extraer helper money a lib`
  - `docs: actualizar CLAUDE.md con regla de Decimal`
  - `chore: actualizar dependencias`
- **Un commit por unidad lógica**, no commits gigantes.

### Antes de cerrar una feature
1. ¿La migración de Prisma se ejecutó sin errores?
2. ¿Lint y typecheck limpios? (`pnpm lint && pnpm typecheck`).
3. ¿Verificación manual de los escenarios listados arriba?
4. ¿La UI funciona en modo claro y oscuro?
5. ¿La feature está documentada en el README (sección de uso)?
6. ¿Hay un commit por etapa lógica?

---

## 7. Variables de Entorno (`.env.example`)

```env
# PostgreSQL local
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/libreria?schema=public"

# Auth.js
AUTH_SECRET="<generar con: openssl rand -base64 32>"
AUTH_URL="http://localhost:3000"

# Entorno
NODE_ENV="development"
```

---

## 8. Comandos Frecuentes

```bash
# Instalación inicial
pnpm install

# Base de datos
pnpm prisma migrate dev          # crear/aplicar migraciones
pnpm prisma generate             # regenerar cliente
pnpm prisma studio               # GUI de BD
pnpm db:seed                     # poblar con datos iniciales

# Desarrollo
pnpm dev                         # Next.js en modo dev
pnpm tauri dev                   # Tauri en modo dev (Next + ventana nativa)

# Calidad
pnpm lint
pnpm typecheck

# Build / release
pnpm build                       # next build
pnpm tauri build                 # empaquetar app de escritorio
```

---

## 9. Casos de Negocio Documentados

### Cálculo de IVA en una venta
```
Por cada línea de SaleItem:
  lineSubtotal = unitPrice * quantity
  if (item.taxable) {
    lineTax = lineSubtotal * (Sale.taxRate / 100)
  } else {
    lineTax = 0
  }
  lineTotal = lineSubtotal + lineTax

Sale.subtotal = suma de lineSubtotal de todas las líneas
Sale.taxAmount = suma de lineTax
Sale.total = Sale.subtotal + Sale.taxAmount
```

> El `taxRate` siempre se toma de `Settings.taxRate` al momento de crear la venta y se guarda en `Sale.taxRate`. Así, si mañana el IVA sube al 16%, los reportes históricos siguen mostrando 15% en las ventas anteriores.

### Alerta de stock bajo
- Un producto está en stock bajo cuando `stock <= minStock`.
- El dashboard muestra el contador de productos en stock bajo.
- Una sección dedicada en `/productos?filter=stock-bajo` lista los productos críticos.

### Cancelación de venta
- Solo el rol `ADMIN` puede cancelar.
- Se requiere `cancelReason` (texto obligatorio).
- En una transacción Prisma:
  1. `Sale.status = CANCELADA`, `Sale.cancelledAt = now()`.
  2. Por cada `SaleItem`, crear `StockMovement` con `type: DEVOLUCION` que **suma** la cantidad de vuelta al `Product.stock`.

### Permisos por rol
| Acción | ADMIN | EMPLEADO |
|--------|-------|----------|
| Login / ver dashboard | ✅ | ✅ |
| Ver productos / clientes / ventas | ✅ | ✅ |
| Crear / editar productos | ✅ | ❌ |
| Crear / editar clientes | ✅ | ✅ |
| Realizar venta | ✅ | ✅ |
| Cancelar venta | ✅ | ❌ |
| Ver reportes | ✅ | ❌ |
| Gestionar usuarios | ✅ | ❌ |
| Cambiar ajustes (IVA, datos del negocio) | ✅ | ❌ |

Implementar `lib/permissions.ts` con funciones tipo `canCancelSale(user)`, `canManageUsers(user)`, etc. Usar en Server Actions, middleware y para esconder controles en UI.

---

## 10. Lo que SIEMPRE preguntar antes de hacer

- ¿Instalar una librería que no está en la lista del §2?
- ¿Crear una tabla nueva en Prisma no contemplada en §4?
- ¿Cambiar la estructura de carpetas del §3?
- ¿Modificar este `CLAUDE.md` o `PLAN.md`?
- ¿Agregar funcionalidad listada en "lo que NO incluye"? (incluye instalar frameworks de testing)
- ¿Borrar datos o tablas existentes?
- ¿Hacer un cambio que afecta múltiples features ya cerradas?

---

## 11. Anti-patrones a evitar

- ❌ Cliente de Prisma instanciado en cada request → usar singleton en `lib/prisma.ts`.
- ❌ `Number` para dinero.
- ❌ `any` o `as any`.
- ❌ Lógica de negocio en componentes UI → vive en `features/<x>/actions.ts` o `queries.ts`.
- ❌ Validación solo en cliente → siempre también en servidor.
- ❌ Mezclar lecturas y escrituras sin transacción cuando deben ser atómicas (venta + stock).
- ❌ Hardcodear IVA (15) en código → siempre desde `Settings`.
- ❌ Hacer migraciones con `prisma db push` en producción → siempre `migrate dev` / `migrate deploy`.
- ❌ Commits que mezclan features distintas.
- ❌ Instalar Vitest, Jest, Playwright o cualquier framework de testing.

---

**Última actualización:** ver fecha del commit. **No modificar este archivo sin autorización del usuario.**

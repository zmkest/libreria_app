# CLAUDE.md — Sistema de Gestión de Inventario para Librería Escolar

> Este archivo es leído automáticamente por **Claude Code** al iniciar en el directorio raíz del proyecto. Contiene el contexto, las reglas, las convenciones y las decisiones arquitectónicas que debes respetar en TODO momento. **Léelo completo antes de ejecutar cualquier acción.**

---

## 1. Contexto del Proyecto

**Nombre:** Sistema de Gestión de Inventario para Librería Escolar
**Tipo de negocio:** Librería / papelería dedicada a productos escolares y educativos (cuadernos, lápices, mochilas, textos escolares, útiles, etc.). **NO es una librería de libros literarios**, por lo tanto el modelo de datos NO debe centrarse en ISBN, autores ni editoriales.
**Ubicación del negocio:** Ecuador (moneda USD).
**Modalidad de uso:** Aplicación de escritorio (Tauri) con base de datos PostgreSQL local en la misma máquina. **Uso offline garantizado** por diseño (no depende de internet).

### Objetivos funcionales
1. Gestión de **inventario** de productos (código, nombre, precio de compra, precio de venta, cantidad).
2. **Ventas** simples (un producto por venta, en efectivo).
3. Gestión de **clientes** (nombres, apellidos, cédula opcional, dirección, celular).
4. **Reportes** y **dashboard** con métricas de ventas por día y por mes.
5. Sistema de **usuarios con login** (sin roles).

### Lo que NO incluye este proyecto (NO implementar)
- ❌ **Roles ni permisos diferenciados.** Todos los usuarios autenticados tienen el mismo nivel de acceso.
- ❌ **Cálculo de IVA / impuestos.** El precio de venta del producto es el precio final que paga el cliente.
- ❌ **Categorías de productos.**
- ❌ **Historial de movimientos de stock** (no hay tabla `StockMovement`).
- ❌ **Carrito de compras / múltiples productos por venta.** Una venta = un producto.
- ❌ **Tabla de configuración global** (`Settings`).
- ❌ **Lógica automática de descuento de stock.** El campo `stock` existe en `Product` pero NO se muestra en la UI, NO se descuenta al vender, NO se valida. Es un campo dormido reservado para uso futuro.
- ❌ Facturación electrónica con SRI (XML, firma .p12, web services).
- ❌ Escaneo de códigos de barras (búsqueda manual por código/nombre).
- ❌ Múltiples métodos de pago (solo efectivo implícito).
- ❌ Múltiples bodegas/ubicaciones.
- ❌ Exportación a CSV/Excel/PDF.
- ❌ Búsqueda de productos en APIs externas (Google Books, Open Library).
- ❌ Internacionalización i18n (solo español).
- ❌ Soporte multimoneda (solo USD).
- ❌ Backend remoto compartido (la BD es siempre local).
- ❌ Tarjetas, transferencias, crédito o fiado al cliente.
- ❌ **Tests automatizados** (Vitest, Playwright, Jest, etc.). La calidad se asegura con TypeScript estricto, validación Zod y verificación manual.

> **Regla:** Si te piden agregar alguna de las funciones excluidas, **detente y pregúntale al usuario antes de implementarlas.** No las añadas por iniciativa propia "por si acaso".

---

## 2. Stack Tecnológico

| Capa | Tecnología | Notas |
|------|------------|-------|
| Gestor de paquetes | **pnpm** | Obligatorio. NO usar npm ni yarn. |
| Runtime / Framework | **Next.js 15+ (App Router)** con **API Routes** | Server Components por defecto. |
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
- **Server Actions** para mutaciones simples desde formularios; **API Routes** (`app/api/.../route.ts`) cuando se requiera consumo externo.
- **Server Components por defecto.** Marca `"use client"` solo donde sea estrictamente necesario.
- Nunca uses `localStorage` o `sessionStorage` para datos de negocio.
- Nunca expongas la conexión de Prisma al cliente. Toda consulta vive en servidor.
- **No se incluyen frameworks de testing.** No instalar Vitest, Jest, Playwright ni similares.

---

## 3. Estructura de Carpetas

### ⚠️ REGLA CRÍTICA: Inicialización del proyecto

**El proyecto debe crearse EN la carpeta actual donde está ubicado este `CLAUDE.md`, NO en una subcarpeta ni en otra carpeta externa.**

Ejemplo: si el usuario está en `libreria_app/` y dentro hay `CLAUDE.md` y `PLAN.md`, entonces:
- ✅ **CORRECTO:** ejecutar `pnpm create next-app@latest .` (con punto al final = carpeta actual)
- ❌ **INCORRECTO:** ejecutar `pnpm create next-app@latest libreria` → crearía `libreria_app/libreria/`
- ❌ **INCORRECTO:** crear `libreria_temp` afuera y luego copiar → NUNCA
- ❌ **INCORRECTO:** ejecutar `pnpm create next-app@latest libreria_app` desde el padre

**Antes de inicializar:**
1. Verificar que la carpeta actual contiene SOLO `CLAUDE.md`, `PLAN.md` y opcionalmente `.git/`.
2. Si hay otros archivos, **detenerse y preguntar al usuario** antes de continuar.
3. Cuando `create-next-app` pregunte si está bien usar el directorio actual no vacío, responder afirmativamente.

### Estructura resultante

```
libreria_app/                    ← carpeta donde está CLAUDE.md y se ejecuta claude
├── CLAUDE.md                    ← este archivo (no modificar sin permiso)
├── PLAN.md                      ← roadmap (no modificar sin permiso)
├── README.md                    ← documentación de instalación y uso
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── .env.example
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
    │   ├── (auth)/
    │   │   └── login/
    │   ├── (dashboard)/
    │   │   ├── layout.tsx       ← sidebar + topbar
    │   │   ├── page.tsx         ← dashboard
    │   │   ├── productos/
    │   │   ├── ventas/
    │   │   ├── clientes/
    │   │   └── reportes/
    │   ├── api/
    │   │   └── auth/[...nextauth]/route.ts
    │   ├── layout.tsx
    │   └── globals.css
    ├── components/
    │   ├── ui/                  ← shadcn/ui (generados por CLI)
    │   └── shared/              ← componentes propios reutilizables
    ├── features/                ← lógica por dominio
    │   ├── productos/
    │   ├── ventas/
    │   ├── clientes/
    │   ├── reportes/
    │   └── usuarios/
    ├── lib/
    │   ├── prisma.ts            ← singleton de PrismaClient
    │   ├── auth.ts              ← config de Auth.js
    │   ├── money.ts             ← helpers para Decimal
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
> └── components/       ← componentes específicos
> ```

---

## 4. Modelo de Datos (Prisma)

Este es el modelo COMPLETO que debe implementarse en `prisma/schema.prisma`. **No agregar campos sin autorización del usuario.**

```prisma
// Datasource y generator
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ============ USUARIOS ============

model User {
  id        String   @id @default(cuid())
  username  String   @unique
  password  String   // hash argon2
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  sales     Sale[]
}

// ============ CLIENTES ============

model Customer {
  id        String   @id @default(cuid())
  idNumber  String?  // cédula, opcional, sin validación SRI
  firstName String                                // nombres
  lastName  String                                // apellidos
  address   String?
  phone     String?                               // celular
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  sales     Sale[]

  @@index([idNumber])
  @@index([lastName, firstName])
}

// ============ PRODUCTOS (INVENTARIO) ============

model Product {
  id            String   @id @default(cuid())
  code          String   @unique                  // código del producto
  name          String
  purchasePrice Decimal  @db.Decimal(10, 2)       // precio de compra
  salePrice     Decimal  @db.Decimal(10, 2)       // precio de venta (precio final, sin IVA)

  // Campo DORMIDO: existe en BD pero NO se usa todavía.
  // No mostrar en UI, no validar al vender, no descontar al vender.
  // Reservado para futura lógica de control de inventario.
  stock         Int      @default(0)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  sales         Sale[]

  @@index([code])
  @@index([name])
}

// ============ VENTAS ============

model Sale {
  id           String     @id @default(cuid())
  saleNumber   Int        @unique @default(autoincrement())  // correlativo legible

  customerId   String?
  customer     Customer?  @relation(fields: [customerId], references: [id])

  userId       String                                        // quién vendió
  user         User       @relation(fields: [userId], references: [id])

  productId    String
  product      Product    @relation(fields: [productId], references: [id])
  productName  String                                        // snapshot del nombre al momento de venta

  unitPrice    Decimal    @db.Decimal(10, 2)                 // precio al momento de venta
  quantity     Int                                           // cantidad vendida
  total        Decimal    @db.Decimal(10, 2)                 // unitPrice * quantity

  status       SaleStatus @default(COMPLETADA)
  cancelReason String?
  cancelledAt  DateTime?

  createdAt    DateTime   @default(now())                    // FECHA DE VENTA (usado en reportes)
  updatedAt    DateTime   @updatedAt

  @@index([createdAt])
  @@index([customerId])
  @@index([userId])
  @@index([productId])
  @@index([status])
}

enum SaleStatus {
  COMPLETADA
  CANCELADA
}
```

### Reglas críticas del modelo

1. **`Product.stock` es un campo dormido.** Existe en BD con valor por defecto `0`. **NO** se muestra en formularios, **NO** se descuenta al vender, **NO** se valida. Solo se persiste para uso futuro. Si Claude Code lo expone o lo modifica, está violando la especificación.

2. **`Sale.createdAt` es la fecha de venta** y se usa directamente para los reportes (diarios y mensuales). No crear otro campo `saleDate`.

3. **`Sale.productName` es un snapshot.** Se copia desde `Product.name` al momento de crear la venta. Si el nombre del producto cambia después, las ventas viejas conservan el nombre original. Igual con `unitPrice`: se congela el precio al que se vendió.

4. **`Sale.total` se calcula en el servidor** como `unitPrice * quantity` (operación con `Decimal.js`, nunca `Number`). Nunca confiar en un total enviado desde el cliente.

5. **Cancelar una venta** = `status = CANCELADA` + `cancelledAt = now()` + `cancelReason` obligatorio. **NUNCA** borrar ventas físicamente. **La cancelación NO modifica stock** porque no hay lógica de stock activa.

6. **`Customer` sin `idNumber`** es válido (cliente "consumidor final" o anónimo).

7. **`Decimal` en TypeScript**: los campos `Decimal` de Prisma son objetos `Decimal.js`. **NO los conviertas a `Number`** para operar; usa los métodos del SDK (`.plus()`, `.times()`, `.mul()`).

---

## 5. Plan de Desarrollo — Feature por Feature

El usuario eligió **estrategia feature-driven**: cada feature se entrega completa (modelo + Server Actions + UI) antes de pasar a la siguiente. Ver `PLAN.md` para detalles. Orden estricto:

1. **Setup inicial** (Next.js + Tauri + Prisma + Tailwind + shadcn/ui + Auth.js) **en la carpeta actual**.
2. **Autenticación** (login con username + password, sin roles).
3. **Productos** (CRUD básico de inventario).
4. **Clientes** (CRUD básico).
5. **Ventas** (registro de venta = un producto + cliente + cantidad).
6. **Dashboard** (KPIs simples).
7. **Reportes** (por día y por mes usando `createdAt`).
8. **Empaquetado Tauri** y release.

> **No saltes pasos. No empieces el feature N+1 hasta que N esté completo y commiteado.**

---

## 6. Reglas Inquebrantables para Claude Code

### Antes de empezar cualquier tarea
1. **Lee este archivo completo y `PLAN.md`** si existe.
2. **Confirma con el usuario qué feature vas a trabajar.**
3. **Si encuentras ambigüedad, pregunta. NO inventes.**
4. **Verifica que estás trabajando en la carpeta correcta** (la que contiene `CLAUDE.md`, NO una subcarpeta).

### Antes de escribir código
1. Revisa qué ya existe en el repo (`view` de directorios relevantes).
2. Si vas a crear una migración de Prisma, **describe primero qué cambia y por qué**.
3. Si vas a instalar una dependencia nueva no listada en §2, **pide autorización primero**.

### Al escribir código
1. **TypeScript estricto**, sin `any` salvo comentario justificado.
2. **Validación con Zod en TODA entrada** (Server Action, Route Handler, formulario). Esta es la principal línea de defensa: como no hay tests, la validación debe ser exhaustiva.
3. **Manejo de errores con `try/catch` y respuestas tipadas**. Para Server Actions, devolver `{ success: true, data } | { success: false, error }`.
4. **Mensajes de error al usuario en español**.
5. **Comentarios técnicos en español** cuando aclaren lógica de negocio. Los nombres de variables, funciones y archivos van en **inglés**.
6. **Server Actions** marcadas con `"use server"`.
7. **Nunca consultes Prisma desde Client Components**.

### Al manejar dinero
1. **Siempre `Decimal`** en BD (Prisma `@db.Decimal(10, 2)`).
2. **Operaciones con `Decimal.js`** (`.plus`, `.minus`, `.mul`, `.div`), nunca operadores `+ - * /`.
3. Helpers en `src/lib/money.ts` para formatear (`$ 1,234.56`), parsear, calcular `total = unitPrice * quantity`, calcular `profit = salePrice - purchasePrice`.

### Verificación manual (reemplaza a los tests)
Antes de cerrar una feature, **prueba manualmente en el navegador / app Tauri** los siguientes escenarios cuando aplique:
- Caso feliz: el flujo principal funciona.
- Caso de error: el sistema responde con mensajes claros cuando la entrada es inválida.
- Persistencia: al recargar, los datos siguen ahí.
- Sesión: rutas protegidas redirigen a login sin sesión.

Documentar en el commit qué se probó manualmente.

### Migraciones
1. Toda modificación de `schema.prisma` se acompaña de `pnpm prisma migrate dev --name <nombre_descriptivo>`.
2. Nombres de migración en español kebab-case: `agregar-tabla-productos`, `agregar-cancelacion-de-venta`.

### Commits
- **Conventional Commits en español**:
  - `feat: agregar formulario de creación de productos`
  - `fix: corregir cálculo de ganancia en listado`
  - `refactor: extraer helper money a lib`
  - `docs: actualizar README con guía de instalación`
  - `chore: actualizar dependencias`
- **Un commit por unidad lógica.**

### Antes de cerrar una feature
1. ¿La migración de Prisma se ejecutó sin errores?
2. ¿Lint y typecheck limpios? (`pnpm lint && pnpm typecheck`).
3. ¿Verificación manual de los escenarios principales?
4. ¿La UI funciona en modo claro y oscuro?
5. ¿La feature está documentada en el README?
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
# Instalación inicial (EN la carpeta actual)
pnpm create next-app@latest .
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

### Cálculo de ganancia (profit)
```
Por producto, en tiempo de consulta (NO se guarda en BD):
  profit = salePrice - purchasePrice
```
Se calcula al vuelo en queries o helpers (`src/lib/money.ts`). El campo NO existe en la tabla `Product`.

### Cálculo del total de una venta
```
Al crear una Sale:
  total = unitPrice * quantity   (operación Decimal.js)
```
El servidor recalcula el total a partir del precio del producto al momento de venta. Nunca confiar en un `total` enviado desde el cliente.

### Cancelación de venta
- Cualquier usuario autenticado puede cancelar (no hay roles).
- Se requiere `cancelReason` (texto obligatorio, mínimo 3 caracteres).
- Acción:
  1. `Sale.status = CANCELADA`
  2. `Sale.cancelledAt = now()`
  3. `Sale.cancelReason = <motivo>`
- **NO se modifica stock** porque el campo `stock` está dormido en esta versión.

### Reportes por día y por mes
- Se basan en el campo `Sale.createdAt`.
- Filtros típicos:
  - **Por día:** ventas de hoy, ventas de una fecha específica, rango de días.
  - **Por mes:** ventas del mes actual, ventas de un mes específico (año + mes).
- Las ventas con `status = CANCELADA` se **excluyen** de los totales por defecto, pero se pueden listar aparte.

---

## 10. Lo que SIEMPRE preguntar antes de hacer

- ¿Instalar una librería que no está en la lista del §2?
- ¿Crear una tabla nueva en Prisma no contemplada en §4?
- ¿Agregar un campo a una tabla existente?
- ¿Cambiar la estructura de carpetas del §3?
- ¿Modificar este `CLAUDE.md` o `PLAN.md`?
- ¿Agregar funcionalidad listada en "lo que NO incluye"? (especialmente: roles, IVA, categorías, lógica de stock, tests)
- ¿Borrar datos o tablas existentes?
- ¿Hacer un cambio que afecta múltiples features ya cerradas?
- **¿La carpeta actual ya tiene archivos del proyecto Next.js o está vacía?** Verificar antes de inicializar.

---

## 11. Anti-patrones a evitar

- ❌ Crear el proyecto en una subcarpeta cuando el usuario ya está en la carpeta destino.
- ❌ Cliente de Prisma instanciado en cada request → usar singleton en `lib/prisma.ts`.
- ❌ `Number` para dinero.
- ❌ `any` o `as any`.
- ❌ Lógica de negocio en componentes UI → vive en `features/<x>/actions.ts` o `queries.ts`.
- ❌ Validación solo en cliente → siempre también en servidor.
- ❌ Implementar lógica de descuento de stock (campo dormido, prohibido tocar).
- ❌ Implementar cálculo de IVA o impuestos.
- ❌ Implementar sistema de roles.
- ❌ Guardar `profit` en la tabla `Product` (debe ser calculado al vuelo).
- ❌ Hacer migraciones con `prisma db push` en producción → siempre `migrate dev` / `migrate deploy`.
- ❌ Commits que mezclan features distintas.
- ❌ Instalar Vitest, Jest, Playwright o cualquier framework de testing.

---

**Última actualización:** ver fecha del commit. **No modificar este archivo sin autorización del usuario.**
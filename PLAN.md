# PLAN.md — Roadmap de Desarrollo por Features

> Documento complementario a `CLAUDE.md`. Describe **el orden estricto de implementación** y los **criterios de aceptación** de cada feature. Claude Code debe trabajar **una feature a la vez** y NO avanzar a la siguiente hasta que la actual esté completa, verificada manualmente y commiteada.

> **Importante:** Este proyecto **NO usa tests automatizados**. La calidad se asegura con:
> - TypeScript estricto (sin `any`).
> - Validación exhaustiva con Zod en cliente y servidor.
> - Manejo de errores tipado en Server Actions.
> - **Verificación manual** en cada feature antes de cerrarla.

---

## Convenciones

Cada feature está dividida en estas etapas:
1. **Modelo** — cambios en `prisma/schema.prisma` + migración.
2. **Backend** — Server Actions, queries, validaciones Zod.
3. **UI** — páginas, formularios, tablas.
4. **Verificación manual** — pruebas en el navegador/Tauri de los flujos descritos.
5. **Checkpoint** — preguntar al usuario antes de cerrar y commitear.

Cada feature debe terminar con un commit principal y, opcionalmente, varios commits parciales.

---

## ✅ Feature 0 — Setup Inicial

**Objetivo:** Tener un proyecto vacío pero ejecutable con todo el stack listo **en la carpeta actual**.

### ⚠️ Regla crítica de carpeta

El usuario ya creó una carpeta (ej: `libreria_app/`), colocó `CLAUDE.md` y `PLAN.md` adentro, y ejecutó `claude` desde ahí. **El proyecto Next.js se inicializa EN esa misma carpeta**, no en una subcarpeta.

**Antes de ejecutar cualquier comando:**
1. Ejecutar `pwd` para confirmar la carpeta actual.
2. Ejecutar `ls -la` para verificar que solo hay `CLAUDE.md`, `PLAN.md` y opcionalmente `.git/`.
3. Si hay otros archivos no esperados, **detenerse y preguntar al usuario** antes de continuar.

### Pasos

1. **Inicializar Next.js EN la carpeta actual:**
   ```bash
   pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
   ```
   - El `.` al final es crítico: significa "inicializar aquí".
   - Cuando pregunte si está bien usar el directorio no vacío, responder **sí**.
   - Cuando pregunte por turbopack, elegir según preferencia (recomendado: sí).

2. **Configurar Tauri 2:**
   ```bash
   pnpm add -D @tauri-apps/cli
   pnpm tauri init
   ```
   - App name: "Librería"
   - Window title: "Sistema de Inventario"
   - `beforeDevCommand`: `"pnpm dev"`
   - `devUrl`: `"http://localhost:3000"`
   - `frontendDist`: `"../out"` (o lo que corresponda según modo de build)
   - Verificar que `src-tauri/` se crea **dentro** de la carpeta actual.

3. **Instalar dependencias base:**
   ```bash
   pnpm add @prisma/client zod react-hook-form @hookform/resolvers \
            date-fns decimal.js sonner lucide-react recharts \
            next-auth@beta @auth/prisma-adapter @node-rs/argon2 \
            @tanstack/react-table next-themes
   pnpm add -D prisma prettier eslint-config-prettier @types/node tsx
   ```

4. **Inicializar Prisma:**
   ```bash
   pnpm prisma init --datasource-provider postgresql
   ```

5. **Instalar shadcn/ui:**
   ```bash
   pnpm dlx shadcn@latest init
   ```
   - Tema: neutral
   - Habilitar modo claro/oscuro.

6. **Configurar `tsconfig.json`:** asegurar `strict: true` y `paths` (`@/*` → `src/*`).

7. **Crear estructura de carpetas** según §3 del CLAUDE.md (carpetas vacías con `.gitkeep` cuando aplique).

8. **Crear `src/lib/prisma.ts`** (singleton de PrismaClient).

9. **Configurar scripts en `package.json`:**
   ```json
   {
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start",
       "lint": "next lint",
       "typecheck": "tsc --noEmit",
       "db:seed": "tsx prisma/seed.ts",
       "tauri": "tauri"
     }
   }
   ```

10. **`.gitignore`** completo (Next.js + Tauri + Prisma + .env).

11. **`README.md`** con guía de instalación (Node 20+, pnpm, PostgreSQL 16+, Rust, `createdb libreria`).

12. **`.env.example`** con `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`.

### Verificación manual
- [ ] `pwd` confirma que estoy en la carpeta correcta (NO en una subcarpeta).
- [ ] `ls` muestra `package.json`, `src/`, `prisma/`, `src-tauri/`, `CLAUDE.md`, `PLAN.md` todos al mismo nivel.
- [ ] **NO existe** ninguna carpeta tipo `libreria/`, `libreria_temp/` o similar dentro o fuera.
- [ ] `pnpm dev` levanta Next.js sin errores.
- [ ] `pnpm tauri dev` abre la ventana nativa con la app.
- [ ] `pnpm typecheck` y `pnpm lint` pasan sin errores.
- [ ] PostgreSQL local creado (`createdb libreria`) y `DATABASE_URL` apunta a él.

### Criterios de aceptación
- [ ] Commit: `chore: setup inicial del proyecto`.

---

## ✅ Feature 1 — Autenticación (Login simple)

**Objetivo:** Login con username y contraseña, sin roles, con protección de rutas.

### Modelo
- Tabla `User` (definida en §4 del CLAUDE.md).
- `pnpm prisma migrate dev --name agregar-tabla-usuarios`.

### Backend
1. `src/lib/auth.ts`: configuración de Auth.js v5 con `CredentialsProvider` (username + password), adapter de Prisma, sesión en BD.
2. `src/app/api/auth/[...nextauth]/route.ts`.
3. `src/middleware.ts`: redirige a `/login` si no hay sesión, redirige a `/` si está logueado y accede a `/login`.
4. `src/features/usuarios/`:
   - `schemas.ts` — `loginSchema` y `changePasswordSchema` con Zod.
   - `actions.ts` — `changePassword`.
   - `queries.ts` — `getCurrentUser`.

### UI
1. `/login` — formulario simple: username + password → redirige a `/`.
2. Layout del dashboard `(dashboard)/layout.tsx`: sidebar con navegación (Productos, Clientes, Ventas, Reportes), topbar con nombre del usuario y botón "Cerrar sesión".
3. `/(dashboard)/perfil` — página simple con datos del usuario actual y opción de cambiar contraseña.
4. Tema claro/oscuro con `next-themes` y toggle en el topbar.

### Seed
- En `prisma/seed.ts`: crear usuario inicial `admin / admin123` con `name: "Administrador"`. Advertir en README que **debe cambiarse en primer uso**.

### Verificación manual
- [ ] Acceder a `/` sin sesión redirige a `/login`.
- [ ] Acceder a `/login` con sesión activa redirige a `/`.
- [ ] Login con `admin / admin123` funciona y lleva al dashboard.
- [ ] Login con contraseña incorrecta muestra error claro.
- [ ] Login con usuario inexistente muestra error claro (sin filtrar si existe o no).
- [ ] El topbar muestra "Administrador" (el `name`, no el username).
- [ ] Logout cierra la sesión y redirige a `/login`.
- [ ] Recargar la página mantiene la sesión.
- [ ] Cambiar contraseña desde `/perfil` funciona y requiere la contraseña actual.
- [ ] Tras cambiar contraseña, el login con la anterior falla.
- [ ] Tema claro/oscuro alterna correctamente.

### Criterios de aceptación
- [ ] Passwords hasheados con argon2 (verificable en BD que no están en texto plano).
- [ ] Sesión persistida en BD.
- [ ] Commit principal: `feat: autenticación con login simple`.

---

## ✅ Feature 2 — Productos (Inventario)

**Objetivo:** CRUD básico de productos con código, nombre, precio de compra, precio de venta y ganancia calculada al vuelo.

### Modelo
- Tabla `Product` (definida en §4 del CLAUDE.md).
- El campo `stock` se crea con `@default(0)` pero **NO se usa, NO se muestra, NO se valida**. Es dormido.
- `pnpm prisma migrate dev --name agregar-tabla-productos`.

### Backend
- `src/features/productos/`:
  - `schemas.ts`:
    - `createProductSchema` — code (string no vacío), name (string no vacío), purchasePrice (decimal positivo), salePrice (decimal positivo).
    - `updateProductSchema` — todos los campos opcionales.
    - Validación adicional: `salePrice >= purchasePrice` recomendado pero no obligatorio (warning, no error).
  - `actions.ts`:
    - `createProduct(data)` — valida con Zod, verifica que `code` no exista, crea producto.
    - `updateProduct(id, data)` — valida y actualiza.
    - `deleteProduct(id)` — bloquea si el producto tiene ventas asociadas (mensaje claro). Si no, elimina físicamente.
  - `queries.ts`:
    - `listProducts({ search, page, pageSize })` — búsqueda por `code` o `name` (case-insensitive). Devuelve productos con `profit` calculado al vuelo.
    - `getProductById(id)` — incluye `profit`.

- `src/lib/money.ts`:
  - `formatCurrency(value: Decimal): string` — formato `$ 1,234.56`.
  - `calculateProfit(salePrice: Decimal, purchasePrice: Decimal): Decimal` — `salePrice.minus(purchasePrice)`.
  - `calculateSaleTotal(unitPrice: Decimal, quantity: number): Decimal` — `unitPrice.times(quantity)`.

### UI
- `/(dashboard)/productos`:
  - Tabla TanStack con columnas: código, nombre, precio compra, precio venta, **ganancia (calculada)**, acciones (editar, eliminar).
  - Buscador por código o nombre.
  - Paginación.
  - Botón "Nuevo producto".
- Modal/página de creación: formulario con react-hook-form + Zod resolver.
- Modal/página de edición: mismo formulario precargado.
- Confirmación antes de eliminar.
- Toast con sonner al crear/editar/eliminar.

### Verificación manual
- [ ] Crear producto con código, nombre, precio compra y precio venta funciona.
- [ ] El listado muestra la ganancia correcta (precio venta - precio compra) sin haberla guardado.
- [ ] Crear producto con código duplicado se rechaza con mensaje claro.
- [ ] Crear producto con precio negativo se rechaza.
- [ ] Crear producto con precio venta menor que precio compra muestra warning pero permite continuar.
- [ ] Editar producto y ver el cambio reflejado al instante.
- [ ] Búsqueda por código funciona (parcial, no exacta).
- [ ] Búsqueda por nombre funciona (case-insensitive).
- [ ] Paginación funciona si hay más de 10 productos.
- [ ] Intentar eliminar un producto que NO tiene ventas: elimina correctamente.
- [ ] El campo `stock` **NO aparece** en ningún formulario ni listado de la UI.
- [ ] Verificar en `pnpm prisma studio` que `stock` se creó con valor 0 por defecto.

### Criterios de aceptación
- [ ] El campo `stock` existe en BD pero está completamente oculto en la UI.
- [ ] `profit` se calcula en runtime, NO se guarda en BD.
- [ ] Commit principal: `feat: gestión de productos (inventario)`.

---

## ✅ Feature 3 — Clientes

**Objetivo:** CRUD básico de clientes con cédula opcional.

### Modelo
- Tabla `Customer` (definida en §4 del CLAUDE.md).
- `pnpm prisma migrate dev --name agregar-tabla-clientes`.

### Backend
- `src/features/clientes/`:
  - `schemas.ts`:
    - `createCustomerSchema`:
      - `firstName`: string no vacío.
      - `lastName`: string no vacío.
      - `idNumber`: string opcional (sin validación SRI).
      - `address`: string opcional.
      - `phone`: string opcional.
    - `updateCustomerSchema`: todos opcionales.
  - `actions.ts`: `createCustomer`, `updateCustomer`, `deleteCustomer`.
    - `deleteCustomer` bloquea si el cliente tiene ventas asociadas.
  - `queries.ts`: `listCustomers({ search, page, pageSize })` — búsqueda por `firstName`, `lastName` o `idNumber`.

### UI
- `/(dashboard)/clientes`:
  - Tabla con columnas: cédula, nombres, apellidos, celular, dirección, acciones.
  - Buscador por nombre, apellido o cédula.
  - Paginación.
  - Botón "Nuevo cliente".
- Modal de creación/edición con formulario react-hook-form + Zod.
- `/(dashboard)/clientes/[id]` — detalle del cliente con sus datos + listado de sus ventas (se llena tras Feature 4).

### Verificación manual
- [ ] Crear cliente con todos los campos funciona.
- [ ] Crear cliente solo con nombres y apellidos (sin cédula, sin dirección, sin celular) funciona.
- [ ] Crear cliente sin nombres o apellidos se rechaza.
- [ ] Editar cliente funciona.
- [ ] Búsqueda por nombre funciona.
- [ ] Búsqueda por apellido funciona.
- [ ] Búsqueda por cédula funciona.
- [ ] Detalle del cliente muestra sus datos correctamente (la sección de ventas queda vacía por ahora).

### Criterios de aceptación
- [ ] Commit: `feat: gestión de clientes`.

---

## ✅ Feature 4 — Ventas

**Objetivo:** Registrar ventas (un producto + un cliente + una cantidad), con número correlativo, cancelación opcional.

### Modelo
- Tabla `Sale` con enum `SaleStatus` (definida en §4 del CLAUDE.md).
- `pnpm prisma migrate dev --name agregar-tabla-ventas`.

### Backend
- `src/features/ventas/`:
  - `schemas.ts`:
    - `createSaleSchema`:
      - `productId`: string requerido.
      - `quantity`: int positivo requerido.
      - `customerId`: string opcional (consumidor final si no se envía).
    - `cancelSaleSchema`:
      - `cancelReason`: string requerido, mínimo 3 caracteres.
  - `actions.ts`:
    - `createSale(data)`:
      1. Validar Zod.
      2. Buscar el producto, obtener `name` y `salePrice` actuales.
      3. Tomar snapshot: `productName = product.name`, `unitPrice = product.salePrice`.
      4. Calcular `total = unitPrice.times(quantity)` usando Decimal.js.
      5. Tomar `userId` de la sesión.
      6. Crear `Sale` con todos los campos. `status = COMPLETADA`.
      7. Devolver la venta creada.
    - `cancelSale(id, { cancelReason })`:
      1. Validar Zod.
      2. Verificar que la venta exista y esté en estado `COMPLETADA`.
      3. Actualizar: `status = CANCELADA`, `cancelledAt = now()`, `cancelReason`.
      4. **NO modificar stock** (campo dormido).
  - `queries.ts`:
    - `listSales({ from, to, customerId, userId, status, search, page, pageSize })`.
    - `getSaleById(id)` — incluye `customer`, `user`, `product`.
    - `getSalesByCustomer(customerId)` — para detalle de cliente.

### UI
- `/(dashboard)/ventas`:
  - Tabla con columnas: N° (saleNumber), fecha (createdAt formateada con date-fns en español), cliente, producto, cantidad, precio unitario, total, estado, acciones.
  - Filtros: rango de fechas, cliente, estado (completada/cancelada/todas).
  - Buscador por número de venta o nombre de producto.
  - Botón "Nueva venta".
- `/(dashboard)/ventas/nueva`:
  - Formulario:
    - Selector de cliente (autocomplete con búsqueda; opción "consumidor final" deja `customerId = null`).
    - Selector de producto (autocomplete con búsqueda por código o nombre).
    - Cantidad (input numérico).
    - Vista previa: muestra precio unitario, total calculado en vivo.
  - Botón "Registrar venta".
  - Tras registrar: redirige al detalle de la venta con mensaje de éxito.
- `/(dashboard)/ventas/[id]`:
  - Muestra todos los datos: número, fecha, cliente, producto (con snapshot del nombre), cantidad, precio unitario, total, estado.
  - Si está COMPLETADA: botón "Cancelar venta" → modal con campo `cancelReason` obligatorio.
  - Si está CANCELADA: muestra fecha de cancelación y motivo.
- En `/(dashboard)/clientes/[id]`: completar la sección de ventas del cliente (listado simple).

### Verificación manual
- [ ] Crear venta con cliente y producto funciona.
- [ ] Crear venta sin cliente (consumidor final) funciona.
- [ ] El `total` calculado coincide con `unitPrice * quantity`.
- [ ] Si cambio el precio del producto DESPUÉS de la venta, el detalle de la venta sigue mostrando el precio original (snapshot).
- [ ] Si cambio el nombre del producto, el detalle de la venta muestra el nombre original (snapshot).
- [ ] El `saleNumber` se incrementa correctamente (001, 002, 003...).
- [ ] El listado muestra la fecha en formato legible en español (ej: "26 de mayo de 2026").
- [ ] Filtro por rango de fechas funciona.
- [ ] Filtro por cliente funciona.
- [ ] Filtro por estado funciona.
- [ ] Cancelar venta con motivo válido funciona.
- [ ] Cancelar venta sin motivo (o motivo < 3 caracteres) se rechaza.
- [ ] Venta cancelada NO se puede volver a cancelar.
- [ ] La cantidad de stock del producto **no cambia** tras vender (verificable en `prisma studio`).
- [ ] La cantidad de stock del producto **no cambia** tras cancelar la venta.
- [ ] En el detalle del cliente, sus ventas aparecen listadas.

### Criterios de aceptación
- [ ] Toda venta crea snapshots de `productName` y `unitPrice`.
- [ ] `total` se calcula con Decimal.js, nunca con Number.
- [ ] `stock` del producto **NO se modifica** en ningún momento.
- [ ] Commit principal: `feat: registro y cancelación de ventas`.

---

## ✅ Feature 5 — Dashboard

**Objetivo:** Página principal con KPIs simples.

### Backend
- `src/features/dashboard/queries.ts`:
  - `getTodaySalesCount()` — número de ventas completadas hoy.
  - `getTodaySalesTotal()` — suma de totales de ventas completadas hoy.
  - `getMonthSalesTotal()` — suma del mes actual.
  - `getTotalProducts()` — count de productos.
  - `getTotalCustomers()` — count de clientes.
  - `getSalesByDayLast30()` — array de `{ date, total }` últimos 30 días para gráfico.
  - `getTopProductsThisMonth(limit = 5)` — top productos por unidades vendidas o por total facturado.

### UI
- `/(dashboard)/` (home):
  - 4 cards: ventas hoy (count + total), ventas del mes (total), productos registrados, clientes registrados.
  - Gráfico de líneas con ventas por día (últimos 30 días) usando Recharts.
  - Tabla con top 5 productos más vendidos del mes.
- Ventas canceladas se **excluyen** de todos los cálculos.

### Verificación manual
- [ ] Las cifras del dashboard coinciden con las del listado de ventas filtrado.
- [ ] Crear una nueva venta → "ventas hoy" aumenta tras refrescar.
- [ ] Cancelar una venta → su monto se resta del total.
- [ ] El gráfico muestra los últimos 30 días correctamente (días sin ventas aparecen en 0).
- [ ] Top productos refleja realmente los más vendidos.
- [ ] Si no hay ventas todavía, el dashboard muestra ceros sin errores.

### Criterios de aceptación
- [ ] Commit: `feat: dashboard con KPIs y gráfico de ventas`.

---

## ✅ Feature 6 — Reportes (por día y por mes)

**Objetivo:** Reportes detallados de ventas basados en `Sale.createdAt`.

### Backend
- `src/features/reportes/queries.ts`:
  - `dailySalesReport({ from, to })`:
    - Agrupa ventas COMPLETADAS por día.
    - Devuelve array de `{ date, salesCount, totalAmount }`.
  - `monthlySalesReport({ year })`:
    - Agrupa ventas COMPLETADAS por mes para un año dado.
    - Devuelve array de 12 elementos `{ month, salesCount, totalAmount }`.
  - `productsReport({ from, to })`:
    - Por producto: unidades vendidas, ingresos totales, ganancia total (calculada).
  - `customersReport({ from, to })`:
    - Por cliente: número de compras, total gastado.
  - `usersReport({ from, to })`:
    - Por usuario (vendedor): número de ventas, total facturado.

### UI
- `/(dashboard)/reportes`:
  - Tabs:
    - **Ventas por día** — date-range picker, tabla + gráfico de barras.
    - **Ventas por mes** — selector de año, tabla de 12 meses + gráfico.
    - **Productos** — date-range picker, tabla con código, nombre, unidades vendidas, ingresos, ganancia.
    - **Clientes** — date-range picker, tabla con cliente, compras, total.
    - **Usuarios** — date-range picker, tabla con usuario, ventas, total.
  - Filtros con date-fns y `locale: es`.
  - Todos los reportes **excluyen ventas canceladas** por defecto.
  - Opción visible: "Incluir canceladas" (checkbox) que cambia la query.

### Verificación manual
- [ ] Reporte por día con rango "hoy" muestra solo las ventas de hoy.
- [ ] Reporte por día con rango "este mes" suma correctamente.
- [ ] Reporte por mes con año actual muestra los 12 meses (con 0 en los meses sin ventas).
- [ ] Reporte de productos muestra correctamente unidades, ingresos y ganancia (`(salePrice - purchasePrice) * cantidad`).
- [ ] Reporte de clientes ignora ventas sin cliente (consumidor final) o las agrupa como "Consumidor final".
- [ ] Reporte de usuarios atribuye las ventas al usuario logueado en cada una.
- [ ] Activar "incluir canceladas" cambia los totales.
- [ ] Cambiar el rango de fechas refresca todos los datos.

### Criterios de aceptación
- [ ] Reportes funcionan correctamente con datos sembrados (al menos 5-10 ventas en distintas fechas).
- [ ] Commit: `feat: módulo de reportes por día, mes, productos, clientes y usuarios`.

---

## ✅ Feature 7 — Empaquetado Tauri y Release

**Objetivo:** Generar instalador `.msi` (Windows), `.dmg` (macOS) o `.deb` (Linux) según el SO objetivo.

### Pasos
1. Verificar que `next build` y `next start` funcionan empaquetados (o usar Tauri con sidecar para servidor Next embebido).
2. Configurar `src-tauri/tauri.conf.json`:
   - `productName`: "Librería"
   - `version`: "1.0.0"
   - `identifier`: "com.libreria.app" (o el que prefiera el usuario)
   - Iconos en `src-tauri/icons/`.
   - Bundle targets según SO.
3. Probar `pnpm tauri build` → instalador generado.
4. Documentar en README:
   - Cómo instalar PostgreSQL en la máquina destino.
   - Cómo crear la BD `libreria` y configurar el `.env`.
   - Cómo correr las migraciones iniciales (`pnpm prisma migrate deploy`).
   - Cómo correr el seed.

### Verificación manual
- [ ] Instalador se genera sin errores.
- [ ] Instalar el `.msi` / `.dmg` / `.deb` en una máquina limpia (o VM).
- [ ] Tras instalar, la app arranca, conecta a PostgreSQL local y funciona.
- [ ] Flujo completo en la app instalada: login → crear producto → crear cliente → registrar venta → ver reporte.

### Criterios de aceptación
- [ ] README actualizado con guía completa de instalación para el usuario final.
- [ ] Commit: `chore: empaquetado tauri para release v1.0.0`.

---

## Notas finales

- **Cada feature debe finalizar con preguntas al usuario:**
  - ¿Probaste manualmente las funciones principales (siguiendo la checklist de "Verificación manual")?
  - ¿Quieres ajustar algo antes de avanzar a la siguiente?
- Si en cualquier momento se descubre que el modelo de datos necesita un cambio que afecta features ya cerradas, **detener todo, documentar el cambio, hacer migración y notificar al usuario** antes de proseguir.
- Mantener `CLAUDE.md` y `PLAN.md` sincronizados con la realidad del repo. Si se cambia algo grande, actualizar ambos en el mismo commit.
- **No se incluyen tests automatizados en este proyecto** por decisión explícita del usuario. La validación con Zod y la verificación manual son las únicas líneas de defensa de calidad.
- **El campo `stock` está dormido** durante todas las features de esta versión. Si en el futuro se necesita activar el control de stock, será una nueva feature aparte (v2).
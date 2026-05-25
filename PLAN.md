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

**Objetivo:** Tener un proyecto vacío pero ejecutable con todo el stack listo.

### Pasos
1. `pnpm create next-app@latest libreria` (TypeScript, App Router, Tailwind, ESLint, src/).
2. Configurar Tauri 2:
   - `pnpm add -D @tauri-apps/cli`
   - `pnpm tauri init` con app name "Librería", window title "Sistema de Inventario".
   - Configurar `tauri.conf.json` con `beforeDevCommand: "pnpm dev"`, `devUrl: "http://localhost:3000"`, `frontendDist: "../out"`.
   - Ajustar `next.config.ts` para soportar build estático compatible con Tauri (`output: 'export'` cuando se buildea para Tauri — evaluar implicaciones con API routes; alternativa: usar `next start` empaquetado).
3. Instalar dependencias base:
   ```bash
   pnpm add @prisma/client zod react-hook-form @hookform/resolvers \
            date-fns decimal.js sonner lucide-react recharts \
            next-auth@beta @auth/prisma-adapter @node-rs/argon2
   pnpm add -D prisma prettier eslint-config-prettier @types/node tsx
   ```
4. Inicializar Prisma: `pnpm prisma init --datasource-provider postgresql`.
5. Instalar shadcn/ui: `pnpm dlx shadcn@latest init` con tema neutral, modo claro/oscuro habilitado.
6. Configurar `tsconfig.json` con `strict: true` y `paths` (`@/*` → `src/*`).
7. Crear estructura de carpetas según §3 del CLAUDE.md (carpetas vacías con `.gitkeep`).
8. Crear `lib/prisma.ts` (singleton).
9. Configurar scripts en `package.json`:
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
10. `.gitignore` con `node_modules`, `.next`, `src-tauri/target`, `.env`, etc.
11. `README.md` con instrucciones de instalación (Node, pnpm, PostgreSQL, etc.).
12. `.env.example` con `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`.

### Criterios de aceptación
- [ ] `pnpm dev` levanta Next.js.
- [ ] `pnpm tauri dev` abre la ventana nativa con la app.
- [ ] `pnpm typecheck` y `pnpm lint` pasan sin errores.
- [ ] El repo tiene la estructura de carpetas del CLAUDE.md.
- [ ] PostgreSQL local creado (`createdb libreria`) y `DATABASE_URL` apunta a él.
- [ ] Commit: `chore: setup inicial del proyecto`.

---

## ✅ Feature 1 — Autenticación y Usuarios

**Objetivo:** Login por email/contraseña, roles ADMIN/EMPLEADO, protección de rutas.

### Modelo
- Tabla `User` (ya definida en §4 del CLAUDE.md).
- `prisma migrate dev --name agregar-usuarios`.

### Backend
1. `lib/auth.ts`: configuración de Auth.js v5 con `CredentialsProvider`, adapter de Prisma, sesión en BD.
2. `app/api/auth/[...nextauth]/route.ts`.
3. `middleware.ts`: redirige a `/login` si no hay sesión, redirige a `/` si está logueado y accede a `/login`.
4. `lib/permissions.ts`: helpers `isAdmin(user)`, `requireAdmin(user)` (lanza error si no).
5. `features/usuarios/`:
   - `schemas.ts` — `createUserSchema` y `loginSchema` con Zod.
   - `actions.ts` — `createUser`, `updateUser`, `deactivateUser`, `changePassword`. Solo admin.
   - `queries.ts` — `listUsers`, `getUserById`.

### UI
1. `/login` — formulario con email + password, redirige a `/`.
2. `/(dashboard)/usuarios` — tabla TanStack con CRUD básico, solo accesible a admin.
3. Layout del dashboard: sidebar con navegación, topbar con menú de usuario (cerrar sesión, perfil).
4. Tema claro/oscuro con shadcn (`ThemeProvider` + `next-themes`).

### Seed
- En `prisma/seed.ts`: crear usuario admin inicial con credenciales por defecto (`admin@libreria.local` / `admin123`), advertir en README que **debe cambiarse** en primer uso.

### Verificación manual
- [ ] Login con admin del seed funciona.
- [ ] Login con contraseña incorrecta muestra error claro.
- [ ] Acceder a `/` sin sesión redirige a `/login`.
- [ ] Acceder a `/login` con sesión activa redirige a `/`.
- [ ] Admin puede crear un nuevo empleado.
- [ ] Empleado **no ve** la sección "Usuarios" en el sidebar.
- [ ] Empleado que intenta acceder a `/usuarios` por URL recibe error o redirección.
- [ ] Logout funciona y limpia la sesión.
- [ ] Recargar página mantiene la sesión.
- [ ] Cambiar entre tema claro/oscuro funciona.

### Criterios de aceptación
- [ ] Passwords hasheados con argon2 (verificar en BD que no están en texto plano).
- [ ] Sesión persistida en BD.
- [ ] Commit principal: `feat: autenticación y gestión de usuarios`.

---

## ✅ Feature 2 — Configuración Global (Settings)

**Objetivo:** Página de ajustes donde el admin configura datos del negocio y la tasa de IVA global.

### Modelo
- Tabla `Settings` (singleton id=1).
- Seed: crear fila inicial con `taxRate: 15.00`, `currency: 'USD'`.

### Backend
- `features/ajustes/`:
  - `schemas.ts` — `updateSettingsSchema` (taxRate entre 0 y 100 con 2 decimales).
  - `actions.ts` — `updateSettings` (solo admin).
  - `queries.ts` — `getSettings` (cachea con `unstable_cache` de Next; invalidar al actualizar).
- `lib/tax.ts` — `calculateLineTax(unitPrice, quantity, taxable, taxRate): Decimal`.

### UI
- `/(dashboard)/ajustes` — formulario con: nombre del negocio, RUC, dirección, teléfono, tasa de IVA, moneda (solo lectura, USD).
- Solo accesible a admin.
- Toast de confirmación al guardar.

### Verificación manual
- [ ] La fila `Settings` con `id=1` existe tras seed (verificable con `prisma studio`).
- [ ] Admin puede cambiar nombre del negocio, RUC, dirección, teléfono.
- [ ] Admin puede cambiar la tasa de IVA (probar con 12, 15, 0).
- [ ] Empleado no puede acceder a `/ajustes`.
- [ ] Valores inválidos en IVA (negativos, >100, no numéricos) se rechazan con mensaje claro.
- [ ] Tras cambiar IVA, recargar la página muestra el valor actualizado.

### Criterios de aceptación
- [ ] Commit: `feat: configuración global del negocio e iva`.

---

## ✅ Feature 3 — Categorías

**Objetivo:** CRUD de categorías de productos (cuadernos, lápices, mochilas, libros de texto, etc.).

### Modelo
- Tabla `Category`.

### Backend
- `features/categorias/` con `schemas`, `queries`, `actions`.
- Validar: no se puede eliminar una categoría con productos asociados (bloquear con mensaje claro).

### UI
- `/(dashboard)/categorias` — tabla simple con CRUD.
- Modal de creación/edición con react-hook-form + Zod.

### Verificación manual
- [ ] Crear categoría nueva funciona.
- [ ] Editar nombre de categoría funciona.
- [ ] Intentar crear categoría con nombre duplicado muestra error.
- [ ] Eliminar categoría sin productos funciona.
- [ ] Eliminar categoría con productos asociados se bloquea (este caso se verifica recién en Feature 4).
- [ ] Empleado puede listar pero no crear/editar/eliminar.

### Criterios de aceptación
- [ ] Commit: `feat: gestión de categorías`.

---

## ✅ Feature 4 — Productos e Inventario

**Objetivo:** CRUD de productos, control de stock con movimientos auditables.

### Modelo
- Tablas `Product` y `StockMovement`.
- Migración con índices en `sku`, `name`, `categoryId`.

### Backend
- `features/productos/`:
  - `schemas.ts` — `createProductSchema`, `updateProductSchema`, `adjustStockSchema`.
  - `actions.ts`:
    - `createProduct(data)` — admin.
    - `updateProduct(id, data)` — admin.
    - `deactivateProduct(id)` — soft delete (active=false). Admin.
    - `adjustStock(productId, quantity, reason)` — crea `StockMovement` con `type: AJUSTE`. Admin.
    - `addStockEntry(productId, quantity, cost?)` — `type: ENTRADA`. Admin.
  - `queries.ts`:
    - `listProducts({ search, categoryId, lowStock, page, pageSize })`.
    - `getProductById(id)`.
    - `getLowStockProducts()` — productos con `stock <= minStock`.
    - `getStockMovements(productId)`.

### UI
- `/(dashboard)/productos` — tabla TanStack con búsqueda, filtros (categoría, stock bajo), paginación.
- Botón "Nuevo producto" → modal/página con formulario completo.
- Detalle del producto → ficha con info + historial de movimientos de stock.
- Acción "Ajustar stock" → modal con cantidad (+/-) y motivo obligatorio.
- Badge visual cuando `stock <= minStock` (color amarillo o rojo).

### Verificación manual
- [ ] Crear producto con todos los campos funciona.
- [ ] Crear producto con SKU duplicado se rechaza.
- [ ] Editar producto (precio, nombre, etc.) funciona.
- [ ] Búsqueda por nombre funciona.
- [ ] Búsqueda por SKU funciona.
- [ ] Filtro por categoría funciona.
- [ ] Filtro "stock bajo" muestra solo productos con `stock <= minStock`.
- [ ] Ajustar stock manualmente (+10, -3) actualiza el stock y crea un `StockMovement`.
- [ ] Intentar ajustar para dejar stock negativo se bloquea.
- [ ] El historial de movimientos del producto se ve correctamente.
- [ ] Producto desactivado no aparece en el listado por defecto (o tiene filtro "incluir inactivos").
- [ ] Eliminar categoría con productos asociados ahora se bloquea correctamente.
- [ ] Empleado solo puede listar; no puede crear, editar ni ajustar stock.

### Criterios de aceptación
- [ ] Toda alteración de stock crea un `StockMovement` correspondiente (verificable en BD).
- [ ] Commit: `feat: gestión de productos e inventario`.

---

## ✅ Feature 5 — Clientes

**Objetivo:** CRUD de clientes con campos preparados para futura facturación SRI.

### Modelo
- Tabla `Customer` con `idType`, `idNumber`, etc.

### Backend
- `features/clientes/`:
  - `schemas.ts` — validar cédula ecuatoriana (10 dígitos con dígito verificador), RUC (13 dígitos), pasaporte (alfanumérico), o consumidor final (sin idNumber).
  - `actions.ts` — CRUD estándar.
  - `queries.ts` — listado con búsqueda por nombre o idNumber.
- `lib/validators/ecuador-id.ts` — algoritmo de validación de cédula ecuatoriana.

### UI
- `/(dashboard)/clientes` — tabla con búsqueda + CRUD.
- Detalle del cliente → datos + historial de compras (queda preparado, se llena cuando exista feature de ventas).

### Verificación manual
- [ ] Crear cliente con cédula válida funciona.
- [ ] Crear cliente con cédula inválida (dígito verificador incorrecto) se rechaza.
- [ ] Crear cliente con RUC de 13 dígitos funciona.
- [ ] Crear cliente "Consumidor final" sin idNumber funciona.
- [ ] Editar cliente funciona.
- [ ] Búsqueda por nombre y por número de identificación funciona.
- [ ] Tanto admin como empleado pueden crear y editar clientes.

### Criterios de aceptación
- [ ] Commit: `feat: gestión de clientes`.

---

## ✅ Feature 6 — Ventas (POS)

**Objetivo:** El feature más crítico. Punto de venta para registrar ventas en efectivo, descontar stock, calcular IVA.

### Modelo
- Tablas `Sale`, `SaleItem`, ya con `PaymentMethod` y `SaleStatus`.

### Backend
- `features/ventas/`:
  - `schemas.ts` — `createSaleSchema` (lista de items con productId+quantity, customerId opcional, paymentMethod, cashReceived).
  - `actions.ts`:
    - `createSale(data)` — **transacción Prisma crítica**:
      1. Validar Zod.
      2. Obtener `Settings.taxRate`.
      3. Para cada item, validar que el producto esté activo y tenga stock suficiente.
      4. Calcular líneas (subtotal, IVA, total) usando `lib/tax.ts`.
      5. Crear `Sale` con `taxRate` congelado.
      6. Crear los `SaleItem` con snapshot del nombre y precio.
      7. Descontar stock de cada `Product`.
      8. Crear un `StockMovement` por cada item (type: VENTA).
      9. Calcular `cashChange = cashReceived - total`.
      10. Devolver `Sale` con sus items.
    - `cancelSale(id, reason)` — admin, transacción:
      1. Marcar `Sale.status = CANCELADA`, `cancelledAt = now()`, `cancelReason`.
      2. Por cada item, restaurar stock y crear `StockMovement` type: DEVOLUCION.
  - `queries.ts`:
    - `listSales({ from, to, customerId, userId, status })`.
    - `getSaleById(id)` con items y customer.
    - `getTodaySales()`.

### UI
- `/(dashboard)/ventas/nueva` — POS:
  - Buscador de productos (por nombre o SKU) → agregar al carrito.
  - Carrito con líneas editables (cantidad), eliminación de línea.
  - Selector de cliente (autocomplete o "Consumidor final").
  - Resumen: subtotal, IVA, total.
  - Campo "efectivo recibido" → calcula vuelto automáticamente.
  - Botón "Cobrar y completar".
  - Después de cobrar: pantalla de confirmación con opción de "imprimir tiquete" (HTML imprimible básico) y "nueva venta".
- `/(dashboard)/ventas` — listado con filtros de fecha, estado, vendedor, cliente.
- `/(dashboard)/ventas/[id]` — detalle de venta + botón "Cancelar venta" (solo admin) con modal de motivo.

### Verificación manual (crítica — este es el feature más sensible)
- [ ] Crear venta de un solo producto: stock decrementa correctamente.
- [ ] Crear venta de varios productos en una sola operación: stocks individuales decrementan.
- [ ] Crear venta con `customerId` (cliente específico) funciona.
- [ ] Crear venta sin cliente (consumidor final implícito) funciona.
- [ ] Crear venta de producto sin stock suficiente: se bloquea con error claro y NO descuenta nada.
- [ ] Verificar que la venta crea un `StockMovement` por cada item (revisar en `prisma studio`).
- [ ] **Congelado de IVA:** crear una venta con IVA=15%, luego cambiar Settings.taxRate a 12%, recargar el detalle de la venta anterior → el IVA mostrado sigue siendo 15%.
- [ ] **Producto exento (taxable=false):** crear un producto con `taxable: false`, venderlo solo, verificar que `taxAmount = 0` y `lineTax = 0`.
- [ ] **Venta mixta:** vender en la misma transacción un producto gravado y uno exento → solo el gravado suma IVA.
- [ ] Cálculo de vuelto: efectivo recibido = $20, total = $13.45, vuelto = $6.55.
- [ ] Efectivo recibido menor al total: se rechaza con mensaje claro.
- [ ] Tiquete imprimible muestra: nombre del negocio, número de venta, fecha, items con cantidades y precios, subtotal, IVA, total, efectivo, vuelto, vendedor.
- [ ] Listado de ventas con filtro de fecha funciona.
- [ ] Listado de ventas filtrado por empleado funciona.
- [ ] **Cancelar venta:** admin puede cancelar; tras cancelar, el stock de cada producto se restaura al valor previo.
- [ ] **Cancelar venta:** se crean `StockMovement` con type DEVOLUCION.
- [ ] **Cancelar venta sin motivo:** se rechaza.
- [ ] Empleado **no ve** el botón "Cancelar venta".
- [ ] Empleado que intenta cancelar por URL/API recibe error de permisos.
- [ ] Búsqueda de productos en POS es rápida y precisa.

### Criterios de aceptación
- [ ] La venta es atómica: nunca queda stock descontado sin Sale, ni viceversa.
- [ ] Empleado puede vender; solo admin puede cancelar.
- [ ] Commit principal: `feat: punto de venta (POS) con descuento de stock`.

---

## ✅ Feature 7 — Dashboard

**Objetivo:** Página principal con KPIs en tiempo real.

### Backend
- `features/dashboard/queries.ts`:
  - `getTodayStats()` — ventas de hoy (count, total).
  - `getWeekStats()` — ventas últimos 7 días.
  - `getMonthStats()` — mes actual.
  - `getLowStockCount()` — productos con stock bajo.
  - `getTopProducts({ from, to, limit })`.
  - `getSalesByDay({ from, to })` — para gráfico.

### UI
- `/(dashboard)/` (home):
  - 4 cards: ventas hoy, ventas semana, ventas mes, productos en stock bajo (con enlace).
  - Gráfico de línea con ventas por día (últimos 30 días) usando Recharts.
  - Top 5 productos más vendidos del mes.
- Solo admin ve cards de ingresos; empleado ve solo "ventas hoy" y stock bajo.

### Verificación manual
- [ ] Las cifras del dashboard coinciden con las del listado de ventas (mismo período).
- [ ] Crear una nueva venta y refrescar el dashboard → "ventas hoy" aumenta.
- [ ] Ventas canceladas NO se suman a los totales (o se ven aparte si decides mostrarlas).
- [ ] El gráfico muestra correctamente los últimos 30 días.
- [ ] Top productos refleja los productos realmente más vendidos.
- [ ] Empleado ve dashboard recortado (sin montos de ingresos).

### Criterios de aceptación
- [ ] Commit: `feat: dashboard con KPIs y gráficos`.

---

## ✅ Feature 8 — Reportes

**Objetivo:** Reportes detallados con filtros, solo accesibles a admin.

### Backend
- `features/reportes/queries.ts`:
  - `salesReport({ from, to, groupBy: 'day'|'week'|'month' })`.
  - `productsReport({ from, to })` — unidades vendidas, ingresos por producto.
  - `categoriesReport({ from, to })`.
  - `employeesReport({ from, to })` — ventas por empleado.
  - `stockMovementsReport({ from, to, productId? })`.

### UI
- `/(dashboard)/reportes`:
  - Tabs: Ventas, Productos, Categorías, Empleados, Movimientos de stock.
  - Filtros de fecha (date-range picker).
  - Tablas + gráficos según el reporte.
- Solo admin.

### Verificación manual
- [ ] Filtros de fecha (hoy, esta semana, este mes, rango custom) funcionan.
- [ ] Reporte de ventas agrupado por día/semana/mes suma correctamente.
- [ ] Reporte de productos muestra unidades vendidas e ingresos.
- [ ] Reporte de empleados muestra ventas por vendedor.
- [ ] Reporte de movimientos de stock filtra por producto opcionalmente.
- [ ] Ventas canceladas se manejan según la decisión (excluidas o mostradas aparte).
- [ ] Empleado no puede acceder a `/reportes`.

### Criterios de aceptación
- [ ] Commit: `feat: módulo de reportes`.

---

## ✅ Feature 9 — Alertas de Stock Bajo

**Objetivo:** Notificación visible cuando hay productos con stock crítico.

### UI
- Badge en sidebar junto al ítem "Productos" con el contador.
- Toast/sonner al iniciar sesión si hay productos en stock bajo.
- Página dedicada `/productos?filter=stock-bajo` ya existe del feature 4; reforzar el filtro.

### Backend
- Reutilizar `getLowStockProducts()` y `getLowStockCount()` ya creados.

### Verificación manual
- [ ] Bajar el stock de un producto a un valor <= minStock → aparece en el contador.
- [ ] Al hacer login con productos en stock bajo, aparece toast/notificación.
- [ ] Tras vender un producto y dejarlo bajo el umbral, el contador se actualiza al recargar.
- [ ] El badge desaparece cuando no hay productos en stock bajo.

### Criterios de aceptación
- [ ] Commit: `feat: alertas de stock bajo`.

---

## ✅ Feature 10 — Empaquetado Tauri y Release

**Objetivo:** Generar instalador `.msi` (Windows), `.dmg` (macOS) o `.deb` (Linux) según el SO objetivo.

### Pasos
1. Verificar que `next build` y `next start` funcionan bien empaquetados (o usar Tauri con sidecar para servidor Next embebido).
2. Configurar `tauri.conf.json`:
   - `productName`, `version`, `identifier`.
   - Iconos en `src-tauri/icons/`.
   - Bundle targets según SO.
3. Probar `pnpm tauri build` → instalador generado.
4. Documentar en README el proceso de release y los requisitos (PostgreSQL local debe estar instalado por el usuario; o, alternativamente, evaluar embeber PostgreSQL portable — **decisión a discutir con el usuario**).

### Verificación manual
- [ ] Instalador se genera sin errores.
- [ ] Instalar el `.msi` / `.dmg` / `.deb` en una máquina limpia.
- [ ] Tras instalar, la app arranca, conecta a PostgreSQL local y funciona.
- [ ] Probar el flujo completo: login → crear producto → vender → ver reporte.

### Criterios de aceptación
- [ ] README actualizado con guía de instalación para el usuario final.
- [ ] Commit: `chore: empaquetado tauri para release`.

---

## Notas finales

- **Cada feature debe finalizar con preguntas al usuario:**
  - ¿Probaste manualmente las funciones principales (siguiendo la checklist de "Verificación manual")?
  - ¿Quieres ajustar algo antes de avanzar a la siguiente?
- Si en cualquier momento se descubre que el modelo de datos necesita un cambio que afecta features ya cerradas, **detener todo, documentar el cambio, hacer migración y notificar al usuario** antes de proseguir.
- Mantener `CLAUDE.md` y `PLAN.md` sincronizados con la realidad del repo. Si se cambia algo grande, actualizar ambos en el mismo commit.
- **No se incluyen tests automatizados en este proyecto** por decisión explícita del usuario. La validación con Zod y la verificación manual son las únicas líneas de defensa de calidad.

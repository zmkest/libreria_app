# Sistema de Gestión de Inventario — Librería Escolar

Aplicación web local (Next.js) para gestión de inventario, ventas y clientes de una librería escolar en Ecuador.

## Requisitos previos

- **Node.js** 20+ — [nodejs.org](https://nodejs.org)
- **pnpm** — `npm install -g pnpm`
- **PostgreSQL** 16+ — [postgresql.org](https://www.postgresql.org/download/)

## Instalación

### 1. Clonar y entrar al directorio

```bash
git clone <url-del-repo>
cd libreria_app
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con los datos reales de PostgreSQL:

```env
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/libreria?schema=public"
AUTH_SECRET="<generar con: openssl rand -base64 32>"
AUTH_URL="http://localhost:3000"
```

### 4. Crear la base de datos

```bash
createdb libreria
```

### 5. Correr migraciones y seed

```bash
pnpm prisma migrate deploy
pnpm db:seed
```

Esto crea el usuario inicial: **admin / admin123**
> **Importante:** Cambiar la contraseña en el primer uso desde la sección de perfil.

### 6. Generar cliente Prisma

```bash
pnpm prisma generate
```

## Desarrollo

```bash
pnpm dev
```

## Comandos útiles

```bash
pnpm lint          # ESLint
pnpm typecheck     # TypeScript sin emitir
pnpm prisma studio # GUI de base de datos
```

## Build

```bash
pnpm build    # Next.js production build
pnpm start    # Iniciar en modo producción
```

## Stack

- **Next.js 15+** con App Router y Server Components
- **PostgreSQL** local + **Prisma ORM**
- **Auth.js v5** para autenticación
- **Tailwind CSS v4** + **shadcn/ui**
- **Zod** para validación

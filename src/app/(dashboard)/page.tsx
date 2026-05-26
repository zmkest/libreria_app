import { auth } from "@/lib/auth";
import Link from "next/link";
import { Package, Users, ShoppingCart, BarChart2 } from "lucide-react";

const modules = [
  {
    href: "/productos",
    label: "Productos",
    description: "Gestiona el inventario de la librería",
    icon: Package,
    color: "bg-brand",
  },
  {
    href: "/clientes",
    label: "Clientes",
    description: "Administra la base de clientes",
    icon: Users,
    color: "bg-brand-light",
  },
  {
    href: "/ventas",
    label: "Ventas",
    description: "Registra y revisa las ventas",
    icon: ShoppingCart,
    color: "bg-brand-dark",
  },
  {
    href: "/reportes",
    label: "Reportes",
    description: "Consulta reportes por día y mes",
    icon: BarChart2,
    color: "bg-brand",
  },
];

export default async function HomePage() {
  const session = await auth();
  const name = session?.user?.name ?? "Usuario";

  return (
    <div>
      {/* Encabezado de bienvenida */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-brand-dark mb-1">
          Bienvenido, {name}
        </h1>
        <p className="text-brand-light text-sm">
          Sistema de gestión de inventario — Librería Escolar
        </p>
      </div>

      {/* Cards de acceso rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map(({ href, label, description, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="group bg-white rounded-2xl shadow-sm border border-brand-border p-6 flex flex-col gap-4 hover:shadow-md hover:-translate-y-1 transition-all"
          >
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
              <Icon size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-brand-dark group-hover:text-brand transition-colors">
                {label}
              </h2>
              <p className="text-xs text-brand-light mt-1">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

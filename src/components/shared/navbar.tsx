"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, LogOut, Menu, X } from "lucide-react";

const navItems = [
  { href: "/",          label: "Inicio"    },
  { href: "/productos", label: "Productos" },
  { href: "/clientes",  label: "Clientes"  },
  { href: "/ventas",    label: "Ventas"    },
  { href: "/reportes",  label: "Reportes"  },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
      title="Cambiar tema"
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

interface NavbarProps {
  userName: string;
}

export function Navbar({ userName }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Cierra el menú al navegar
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full bg-brand shadow-md">
      {/* Barra principal */}
      <div className="flex items-center justify-between px-4 sm:px-8 h-16">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/logo.png"
            alt="Logo"
            width={64}
            className="object-contain"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </Link>

        {/* Nav escritorio */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-white/20 text-white"
                    : "text-white/75 hover:text-white hover:bg-white/10"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Controles escritorio */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <ThemeToggle />
          <span className="text-sm text-white/90 font-medium">{userName}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-white/75 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut size={15} />
            Salir
          </button>
        </div>

        {/* Botón hamburguesa móvil */}
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="md:hidden p-2 rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          aria-label="Menú"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menú desplegable móvil */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-brand px-4 pb-4">
          <nav className="flex flex-col gap-1 pt-3">
            {navItems.map(({ href, label }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-white/20 text-white"
                      : "text-white/75 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-sm text-white/90 font-medium">{userName}</span>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-white/75 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <LogOut size={15} />
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

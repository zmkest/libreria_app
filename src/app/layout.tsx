import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/shared/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Librería — Sistema de Inventario",
  description: "Sistema de gestión de inventario para librería escolar",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/img/logo2.png" type="image/png" />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

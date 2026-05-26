import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/shared/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      <Navbar userName={session.user.name} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-8">
        {children}
      </main>
    </div>
  );
}

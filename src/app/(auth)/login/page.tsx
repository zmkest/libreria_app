import { LoginForm } from "./components/login-form";

export default function LoginPage() {
  return (
    <div className="w-[380px] bg-white rounded-2xl shadow-2xl p-10 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/img/logo.png"
        alt="Logo Librería"
        width={140}
        className="mx-auto mb-5"
      />

      <h1 className="text-3xl font-bold text-brand mb-8">Iniciar Sesión</h1>

      <LoginForm />
    </div>
  );
}

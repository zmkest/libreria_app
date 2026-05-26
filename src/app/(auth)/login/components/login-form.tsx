"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { loginSchema, type LoginInput } from "@/features/usuarios/schemas";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setServerError(null);

    const result = await signIn("credentials", {
      username: data.username,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setServerError("Usuario o contraseña incorrectos");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="text-left">
      {serverError && (
        <p className="mb-4 px-4 py-3 rounded-xl text-sm text-white text-center bg-danger">
          {serverError}
        </p>
      )}

      {/* Usuario */}
      <div className="mb-5">
        <label className="block mb-2 text-sm font-bold text-brand-dark">
          Usuario
        </label>
        <input
          {...register("username")}
          type="text"
          placeholder="Ingrese su usuario"
          autoComplete="username"
          className="w-full px-3 py-3 rounded-xl text-sm text-brand-dark bg-brand-input border-2 border-brand-border outline-none transition-all focus:border-brand focus:shadow-[0_0_5px_rgba(40,85,141,0.2)]"
        />
        {errors.username && (
          <p className="mt-1 text-xs text-danger">{errors.username.message}</p>
        )}
      </div>

      {/* Contraseña */}
      <div className="mb-6">
        <label className="block mb-2 text-sm font-bold text-brand-dark">
          Contraseña
        </label>
        <input
          {...register("password")}
          type="password"
          placeholder="Ingrese su contraseña"
          autoComplete="current-password"
          className="w-full px-3 py-3 rounded-xl text-sm text-brand-dark bg-brand-input border-2 border-brand-border outline-none transition-all focus:border-brand focus:shadow-[0_0_5px_rgba(40,85,141,0.2)]"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 rounded-xl font-bold text-white bg-brand hover:bg-brand-dark hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
      >
        {isSubmitting ? "Verificando..." : "Ingresar"}
      </button>
    </form>
  );
}

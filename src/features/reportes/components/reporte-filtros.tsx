"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { PeriodType } from "@/features/reportes/queries";

interface Props {
  currentTipo:  PeriodType;
  currentValor: string;
}

function defaultValor(tipo: PeriodType): string {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Guayaquil" }).format(new Date());
  if (tipo === "dia") return today;
  if (tipo === "mes") return today.slice(0, 7);
  return today.slice(0, 4);
}

const YEARS = Array.from({ length: 8 }, (_, i) => 2020 + i);

export function ReporteFiltros({ currentTipo, currentValor }: Props) {
  const router = useRouter();
  const [tipo,  setTipo]  = useState<PeriodType>(currentTipo);
  const [valor, setValor] = useState(currentValor);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValor(defaultValor(tipo));
  }, [tipo]);

  function apply() {
    const params = new URLSearchParams({ tipo, valor });
    router.push(`/reportes?${params.toString()}`);
  }

  const inputClass =
    "px-3 py-2.5 rounded-xl text-sm text-brand-dark bg-brand-input border-2 border-brand-border outline-none transition-all focus:border-brand focus:shadow-[0_0_5px_rgba(40,85,141,0.2)]";

  return (
    <div className="bg-white rounded-2xl shadow-md p-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-brand-dark">Período</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as PeriodType)}
            className={inputClass}
          >
            <option value="dia">Por día</option>
            <option value="mes">Por mes</option>
            <option value="anio">Por año</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-brand-dark">
            {tipo === "dia" ? "Fecha" : tipo === "mes" ? "Mes" : "Año"}
          </label>
          {tipo === "dia" && (
            <input
              type="date"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className={inputClass}
            />
          )}
          {tipo === "mes" && (
            <input
              type="month"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className={inputClass}
            />
          )}
          {tipo === "anio" && (
            <select
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className={inputClass}
            >
              {YEARS.map((y) => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
          )}
        </div>

        <button
          onClick={apply}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-brand hover:bg-brand-dark transition-all cursor-pointer"
        >
          Ver reporte
        </button>
      </div>
    </div>
  );
}

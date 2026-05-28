"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface Props {
  currentFrom:   string;
  currentTo:     string;
  currentStatus: string;
  currentSearch: string;
}

export function VentasFiltros({ currentFrom, currentTo, currentStatus, currentSearch }: Props) {
  const router = useRouter();
  const [from,   setFrom]   = useState(currentFrom);
  const [to,     setTo]     = useState(currentTo);
  const [status, setStatus] = useState(currentStatus);
  const [search, setSearch] = useState(currentSearch);

  function applyFilters() {
    const params = new URLSearchParams();
    if (from)                        params.set("from",   from);
    if (to)                          params.set("to",     to);
    if (status && status !== "TODAS") params.set("status", status);
    if (search)                      params.set("search", search);
    params.set("page", "1");
    router.push(`/ventas?${params.toString()}`);
  }

  function clearFilters() {
    setFrom(""); setTo(""); setStatus("TODAS"); setSearch("");
    router.push("/ventas");
  }

  const hasFilters = from || to || (status && status !== "TODAS") || search;

  const inputClass =
    "px-3 py-2.5 rounded-xl text-sm text-brand-dark bg-brand-input border-2 border-brand-border outline-none transition-all focus:border-brand focus:shadow-[0_0_5px_rgba(40,85,141,0.2)]";

  return (
    <div className="bg-white rounded-2xl shadow-md p-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-brand-dark">Desde</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-brand-dark">Hasta</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-brand-dark">Estado</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={inputClass}
          >
            <option value="TODAS">Todas</option>
            <option value="COMPLETADA">Completadas</option>
            <option value="CANCELADA">Canceladas</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-brand-dark">Buscar</label>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-border" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="N° de venta o nombre de producto..."
              className={`${inputClass} pl-9 w-full`}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-brand hover:bg-brand-dark transition-all cursor-pointer"
          >
            Filtrar
          </button>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-brand-dark border-2 border-brand-border hover:bg-brand-bg transition-all cursor-pointer"
            >
              <X size={14} />
              Limpiar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

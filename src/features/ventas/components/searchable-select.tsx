"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

export interface SelectOption {
  value:     string;
  label:     string;
  sublabel?: string;
}

interface Props {
  options:     SelectOption[];
  value:       string | null;
  onChange:    (value: string | null) => void;
  placeholder: string;
  clearable?:  boolean;
}

export function SearchableSelect({ options, value, onChange, placeholder, clearable = false }: Props) {
  const [query, setQuery] = useState("");
  const [open,  setOpen]  = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) ?? null;

  const filtered = query
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(query.toLowerCase()) ||
          o.sublabel?.toLowerCase().includes(query.toLowerCase()),
      )
    : options;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(option: SelectOption) {
    onChange(option.value);
    setOpen(false);
    setQuery("");
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(null);
    setQuery("");
  }

  const baseInput =
    "w-full px-3 py-3 rounded-xl text-sm text-brand-dark bg-brand-input border-2 border-brand-border outline-none transition-all focus:border-brand focus:shadow-[0_0_5px_rgba(40,85,141,0.2)]";

  return (
    <div ref={containerRef} className="relative">
      {open ? (
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar..."
          className={baseInput}
        />
      ) : (
        <div
          onClick={() => setOpen(true)}
          className={`${baseInput} flex items-center justify-between cursor-pointer`}
        >
          {selected ? (
            <div className="flex-1 min-w-0">
              <span className="block truncate">{selected.label}</span>
              {selected.sublabel && (
                <span className="block text-xs text-gray-400 truncate">{selected.sublabel}</span>
              )}
            </div>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
          <div className="flex items-center gap-1 shrink-0 ml-2">
            {clearable && value && (
              <X size={14} className="text-gray-400 hover:text-danger" onClick={handleClear} />
            )}
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </div>
      )}

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border-2 border-brand-border rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400">Sin resultados</div>
          ) : (
            filtered.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option)}
                className={`px-4 py-2.5 cursor-pointer hover:bg-brand-bg transition-colors ${
                  option.value === value ? "bg-brand-bg font-medium" : ""
                }`}
              >
                <div className="text-sm text-brand-dark">{option.label}</div>
                {option.sublabel && (
                  <div className="text-xs text-gray-400">{option.sublabel}</div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

"use client"

import { Check, X, Clock, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { EstadoAsistencia } from "@/lib/services/asistencias.service"

interface EstadoAsistenciaToggleProps {
  value: EstadoAsistencia | null
  saving: boolean
  onChange: (estado: EstadoAsistencia) => void
}

const opciones: { estado: EstadoAsistencia; label: string; icon: typeof Check; activeClass: string }[] = [
  { estado: "PRESENTE", label: "Presente", icon: Check, activeClass: "bg-secondary text-secondary-foreground border-secondary" },
  { estado: "TARDE", label: "Tarde", icon: Clock, activeClass: "bg-amber-500 text-white border-amber-500 dark:text-black" },
  { estado: "AUSENTE", label: "Ausente", icon: X, activeClass: "bg-destructive text-destructive-foreground border-destructive" },
]

export function EstadoAsistenciaToggle({ value, saving, onChange }: EstadoAsistenciaToggleProps) {
  return (
    <div className="inline-flex items-center gap-1.5">
      {opciones.map(({ estado, label, icon: Icon, activeClass }) => {
        const activo = value === estado
        return (
          <button
            key={estado}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={activo}
            disabled={saving}
            onClick={() => onChange(estado)}
            className={cn(
              "flex size-8 items-center justify-center rounded-full border transition-all duration-150",
              "disabled:cursor-not-allowed disabled:opacity-60",
              activo ? activeClass : "border-input bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
          </button>
        )
      })}
      {saving && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
    </div>
  )
}

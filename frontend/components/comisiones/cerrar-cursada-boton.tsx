"use client"

import { useState, useTransition } from "react"
import { CheckCircle2 } from "lucide-react"
import { cerrarCursada } from "@/app/actions/cursada-actions"
import { Button } from "@/components/ui/button"

export default function CerrarCursadaBoton({ cursadaId }: { cursadaId: number }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    setError(null)
    startTransition(async () => {
      try {
        await cerrarCursada(cursadaId)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error desconocido")
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" variant="outline" size="sm" onClick={handleClick} disabled={isPending}>
        <CheckCircle2 className="size-4" />
        {isPending ? "Calculando..." : "Cerrar cursada"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

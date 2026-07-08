"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Sparkles } from "lucide-react"
import { generarOfertaAcademicaAutomatica } from "@/app/actions/oferta-automatica-actions"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface CarreraDisponible {
  id: number
  nombre: string
}

function BotonGenerar({ cantidad }: { cantidad: number }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending || cantidad === 0}>
      {pending ? "Generando..." : `Generar Oferta para ${cantidad} Carrera${cantidad === 1 ? "" : "s"}`}
    </Button>
  )
}

export default function GenerarOfertaAutomaticaDialog({
  cicloId,
  anio,
  carrerasDisponibles,
}: {
  cicloId: number
  anio: number
  carrerasDisponibles: CarreraDisponible[]
}) {
  const [open, setOpen] = useState(false)
  const [seleccionadas, setSeleccionadas] = useState<Set<number>>(new Set())

  function toggleCarrera(id: number) {
    setSeleccionadas((prev) => {
      const nuevo = new Set(prev)
      if (nuevo.has(id)) nuevo.delete(id)
      else nuevo.add(id)
      return nuevo
    })
  }

  function cerrarYResetear() {
    setOpen(false)
    setSeleccionadas(new Set())
  }

  async function handleSubmit() {
    if (seleccionadas.size === 0) return
    await generarOfertaAcademicaAutomatica(cicloId, anio, Array.from(seleccionadas))
    cerrarYResetear()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : cerrarYResetear())}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Sparkles className="size-4" />
          Generar Oferta Académica Automática
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generar Oferta Académica Automática</DialogTitle>
          <DialogDescription>
            Crea "1er Cuatrimestre {anio}" y "2do Cuatrimestre {anio}", y una Comisión por cada materia del plan
            activo de las carreras que elijas (impares al 1er período, pares al 2do). No inscribe alumnos.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          {carrerasDisponibles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay carreras registradas.</p>
          ) : (
            <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-border p-2">
              {carrerasDisponibles.map((carrera) => (
                <label
                  key={carrera.id}
                  className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <Checkbox
                    checked={seleccionadas.has(carrera.id)}
                    onCheckedChange={() => toggleCarrera(carrera.id)}
                  />
                  <span className="flex-1">{carrera.nombre}</span>
                </label>
              ))}
            </div>
          )}
          <DialogFooter>
            <BotonGenerar cantidad={seleccionadas.size} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

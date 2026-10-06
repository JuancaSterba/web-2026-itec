"use client"

import { useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { Plus } from "lucide-react"
import { createCiclo } from "@/app/actions/ciclo-actions"
import { generarOfertaAcademicaAutomatica } from "@/app/actions/oferta-automatica-actions"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface CarreraDisponible {
  id: number
  nombre: string
}

function BotonGuardar() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando..." : "Guardar"}
    </Button>
  )
}

export default function NuevoCicloDialog({
  carrerasDisponibles,
}: {
  carrerasDisponibles: CarreraDisponible[]
}) {
  const [open, setOpen] = useState(false)
  const [generarOferta, setGenerarOferta] = useState(false)
  const [seleccionadas, setSeleccionadas] = useState<Set<number>>(new Set())
  const formRef = useRef<HTMLFormElement>(null)

  function toggleGenerarOferta(marcado: boolean) {
    setGenerarOferta(marcado)
    setSeleccionadas(marcado ? new Set(carrerasDisponibles.map((c) => c.id)) : new Set())
  }

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
    setGenerarOferta(false)
    setSeleccionadas(new Set())
    formRef.current?.reset()
  }

  async function handleSubmit(formData: FormData) {
    const ciclo = await createCiclo(formData)
    if (generarOferta && seleccionadas.size > 0) {
      await generarOfertaAcademicaAutomatica(ciclo.id, ciclo.anio, Array.from(seleccionadas))
    }
    cerrarYResetear()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : cerrarYResetear())}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Nuevo Ciclo Lectivo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo Ciclo Lectivo</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="anio">Año</Label>
            <Input id="anio" name="anio" type="number" placeholder="2026" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
            <Input id="fechaInicio" name="fechaInicio" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaFin">Fecha de Fin</Label>
            <Input id="fechaFin" name="fechaFin" type="date" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={generarOferta} onCheckedChange={(v) => toggleGenerarOferta(v === true)} />
            Generar oferta académica automática
          </label>
          {generarOferta && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Crea los 2 cuatrimestres del año y una Comisión por cada materia del plan activo de las carreras
                elegidas. No inscribe alumnos.
              </p>
              {carrerasDisponibles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay carreras registradas.</p>
              ) : (
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-border p-2">
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
            </div>
          )}
          <DialogFooter>
            <BotonGuardar />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

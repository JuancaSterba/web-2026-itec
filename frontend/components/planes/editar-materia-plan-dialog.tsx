"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Pencil } from "lucide-react"
import { updateMateriaPlan } from "@/app/actions/materia-plan-actions"
import { anioYCuatrimestre, calcularCuatrimestreDictado } from "@/lib/cuatrimestre-carrera"
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
import SelectMateriaBuscable from "@/components/materias/select-materia-buscable"

interface MateriaDisponible {
  id: number
  nombre: string
}

interface CorrelativaDisponible {
  id: number
  materiaNombre: string
}

interface MateriaPlanEditable {
  id: number
  materiaId: number
  cuatrimestreDictado: number
  cargaHoraria: number
  correlativaIds: number[]
  modalidadEvaluacion: string
}

function BotonGuardar() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando..." : "Guardar"}
    </Button>
  )
}

export default function EditarMateriaPlanDialog({
  materiaPlan,
  planId,
  materiasDisponibles,
  correlativasDisponibles,
}: {
  materiaPlan: MateriaPlanEditable
  planId: number
  materiasDisponibles: MateriaDisponible[]
  correlativasDisponibles: CorrelativaDisponible[]
}) {
  const [open, setOpen] = useState(false)
  const [correlativasElegidas, setCorrelativasElegidas] = useState<Set<number>>(
    new Set(materiaPlan.correlativaIds)
  )
  const [materiaId, setMateriaId] = useState(String(materiaPlan.materiaId))
  const { anio, cuatrimestreDelAnio } = anioYCuatrimestre(materiaPlan.cuatrimestreDictado)

  function handleOpenChange(value: boolean) {
    setOpen(value)
    if (!value) setMateriaId(String(materiaPlan.materiaId))
  }

  function toggleCorrelativa(id: number) {
    setCorrelativasElegidas((prev) => {
      const nuevo = new Set(prev)
      if (nuevo.has(id)) nuevo.delete(id)
      else nuevo.add(id)
      return nuevo
    })
  }

  async function handleSubmit(formData: FormData) {
    const anioForm = Number(formData.get("anio"))
    const cuatrimestreDelAnioForm = Number(formData.get("cuatrimestreDelAnio"))
    formData.set("cuatrimestreDictado", String(calcularCuatrimestreDictado(anioForm, cuatrimestreDelAnioForm)))
    correlativasElegidas.forEach((id) => formData.append("correlativaIds", String(id)))

    await updateMateriaPlan(formData, materiaPlan.id, planId)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="icon" title="Editar">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Materia del Plan</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="materiaId">Materia</Label>
            <SelectMateriaBuscable
              id="materiaId"
              name="materiaId"
              materias={materiasDisponibles}
              value={materiaId}
              onValueChange={setMateriaId}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="anio">Año de la Carrera</Label>
              <Input id="anio" name="anio" type="number" min={1} defaultValue={anio} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cuatrimestreDelAnio">Cuatrimestre del Año</Label>
              <select
                id="cuatrimestreDelAnio"
                name="cuatrimestreDelAnio"
                required
                defaultValue={cuatrimestreDelAnio}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="1">1º Cuatrimestre</option>
                <option value="2">2º Cuatrimestre</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cargaHoraria">Carga Horaria Semanal</Label>
            <Input
              id="cargaHoraria"
              name="cargaHoraria"
              type="number"
              min={1}
              placeholder="Horas por semana"
              defaultValue={materiaPlan.cargaHoraria}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modalidadEvaluacion">Modalidad de Evaluación</Label>
            <select
              id="modalidadEvaluacion"
              name="modalidadEvaluacion"
              defaultValue={materiaPlan.modalidadEvaluacion}
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="FINAL">Final (requiere examen final)</option>
              <option value="PROMOCIONAL">Promocional (puede promocionar sin final)</option>
            </select>
          </div>
          {correlativasDisponibles.length > 0 && (
            <div className="space-y-2">
              <Label>Correlativas (materias que hay que tener aprobadas antes)</Label>
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                {correlativasDisponibles.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                  >
                    <Checkbox
                      checked={correlativasElegidas.has(c.id)}
                      onCheckedChange={() => toggleCorrelativa(c.id)}
                    />
                    <span className="flex-1">{c.materiaNombre}</span>
                  </label>
                ))}
              </div>
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

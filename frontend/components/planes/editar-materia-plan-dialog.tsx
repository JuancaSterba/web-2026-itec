"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Pencil } from "lucide-react"
import { updateMateriaPlan } from "@/app/actions/materia-plan-actions"
import { Button } from "@/components/ui/button"
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

interface MateriaDisponible {
  id: number
  nombre: string
}

interface MateriaPlanEditable {
  id: number
  materiaId: number
  cuatrimestreDictado: number
  cargaHoraria: number
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
}: {
  materiaPlan: MateriaPlanEditable
  planId: number
  materiasDisponibles: MateriaDisponible[]
}) {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    await updateMateriaPlan(formData, materiaPlan.id, planId)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            <select
              id="materiaId"
              name="materiaId"
              required
              defaultValue={materiaPlan.materiaId}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {materiasDisponibles.map((materia) => (
                <option key={materia.id} value={materia.id}>
                  {materia.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cuatrimestreDictado">Cuatrimestre</Label>
            <Input
              id="cuatrimestreDictado"
              name="cuatrimestreDictado"
              type="number"
              min={1}
              defaultValue={materiaPlan.cuatrimestreDictado}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cargaHoraria">Carga Horaria</Label>
            <Input
              id="cargaHoraria"
              name="cargaHoraria"
              type="number"
              min={1}
              defaultValue={materiaPlan.cargaHoraria}
              required
            />
          </div>
          <DialogFooter>
            <BotonGuardar />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

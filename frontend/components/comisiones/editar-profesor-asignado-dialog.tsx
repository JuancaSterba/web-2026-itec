"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Pencil } from "lucide-react"
import { updateComisionProfesor } from "@/app/actions/comision-profesor-actions"
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

interface ProfesorDisponible {
  id: number
  nombre: string
  apellido: string
  dni: string
}

interface ComisionProfesorEditable {
  id: number
  comisionId: number
  profesorId: number
  rol: string
}

function BotonGuardar() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando..." : "Guardar"}
    </Button>
  )
}

export default function EditarProfesorAsignadoDialog({
  asignacion,
  profesoresDisponibles,
}: {
  asignacion: ComisionProfesorEditable
  profesoresDisponibles: ProfesorDisponible[]
}) {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    await updateComisionProfesor(formData, asignacion.id, asignacion.comisionId)
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
          <DialogTitle>Editar Asignación Docente</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profesorId">Profesor</Label>
            <select
              id="profesorId"
              name="profesorId"
              required
              defaultValue={asignacion.profesorId}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {profesoresDisponibles.map((profesor) => (
                <option key={profesor.id} value={profesor.id}>
                  {profesor.nombre} {profesor.apellido} — DNI {profesor.dni}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rol">Rol</Label>
            <Input id="rol" name="rol" defaultValue={asignacion.rol} placeholder="Titular" />
          </div>
          <DialogFooter>
            <BotonGuardar />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

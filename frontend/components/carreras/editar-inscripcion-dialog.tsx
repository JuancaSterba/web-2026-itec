"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Pencil } from "lucide-react"
import { updateInscripcionCarrera } from "@/app/actions/inscripcion-carrera-actions"
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

interface InscripcionEditable {
  id: number
  alumnoId: number
  planEstudioId: number
  fechaInscripcion: string
  estado: string
}

function BotonGuardar() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando..." : "Guardar"}
    </Button>
  )
}

export default function EditarInscripcionDialog({ inscripcion }: { inscripcion: InscripcionEditable }) {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    await updateInscripcionCarrera(formData, inscripcion.id, inscripcion.alumnoId, inscripcion.planEstudioId)
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
          <DialogTitle>Editar Inscripción a Carrera</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fechaInscripcion">Fecha de Inscripción</Label>
            <Input
              id="fechaInscripcion"
              name="fechaInscripcion"
              type="date"
              defaultValue={inscripcion.fechaInscripcion}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Input id="estado" name="estado" defaultValue={inscripcion.estado} required />
          </div>
          <DialogFooter>
            <BotonGuardar />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

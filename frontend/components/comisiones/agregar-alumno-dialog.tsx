"use client"

import { useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { Plus } from "lucide-react"
import { createCursada } from "@/app/actions/cursada-actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface AlumnoDisponible {
  id: number
  nombre: string
  apellido: string
  dni: string
}

function BotonGuardar() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Matriculando..." : "Matricular"}
    </Button>
  )
}

export default function AgregarAlumnoDialog({
  comisionId,
  alumnosDisponibles,
}: {
  comisionId: number
  alumnosDisponibles: AlumnoDisponible[]
}) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    await createCursada(formData, comisionId)
    formRef.current?.reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Matricular Alumno
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Matricular Alumno</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="alumnoId">Alumno</Label>
            <select
              id="alumnoId"
              name="alumnoId"
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Seleccioná un alumno</option>
              {alumnosDisponibles.map((alumno) => (
                <option key={alumno.id} value={alumno.id}>
                  {alumno.nombre} {alumno.apellido} — DNI {alumno.dni}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <BotonGuardar />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

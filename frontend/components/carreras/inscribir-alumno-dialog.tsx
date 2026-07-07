"use client"

import { useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { UserPlus } from "lucide-react"
import { createInscripcionCarrera } from "@/app/actions/inscripcion-carrera-actions"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface PlanDisponible {
  id: number
  cohorte: string
}

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
      {pending ? "Inscribiendo..." : "Inscribir"}
    </Button>
  )
}

export default function InscribirAlumnoDialog({
  planesDisponibles,
  alumnosDisponibles,
}: {
  planesDisponibles: PlanDisponible[]
  alumnosDisponibles: AlumnoDisponible[]
}) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    await createInscripcionCarrera(formData)
    formRef.current?.reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="size-4" />
          Inscribir Alumno
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inscribir Alumno a la Carrera</DialogTitle>
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
          <div className="space-y-2">
            <Label htmlFor="planEstudioId">Plan de Estudio</Label>
            <select
              id="planEstudioId"
              name="planEstudioId"
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Seleccioná un plan</option>
              {planesDisponibles.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  Plan {plan.cohorte}
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

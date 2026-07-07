"use client"

import { useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { UserPlus } from "lucide-react"
import { createCursadasMasivas } from "@/app/actions/cursada-actions"
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

interface ComisionDelPeriodo {
  id: number
  etiqueta: string
}

interface AlumnoDisponible {
  id: number
  nombre: string
  apellido: string
  dni: string
}

interface CursadaExistente {
  alumnoId: number
  comisionId: number
}

function BotonGuardar() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Matriculando..." : "Matricular en Todo el Cuatrimestre"}
    </Button>
  )
}

export default function InscribirCuatrimestreDialog({
  comisionesDelPeriodo,
  alumnosDisponibles,
  cursadasExistentes,
}: {
  comisionesDelPeriodo: ComisionDelPeriodo[]
  alumnosDisponibles: AlumnoDisponible[]
  cursadasExistentes: CursadaExistente[]
}) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    const alumnoId = Number(formData.get("alumnoId"))
    const comisionIds = comisionesDelPeriodo
      .map((c) => c.id)
      .filter(
        (comisionId) =>
          !cursadasExistentes.some((cu) => cu.alumnoId === alumnoId && cu.comisionId === comisionId)
      )

    if (comisionIds.length === 0) {
      alert("El alumno ya está matriculado en todas las comisiones de este período.")
      return
    }

    await createCursadasMasivas(alumnoId, comisionIds)
    formRef.current?.reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="size-4" />
          Inscribir Alumno al Cuatrimestre
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Matricular Alumno en Todo el Cuatrimestre</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          {alumnosDisponibles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay alumnos inscriptos a la carrera de este período que falten matricular.
            </p>
          ) : (
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
          )}
          <p className="text-xs text-muted-foreground">
            Se creará una matriculación en cada una de las {comisionesDelPeriodo.length} comisiones de este
            período (las que el alumno ya tenga se omiten).
          </p>
          <DialogFooter>
            <BotonGuardar />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

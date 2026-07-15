"use client"

import { useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { inscribirAlumnoEnMesa } from "@/app/actions/mesa-examen-actions"
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

interface AlumnoDisponible {
  userId: number
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

export default function InscribirAlumnoMesaDialog({
  mesaExamenId,
  alumnosDisponibles,
}: {
  mesaExamenId: number
  alumnosDisponibles: AlumnoDisponible[]
}) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    try {
      await inscribirAlumnoEnMesa(mesaExamenId, {
        alumnoId: Number(formData.get("alumnoId")),
        condicionInscripcion: formData.get("condicionInscripcion") as string,
      })
      formRef.current?.reset()
      setOpen(false)
      toast.success("Alumno inscripto a la mesa correctamente")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo inscribir al alumno")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={alumnosDisponibles.length === 0}>
          <Plus className="size-4" />
          Inscribir Alumno
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inscribir Alumno a la Mesa</DialogTitle>
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
                <option key={alumno.userId} value={alumno.userId}>
                  {alumno.nombre} {alumno.apellido} — DNI {alumno.dni}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="condicionInscripcion">Condición</Label>
            <select
              id="condicionInscripcion"
              name="condicionInscripcion"
              required
              defaultValue="REGULAR"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="REGULAR">Regular</option>
              <option value="LIBRE">Libre</option>
              <option value="PROMOCION">Promoción</option>
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

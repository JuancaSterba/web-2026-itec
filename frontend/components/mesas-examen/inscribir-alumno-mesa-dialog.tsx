"use client"

import { useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { AlertTriangle, Plus } from "lucide-react"
import { toast } from "sonner"
import { inscribirAlumnoEnMesa } from "@/app/actions/mesa-examen-actions"
import { Badge } from "@/components/ui/badge"
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

function BotonGuardar({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? "Inscribiendo..." : "Inscribir"}
    </Button>
  )
}

export default function InscribirAlumnoMesaDialog({
  mesaExamenId,
  fechaHoraMesa,
  alumnosDisponibles,
}: {
  mesaExamenId: number
  fechaHoraMesa?: string
  alumnosDisponibles: AlumnoDisponible[]
}) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const esExtemporaneo = fechaHoraMesa
    ? new Date() > new Date(new Date(fechaHoraMesa).getTime() - 48 * 60 * 60 * 1000)
    : false

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen)
    if (newOpen && esExtemporaneo) {
      toast.warning("Plazo vencido: La inscripción debe realizarse al menos 48hs antes de la mesa")
    }
  }

  async function handleSubmit(formData: FormData) {
    if (esExtemporaneo) {
      toast.error("No se puede inscribir: El plazo de 48hs previas ha expirado")
      return
    }

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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={alumnosDisponibles.length === 0}>
          <Plus className="size-4" />
          Inscribir Alumno
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Inscribir Alumno a la Mesa</span>
            {esExtemporaneo && (
              <Badge variant="destructive" className="mr-6 text-xs">
                Inscripción Cerrada (48h)
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {esExtemporaneo && (
          <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-semibold">Plazo límite de inscripción superado</p>
              <p className="mt-0.5 text-muted-foreground">
                Las inscripciones deben realizarse al menos 48 horas antes de la fecha del examen.
              </p>
            </div>
          </div>
        )}

        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="alumnoId">Alumno</Label>
            <select
              id="alumnoId"
              name="alumnoId"
              required
              disabled={esExtemporaneo}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
              disabled={esExtemporaneo}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="REGULAR">Regular</option>
              <option value="LIBRE">Libre</option>
              <option value="PROMOCION">Promoción</option>
            </select>
          </div>

          <DialogFooter>
            <BotonGuardar disabled={esExtemporaneo} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

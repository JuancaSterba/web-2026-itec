"use client"

import { useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { UserPlus } from "lucide-react"
import { createInscripcionCarrera, crearAlumnoEInscribir } from "@/app/actions/inscripcion-carrera-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
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

type Modo = "existente" | "nuevo"

function BotonGuardar({ modo }: { modo: Modo }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando..." : modo === "existente" ? "Inscribir" : "Crear e Inscribir"}
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
  const [modo, setModo] = useState<Modo>("existente")
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    const resultado =
      modo === "existente"
        ? await createInscripcionCarrera(formData)
        : await crearAlumnoEInscribir(formData)

    if (!resultado.ok) {
      toast.error("error" in resultado ? resultado.error : "Ocurrió un error");
      return
    }

    formRef.current?.reset()
    setOpen(false)
    setModo("existente")
    toast.success("Alumno inscripto en la carrera correctamente")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="size-4" />
          Inscribir Alumno
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Inscribir Alumno a la Carrera</DialogTitle>
        </DialogHeader>

        <div className="flex gap-1 rounded-md bg-muted p-1">
          <button
            type="button"
            onClick={() => setModo("existente")}
            className={cn(
              "flex-1 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
              modo === "existente" ? "bg-background shadow-sm" : "text-muted-foreground"
            )}
          >
            Alumno Existente
          </button>
          <button
            type="button"
            onClick={() => setModo("nuevo")}
            className={cn(
              "flex-1 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
              modo === "nuevo" ? "bg-background shadow-sm" : "text-muted-foreground"
            )}
          >
            Alumno Nuevo
          </button>
        </div>

        <form ref={formRef} action={handleSubmit} className="space-y-4">
          {modo === "existente" ? (
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
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" name="nombre" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input id="apellido" name="apellido" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dni">DNI</Label>
                  <Input id="dni" name="dni" placeholder="Sin puntos, 7 u 8 dígitos" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" name="telefono" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefonoSecundario">Teléfono Secundario (opcional)</Label>
                <Input id="telefonoSecundario" name="telefonoSecundario" />
              </div>
            </div>
          )}

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
            <BotonGuardar modo={modo} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

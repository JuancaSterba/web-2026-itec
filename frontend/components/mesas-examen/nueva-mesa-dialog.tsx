"use client"

import { useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { createMesaExamen } from "@/app/actions/mesa-examen-actions"
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
import SelectMateriaBuscable from "@/components/materias/select-materia-buscable"

interface MateriaDisponible {
  id: number
  nombre: string
}

interface PeriodoDisponible {
  id: number
  nombre: string
}

interface ProfesorDisponible {
  userId: number
  nombre: string
  apellido: string
}

function BotonGuardar() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creando..." : "Crear Mesa"}
    </Button>
  )
}

export default function NuevaMesaDialog({
  materiasDisponibles,
  periodosDisponibles,
  profesoresDisponibles,
}: {
  materiasDisponibles: MateriaDisponible[]
  periodosDisponibles: PeriodoDisponible[]
  profesoresDisponibles: ProfesorDisponible[]
}) {
  const [open, setOpen] = useState(false)
  const [materiaPlanId, setMateriaPlanId] = useState("")
  const formRef = useRef<HTMLFormElement>(null)

  function handleOpenChange(value: boolean) {
    setOpen(value)
    if (!value) setMateriaPlanId("")
  }

  async function handleSubmit(formData: FormData) {
    if (!materiaPlanId) {
      toast.error("Seleccioná una materia")
      return
    }

    const tribunalIds = profesoresDisponibles
      .filter((profesor) => formData.get(`tribunal_${profesor.userId}`) === "on")
      .map((profesor) => profesor.userId)

    try {
      await createMesaExamen({
        materiaPlanId: Number(formData.get("materiaPlanId")),
        periodoAcademicoId: Number(formData.get("periodoAcademicoId")),
        // datetime-local devuelve "YYYY-MM-DDTHH:mm"; LocalDateTime lo acepta con segundos.
        fechaHora: `${formData.get("fechaHora")}:00`,
        tribunalIds,
      })
      formRef.current?.reset()
      setMateriaPlanId("")
      setOpen(false)
      toast.success("Mesa de examen creada correctamente")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear la mesa de examen")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Crear Mesa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Mesa de Examen</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="materiaPlanId">Materia</Label>
            <SelectMateriaBuscable
              id="materiaPlanId"
              name="materiaPlanId"
              materias={materiasDisponibles}
              value={materiaPlanId}
              onValueChange={setMateriaPlanId}
              placeholder="Seleccioná una materia"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="periodoAcademicoId">Período Académico</Label>
            <select
              id="periodoAcademicoId"
              name="periodoAcademicoId"
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Seleccioná un período</option>
              {periodosDisponibles.map((periodo) => (
                <option key={periodo.id} value={periodo.id}>
                  {periodo.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaHora">Fecha y Hora</Label>
            <Input id="fechaHora" name="fechaHora" type="datetime-local" required />
          </div>

          <div className="space-y-2">
            <Label>Tribunal Docente</Label>
            {profesoresDisponibles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay profesores registrados.</p>
            ) : (
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-input p-2">
                {profesoresDisponibles.map((profesor) => (
                  <label
                    key={profesor.userId}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent"
                  >
                    <input type="checkbox" name={`tribunal_${profesor.userId}`} className="size-4" />
                    {profesor.apellido}, {profesor.nombre}
                  </label>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <BotonGuardar />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

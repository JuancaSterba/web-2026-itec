"use client"

import { useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { createHorarioClase } from "@/app/actions/horario-actions"
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

interface ModuloDisponible {
  id: number
  numero: number
  horaInicio: string
  horaFin: string
}

const DIAS_SEMANA = [
  { value: "MONDAY", label: "Lunes" },
  { value: "TUESDAY", label: "Martes" },
  { value: "WEDNESDAY", label: "Miércoles" },
  { value: "THURSDAY", label: "Jueves" },
  { value: "FRIDAY", label: "Viernes" },
  { value: "SATURDAY", label: "Sábado" },
]

function BotonGuardar() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando..." : "Agregar Horario"}
    </Button>
  )
}

export default function AgregarHorarioDialog({
  comisionId,
  modulos,
}: {
  comisionId: number
  modulos: ModuloDisponible[]
}) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    const diaSemana = formData.get("diaSemana") as string
    const modulosIds = modulos
      .filter((modulo) => formData.get(`modulo_${modulo.id}`) === "on")
      .map((modulo) => modulo.id)

    if (modulosIds.length === 0) {
      toast.error("Seleccioná al menos un módulo")
      return
    }

    try {
      await createHorarioClase(comisionId, diaSemana, modulosIds)
      formRef.current?.reset()
      setOpen(false)
      toast.success("Horario agregado correctamente")
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={modulos.length === 0}
          title={modulos.length === 0 ? "No hay módulos horarios cargados" : undefined}
        >
          <Plus className="size-4" />
          Agregar Horario
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Horario de Clase</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="diaSemana">Día de la Semana</Label>
            <select
              id="diaSemana"
              name="diaSemana"
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {DIAS_SEMANA.map((dia) => (
                <option key={dia.value} value={dia.value}>
                  {dia.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Módulos</Label>
            {modulos.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay módulos horarios cargados.</p>
            ) : (
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-input p-2">
                {modulos.map((modulo) => (
                  <label
                    key={modulo.id}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent"
                  >
                    <input type="checkbox" name={`modulo_${modulo.id}`} className="size-4" />
                    Módulo {modulo.numero} ({modulo.horaInicio.slice(0, 5)} - {modulo.horaFin.slice(0, 5)})
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

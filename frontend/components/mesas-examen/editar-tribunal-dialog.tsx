"use client"

import { useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { Pencil } from "lucide-react"
import { toast } from "sonner"
import { updateTribunalMesa } from "@/app/actions/mesa-examen-actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ProfesorDisponible {
  userId: number
  nombre: string
  apellido: string
}

function BotonGuardar() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando..." : "Guardar Cambios"}
    </Button>
  )
}

export default function EditarTribunalDialog({
  mesaExamenId,
  profesoresDisponibles,
  tribunalIdsActuales,
}: {
  mesaExamenId: number
  profesoresDisponibles: ProfesorDisponible[]
  tribunalIdsActuales: number[]
}) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    const tribunalIds = profesoresDisponibles
      .filter((profesor) => formData.get(`tribunal_${profesor.userId}`) === "on")
      .map((profesor) => profesor.userId)

    try {
      await updateTribunalMesa(mesaExamenId, { tribunalIds })
      setOpen(false)
      toast.success("Tribunal actualizado correctamente")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el tribunal")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Editar Tribunal</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Tribunal Docente</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            {profesoresDisponibles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay profesores registrados.</p>
            ) : (
              <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-input p-2">
                {profesoresDisponibles.map((profesor) => {
                  const isChecked = tribunalIdsActuales.includes(profesor.userId)
                  return (
                    <label
                      key={profesor.userId}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent"
                    >
                      <input 
                        type="checkbox" 
                        name={`tribunal_${profesor.userId}`} 
                        defaultChecked={isChecked}
                        className="size-4" 
                      />
                      {profesor.apellido}, {profesor.nombre}
                    </label>
                  )
                })}
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

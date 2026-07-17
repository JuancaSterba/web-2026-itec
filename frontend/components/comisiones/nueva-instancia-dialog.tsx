"use client"

import { useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { saveCalificacionesMasivas } from "@/app/actions/nota-actions"
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

interface CursadaParaNota {
  id: number
  alumnoNombre: string
}

function BotonGuardar() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando..." : "Crear Instancia"}
    </Button>
  )
}

export default function NuevaInstanciaDialog({ comisionId, cursadas }: { comisionId: number; cursadas: CursadaParaNota[] }) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    const instancia = formData.get("instancia") as string
    const registros = cursadas
      .map((cursada) => ({
        cursadaId: cursada.id,
        notaRaw: formData.get(`nota_${cursada.id}`) as string,
      }))
      .filter((r) => r.notaRaw !== "")
      .map((r) => ({ cursadaId: r.cursadaId, nota: Number(r.notaRaw) }))

    try {
      await saveCalificacionesMasivas(comisionId, instancia, registros)
      formRef.current?.reset()
      setOpen(false)
      toast.success("Instancia creada correctamente")
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={cursadas.length === 0}
          title={cursadas.length === 0 ? "No hay alumnos inscriptos en esta comisión" : undefined}
        >
          <Plus className="size-4" />
          Nueva Instancia
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Instancia de Evaluación</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instancia">Nombre de la Instancia</Label>
            <Input id="instancia" name="instancia" placeholder="Primer Parcial" required />
          </div>

          {cursadas.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay alumnos inscritos en esta comisión.</p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Dejá vacío el campo de un alumno para no cargarle nota todavía.
              </p>
              {cursadas.map((cursada) => (
                <div key={cursada.id} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-foreground">{cursada.alumnoNombre}</span>
                  <Input
                    name={`nota_${cursada.id}`}
                    type="number"
                    min={0}
                    max={10}
                    step={0.5}
                    className="w-24 text-center"
                  />
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <BotonGuardar />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

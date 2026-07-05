"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { crearCarrera, actualizarCarrera, type Carrera } from "@/lib/services/carreras.service"

interface CarreraFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  carrera: Carrera | null
  onSuccess: (carrera: Carrera) => void
}

const emptyForm = {
  nombre: "",
  descripcion: "",
  resolucion: "",
}

export function CarreraFormDialog({ open, onOpenChange, carrera, onSuccess }: CarreraFormDialogProps) {
  const isEditing = !!carrera
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setForm({
      nombre: carrera?.nombre ?? "",
      descripcion: carrera?.descripcion ?? "",
      resolucion: carrera?.resolucion ?? "",
    })
    setError(null)
  }, [open, carrera])

  const setField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const validar = (): string | null => {
    if (!form.nombre.trim()) return "El nombre es obligatorio"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validar()
    if (validationError) {
      setError(validationError)
      return
    }

    const input = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      resolucion: form.resolucion.trim(),
    }

    setSubmitting(true)
    setError(null)
    try {
      const resultado = isEditing
        ? await actualizarCarrera(carrera!.id, input)
        : await crearCarrera(input)

      toast.success(isEditing ? "Carrera actualizada correctamente" : "Carrera creada correctamente")
      onSuccess(resultado)
      onOpenChange(false)
    } catch (err: any) {
      const message = err?.message || "No se pudo guardar la carrera"
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar carrera" : "Nueva carrera"}</DialogTitle>
          <DialogDescription>Nombre, descripción y resolución de aprobación de la carrera.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={form.nombre}
              onChange={setField("nombre")}
              placeholder="Ej. Tecnicatura en Programación"
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={form.descripcion}
              onChange={setField("descripcion")}
              placeholder="Descripción breve de la carrera"
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolucion">Resolución</Label>
            <Input
              id="resolucion"
              value={form.resolucion}
              onChange={setField("resolucion")}
              placeholder="Ej. Res. 123/2024"
              disabled={submitting}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? "Guardar cambios" : "Crear carrera"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

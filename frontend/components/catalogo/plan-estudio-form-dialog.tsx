"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { crearPlanEstudio, actualizarPlanEstudio, type PlanEstudio } from "@/lib/services/planes-estudio.service"
import { listarCarreras, type Carrera } from "@/lib/services/carreras.service"

// @radix-ui/react-select no esta instalado en este proyecto (components/ui/select.tsx
// esta roto). Select nativo con la misma estetica que Input, en vez de una libreria rota.
const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-all duration-200 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"

interface PlanEstudioFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: PlanEstudio | null
  onSuccess: (plan: PlanEstudio) => void
}

const emptyForm = {
  validez: "",
  resolucion: "",
  fechaInicio: "",
  fechaFin: "",
  carreraId: "",
}

export function PlanEstudioFormDialog({ open, onOpenChange, plan, onSuccess }: PlanEstudioFormDialogProps) {
  const isEditing = !!plan
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [opcionesLoading, setOpcionesLoading] = useState(true)
  const [carreras, setCarreras] = useState<Carrera[]>([])

  useEffect(() => {
    if (!open) return

    setForm({
      validez: plan?.validez ?? "",
      resolucion: plan?.resolucion ?? "",
      fechaInicio: plan?.fechaInicio ?? "",
      fechaFin: plan?.fechaFin ?? "",
      carreraId: plan ? String(plan.carreraId) : "",
    })
    setError(null)

    setOpcionesLoading(true)
    listarCarreras()
      .then(setCarreras)
      .catch((err: any) => {
        toast.error(err?.message || "No se pudieron cargar las carreras")
      })
      .finally(() => setOpcionesLoading(false))
  }, [open, plan])

  const setField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const validar = (): string | null => {
    if (!form.validez.trim()) return "La validez es obligatoria"
    if (!form.fechaInicio) return "La fecha de inicio es obligatoria"
    if (!form.fechaFin) return "La fecha de fin es obligatoria"
    if (!form.carreraId) return "Seleccioná una carrera"
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
      validez: form.validez.trim(),
      resolucion: form.resolucion.trim(),
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin,
      carreraId: Number(form.carreraId),
    }

    setSubmitting(true)
    setError(null)
    try {
      const resultado = isEditing
        ? await actualizarPlanEstudio(plan!.id, input)
        : await crearPlanEstudio(input)

      toast.success(isEditing ? "Plan de estudio actualizado correctamente" : "Plan de estudio creado correctamente")
      onSuccess(resultado)
      onOpenChange(false)
    } catch (err: any) {
      const message = err?.message || "No se pudo guardar el plan de estudio"
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const disabled = submitting || opcionesLoading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar plan de estudio" : "Nuevo plan de estudio"}</DialogTitle>
          <DialogDescription>Un plan de estudio pertenece a una Carrera y agrupa sus Materias.</DialogDescription>
        </DialogHeader>

        {opcionesLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Cargando carreras...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="carreraId">Carrera</Label>
              <select
                id="carreraId"
                value={form.carreraId}
                onChange={setField("carreraId")}
                disabled={disabled}
                className={cn(selectClassName)}
              >
                <option value="">Seleccioná una carrera</option>
                {carreras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validez">Validez</Label>
                <Input
                  id="validez"
                  value={form.validez}
                  onChange={setField("validez")}
                  placeholder="Ej. Plan 2024"
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resolucion">Resolución</Label>
                <Input
                  id="resolucion"
                  value={form.resolucion}
                  onChange={setField("resolucion")}
                  placeholder="Ej. Res. 456/2024"
                  disabled={disabled}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha de inicio</Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  value={form.fechaInicio}
                  onChange={setField("fechaInicio")}
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaFin">Fecha de fin</Label>
                <Input
                  id="fechaFin"
                  type="date"
                  value={form.fechaFin}
                  onChange={setField("fechaFin")}
                  disabled={disabled}
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button type="submit" disabled={disabled} className="w-full sm:w-auto">
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {isEditing ? "Guardar cambios" : "Crear plan de estudio"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

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
import {
  crearCuatrimestre,
  actualizarCuatrimestre,
  type Cuatrimestre,
} from "@/lib/services/cuatrimestres.service"

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-all duration-200 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"

interface CuatrimestreFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cuatrimestre: Cuatrimestre | null
  onSuccess: (cuatrimestre: Cuatrimestre) => void
}

const emptyForm = {
  anio: "",
  numero: "",
  fechaInicio: "",
  fechaFin: "",
}

export function CuatrimestreFormDialog({
  open,
  onOpenChange,
  cuatrimestre,
  onSuccess,
}: CuatrimestreFormDialogProps) {
  const isEditing = !!cuatrimestre
  const [form, setForm] = useState(emptyForm)
  const [actual, setActual] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setForm({
      anio: cuatrimestre ? String(cuatrimestre.anio) : "",
      numero: cuatrimestre ? String(cuatrimestre.numero) : "",
      fechaInicio: cuatrimestre?.fechaInicio ?? "",
      fechaFin: cuatrimestre?.fechaFin ?? "",
    })
    setActual(cuatrimestre?.actual ?? false)
    setError(null)
  }, [open, cuatrimestre])

  const setField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const validar = (): string | null => {
    if (!form.anio || Number(form.anio) < 2000) return "El año debe ser 2000 o posterior"
    if (!form.numero) return "Seleccioná el número de cuatrimestre"
    if (!form.fechaInicio) return "La fecha de inicio es obligatoria"
    if (!form.fechaFin) return "La fecha de fin es obligatoria"
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
      anio: Number(form.anio),
      numero: Number(form.numero),
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin,
      actual,
    }

    setSubmitting(true)
    setError(null)
    try {
      const resultado = isEditing
        ? await actualizarCuatrimestre(cuatrimestre!.id, input)
        : await crearCuatrimestre(input)

      toast.success(isEditing ? "Cuatrimestre actualizado correctamente" : "Cuatrimestre creado correctamente")
      onSuccess(resultado)
      onOpenChange(false)
    } catch (err: any) {
      const message = err?.message || "No se pudo guardar el cuatrimestre"
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
          <DialogTitle>{isEditing ? "Editar cuatrimestre" : "Nuevo cuatrimestre"}</DialogTitle>
          <DialogDescription>Período lectivo que agrupa las comisiones dictadas en esas fechas.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="anio">Año</Label>
              <Input
                id="anio"
                type="number"
                min={2000}
                value={form.anio}
                onChange={setField("anio")}
                placeholder="2026"
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero">Número</Label>
              <select
                id="numero"
                value={form.numero}
                onChange={setField("numero")}
                disabled={submitting}
                className={cn(selectClassName)}
              >
                <option value="">—</option>
                <option value="1">1° cuatrimestre</option>
                <option value="2">2° cuatrimestre</option>
              </select>
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
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaFin">Fecha de fin</Label>
              <Input
                id="fechaFin"
                type="date"
                value={form.fechaFin}
                onChange={setField("fechaFin")}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>¿Es el cuatrimestre actual?</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={actual ? "default" : "outline"}
                onClick={() => setActual(true)}
                disabled={submitting}
                className="flex-1"
              >
                Actual
              </Button>
              <Button
                type="button"
                size="sm"
                variant={!actual ? "secondary" : "outline"}
                onClick={() => setActual(false)}
                disabled={submitting}
                className="flex-1"
              >
                No actual
              </Button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? "Guardar cambios" : "Crear cuatrimestre"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

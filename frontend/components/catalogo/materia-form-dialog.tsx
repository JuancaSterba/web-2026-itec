"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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
  crearMateria,
  actualizarMateria,
  listarMateriasPorPlan,
  asignarCorrelativas,
  type Materia,
} from "@/lib/services/materias.service"
import { listarPlanesEstudio, type PlanEstudio } from "@/lib/services/planes-estudio.service"

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-all duration-200 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"

interface MateriaFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  materia: Materia | null
  onSuccess: (materia: Materia) => void
}

const emptyForm = {
  nombre: "",
  cargaHoraria: "",
  anio: "",
  cuatrimestre: "",
  planEstudioId: "",
}

export function MateriaFormDialog({ open, onOpenChange, materia, onSuccess }: MateriaFormDialogProps) {
  const isEditing = !!materia
  const [form, setForm] = useState(emptyForm)
  const [correlativasIds, setCorrelativasIds] = useState<number[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [opcionesLoading, setOpcionesLoading] = useState(true)
  const [planes, setPlanes] = useState<PlanEstudio[]>([])
  const [materiasDelPlan, setMateriasDelPlan] = useState<Materia[]>([])
  const [correlativasLoading, setCorrelativasLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    setForm({
      nombre: materia?.nombre ?? "",
      cargaHoraria: materia ? String(materia.cargaHoraria) : "",
      anio: materia ? String(materia.anio) : "",
      cuatrimestre: materia ? String(materia.cuatrimestre) : "",
      planEstudioId: materia ? String(materia.planEstudioId) : "",
    })
    setCorrelativasIds(materia?.correlativasIds ?? [])
    setError(null)

    setOpcionesLoading(true)
    listarPlanesEstudio()
      .then(setPlanes)
      .catch((err: any) => {
        toast.error(err?.message || "No se pudieron cargar los planes de estudio")
      })
      .finally(() => setOpcionesLoading(false))
  }, [open, materia])

  useEffect(() => {
    if (!open || !form.planEstudioId) {
      setMateriasDelPlan([])
      return
    }

    setCorrelativasLoading(true)
    listarMateriasPorPlan(Number(form.planEstudioId))
      .then((data) => {
        setMateriasDelPlan(data.filter((m) => m.id !== materia?.id))
      })
      .catch((err: any) => {
        toast.error(err?.message || "No se pudieron cargar las materias del plan")
      })
      .finally(() => setCorrelativasLoading(false))
  }, [open, form.planEstudioId, materia?.id])

  const setField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const toggleCorrelativa = (id: number) => {
    setCorrelativasIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  const validar = (): string | null => {
    if (!form.nombre.trim()) return "El nombre es obligatorio"
    if (!form.cargaHoraria || Number(form.cargaHoraria) <= 0) return "La carga horaria debe ser mayor a 0"
    if (!form.anio || Number(form.anio) <= 0) return "El año debe ser mayor a 0"
    if (!form.cuatrimestre) return "Seleccioná el cuatrimestre"
    if (!form.planEstudioId) return "Seleccioná un plan de estudio"
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
      cargaHoraria: Number(form.cargaHoraria),
      anio: Number(form.anio),
      cuatrimestre: Number(form.cuatrimestre),
      planEstudioId: Number(form.planEstudioId),
    }

    setSubmitting(true)
    setError(null)
    try {
      const guardada = isEditing
        ? await actualizarMateria(materia!.id, input)
        : await crearMateria(input)

      const resultado = await asignarCorrelativas(guardada.id, correlativasIds)

      toast.success(isEditing ? "Materia actualizada correctamente" : "Materia creada correctamente")
      onSuccess(resultado)
      onOpenChange(false)
    } catch (err: any) {
      const message = err?.message || "No se pudo guardar la materia"
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
          <DialogTitle>{isEditing ? "Editar materia" : "Nueva materia"}</DialogTitle>
          <DialogDescription>Una materia pertenece a un Plan de Estudio y puede tener correlativas.</DialogDescription>
        </DialogHeader>

        {opcionesLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Cargando planes de estudio...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={form.nombre}
                onChange={setField("nombre")}
                placeholder="Ej. Matemática 1"
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="planEstudioId">Plan de estudio</Label>
              <select
                id="planEstudioId"
                value={form.planEstudioId}
                onChange={setField("planEstudioId")}
                disabled={disabled}
                className={cn(selectClassName)}
              >
                <option value="">Seleccioná un plan</option>
                {planes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.carreraNombre} — {p.validez}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cargaHoraria">Carga horaria</Label>
                <Input
                  id="cargaHoraria"
                  type="number"
                  min={1}
                  value={form.cargaHoraria}
                  onChange={setField("cargaHoraria")}
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="anio">Año</Label>
                <Input
                  id="anio"
                  type="number"
                  min={1}
                  value={form.anio}
                  onChange={setField("anio")}
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cuatrimestre">Cuatrimestre</Label>
                <select
                  id="cuatrimestre"
                  value={form.cuatrimestre}
                  onChange={setField("cuatrimestre")}
                  disabled={disabled}
                  className={cn(selectClassName)}
                >
                  <option value="">—</option>
                  <option value="1">1°</option>
                  <option value="2">2°</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Correlativas</Label>
              {!form.planEstudioId ? (
                <p className="text-sm text-muted-foreground">Elegí un plan de estudio para ver sus materias.</p>
              ) : correlativasLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Cargando materias del plan...
                </div>
              ) : materiasDelPlan.length === 0 ? (
                <p className="text-sm text-muted-foreground">Este plan todavía no tiene otras materias.</p>
              ) : (
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
                  {materiasDelPlan.map((m) => (
                    <label key={m.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={correlativasIds.includes(m.id)}
                        onCheckedChange={() => toggleCorrelativa(m.id)}
                        disabled={disabled}
                      />
                      {m.nombre} (Año {m.anio})
                    </label>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button type="submit" disabled={disabled} className="w-full sm:w-auto">
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {isEditing ? "Guardar cambios" : "Crear materia"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

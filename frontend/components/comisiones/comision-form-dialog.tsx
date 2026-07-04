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
import { crearComision, actualizarComision, type Comision } from "@/lib/services/comisiones.service"
import { listarMaterias, type Materia } from "@/lib/services/materias.service"
import { listarCuatrimestres, type Cuatrimestre } from "@/lib/services/cuatrimestres.service"
import { listarProfesores, type Profesor } from "@/lib/services/profesores.service"

// @radix-ui/react-select no esta instalado en este proyecto (components/ui/select.tsx
// esta roto). Select nativo con la misma estetica que Input, en vez de una libreria rota.
const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-all duration-200 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"

interface ComisionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  comision: Comision | null
  onSuccess: (comision: Comision) => void
}

const emptyForm = {
  nombre: "",
  cupo: "",
  materiaId: "",
  cuatrimestreId: "",
  profesorId: "",
}

export function ComisionFormDialog({ open, onOpenChange, comision, onSuccess }: ComisionFormDialogProps) {
  const isEditing = !!comision
  const [form, setForm] = useState(emptyForm)
  const [activa, setActiva] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [opcionesLoading, setOpcionesLoading] = useState(true)
  const [materias, setMaterias] = useState<Materia[]>([])
  const [cuatrimestres, setCuatrimestres] = useState<Cuatrimestre[]>([])
  const [profesores, setProfesores] = useState<Profesor[]>([])

  useEffect(() => {
    if (!open) return

    setForm({
      nombre: comision?.nombre ?? "",
      cupo: comision ? String(comision.cupo) : "",
      materiaId: comision ? String(comision.materiaId) : "",
      cuatrimestreId: comision ? String(comision.cuatrimestreId) : "",
      profesorId: comision ? String(comision.profesorId) : "",
    })
    setActiva(comision?.activa ?? true)
    setError(null)

    setOpcionesLoading(true)
    Promise.all([listarMaterias(), listarCuatrimestres(), listarProfesores()])
      .then(([materiasData, cuatrimestresData, profesoresData]) => {
        setMaterias(materiasData)
        setCuatrimestres(cuatrimestresData)
        setProfesores(profesoresData)
      })
      .catch((err: any) => {
        toast.error(err?.message || "No se pudieron cargar materias/cuatrimestres/profesores")
      })
      .finally(() => setOpcionesLoading(false))
  }, [open, comision])

  const setField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const validar = (): string | null => {
    if (!form.nombre.trim()) return "El nombre es obligatorio"
    if (!form.cupo || Number(form.cupo) <= 0) return "El cupo debe ser mayor a 0"
    if (!form.materiaId) return "Seleccioná una materia"
    if (!form.cuatrimestreId) return "Seleccioná un cuatrimestre"
    if (!form.profesorId) return "Seleccioná un profesor"
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
      cupo: Number(form.cupo),
      materiaId: Number(form.materiaId),
      cuatrimestreId: Number(form.cuatrimestreId),
      profesorId: Number(form.profesorId),
      activa,
    }

    setSubmitting(true)
    setError(null)
    try {
      const resultado = isEditing
        ? await actualizarComision(comision!.id, input)
        : await crearComision(input)

      toast.success(isEditing ? "Comisión actualizada correctamente" : "Comisión creada correctamente")
      onSuccess(resultado)
      onOpenChange(false)
    } catch (err: any) {
      const message = err?.message || "No se pudo guardar la comisión"
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
          <DialogTitle>{isEditing ? "Editar comisión" : "Nueva comisión"}</DialogTitle>
          <DialogDescription>
            Una comisión agrupa una Materia, un Cuatrimestre y el Profesor a cargo.
          </DialogDescription>
        </DialogHeader>

        {opcionesLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Cargando materias, cuatrimestres y profesores...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={form.nombre}
                  onChange={setField("nombre")}
                  placeholder="Ej. Comisión A"
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cupo">Cupo</Label>
                <Input
                  id="cupo"
                  type="number"
                  min={1}
                  value={form.cupo}
                  onChange={setField("cupo")}
                  disabled={disabled}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="materiaId">Materia</Label>
              <select
                id="materiaId"
                value={form.materiaId}
                onChange={setField("materiaId")}
                disabled={disabled}
                className={cn(selectClassName)}
              >
                <option value="">Seleccioná una materia</option>
                {materias.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} (Año {m.anio})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cuatrimestreId">Cuatrimestre</Label>
                <select
                  id="cuatrimestreId"
                  value={form.cuatrimestreId}
                  onChange={setField("cuatrimestreId")}
                  disabled={disabled}
                  className={cn(selectClassName)}
                >
                  <option value="">Seleccioná uno</option>
                  {cuatrimestres.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.anio} - {c.numero}° cuatrimestre{c.actual ? " (actual)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="profesorId">Profesor</Label>
                <select
                  id="profesorId"
                  value={form.profesorId}
                  onChange={setField("profesorId")}
                  disabled={disabled}
                  className={cn(selectClassName)}
                >
                  <option value="">Seleccioná uno</option>
                  {profesores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.apellido}, {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isEditing && (
              <div className="space-y-2">
                <Label>Estado</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={activa ? "default" : "outline"}
                    onClick={() => setActiva(true)}
                    disabled={disabled}
                    className="flex-1"
                  >
                    Activa
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={!activa ? "secondary" : "outline"}
                    onClick={() => setActiva(false)}
                    disabled={disabled}
                    className="flex-1"
                  >
                    Inactiva
                  </Button>
                </div>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button type="submit" disabled={disabled} className="w-full sm:w-auto">
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {isEditing ? "Guardar cambios" : "Crear comisión"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

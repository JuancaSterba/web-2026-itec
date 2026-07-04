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
import { actualizarAlumno, crearAlumno, type Alumno } from "@/lib/services/alumnos.service"

interface AlumnoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  alumno: Alumno | null
  onSuccess: (alumno: Alumno) => void
}

export function AlumnoFormDialog({ open, onOpenChange, alumno, onSuccess }: AlumnoFormDialogProps) {
  const isEditing = !!alumno
  const [userId, setUserId] = useState("")
  const [legajo, setLegajo] = useState("")
  const [activo, setActivo] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setUserId(alumno?.userId ? String(alumno.userId) : "")
      setLegajo(alumno?.legajo ?? "")
      setActivo(alumno?.activo ?? true)
      setError(null)
    }
  }, [open, alumno])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!legajo.trim()) {
      setError("El legajo es obligatorio")
      return
    }
    if (!isEditing && (!userId || Number(userId) <= 0)) {
      setError("El ID de usuario debe ser un número válido")
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const resultado = isEditing
        ? await actualizarAlumno(alumno!.id, { legajo: legajo.trim(), activo })
        : await crearAlumno({ userId: Number(userId), legajo: legajo.trim() })

      toast.success(isEditing ? "Alumno actualizado correctamente" : "Alumno creado correctamente")
      onSuccess(resultado)
      onOpenChange(false)
    } catch (err: any) {
      const message = err?.message || "No se pudo guardar el alumno"
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar alumno" : "Nuevo alumno"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualiza el legajo o el estado del alumno."
              : "El usuario debe existir previamente con rol ALUMNO. Los datos personales (nombre, DNI, email) se toman de ese usuario."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isEditing && (
            <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              {alumno!.nombre} {alumno!.apellido} · DNI {alumno!.dni}
            </div>
          )}

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="userId">ID de usuario</Label>
              <Input
                id="userId"
                type="number"
                min={1}
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Ej. 2"
                disabled={submitting}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="legajo">Legajo</Label>
            <Input
              id="legajo"
              value={legajo}
              onChange={(e) => setLegajo(e.target.value)}
              placeholder="Ej. LEG-2026-001"
              disabled={submitting}
            />
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label>Estado</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={activo ? "default" : "outline"}
                  onClick={() => setActivo(true)}
                  disabled={submitting}
                  className="flex-1"
                >
                  Activo
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={!activo ? "secondary" : "outline"}
                  onClick={() => setActivo(false)}
                  disabled={submitting}
                  className="flex-1"
                >
                  Inactivo
                </Button>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={submitting} className={cn("w-full sm:w-auto")}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? "Guardar cambios" : "Crear alumno"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

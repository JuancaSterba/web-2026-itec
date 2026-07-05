"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2, Trash2 } from "lucide-react"
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
  listarInscripcionesCarreraPorAlumno,
  crearInscripcionCarrera,
  eliminarInscripcionCarrera,
  type InscripcionCarrera,
} from "@/lib/services/inscripciones-carreras.service"
import { listarCarreras, type Carrera } from "@/lib/services/carreras.service"
import { listarPlanesEstudio, type PlanEstudio } from "@/lib/services/planes-estudio.service"
import type { Alumno } from "@/lib/services/alumnos.service"

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-all duration-200 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"

interface InscribirCarreraDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  alumno: Alumno | null
}

export function InscribirCarreraDialog({ open, onOpenChange, alumno }: InscribirCarreraDialogProps) {
  const [inscripciones, setInscripciones] = useState<InscripcionCarrera[]>([])
  const [loading, setLoading] = useState(true)

  const [carreras, setCarreras] = useState<Carrera[]>([])
  const [planes, setPlanes] = useState<PlanEstudio[]>([])
  const [opcionesLoading, setOpcionesLoading] = useState(true)

  const [carreraId, setCarreraId] = useState("")
  const [planEstudioId, setPlanEstudioId] = useState("")
  const [anioIngreso, setAnioIngreso] = useState(String(new Date().getFullYear()))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !alumno) return

    setLoading(true)
    listarInscripcionesCarreraPorAlumno(alumno.id)
      .then(setInscripciones)
      .catch((err: any) => {
        toast.error(err?.message || "No se pudieron cargar las inscripciones del alumno")
      })
      .finally(() => setLoading(false))

    setCarreraId("")
    setPlanEstudioId("")
    setAnioIngreso(String(new Date().getFullYear()))
    setError(null)

    setOpcionesLoading(true)
    Promise.all([listarCarreras(), listarPlanesEstudio()])
      .then(([carrerasData, planesData]) => {
        setCarreras(carrerasData)
        setPlanes(planesData)
      })
      .catch((err: any) => {
        toast.error(err?.message || "No se pudieron cargar carreras y planes de estudio")
      })
      .finally(() => setOpcionesLoading(false))
  }, [open, alumno])

  const planesDeCarrera = planes.filter((p) => String(p.carreraId) === carreraId)

  const handleQuitar = async (inscripcion: InscripcionCarrera) => {
    try {
      await eliminarInscripcionCarrera(inscripcion.id)
      setInscripciones((prev) => prev.filter((i) => i.id !== inscripcion.id))
      toast.success("Inscripción a carrera eliminada correctamente")
    } catch (err: any) {
      toast.error(err?.message || "No se pudo eliminar la inscripción")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!alumno) return

    if (!carreraId) {
      setError("Seleccioná una carrera")
      return
    }
    if (!planEstudioId) {
      setError("Seleccioná un plan de estudio")
      return
    }
    if (!anioIngreso || Number(anioIngreso) < 2000) {
      setError("El año de ingreso debe ser 2000 o posterior")
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const nueva = await crearInscripcionCarrera({
        alumnoId: alumno.id,
        carreraId: Number(carreraId),
        planEstudioId: Number(planEstudioId),
        anioIngreso: Number(anioIngreso),
      })
      setInscripciones((prev) => [...prev, nueva])
      setCarreraId("")
      setPlanEstudioId("")
      toast.success("Alumno inscripto en la carrera correctamente")
    } catch (err: any) {
      const message = err?.message || "No se pudo inscribir al alumno en la carrera"
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
          <DialogTitle>Inscripción a Carrera</DialogTitle>
          <DialogDescription>
            {alumno && (
              <>
                Carreras en las que <strong>{alumno.nombre} {alumno.apellido}</strong> está inscripto, y alta de una
                nueva.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Cargando inscripciones...
          </div>
        ) : inscripciones.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no está inscripto en ninguna carrera.</p>
        ) : (
          <ul className="space-y-2">
            {inscripciones.map((i) => (
              <li key={i.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">{i.carreraNombre}</p>
                  <p className="text-muted-foreground">
                    {i.planEstudioResolucion} — Ingreso {i.anioIngreso}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleQuitar(i)} aria-label="Quitar">
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        {opcionesLoading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Cargando carreras y planes...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="carreraId">Carrera</Label>
              <select
                id="carreraId"
                value={carreraId}
                onChange={(e) => {
                  setCarreraId(e.target.value)
                  setPlanEstudioId("")
                }}
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

            <div className="space-y-2">
              <Label htmlFor="planEstudioId">Plan de estudio</Label>
              <select
                id="planEstudioId"
                value={planEstudioId}
                onChange={(e) => setPlanEstudioId(e.target.value)}
                disabled={disabled || !carreraId}
                className={cn(selectClassName)}
              >
                <option value="">Seleccioná un plan</option>
                {planesDeCarrera.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.validez}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="anioIngreso">Año de ingreso</Label>
              <Input
                id="anioIngreso"
                type="number"
                min={2000}
                value={anioIngreso}
                onChange={(e) => setAnioIngreso(e.target.value)}
                disabled={disabled}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={disabled} className="w-full">
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Inscribir en Carrera
            </Button>
          </form>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

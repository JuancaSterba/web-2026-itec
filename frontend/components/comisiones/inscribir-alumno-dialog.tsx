"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2, Search } from "lucide-react"
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
import { buscarAlumnoPorDni, type Alumno } from "@/lib/services/alumnos.service"
import { listarInscripcionesCarreraPorAlumno } from "@/lib/services/inscripciones-carreras.service"
import { crearInscripcionMateria, type AlumnoInscripto } from "@/lib/services/inscripciones.service"

interface InscribirAlumnoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  comisionId: number
  carreraId: number | null
  carreraNombre: string
  onSuccess: (inscripcion: AlumnoInscripto) => void
}

export function InscribirAlumnoDialog({
  open,
  onOpenChange,
  comisionId,
  carreraId,
  carreraNombre,
  onSuccess,
}: InscribirAlumnoDialogProps) {
  const [dni, setDni] = useState("")
  const [buscando, setBuscando] = useState(false)
  const [alumno, setAlumno] = useState<Alumno | null>(null)
  const [alumnoCarreraId, setAlumnoCarreraId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [inscribiendo, setInscribiendo] = useState(false)

  useEffect(() => {
    if (!open) return
    setDni("")
    setAlumno(null)
    setAlumnoCarreraId(null)
    setError(null)
  }, [open])

  const handleBuscar = async () => {
    if (!dni.trim()) {
      setError("Ingresá un DNI")
      return
    }

    setBuscando(true)
    setError(null)
    setAlumno(null)
    setAlumnoCarreraId(null)
    try {
      const encontrado = await buscarAlumnoPorDni(dni.trim())
      setAlumno(encontrado)

      const inscripcionesCarrera = await listarInscripcionesCarreraPorAlumno(encontrado.id)
      const match = inscripcionesCarrera.find((i) => i.carreraId === carreraId)

      if (match) {
        setAlumnoCarreraId(match.id)
      } else {
        setError(
          `${encontrado.nombre} ${encontrado.apellido} no está inscripto en ${carreraNombre || "esta carrera"}. Inscribilo primero desde Alumnos.`
        )
      }
    } catch (err: any) {
      setError(err?.message || "No se encontró un alumno con ese DNI")
    } finally {
      setBuscando(false)
    }
  }

  const handleInscribir = async () => {
    if (!alumnoCarreraId) return

    setInscribiendo(true)
    setError(null)
    try {
      const inscripcion = await crearInscripcionMateria({
        alumnoCarreraId,
        comisionMateriaId: comisionId,
      })
      toast.success("Alumno inscripto en la comisión correctamente")
      onSuccess(inscripcion)
      onOpenChange(false)
    } catch (err: any) {
      const message = err?.message || "No se pudo inscribir al alumno en la comisión"
      setError(message)
      toast.error(message)
    } finally {
      setInscribiendo(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Inscribir alumno</DialogTitle>
          <DialogDescription>Buscá al alumno por DNI para inscribirlo en esta comisión.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dni">DNI</Label>
            <div className="flex gap-2">
              <Input
                id="dni"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="Ej. 30123456"
                disabled={buscando}
              />
              <Button type="button" onClick={handleBuscar} disabled={buscando}>
                {buscando ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                Buscar
              </Button>
            </div>
          </div>

          {alumno && (
            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium text-foreground">
                {alumno.nombre} {alumno.apellido}
              </p>
              <p className="text-muted-foreground">DNI {alumno.dni} — Legajo {alumno.legajo || "—"}</p>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={inscribiendo}>
            Cancelar
          </Button>
          <Button onClick={handleInscribir} disabled={!alumnoCarreraId || inscribiendo}>
            {inscribiendo && <Loader2 className="size-4 animate-spin" />}
            Inscribir a la comisión
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

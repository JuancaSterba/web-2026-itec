"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Plus, Trash2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { obtenerRosterComision, type AlumnoRoster } from "@/lib/services/roster.service"
import { eliminarInscripcionMateria, type AlumnoInscripto } from "@/lib/services/inscripciones.service"
import { InscribirAlumnoDialog } from "./inscribir-alumno-dialog"

interface RosterComisionViewProps {
  comisionId: number
  carreraId: number | null
  carreraNombre: string
}

export function RosterComisionView({ comisionId, carreraId, carreraNombre }: RosterComisionViewProps) {
  const [roster, setRoster] = useState<AlumnoRoster[]>([])
  const [loading, setLoading] = useState(true)
  const [inscribirOpen, setInscribirOpen] = useState(false)

  const cargarRoster = async () => {
    setLoading(true)
    try {
      const data = await obtenerRosterComision(comisionId)
      setRoster(data)
    } catch (err: any) {
      toast.error(err?.message || "No se pudo cargar la nómina de la comisión")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarRoster()
  }, [comisionId])

  const handleQuitar = async (alumno: AlumnoRoster) => {
    try {
      await eliminarInscripcionMateria(alumno.id)
      setRoster((prev) => prev.filter((a) => a.id !== alumno.id))
      toast.success("Alumno desinscripto de la comisión correctamente")
    } catch (err: any) {
      toast.error(err?.message || "No se pudo desinscribir al alumno")
    }
  }

  const handleInscripto = (inscripcion: AlumnoInscripto) => {
    setRoster((prev) => [
      ...prev,
      {
        id: inscripcion.id,
        alumnoId: inscripcion.alumnoId,
        nombreCompleto: `${inscripcion.nombre} ${inscripcion.apellido}`,
        dni: inscripcion.dni,
        legajo: inscripcion.legajo,
      },
    ])
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{roster.length} alumno(s) inscripto(s)</p>
        <Button size="sm" onClick={() => setInscribirOpen(true)}>
          <Plus className="size-4" />
          Inscribir alumno
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : roster.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border p-12 text-center">
          <Users className="size-8 text-muted-foreground" />
          <p className="font-medium text-foreground">Todavía no hay alumnos inscriptos</p>
          <p className="text-sm text-muted-foreground">Usá "Inscribir alumno" para agregar el primero por DNI.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Legajo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roster.map((alumno) => (
              <TableRow key={alumno.id}>
                <TableCell className="font-medium">{alumno.nombreCompleto}</TableCell>
                <TableCell>{alumno.dni}</TableCell>
                <TableCell>{alumno.legajo || "—"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleQuitar(alumno)} aria-label="Quitar">
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <InscribirAlumnoDialog
        open={inscribirOpen}
        onOpenChange={setInscribirOpen}
        comisionId={comisionId}
        carreraId={carreraId}
        carreraNombre={carreraNombre}
        onSuccess={handleInscripto}
      />
    </div>
  )
}

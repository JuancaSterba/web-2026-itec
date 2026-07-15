import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { fetchCore, fetchGateway } from "@/lib/api-server"
import { getProfesorActual } from "@/lib/profesor-actual"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import CeldasNotaMesa from "@/components/mesas-examen/celdas-nota-mesa"

interface MesaExamenResponse {
  id: number
  materiaPlanId: number
  periodoAcademicoId: number
  fechaHora: string
  estado: "PROGRAMADA" | "CERRADA"
  tribunalIds: number[]
}

interface InscripcionMesaResponse {
  id: number
  mesaExamenId: number
  alumnoId: number
  condicionInscripcion: "REGULAR" | "LIBRE" | "PROMOCION"
  fechaInscripcion: string
}

interface CalificacionMesaResponse {
  id: number
  mesaExamenId: number
  alumnoId: number
  nota: number | null
  ausente: boolean
  libro: string | null
  folio: string | null
}

interface MateriaPlanResponse {
  id: number
  materiaNombre: string
}

interface AlumnoResponse {
  id: number
  userId: number
  nombre: string
  apellido: string
  dni: string
}

const CONDICION_LABEL: Record<InscripcionMesaResponse["condicionInscripcion"], string> = {
  REGULAR: "Regular",
  LIBRE: "Libre",
  PROMOCION: "Promoción",
}

function formatearFechaHora(fechaHora: string) {
  return new Date(fechaHora).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export default async function MisMesasDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const mesaId = Number(id)

  const profesor = await getProfesorActual()
  if (!profesor) notFound()

  const [mesaData, inscripciones, calificaciones, materiasPlan, alumnos] = await Promise.all([
    fetchCore<MesaExamenResponse>(`/mesas-examen/${mesaId}`),
    fetchCore<InscripcionMesaResponse>(`/mesas-examen/${mesaId}/inscripciones`),
    fetchGateway<CalificacionMesaResponse>(`/api/notas/mesas?mesaExamenId=${mesaId}`),
    fetchCore<MateriaPlanResponse>("/materias-plan"),
    fetchCore<AlumnoResponse>("/alumnos"),
  ])

  const mesa = mesaData?.[0]
  // Ownership: el profesor solo puede operar mesas donde integra el tribunal.
  if (!mesa || !mesa.tribunalIds.includes(profesor.userId)) notFound()

  const materiaNombre =
    (materiasPlan ?? []).find((m) => m.id === mesa.materiaPlanId)?.materiaNombre ??
    `Materia #${mesa.materiaPlanId}`
  const alumnoPorUserId = new Map((alumnos ?? []).map((a) => [a.userId, a]))
  const calificacionPorAlumno = new Map((calificaciones ?? []).map((c) => [c.alumnoId, c]))

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/mis-mesas"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a Mis Mesas
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">{materiaNombre}</h1>
          <p className="text-sm text-muted-foreground">{formatearFechaHora(mesa.fechaHora)}</p>
        </div>
        <Badge variant={mesa.estado === "PROGRAMADA" ? "default" : "secondary"}>
          {mesa.estado === "PROGRAMADA" ? "Programada" : "Cerrada"}
        </Badge>
      </div>

      {inscripciones === null ? (
        <p className="text-sm text-destructive">No se pudieron obtener las inscripciones.</p>
      ) : inscripciones.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay alumnos inscriptos a esta mesa.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alumno</TableHead>
              <TableHead>Condición</TableHead>
              <TableHead>Nota Definitiva</TableHead>
              <TableHead>Libro / Folio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inscripciones.map((inscripcion) => {
              const alumno = alumnoPorUserId.get(inscripcion.alumnoId)
              return (
                <TableRow key={inscripcion.id}>
                  <TableCell className="font-medium">
                    {alumno ? `${alumno.nombre} ${alumno.apellido}` : `Alumno #${inscripcion.alumnoId}`}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{CONDICION_LABEL[inscripcion.condicionInscripcion]}</Badge>
                  </TableCell>
                  <CeldasNotaMesa
                    mesaExamenId={mesa.id}
                    alumnoUserId={inscripcion.alumnoId}
                    calificacion={calificacionPorAlumno.get(inscripcion.alumnoId) ?? null}
                  />
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

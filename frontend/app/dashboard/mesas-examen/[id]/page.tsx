import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { fetchCore } from "@/lib/api-server"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import InscribirAlumnoMesaDialog from "@/components/mesas-examen/inscribir-alumno-mesa-dialog"

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

interface MateriaPlanResponse {
  id: number
  materiaNombre: string
}

interface PeriodoAcademicoResponse {
  id: number
  nombre: string
}

interface ProfesorResponse {
  id: number
  userId: number
  nombre: string
  apellido: string
}

interface AlumnoResponse {
  id: number
  userId: number
  nombre: string
  apellido: string
  dni: string
  activo: boolean
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

export default async function MesaExamenDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const mesaId = Number(id)

  const [mesaData, inscripciones, materiasPlan, periodos, profesores, alumnos] = await Promise.all([
    fetchCore<MesaExamenResponse>(`/mesas-examen/${mesaId}`),
    fetchCore<InscripcionMesaResponse>(`/mesas-examen/${mesaId}/inscripciones`),
    fetchCore<MateriaPlanResponse>("/materias-plan"),
    fetchCore<PeriodoAcademicoResponse>("/periodos-academicos"),
    fetchCore<ProfesorResponse>("/profesores"),
    fetchCore<AlumnoResponse>("/alumnos"),
  ])

  const mesa = mesaData?.[0]
  if (!mesa) notFound()

  const materiaNombre =
    (materiasPlan ?? []).find((m) => m.id === mesa.materiaPlanId)?.materiaNombre ??
    `Materia #${mesa.materiaPlanId}`
  const periodoNombre =
    (periodos ?? []).find((p) => p.id === mesa.periodoAcademicoId)?.nombre ??
    `Período #${mesa.periodoAcademicoId}`
  const profesorPorUserId = new Map((profesores ?? []).map((p) => [p.userId, p]))
  const tribunal = mesa.tribunalIds.map((userId) => {
    const profesor = profesorPorUserId.get(userId)
    return profesor ? `${profesor.apellido}, ${profesor.nombre}` : `Docente #${userId}`
  })

  const alumnoPorUserId = new Map((alumnos ?? []).map((a) => [a.userId, a]))
  const userIdsInscriptos = new Set((inscripciones ?? []).map((i) => i.alumnoId))
  const alumnosDisponibles = (alumnos ?? [])
    .filter((a) => a.activo && a.userId != null && !userIdsInscriptos.has(a.userId))
    .map((a) => ({ userId: a.userId, nombre: a.nombre, apellido: a.apellido, dni: a.dni }))

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/mesas-examen"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a Mesas de Examen
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">{materiaNombre}</h1>
          <p className="text-sm text-muted-foreground">
            {periodoNombre} · {formatearFechaHora(mesa.fechaHora)}
          </p>
        </div>
        <Badge variant={mesa.estado === "PROGRAMADA" ? "default" : "secondary"}>
          {mesa.estado === "PROGRAMADA" ? "Programada" : "Cerrada"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tribunal Docente</CardTitle>
        </CardHeader>
        <CardContent>
          {tribunal.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin tribunal asignado.</p>
          ) : (
            <p className="text-sm text-foreground">{tribunal.join(" · ")}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-foreground">Alumnos Inscriptos</h2>
        <InscribirAlumnoMesaDialog mesaExamenId={mesa.id} alumnosDisponibles={alumnosDisponibles} />
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
              <TableHead>DNI</TableHead>
              <TableHead>Condición</TableHead>
              <TableHead>Fecha de Inscripción</TableHead>
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
                  <TableCell>{alumno?.dni ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{CONDICION_LABEL[inscripcion.condicionInscripcion]}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatearFechaHora(inscripcion.fechaInscripcion)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

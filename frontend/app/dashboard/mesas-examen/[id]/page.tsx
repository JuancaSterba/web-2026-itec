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
import EditarTribunalDialog from "@/components/mesas-examen/editar-tribunal-dialog"
import CerrarActaButton from "@/components/mesas-examen/cerrar-acta-button"
import { getUsuarioActual } from "@/lib/auth-server"
import { FileText } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

interface MesaExamenResponse {
  id: number
  materiaPlanId: number
  cicloLectivoId: number
  turno: "PRIMER_TURNO" | "SEGUNDO_TURNO" | "TERCER_TURNO" | null
  tipo: "ORDINARIA_1ER_LLAMADO" | "ORDINARIA_2DO_LLAMADO" | "ESPECIAL"
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
  planEstudioId?: number
  materiaNombre: string
}

interface CicloLectivoResponse {
  id: number
  anio: number
}

interface PlanEstudioResponse {
  id: number
  cohorte: string
  resolucion: string
  carreraNombre: string
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

  const [mesaData, inscripciones, materiasPlan, periodos, profesores, alumnos, planes] = await Promise.all([
    fetchCore<MesaExamenResponse>(`/mesas-examen/${mesaId}`),
    fetchCore<InscripcionMesaResponse>(`/mesas-examen/${mesaId}/inscripciones`),
    fetchCore<MateriaPlanResponse>("/materias-plan"),
    fetchCore<CicloLectivoResponse>("/ciclos-lectivos"),
    fetchCore<ProfesorResponse>("/profesores"),
    fetchCore<AlumnoResponse>("/alumnos"),
    fetchCore<PlanEstudioResponse>("/planes-estudio"),
  ])

  const mesa = mesaData?.[0]
  if (!mesa) notFound()

  const materiaPlan = (materiasPlan ?? []).find((m) => m.id === mesa.materiaPlanId)
  const planEstudio = (planes ?? []).find((p) => p.id === materiaPlan?.planEstudioId)
  
  let materiaNombre = materiaPlan?.materiaNombre ?? `Materia #${mesa.materiaPlanId}`
  if (planEstudio) {
    materiaNombre = `${materiaNombre} - ${planEstudio.carreraNombre} (Res. ${planEstudio.resolucion})`
  }
  const cicloNombre =
    (periodos ?? []).find((c) => c.id === mesa.cicloLectivoId)?.anio.toString() ??
    `Ciclo #${mesa.cicloLectivoId}`
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

  const profesoresDisponiblesParaDialog = (profesores ?? []).map((p) => ({
    userId: p.userId,
    nombre: p.nombre,
    apellido: p.apellido,
  }))

  const usuario = await getUsuarioActual()
  const esAdmin = usuario?.roles.includes("ADMIN") || usuario?.roles.includes("ADMINISTRATIVO")

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
            {cicloNombre} ·{" "}
            {mesa.tipo === "ORDINARIA_1ER_LLAMADO" && "Ordinaria (1er Llamado)"}
            {mesa.tipo === "ORDINARIA_2DO_LLAMADO" && "Ordinaria (2do Llamado)"}
            {mesa.tipo === "ESPECIAL" && "Especial"}
            {mesa.turno && ` (${mesa.turno.replace("_", " ").toLowerCase()})`} ·{" "}
            {formatearFechaHora(mesa.fechaHora)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={mesa.estado === "PROGRAMADA" ? "default" : "secondary"}>
            {mesa.estado === "PROGRAMADA" ? "Programada" : "Cerrada"}
          </Badge>
          <a 
            href={`/api/mesas-examen/${mesa.id}/acta-pdf`} 
            target="_blank" 
            rel="noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            <FileText className="mr-2 size-4" />
            Descargar Acta
          </a>
          {esAdmin && <CerrarActaButton mesaId={mesa.id} estado={mesa.estado} />}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Tribunal Docente</CardTitle>
          {esAdmin && mesa.estado === "PROGRAMADA" && (
            <EditarTribunalDialog
              mesaExamenId={mesa.id}
              profesoresDisponibles={profesoresDisponiblesParaDialog}
              tribunalIdsActuales={mesa.tribunalIds}
            />
          )}
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
        <InscribirAlumnoMesaDialog
          mesaExamenId={mesa.id}
          fechaHoraMesa={mesa.fechaHora}
          alumnosDisponibles={alumnosDisponibles}
        />
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

import Link from "next/link"
import { fetchCore } from "@/lib/api-server"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import NuevaMesaDialog from "@/components/mesas-examen/nueva-mesa-dialog"

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

interface MateriaPlanResponse {
  id: number
  materiaNombre: string
}

interface CicloLectivoResponse {
  id: number
  anio: number
}

interface ProfesorResponse {
  id: number
  userId: number
  nombre: string
  apellido: string
  activo: boolean
}

interface PlanEstudioResponse {
  id: number
  cohorte: string
  resolucion: string
  carreraNombre: string
}

function formatearFechaHora(fechaHora: string) {
  return new Date(fechaHora).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export default async function MesasExamenPage() {
  const [mesas, materiasPlan, ciclos, profesores, planes] = await Promise.all([
    fetchCore<MesaExamenResponse>("/mesas-examen"),
    fetchCore<MateriaPlanResponse>("/materias-plan"),
    fetchCore<CicloLectivoResponse>("/ciclos-lectivos"),
    fetchCore<ProfesorResponse>("/profesores"),
    fetchCore<PlanEstudioResponse>("/planes-estudio"),
  ])

  const planPorId = new Map(
    (planes ?? []).map((p) => [p.id, `${p.carreraNombre} (Res. ${p.resolucion})`])
  )
  
  const getNombreCompletoMateria = (m: MateriaPlanResponse) => {
    const infoPlan = planPorId.get(m.planEstudioId)
    return infoPlan ? `${m.materiaNombre} - ${infoPlan}` : m.materiaNombre
  }

  const materiaPorId = new Map(
    (materiasPlan ?? []).map((m) => [m.id, getNombreCompletoMateria(m)])
  )
  const profesorPorUserId = new Map(
    (profesores ?? []).map((p) => [p.userId, `${p.apellido}, ${p.nombre}`])
  )

  const materiasDisponibles = (materiasPlan ?? []).map((m) => ({
    id: m.id,
    nombre: getNombreCompletoMateria(m),
  }))
  const ciclosDisponibles = (ciclos ?? []).map((c) => ({ id: c.id, anio: c.anio }))
  const profesoresDisponibles = (profesores ?? [])
    .filter((p) => p.activo && p.userId != null)
    .map((p) => ({ userId: p.userId, nombre: p.nombre, apellido: p.apellido }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Mesas de Examen</h1>
          <p className="text-sm text-muted-foreground">
            Creá mesas finales, asigná el tribunal y gestioná los alumnos inscriptos
          </p>
        </div>
        <NuevaMesaDialog
          materiasDisponibles={materiasDisponibles}
          ciclosDisponibles={ciclosDisponibles}
          profesoresDisponibles={profesoresDisponibles}
        />
      </div>

      {mesas === null ? (
        <p className="text-sm text-destructive">
          No se pudo obtener el listado de mesas de examen. Intentá nuevamente más tarde.
        </p>
      ) : mesas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay mesas de examen creadas.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Materia</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Tribunal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mesas.map((mesa) => (
              <TableRow key={mesa.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/mesas-examen/${mesa.id}`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {materiaPorId.get(mesa.materiaPlanId) ?? `Materia #${mesa.materiaPlanId}`}
                  </Link>
                </TableCell>
                <TableCell>{formatearFechaHora(mesa.fechaHora)}</TableCell>
                <TableCell>
                  <span className="text-sm font-medium">
                    {mesa.tipo === "ORDINARIA_1ER_LLAMADO" && "Ordinaria (1er Llamado)"}
                    {mesa.tipo === "ORDINARIA_2DO_LLAMADO" && "Ordinaria (2do Llamado)"}
                    {mesa.tipo === "ESPECIAL" && "Especial"}
                  </span>
                  {mesa.turno && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({mesa.turno.replace("_", " ").toLowerCase()})
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={mesa.estado === "PROGRAMADA" ? "default" : "secondary"}>
                    {mesa.estado === "PROGRAMADA" ? "Programada" : "Cerrada"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {mesa.tribunalIds.length === 0
                    ? "Sin tribunal asignado"
                    : mesa.tribunalIds
                        .map((userId) => profesorPorUserId.get(userId) ?? `Docente #${userId}`)
                        .join(" · ")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

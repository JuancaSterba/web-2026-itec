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
  periodoAcademicoId: number
  fechaHora: string
  estado: "PROGRAMADA" | "CERRADA"
  tribunalIds: number[]
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
  activo: boolean
}

function formatearFechaHora(fechaHora: string) {
  return new Date(fechaHora).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export default async function MesasExamenPage() {
  const [mesas, materiasPlan, periodos, profesores] = await Promise.all([
    fetchCore<MesaExamenResponse>("/mesas-examen"),
    fetchCore<MateriaPlanResponse>("/materias-plan"),
    fetchCore<PeriodoAcademicoResponse>("/periodos-academicos"),
    fetchCore<ProfesorResponse>("/profesores"),
  ])

  const materiaPorId = new Map((materiasPlan ?? []).map((m) => [m.id, m.materiaNombre]))
  const profesorPorUserId = new Map(
    (profesores ?? []).map((p) => [p.userId, `${p.apellido}, ${p.nombre}`])
  )

  const materiasDisponibles = (materiasPlan ?? []).map((m) => ({
    id: m.id,
    nombre: m.materiaNombre,
  }))
  const periodosDisponibles = (periodos ?? []).map((p) => ({ id: p.id, nombre: p.nombre }))
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
          periodosDisponibles={periodosDisponibles}
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

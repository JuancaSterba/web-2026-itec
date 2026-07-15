import Link from "next/link"
import { fetchCore } from "@/lib/api-server"
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

function formatearFechaHora(fechaHora: string) {
  return new Date(fechaHora).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export default async function MisMesasPage() {
  const profesor = await getProfesorActual()

  if (!profesor) {
    return (
      <p className="text-sm text-destructive">
        No se pudo identificar al profesor actual. Volvé a iniciar sesión.
      </p>
    )
  }

  const [mesas, materiasPlan, periodos] = await Promise.all([
    fetchCore<MesaExamenResponse>(`/mesas-examen?tribunalUserId=${profesor.userId}`),
    fetchCore<MateriaPlanResponse>("/materias-plan"),
    fetchCore<PeriodoAcademicoResponse>("/periodos-academicos"),
  ])

  const materiaPorId = new Map((materiasPlan ?? []).map((m) => [m.id, m.materiaNombre]))
  const periodoPorId = new Map((periodos ?? []).map((p) => [p.id, p.nombre]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Mis Mesas de Examen</h1>
        <p className="text-sm text-muted-foreground">
          Mesas donde fuiste designado como tribunal. Entrá a una mesa para cargar las notas.
        </p>
      </div>

      {mesas === null ? (
        <p className="text-sm text-destructive">
          No se pudieron obtener tus mesas de examen. Intentá nuevamente más tarde.
        </p>
      ) : mesas.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tenés mesas de examen asignadas.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Materia</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mesas.map((mesa) => (
              <TableRow key={mesa.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/mis-mesas/${mesa.id}`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {materiaPorId.get(mesa.materiaPlanId) ?? `Materia #${mesa.materiaPlanId}`}
                  </Link>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {periodoPorId.get(mesa.periodoAcademicoId) ?? `Período #${mesa.periodoAcademicoId}`}
                </TableCell>
                <TableCell>{formatearFechaHora(mesa.fechaHora)}</TableCell>
                <TableCell>
                  <Badge variant={mesa.estado === "PROGRAMADA" ? "default" : "secondary"}>
                    {mesa.estado === "PROGRAMADA" ? "Programada" : "Cerrada"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

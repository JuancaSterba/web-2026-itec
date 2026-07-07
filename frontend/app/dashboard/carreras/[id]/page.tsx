import Link from "next/link"
import { fetchCore } from "@/lib/api-server"
import NuevoPlanDialog from "@/components/planes/nuevo-plan-dialog"
import InscribirAlumnoDialog from "@/components/carreras/inscribir-alumno-dialog"
import EditarPlanDialog from "@/components/planes/editar-plan-dialog"
import EditarInscripcionDialog from "@/components/carreras/editar-inscripcion-dialog"
import EliminarBoton from "@/components/shared/eliminar-boton"
import { deletePlan } from "@/app/actions/plan-actions"
import { deleteInscripcionCarrera } from "@/app/actions/inscripcion-carrera-actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface CarreraResponse {
  id: number
  nombre: string
  resolucionMinisterial: string
  activa: boolean
}

interface AlumnoResponse {
  id: number
  nombre: string
  apellido: string
  dni: string
}

interface PlanEstudioResponse {
  id: number
  cohorte: string
  resolucion: string
  fechaImplementacion: string
  activo: boolean
  carreraId: number
  carreraNombre: string
}

interface InscripcionCarreraResponse {
  id: number
  alumnoId: number
  planEstudioId: number
  fechaInscripcion: string
  estado: string
}

export default async function CarreraDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [carreras, planes, alumnos, inscripciones] = await Promise.all([
    fetchCore<CarreraResponse>(`/carreras/${id}`),
    fetchCore<PlanEstudioResponse>(`/planes-estudio/carrera/${id}`),
    fetchCore<AlumnoResponse>("/alumnos"),
    fetchCore<InscripcionCarreraResponse>("/inscripciones-carreras"),
  ])

  const carrera = carreras?.[0] ?? null
  const planesVigentes = (planes ?? []).filter((p) => p.activo)
  const planesParaInscripcion = planesVigentes.length > 0 ? planesVigentes : planes ?? []
  const planIds = new Set((planes ?? []).map((p) => p.id))
  const inscripcionesDeLaCarrera = inscripciones?.filter((i) => planIds.has(i.planEstudioId)) ?? null
  const alumnoPorId = new Map((alumnos ?? []).map((a) => [a.id, a]))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Dashboard de la Carrera {carrera?.nombre ?? id}
          </h1>
          <p className="text-sm text-muted-foreground">
            {carrera ? `Resolución ${carrera.resolucionMinisterial}` : "Planes de estudio asociados a esta carrera"}
          </p>
        </div>
        <div className="flex gap-2">
          <InscribirAlumnoDialog planesDisponibles={planesParaInscripcion} alumnosDisponibles={alumnos ?? []} />
          <NuevoPlanDialog carreraId={Number(id)} />
        </div>
      </div>

      {planes === null ? (
        <p className="text-sm text-destructive">No se pudo obtener los planes de estudio. Intentá nuevamente más tarde.</p>
      ) : planes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Esta carrera no tiene planes de estudio registrados.</p>
      ) : (
        <div className="space-y-2">
          {planes.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:bg-accent"
            >
              <Link href={`/dashboard/carreras/${id}/planes/${plan.id}`} className="flex-1 text-sm font-medium text-foreground">
                Plan {plan.cohorte} — Resolución {plan.resolucion}
              </Link>
              <div className="flex gap-1">
                <EditarPlanDialog plan={plan} carreraId={Number(id)} />
                <EliminarBoton
                  accion={deletePlan.bind(null, plan.id)}
                  entidadLabel={`Plan ${plan.cohorte}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h2 className="mb-2 text-lg font-semibold text-foreground">Alumnos Inscriptos</h2>
        {inscripcionesDeLaCarrera === null ? (
          <p className="text-sm text-destructive">No se pudo obtener las inscripciones. Intentá nuevamente más tarde.</p>
        ) : inscripcionesDeLaCarrera.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay alumnos inscriptos en esta carrera.</p>
        ) : (
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alumno</TableHead>
                  <TableHead>Fecha de Inscripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inscripcionesDeLaCarrera.map((inscripcion) => {
                  const alumno = alumnoPorId.get(inscripcion.alumnoId)
                  return (
                    <TableRow key={inscripcion.id}>
                      <TableCell>
                        {alumno ? `${alumno.nombre} ${alumno.apellido}` : `Alumno #${inscripcion.alumnoId}`}
                      </TableCell>
                      <TableCell>{inscripcion.fechaInscripcion ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={inscripcion.estado === "BAJA" ? "secondary" : "default"}>
                          {inscripcion.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex justify-end gap-1">
                        <EditarInscripcionDialog inscripcion={inscripcion} />
                        <EliminarBoton
                          accion={deleteInscripcionCarrera.bind(null, inscripcion.id)}
                          entidadLabel={alumno ? `${alumno.nombre} ${alumno.apellido}` : `Alumno #${inscripcion.alumnoId}`}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}

import Link from "next/link"
import { fetchCore } from "@/lib/api-server"
import NuevoPlanDialog from "@/components/planes/nuevo-plan-dialog"
import InscribirAlumnoDialog from "@/components/carreras/inscribir-alumno-dialog"

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

export default async function CarreraDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [carreras, planes, alumnos] = await Promise.all([
    fetchCore<CarreraResponse>(`/carreras/${id}`),
    fetchCore<PlanEstudioResponse>(`/planes-estudio/carrera/${id}`),
    fetchCore<AlumnoResponse>("/alumnos"),
  ])

  const carrera = carreras?.[0] ?? null
  const planesVigentes = (planes ?? []).filter((p) => p.activo)
  const planesParaInscripcion = planesVigentes.length > 0 ? planesVigentes : planes ?? []

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
            <Link
              key={plan.id}
              href={`/dashboard/carreras/${id}/planes/${plan.id}`}
              className="block rounded-lg border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent"
            >
              Plan {plan.cohorte} — Resolución {plan.resolucion}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

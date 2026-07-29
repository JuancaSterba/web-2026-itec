import { fetchCore } from "@/lib/api-server"
import NuevaMesaDialog from "@/components/mesas-examen/nueva-mesa-dialog"
import { MesasExamenTabla, type MesaExamenItem } from "@/components/mesas-examen/mesas-examen-tabla"

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
  planEstudioId?: number
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
  const cicloPorId = new Map(
    (ciclos ?? []).map((c) => [c.id, c.anio])
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

  const mesasEnriquecidas: MesaExamenItem[] = (mesas ?? []).map((m) => ({
    id: m.id,
    materiaNombre: materiaPorId.get(m.materiaPlanId) ?? `Materia #${m.materiaPlanId}`,
    cicloAnio: cicloPorId.get(m.cicloLectivoId) ?? 0,
    cicloLectivoId: m.cicloLectivoId,
    turno: m.turno,
    tipo: m.tipo,
    fechaHora: m.fechaHora,
    estado: m.estado,
    tribunalNombres: (m.tribunalIds ?? []).map(
      (userId) => profesorPorUserId.get(userId) ?? `Docente #${userId}`
    ),
  }))

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
        <MesasExamenTabla mesas={mesasEnriquecidas} ciclosDisponibles={ciclosDisponibles} />
      )}
    </div>
  )
}

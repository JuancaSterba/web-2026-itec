import { fetchCore } from "@/lib/api-server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { etiquetaCuatrimestre } from "@/lib/cuatrimestre-carrera"

interface AlumnoResponse {
  id: number
  legajo: string
  activo: boolean
  nombre: string
  apellido: string
  dni: string
  email: string
}

interface InscripcionCarreraResponse {
  id: number
  alumnoId: number
  planEstudioId: number
  fechaInscripcion: string
  estado: string
}

interface PlanEstudioResponse {
  id: number
  cohorte: string
  resolucion: string
  activo: boolean
  carreraId: number
  carreraNombre: string
}

interface MateriaPlanResponse {
  id: number
  planEstudioId: number
  materiaId: number
  materiaNombre: string
  cuatrimestreDictado: number
  cargaHoraria: number
}

interface ComisionResponse {
  id: number
  nombreComision: string
  periodoAcademicoId: number
  materiaPlanId: number
}

interface PeriodoAcademicoResponse {
  id: number
  nombre: string
  fechaInicio: string
  fechaFin: string
  cicloLectivoId: number
}

interface CursadaResponse {
  id: number
  alumnoId: number
  comisionId: number
  condicionFinal: string
  notaCierre: number | null
}

type EstadoMateria = "cursando" | "aprobada" | "libre" | "otro" | "pendiente"

interface MateriaConEstado {
  materiaNombre: string
  cuatrimestreDictado: number
  estado: EstadoMateria
  condicionFinal?: string
  notaCierre?: number | null
}

function clasificarCondicion(condicionFinal: string, vigente: boolean): EstadoMateria {
  const normalizado = condicionFinal.toUpperCase()
  if (/PROMOCIONA|APROBAD/.test(normalizado)) return "aprobada"
  if (/LIBRE/.test(normalizado)) return "libre"
  if (normalizado === "REGULAR" && vigente) return "cursando"
  return "otro"
}

const ETIQUETAS_ESTADO: Record<EstadoMateria, string> = {
  cursando: "Cursando Ahora",
  aprobada: "Aprobadas",
  libre: "Libres",
  otro: "Otras Condiciones",
  pendiente: "Pendientes",
}

const VARIANTE_BADGE: Record<EstadoMateria, "default" | "secondary" | "destructive" | "outline"> = {
  cursando: "default",
  aprobada: "default",
  libre: "destructive",
  otro: "secondary",
  pendiente: "outline",
}

export default async function FichaAlumnoPage({
  params,
}: {
  params: Promise<{ alumnoId: string }>
}) {
  const { alumnoId } = await params

  const [alumnos, inscripciones, planes, materiasPlan, comisiones, periodos, cursadas] = await Promise.all([
    fetchCore<AlumnoResponse>(`/alumnos/${alumnoId}`),
    fetchCore<InscripcionCarreraResponse>("/inscripciones-carreras"),
    fetchCore<PlanEstudioResponse>("/planes-estudio"),
    fetchCore<MateriaPlanResponse>("/materias-plan"),
    fetchCore<ComisionResponse>("/comisiones"),
    fetchCore<PeriodoAcademicoResponse>("/periodos-academicos"),
    fetchCore<CursadaResponse>("/cursadas"),
  ])

  const alumno = alumnos?.[0] ?? null
  const hoy = new Date().toISOString().slice(0, 10)

  const inscripcionesDelAlumno =
    inscripciones?.filter((i) => String(i.alumnoId) === alumnoId && i.estado !== "BAJA") ?? null

  const bloquesPorCarrera = (inscripcionesDelAlumno ?? []).map((inscripcion) => {
    const plan = (planes ?? []).find((p) => p.id === inscripcion.planEstudioId) ?? null
    const materiasDelPlan = (materiasPlan ?? [])
      .filter((mp) => mp.planEstudioId === inscripcion.planEstudioId)
      .sort((a, b) => a.cuatrimestreDictado - b.cuatrimestreDictado)

    const materiasConEstado: MateriaConEstado[] = materiasDelPlan.map((mp) => {
      const comisionesDeLaMateria = (comisiones ?? []).filter((c) => c.materiaPlanId === mp.id)
      const cursada = (cursadas ?? []).find(
        (cu) => String(cu.alumnoId) === alumnoId && comisionesDeLaMateria.some((c) => c.id === cu.comisionId)
      )

      if (!cursada) {
        return { materiaNombre: mp.materiaNombre, cuatrimestreDictado: mp.cuatrimestreDictado, estado: "pendiente" }
      }

      const comision = comisionesDeLaMateria.find((c) => c.id === cursada.comisionId)
      const periodo = (periodos ?? []).find((p) => p.id === comision?.periodoAcademicoId)
      const vigente = !!periodo && hoy >= periodo.fechaInicio && hoy <= periodo.fechaFin
      const estado = clasificarCondicion(cursada.condicionFinal, vigente)

      return {
        materiaNombre: mp.materiaNombre,
        cuatrimestreDictado: mp.cuatrimestreDictado,
        estado,
        condicionFinal: cursada.condicionFinal,
        notaCierre: cursada.notaCierre,
      }
    })

    return { inscripcion, plan, materiasConEstado }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">
          Ficha de {alumno ? `${alumno.nombre} ${alumno.apellido}` : `Alumno #${alumnoId}`}
        </h1>
        <p className="text-sm text-muted-foreground">
          {alumno ? `Legajo ${alumno.legajo} · DNI ${alumno.dni}` : "Progreso académico"}
        </p>
      </div>

      {alumno === null ? (
        <p className="text-sm text-destructive">No se pudo obtener el alumno. Intentá nuevamente más tarde.</p>
      ) : inscripcionesDelAlumno === null ? (
        <p className="text-sm text-destructive">No se pudo obtener las inscripciones. Intentá nuevamente más tarde.</p>
      ) : bloquesPorCarrera.length === 0 ? (
        <p className="text-sm text-muted-foreground">Este alumno no tiene inscripciones a carrera activas.</p>
      ) : (
        <div className="space-y-6">
          {bloquesPorCarrera.map(({ inscripcion, plan, materiasConEstado }) => {
            const totalMaterias = materiasConEstado.length
            const aprobadas = materiasConEstado.filter((m) => m.estado === "aprobada").length

            return (
              <Card key={inscripcion.id}>
                <CardHeader>
                  <CardTitle>{plan?.carreraNombre ?? "Carrera"}</CardTitle>
                  <CardDescription>
                    Cohorte {plan?.cohorte ?? "—"} · {aprobadas}/{totalMaterias} materias aprobadas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(["cursando", "aprobada", "libre", "otro", "pendiente"] as EstadoMateria[]).map((estado) => {
                    const materiasDelEstado = materiasConEstado.filter((m) => m.estado === estado)
                    if (materiasDelEstado.length === 0) return null
                    return (
                      <div key={estado}>
                        <h3 className="mb-2 text-sm font-semibold text-foreground">{ETIQUETAS_ESTADO[estado]}</h3>
                        <div className="space-y-1">
                          {materiasDelEstado.map((materia) => (
                            <div
                              key={materia.materiaNombre}
                              className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm"
                            >
                              <span>
                                {materia.materiaNombre}{" "}
                                <span className="text-xs text-muted-foreground">
                                  ({etiquetaCuatrimestre(materia.cuatrimestreDictado)})
                                </span>
                              </span>
                              <div className="flex items-center gap-2">
                                {materia.notaCierre != null && (
                                  <span className="text-xs text-muted-foreground">Nota: {materia.notaCierre}</span>
                                )}
                                <Badge variant={VARIANTE_BADGE[estado]}>
                                  {materia.condicionFinal ?? "Pendiente"}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

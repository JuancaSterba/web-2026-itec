import Link from "next/link"
import { fetchCore } from "@/lib/api-server"
import { getUsuarioActual } from "@/lib/auth-server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users, UserCheck, BookOpenCheck, ClipboardList } from "lucide-react"

interface CarreraResponse {
  id: number
  nombre: string
  activa: boolean
}

interface AlumnoResponse {
  id: number
  nombre: string
  apellido: string
  activo: boolean
}

interface ProfesorResponse {
  id: number
  activo: boolean
}

interface ComisionResponse {
  id: number
  periodoAcademicoId: number
}

interface PeriodoAcademicoResponse {
  id: number
  fechaInicio: string
  fechaFin: string
}

interface CursadaResponse {
  id: number
  alumnoId: number
  comisionId: number
  condicionFinal: string
}

interface PlanEstudioResponse {
  id: number
  carreraNombre: string
}

interface InscripcionCarreraResponse {
  id: number
  alumnoId: number
  planEstudioId: number
  fechaInscripcion: string
  estado: string
}

function KpiCard({
  titulo,
  valor,
  icono: Icono,
}: {
  titulo: string
  valor: number | string
  icono: typeof GraduationCap
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{titulo}</CardTitle>
        <Icono className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="font-display text-3xl font-semibold text-foreground">{valor}</p>
      </CardContent>
    </Card>
  )
}

function DashboardNoAdmin() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Bienvenido/a</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Accesos rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <Link
            href="/dashboard/mis-comisiones"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ClipboardList className="size-4" />
            Ver mis comisiones
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function DashboardPage() {
  // Las métricas de esta página piden endpoints (carreras, periodos-academicos,
  // planes-estudio, inscripciones-carreras) que siguen ADMIN/ADMINISTRATIVO-only.
  // PROFESOR ahora es actor real pero no tiene acceso a todo eso: mostrarle esta
  // pantalla igual terminaba en un cartel de error por datos faltantes. En vez de
  // eso, se le muestra una versión reducida sin pedir nada que no puede ver.
  const usuario = await getUsuarioActual()
  const esAdmin = !!usuario?.roles.some((rol) => rol === "ADMIN" || rol === "ADMINISTRATIVO")

  if (!esAdmin) {
    return <DashboardNoAdmin />
  }

  const [carreras, alumnos, profesores, comisiones, periodos, cursadas, planesEstudio, inscripciones] =
    await Promise.all([
      fetchCore<CarreraResponse>("/carreras"),
      fetchCore<AlumnoResponse>("/alumnos"),
      fetchCore<ProfesorResponse>("/profesores"),
      fetchCore<ComisionResponse>("/comisiones"),
      fetchCore<PeriodoAcademicoResponse>("/periodos-academicos"),
      fetchCore<CursadaResponse>("/cursadas"),
      fetchCore<PlanEstudioResponse>("/planes-estudio"),
      fetchCore<InscripcionCarreraResponse>("/inscripciones-carreras"),
    ])

  const hoy = new Date().toISOString().slice(0, 10)
  const periodoPorId = new Map((periodos ?? []).map((p) => [p.id, p]))
  const comisionPorId = new Map((comisiones ?? []).map((c) => [c.id, c]))
  const alumnoPorId = new Map((alumnos ?? []).map((a) => [a.id, a]))
  const planPorId = new Map((planesEstudio ?? []).map((p) => [p.id, p]))

  const carrerasActivas = (carreras ?? []).filter((c) => c.activa).length
  const alumnosActivos = (alumnos ?? []).filter((a) => a.activo).length
  const profesoresActivos = (profesores ?? []).filter((p) => p.activo).length

  const cursadasActivas = (cursadas ?? []).filter((cu) => {
    if (cu.condicionFinal !== "REGULAR") return false
    const comision = comisionPorId.get(cu.comisionId)
    const periodo = comision ? periodoPorId.get(comision.periodoAcademicoId) : undefined
    return !!periodo && hoy >= periodo.fechaInicio && hoy <= periodo.fechaFin
  }).length

  const ultimasInscripciones = (inscripciones ?? [])
    .filter((i) => i.fechaInscripcion)
    .sort((a, b) => (a.fechaInscripcion < b.fechaInscripcion ? 1 : -1))
    .slice(0, 5)

  const datosIncompletos = !carreras || !alumnos || !profesores || !comisiones || !periodos || !cursadas

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resumen general de la institución</p>
      </div>

      {datosIncompletos ? (
        <p className="text-sm text-destructive">
          No se pudieron obtener todas las métricas. Algunos datos pueden faltar.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard titulo="Carreras Activas" valor={carrerasActivas} icono={GraduationCap} />
          <KpiCard titulo="Alumnos Activos" valor={alumnosActivos} icono={Users} />
          <KpiCard titulo="Profesores Activos" valor={profesoresActivos} icono={UserCheck} />
          <KpiCard titulo="Cursadas Activas Ahora" valor={cursadasActivas} icono={BookOpenCheck} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Últimas Inscripciones a Carrera</CardTitle>
        </CardHeader>
        <CardContent>
          {ultimasInscripciones.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavía no hay inscripciones registradas.</p>
          ) : (
            <div className="space-y-3">
              {ultimasInscripciones.map((inscripcion) => {
                const alumno = alumnoPorId.get(inscripcion.alumnoId)
                const plan = planPorId.get(inscripcion.planEstudioId)
                return (
                  <div key={inscripcion.id} className="flex items-center justify-between text-sm">
                    <div>
                      <Link
                        href={`/dashboard/alumnos/${inscripcion.alumnoId}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {alumno ? `${alumno.nombre} ${alumno.apellido}` : `Alumno #${inscripcion.alumnoId}`}
                      </Link>
                      <p className="text-xs text-muted-foreground">{plan?.carreraNombre ?? "—"}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{inscripcion.fechaInscripcion}</span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

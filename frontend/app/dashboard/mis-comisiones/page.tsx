import Link from "next/link"
import { fetchCore } from "@/lib/api-server"
import { getProfesorActual } from "@/lib/profesor-actual"
import { RequireRole } from "@/components/auth/require-role"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface ComisionProfesorResponse {
  id: number
  comisionId: number
  profesorId: number
  rol: string
}

interface ComisionResponse {
  id: number
  nombreComision: string
  cupoMaximo: number
  activa: boolean
  periodoAcademicoId: number
  materiaPlanId: number
}

interface MateriaPlanResponse {
  id: number
  materiaNombre: string
}

interface PeriodoAcademicoResponse {
  id: number
  nombre: string
}

interface CursadaResponse {
  id: number
  comisionId: number
}

async function MisComisionesLista() {
  const profesor = await getProfesorActual()

  if (!profesor) {
    return <p className="text-sm text-destructive">No se encontró tu perfil de profesor.</p>
  }

  const [asignaciones, comisiones, materiasPlan, periodos, cursadas] = await Promise.all([
    fetchCore<ComisionProfesorResponse>("/comisiones-profesores"),
    fetchCore<ComisionResponse>("/comisiones"),
    fetchCore<MateriaPlanResponse>("/materias-plan"),
    fetchCore<PeriodoAcademicoResponse>("/periodos-academicos"),
    fetchCore<CursadaResponse>("/cursadas"),
  ])

  if (asignaciones === null || comisiones === null) {
    return (
      <p className="text-sm text-destructive">
        No se pudieron obtener tus comisiones. Intentá nuevamente más tarde.
      </p>
    )
  }

  const misAsignaciones = asignaciones.filter((a) => a.profesorId === profesor.id)

  if (misAsignaciones.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no tenés comisiones asignadas.</p>
  }

  const misComisiones = misAsignaciones
    .map((a) => comisiones.find((c) => c.id === a.comisionId))
    .filter((c): c is ComisionResponse => c !== undefined)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {misComisiones.map((comision) => {
        const materiaNombre = (materiasPlan ?? []).find((mp) => mp.id === comision.materiaPlanId)?.materiaNombre
        const periodoNombre = (periodos ?? []).find((p) => p.id === comision.periodoAcademicoId)?.nombre
        const cantidadAlumnos = (cursadas ?? []).filter((c) => c.comisionId === comision.id).length

        return (
          <Link key={comision.id} href={`/dashboard/comisiones/${comision.id}`}>
            <Card className="h-full transition-colors hover:bg-accent">
              <CardHeader>
                <CardTitle className="text-base">{materiaNombre ?? comision.nombreComision}</CardTitle>
                <CardDescription>
                  {periodoNombre ?? "—"} · {cantidadAlumnos} alumno{cantidadAlumnos === 1 ? "" : "s"}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

export default function MisComisionesPage() {
  return (
    <RequireRole roles={["PROFESOR"]}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Mis Comisiones</h1>
          <p className="text-sm text-muted-foreground">Comisiones donde estás asignado como docente</p>
        </div>
        <MisComisionesLista />
      </div>
    </RequireRole>
  )
}

import { AlertTriangle } from "lucide-react"
import { fetchCore } from "@/lib/api-server"
import { getUsuarioActual } from "@/lib/auth-server"
import { etiquetaEstado, fetchResumenAsistencia, formatearPorcentaje, SIN_REGISTROS, varianteEstado } from "@/lib/asistencia"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface MateriaPlanResponse {
  id: number
  planEstudioId: number
  materiaNombre: string
}

interface PlanEstudioResponse {
  id: number
  cohorte: string
  carreraNombre: string
}

interface CicloLectivoResponse {
  id: number
  anio: number
}

interface PeriodoAcademicoResponse {
  id: number
  cicloLectivoId: number
}

interface ComisionResponse {
  id: number
  nombreComision: string
  periodoAcademicoId: number
  materiaPlanId: number
}

interface CursadaResponse {
  id: number
  alumnoId: number
  comisionId: number
}

interface AlumnoResponse {
  id: number
  nombre: string
  apellido: string
}

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

// Reporte de asistencia por materia y ciclo lectivo (spec 002, US-REP-01):
// alumnos de todas las comisiones, con los NO_REGULAR primero (RF-15, RF-16).
// Formulario GET: la seleccion queda en la URL y la pagina es solo lectura.
export default async function ReporteAsistenciaPage({
  searchParams,
}: {
  searchParams: Promise<{ materiaPlanId?: string; cicloId?: string }>
}) {
  const usuario = await getUsuarioActual()
  const puedeVer = !!usuario?.roles.some((rol) => rol === "ADMIN" || rol === "ADMINISTRATIVO")
  if (!puedeVer) {
    // RF-21: el reporte es solo para admin y administrativo.
    return <p className="text-sm text-destructive">No tenés permiso para ver el reporte de asistencia.</p>
  }

  const { materiaPlanId, cicloId } = await searchParams
  const [materiasPlan, planes, ciclos] = await Promise.all([
    fetchCore<MateriaPlanResponse>("/materias-plan"),
    fetchCore<PlanEstudioResponse>("/planes-estudio"),
    fetchCore<CicloLectivoResponse>("/ciclos-lectivos"),
  ])
  const planPorId = new Map((planes ?? []).map((p) => [p.id, p]))
  const etiquetaMateria = (mp: MateriaPlanResponse) => {
    const plan = planPorId.get(mp.planEstudioId)
    return plan ? `${mp.materiaNombre} — ${plan.carreraNombre} (${plan.cohorte})` : mp.materiaNombre
  }

  const filas = materiaPlanId && cicloId ? await armarFilas(Number(materiaPlanId), Number(cicloId)) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Reporte de asistencia</h1>
        <p className="text-sm text-muted-foreground">
          Porcentaje de asistencia y regularidad (70 %) por materia y ciclo lectivo.
        </p>
      </div>

      <form method="get" className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
        <div className="space-y-1">
          <Label htmlFor="materiaPlanId">Materia</Label>
          <select id="materiaPlanId" name="materiaPlanId" defaultValue={materiaPlanId ?? ""} required className={SELECT_CLASS}>
            <option value="" disabled>Elegí una materia</option>
            {(materiasPlan ?? []).map((mp) => (
              <option key={mp.id} value={mp.id}>{etiquetaMateria(mp)}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="cicloId">Ciclo lectivo</Label>
          <select id="cicloId" name="cicloId" defaultValue={cicloId ?? ""} required className={SELECT_CLASS}>
            <option value="" disabled>Elegí un ciclo</option>
            {(ciclos ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.anio}</option>
            ))}
          </select>
        </div>
        <Button type="submit">Generar reporte</Button>
      </form>

      {filas === null ? null : filas === "error" ? (
        <p className="text-sm text-destructive">No se pudo generar el reporte. Intentá de nuevo más tarde.</p>
      ) : filas.length === 0 ? (
        // RF-17
        <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">{SIN_REGISTROS}</p>
      ) : (
        <div className="rounded-lg border border-border bg-card p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alumno</TableHead>
                <TableHead>Comisión</TableHead>
                <TableHead>Asistencia</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filas.map((fila) => {
                const enRiesgo = fila.resumen?.estado === "NO_REGULAR"
                return (
                  <TableRow key={fila.cursadaId} className={enRiesgo ? "bg-destructive/5" : undefined}>
                    <TableCell className="font-medium">
                      <span className="inline-flex items-center gap-2">
                        {enRiesgo && <AlertTriangle className="size-4 text-destructive" aria-label="En riesgo" />}
                        {fila.alumno}
                      </span>
                    </TableCell>
                    <TableCell>{fila.comision}</TableCell>
                    <TableCell>{formatearPorcentaje(fila.resumen)}</TableCell>
                    <TableCell>
                      <Badge variant={varianteEstado(fila.resumen?.estado)}>{etiquetaEstado(fila.resumen?.estado)}</Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

const ORDEN_ESTADO = { NO_REGULAR: 0, REGULAR: 1, SIN_REGISTROS: 2 } as const

// Filas del reporte, o [] si no hay asistencias registradas en la materia y el
// ciclo (RF-17), o "error" si algun servicio no respondio.
async function armarFilas(materiaPlanId: number, cicloId: number) {
  const [periodos, comisiones, cursadas, alumnos] = await Promise.all([
    fetchCore<PeriodoAcademicoResponse>("/periodos-academicos"),
    fetchCore<ComisionResponse>("/comisiones"),
    fetchCore<CursadaResponse>("/cursadas"),
    fetchCore<AlumnoResponse>("/alumnos"),
  ])
  if (!periodos || !comisiones || !cursadas || !alumnos) return "error" as const

  const periodosDelCiclo = new Set(periodos.filter((p) => p.cicloLectivoId === cicloId).map((p) => p.id))
  const comisionesDelReporte = new Map(
    comisiones
      .filter((c) => c.materiaPlanId === materiaPlanId && periodosDelCiclo.has(c.periodoAcademicoId))
      .map((c) => [c.id, c])
  )
  const cursadasDelReporte = cursadas.filter((c) => comisionesDelReporte.has(c.comisionId))

  const resumenes = await fetchResumenAsistencia(cursadasDelReporte.map((c) => c.id))
  if (resumenes === null) return "error" as const
  const hayRegistros = Array.from(resumenes.values()).some((r) => r.estado !== "SIN_REGISTROS")
  if (!hayRegistros) return []

  const alumnoPorId = new Map(alumnos.map((a) => [a.id, a]))
  return cursadasDelReporte
    .map((cursada) => {
      const alumno = alumnoPorId.get(cursada.alumnoId)
      return {
        cursadaId: cursada.id,
        alumno: alumno ? `${alumno.apellido}, ${alumno.nombre}` : `Alumno #${cursada.alumnoId}`,
        comision: comisionesDelReporte.get(cursada.comisionId)?.nombreComision ?? `#${cursada.comisionId}`,
        resumen: resumenes.get(cursada.id),
      }
    })
    .sort(
      (a, b) =>
        ORDEN_ESTADO[a.resumen?.estado ?? "SIN_REGISTROS"] - ORDEN_ESTADO[b.resumen?.estado ?? "SIN_REGISTROS"] ||
        a.alumno.localeCompare(b.alumno, "es")
    )
}

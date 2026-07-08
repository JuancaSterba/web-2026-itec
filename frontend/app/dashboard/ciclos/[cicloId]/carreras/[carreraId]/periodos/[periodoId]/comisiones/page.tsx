import Link from "next/link"
import { fetchCore } from "@/lib/api-server"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import AgregarComisionesPorCarreraDialog from "@/components/comisiones/agregar-comisiones-por-carrera-dialog"
import EditarComisionDialog from "@/components/comisiones/editar-comision-dialog"
import EliminarBoton from "@/components/shared/eliminar-boton"
import { deleteComision } from "@/app/actions/comision-actions"
import { Badge } from "@/components/ui/badge"
import InscribirCuatrimestreDialog from "@/components/comisiones/inscribir-cuatrimestre-dialog"
import { etiquetaCuatrimestre } from "@/lib/cuatrimestre-carrera"

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
  planEstudioId: number
  materiaId: number
  materiaNombre: string
  cuatrimestreDictado: number
  cargaHoraria: number
}

interface AlumnoResponse {
  id: number
  nombre: string
  apellido: string
  dni: string
}

interface CursadaResponse {
  id: number
  alumnoId: number
  comisionId: number
}

interface InscripcionCarreraResponse {
  id: number
  alumnoId: number
  planEstudioId: number
  estado: string
}

interface PlanEstudioResponse {
  id: number
  cohorte: string
  carreraId: number
  carreraNombre: string
}

interface CarreraResponse {
  id: number
  nombre: string
}

interface PeriodoAcademicoResponse {
  id: number
  nombre: string
}

export default async function OfertaAcademicaPage({
  params,
}: {
  params: Promise<{ cicloId: string; carreraId: string; periodoId: string }>
}) {
  const { cicloId, carreraId, periodoId } = await params

  const [comisiones, materiasPlan, alumnos, cursadas, inscripcionesCarrera, planesEstudio, carreras, periodos] =
    await Promise.all([
      fetchCore<ComisionResponse>("/comisiones"),
      fetchCore<MateriaPlanResponse>("/materias-plan"),
      fetchCore<AlumnoResponse>("/alumnos"),
      fetchCore<CursadaResponse>("/cursadas"),
      fetchCore<InscripcionCarreraResponse>("/inscripciones-carreras"),
      fetchCore<PlanEstudioResponse>("/planes-estudio"),
      fetchCore<CarreraResponse>(`/carreras/${carreraId}`),
      fetchCore<PeriodoAcademicoResponse>("/periodos-academicos"),
    ])

  const carrera = carreras?.[0] ?? null
  const periodo = (periodos ?? []).find((p) => String(p.id) === periodoId) ?? null

  const materiaPlanPorId = new Map((materiasPlan ?? []).map((mp) => [mp.id, mp]))
  const materiaNombrePorId = new Map((materiasPlan ?? []).map((mp) => [mp.id, mp.materiaNombre]))
  const planPorId = new Map((planesEstudio ?? []).map((p) => [p.id, p]))

  const comisionesDelPeriodo = comisiones?.filter((c) => String(c.periodoAcademicoId) === periodoId) ?? null
  const comisionesDeLaCarrera =
    comisionesDelPeriodo?.filter((c) => {
      const mp = materiaPlanPorId.get(c.materiaPlanId)
      const plan = mp ? planPorId.get(mp.planEstudioId) : undefined
      return String(plan?.carreraId) === carreraId
    }) ?? null

  const materiasPlanDisponibles = (materiasPlan ?? []).map((mp) => ({
    id: mp.id,
    etiqueta: `${mp.materiaNombre} (${etiquetaCuatrimestre(mp.cuatrimestreDictado)})`,
  }))
  const comisionesParaInscripcion = (comisionesDeLaCarrera ?? []).map((c) => ({
    id: c.id,
    etiqueta: `${c.nombreComision} - ${materiaNombrePorId.get(c.materiaPlanId) ?? "—"}`,
  }))
  const comisionIdsDeLaCarrera = new Set((comisionesDeLaCarrera ?? []).map((c) => c.id))
  const cursadasExistentes = (cursadas ?? [])
    .filter((cu) => comisionIdsDeLaCarrera.has(cu.comisionId))
    .map((cu) => ({ alumnoId: cu.alumnoId, comisionId: cu.comisionId }))

  // Solo alumnos inscriptos (estado != BAJA) al plan de esta carrera, y que
  // no esten ya matriculados en TODAS las comisiones de esta carrera en
  // este período (si les falta al menos una, se muestran igual).
  const planEstudioIdsDeLaCarrera = new Set(
    (planesEstudio ?? []).filter((p) => String(p.carreraId) === carreraId).map((p) => p.id)
  )
  const alumnoIdsInscriptosEnCarrera = new Set(
    (inscripcionesCarrera ?? [])
      .filter((i) => planEstudioIdsDeLaCarrera.has(i.planEstudioId) && i.estado !== "BAJA")
      .map((i) => i.alumnoId)
  )
  const alumnosParaInscripcion = (alumnos ?? []).filter(
    (a) =>
      alumnoIdsInscriptosEnCarrera.has(a.id) &&
      (comisionesDeLaCarrera ?? []).some(
        (c) => !cursadasExistentes.some((cu) => cu.alumnoId === a.id && cu.comisionId === c.id)
      )
  )

  const planesDeLaCarrera = (planesEstudio ?? [])
    .filter((p) => String(p.carreraId) === carreraId)
    .map((p) => ({ id: p.id, etiqueta: `${p.carreraNombre} - Plan ${p.cohorte}` }))
  const materiaPlanIdsYaOfertados = (comisionesDeLaCarrera ?? []).map((c) => c.materiaPlanId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Oferta Académica · {carrera?.nombre ?? `Carrera #${carreraId}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            Ciclo {cicloId} · {periodo?.nombre ?? `Período #${periodoId}`}
          </p>
        </div>
        <div className="flex gap-2">
          <InscribirCuatrimestreDialog
            comisionesDelPeriodo={comisionesParaInscripcion}
            alumnosDisponibles={alumnosParaInscripcion}
            cursadasExistentes={cursadasExistentes}
          />
          <AgregarComisionesPorCarreraDialog
            periodoId={Number(periodoId)}
            planesDisponibles={planesDeLaCarrera}
            materiasPlan={materiasPlan ?? []}
            materiaPlanIdsYaOfertados={materiaPlanIdsYaOfertados}
          />
        </div>
      </div>

      {comisionesDeLaCarrera === null ? (
        <p className="text-sm text-destructive">No se pudo obtener la oferta académica. Intentá nuevamente más tarde.</p>
      ) : comisionesDeLaCarrera.length === 0 ? (
        <p className="text-sm text-muted-foreground">Esta carrera no tiene comisiones en este período.</p>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comisión</TableHead>
                <TableHead>Materia</TableHead>
                <TableHead>Cuatrimestre</TableHead>
                <TableHead>Cupo Máximo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comisionesDeLaCarrera
                .slice()
                .sort((a, b) => {
                  const cuatA = materiaPlanPorId.get(a.materiaPlanId)?.cuatrimestreDictado ?? 0
                  const cuatB = materiaPlanPorId.get(b.materiaPlanId)?.cuatrimestreDictado ?? 0
                  return cuatA - cuatB
                })
                .map((comision) => (
                  <TableRow key={comision.id}>
                    <TableCell>
                      <Link href={`/dashboard/comisiones/${comision.id}`} className="font-medium hover:underline">
                        {comision.nombreComision}
                      </Link>
                    </TableCell>
                    <TableCell>{materiaNombrePorId.get(comision.materiaPlanId) ?? "—"}</TableCell>
                    <TableCell>
                      {(() => {
                        const cuatrimestre = materiaPlanPorId.get(comision.materiaPlanId)?.cuatrimestreDictado
                        return cuatrimestre ? etiquetaCuatrimestre(cuatrimestre) : "—"
                      })()}
                    </TableCell>
                    <TableCell>{comision.cupoMaximo}</TableCell>
                    <TableCell>
                      <Badge variant={comision.activa ? "default" : "secondary"}>
                        {comision.activa ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex justify-end gap-1">
                      <EditarComisionDialog
                        comision={comision}
                        periodoId={Number(periodoId)}
                        materiasPlanDisponibles={materiasPlanDisponibles}
                      />
                      <EliminarBoton
                        accion={deleteComision.bind(null, comision.id)}
                        entidadLabel={comision.nombreComision}
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

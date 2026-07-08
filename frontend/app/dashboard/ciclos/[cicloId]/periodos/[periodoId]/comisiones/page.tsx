import Link from "next/link"
import { fetchCore } from "@/lib/api-server"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import AgregarComisionesPorCarreraDialog from "@/components/comisiones/agregar-comisiones-por-carrera-dialog"
import EditarComisionDialog from "@/components/comisiones/editar-comision-dialog"
import EliminarBoton from "@/components/shared/eliminar-boton"
import { deleteComision } from "@/app/actions/comision-actions"
import { Badge } from "@/components/ui/badge"
import InscribirCuatrimestreDialog from "@/components/comisiones/inscribir-cuatrimestre-dialog"

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

export default async function OfertaAcademicaPage({
  params,
}: {
  params: Promise<{ cicloId: string; periodoId: string }>
}) {
  const { cicloId, periodoId } = await params

  const [comisiones, materiasPlan, alumnos, cursadas, inscripcionesCarrera, planesEstudio] = await Promise.all([
    fetchCore<ComisionResponse>("/comisiones"),
    fetchCore<MateriaPlanResponse>("/materias-plan"),
    fetchCore<AlumnoResponse>("/alumnos"),
    fetchCore<CursadaResponse>("/cursadas"),
    fetchCore<InscripcionCarreraResponse>("/inscripciones-carreras"),
    fetchCore<PlanEstudioResponse>("/planes-estudio"),
  ])

  const comisionesDelPeriodo = comisiones?.filter((c) => String(c.periodoAcademicoId) === periodoId) ?? null
  const materiaPlanPorId = new Map((materiasPlan ?? []).map((mp) => [mp.id, mp]))
  const materiaNombrePorId = new Map((materiasPlan ?? []).map((mp) => [mp.id, mp.materiaNombre]))
  const materiasPlanDisponibles = (materiasPlan ?? []).map((mp) => ({
    id: mp.id,
    etiqueta: `${mp.materiaNombre} (${mp.cuatrimestreDictado}º Cuatrimestre)`,
  }))
  const comisionesParaInscripcion = (comisionesDelPeriodo ?? []).map((c) => ({
    id: c.id,
    etiqueta: `${c.nombreComision} - ${materiaNombrePorId.get(c.materiaPlanId) ?? "—"}`,
  }))
  const comisionIdsDelPeriodo = new Set((comisionesDelPeriodo ?? []).map((c) => c.id))
  const cursadasExistentes = (cursadas ?? [])
    .filter((cu) => comisionIdsDelPeriodo.has(cu.comisionId))
    .map((cu) => ({ alumnoId: cu.alumnoId, comisionId: cu.comisionId }))

  // Solo alumnos inscriptos (estado != BAJA) al/los plan/es de estudio de las
  // materias que se dictan en este período, y que no esten ya matriculados
  // en TODAS las comisiones (si les falta al menos una, se muestran igual).
  const planEstudioIdsDelPeriodo = new Set(
    (comisionesDelPeriodo ?? [])
      .map((c) => materiaPlanPorId.get(c.materiaPlanId)?.planEstudioId)
      .filter((id): id is number => id !== undefined)
  )
  const alumnoIdsInscriptosEnCarrera = new Set(
    (inscripcionesCarrera ?? [])
      .filter((i) => planEstudioIdsDelPeriodo.has(i.planEstudioId) && i.estado !== "BAJA")
      .map((i) => i.alumnoId)
  )
  const alumnosParaInscripcion = (alumnos ?? []).filter(
    (a) =>
      alumnoIdsInscriptosEnCarrera.has(a.id) &&
      (comisionesDelPeriodo ?? []).some(
        (c) => !cursadasExistentes.some((cu) => cu.alumnoId === a.id && cu.comisionId === c.id)
      )
  )

  // Un mismo Periodo institucional agrupa comisiones de TODAS las carreras
  // habilitadas ese cuatrimestre -- se separan visualmente por Carrera (y
  // dentro de cada una, por el cuatrimestre curricular de la materia) para
  // no mostrar todo mezclado en una sola tabla plana.
  const planPorId = new Map((planesEstudio ?? []).map((p) => [p.id, p]))
  const carreraNombrePorComision = new Map(
    (comisionesDelPeriodo ?? []).map((c) => {
      const mp = materiaPlanPorId.get(c.materiaPlanId)
      const plan = mp ? planPorId.get(mp.planEstudioId) : undefined
      return [c.id, plan?.carreraNombre ?? "Sin carrera"]
    })
  )
  const comisionesPorCarrera = new Map<string, ComisionResponse[]>()
  for (const comision of comisionesDelPeriodo ?? []) {
    const carrera = carreraNombrePorComision.get(comision.id) ?? "Sin carrera"
    if (!comisionesPorCarrera.has(carrera)) comisionesPorCarrera.set(carrera, [])
    comisionesPorCarrera.get(carrera)!.push(comision)
  }
  for (const lista of comisionesPorCarrera.values()) {
    lista.sort((a, b) => {
      const cuatA = materiaPlanPorId.get(a.materiaPlanId)?.cuatrimestreDictado ?? 0
      const cuatB = materiaPlanPorId.get(b.materiaPlanId)?.cuatrimestreDictado ?? 0
      return cuatA - cuatB
    })
  }
  const carrerasOrdenadas = Array.from(comisionesPorCarrera.keys()).sort()

  const planesDisponibles = (planesEstudio ?? []).map((p) => ({
    id: p.id,
    etiqueta: `${p.carreraNombre} - Plan ${p.cohorte}`,
  }))
  const materiaPlanIdsYaOfertados = (comisionesDelPeriodo ?? []).map((c) => c.materiaPlanId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Oferta Académica</h1>
          <p className="text-sm text-muted-foreground">
            Ciclo {cicloId} · Período {periodoId}
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
            planesDisponibles={planesDisponibles}
            materiasPlan={materiasPlan ?? []}
            materiaPlanIdsYaOfertados={materiaPlanIdsYaOfertados}
          />
        </div>
      </div>

      {comisionesDelPeriodo === null ? (
        <p className="text-sm text-destructive">No se pudo obtener la oferta académica. Intentá nuevamente más tarde.</p>
      ) : comisionesDelPeriodo.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay comisiones registradas para este período.</p>
      ) : (
        <div className="space-y-6">
          {carrerasOrdenadas.map((carrera) => (
            <div key={carrera}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {carrera}
              </h2>
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
                    {comisionesPorCarrera.get(carrera)!.map((comision) => (
                      <TableRow key={comision.id}>
                        <TableCell>
                          <Link href={`/dashboard/comisiones/${comision.id}`} className="font-medium hover:underline">
                            {comision.nombreComision}
                          </Link>
                        </TableCell>
                        <TableCell>{materiaNombrePorId.get(comision.materiaPlanId) ?? "—"}</TableCell>
                        <TableCell>
                          {materiaPlanPorId.get(comision.materiaPlanId)?.cuatrimestreDictado ?? "—"}º
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

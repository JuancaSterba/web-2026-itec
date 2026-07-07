import { fetchCore, fetchGateway } from "@/lib/api-server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import AgregarAlumnoDialog from "@/components/comisiones/agregar-alumno-dialog"
import EditableNotaCell from "@/components/comisiones/editable-nota-cell"
import TomarAsistenciaDialog from "@/components/comisiones/tomar-asistencia-dialog"
import AsignarProfesorDialog from "@/components/comisiones/asignar-profesor-dialog"
import EditarCursadaDialog from "@/components/comisiones/editar-cursada-dialog"
import EditarProfesorAsignadoDialog from "@/components/comisiones/editar-profesor-asignado-dialog"
import EliminarBoton from "@/components/shared/eliminar-boton"
import { deleteCursada } from "@/app/actions/cursada-actions"
import { deleteComisionProfesor } from "@/app/actions/comision-profesor-actions"
import NuevaInstanciaDialog from "@/components/comisiones/nueva-instancia-dialog"

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

interface CursadaResponse {
  id: number
  alumnoId: number
  comisionId: number
  fechaInscripcion: string
  condicionFinal: string
  notaCierre: number | null
}

interface AlumnoResponse {
  id: number
  legajo: string
  activo: boolean
  nombre: string
  apellido: string
  dni: string
}

interface CalificacionParcialResponse {
  id: number
  cursadaId: number
  instancia: string
  nota: number
  fecha: string
}

interface AsistenciaResponse {
  id: number
  cursadaId: number
  fecha: string
  estado: string
}

interface ProfesorResponse {
  id: number
  nombre: string
  apellido: string
  dni: string
}

interface ComisionProfesorResponse {
  id: number
  comisionId: number
  profesorId: number
  rol: string
}

export default async function ComisionDetallePage({
  params,
}: {
  params: Promise<{ comisionId: string }>
}) {
  const { comisionId } = await params

  const [comisiones, materiasPlan, cursadas, alumnos, profesores, comisionesProfesores] = await Promise.all([
    fetchCore<ComisionResponse>(`/comisiones/${comisionId}`),
    fetchCore<MateriaPlanResponse>("/materias-plan"),
    fetchCore<CursadaResponse>("/cursadas"),
    fetchCore<AlumnoResponse>("/alumnos"),
    fetchCore<ProfesorResponse>("/profesores"),
    fetchCore<ComisionProfesorResponse>("/comisiones-profesores"),
  ])

  const comision = comisiones?.[0] ?? null
  const materiaNombre = materiasPlan?.find((mp) => mp.id === comision?.materiaPlanId)?.materiaNombre
  const cursadasDeLaComision = cursadas?.filter((c) => String(c.comisionId) === comisionId) ?? null
  const alumnoPorId = new Map((alumnos ?? []).map((a) => [a.id, a]))
  const profesorPorId = new Map((profesores ?? []).map((p) => [p.id, p]))
  const docentesDeLaComision = comisionesProfesores?.filter((cp) => String(cp.comisionId) === comisionId) ?? null

  const cursadasParaAsistencia = (cursadasDeLaComision ?? []).map((cursada) => {
    const alumno = alumnoPorId.get(cursada.alumnoId)
    return {
      id: cursada.id,
      alumnoNombre: alumno ? `${alumno.nombre} ${alumno.apellido}` : `Alumno #${cursada.alumnoId}`,
    }
  })

  const titulo = comision
    ? `${comision.nombreComision}${materiaNombre ? ` - ${materiaNombre}` : ""}`
    : comisionId

  // ms-notas/ms-asistencias se filtran por cursadaId (soportado server-side); una
  // cursada por alumno en esta comisión, asi que se resuelve con un fetch por cursada.
  let calificacionesPorCursada: Map<number, CalificacionParcialResponse[]> | null = null
  let asistenciasPorCursada: Map<number, AsistenciaResponse[]> | null = null

  if (cursadasDeLaComision) {
    const resultados = await Promise.all(
      cursadasDeLaComision.map((cursada) =>
        Promise.all([
          fetchGateway<CalificacionParcialResponse>(`/api/calificaciones-parciales?cursadaId=${cursada.id}`),
          fetchGateway<AsistenciaResponse>(`/api/asistencias?cursadaId=${cursada.id}`),
        ])
      )
    )

    calificacionesPorCursada = new Map()
    asistenciasPorCursada = new Map()
    cursadasDeLaComision.forEach((cursada, index) => {
      calificacionesPorCursada!.set(cursada.id, resultados[index][0] ?? [])
      asistenciasPorCursada!.set(cursada.id, resultados[index][1] ?? [])
    })
  }

  const instancias = Array.from(
    new Set(Array.from(calificacionesPorCursada?.values() ?? []).flat().map((c) => c.instancia))
  ).sort()

  const fechasAsistencia = Array.from(
    new Set(Array.from(asistenciasPorCursada?.values() ?? []).flat().map((a) => a.fecha))
  ).sort()

  const asistenciasExistentes = Array.from(asistenciasPorCursada?.entries() ?? []).flatMap(
    ([cursadaId, asistenciasDeCursada]) =>
      asistenciasDeCursada.map((a) => ({ cursadaId, fecha: a.fecha, id: a.id }))
  )

  function badgeParaEstado(estado: string) {
    const normalizado = estado.toLowerCase()
    if (normalizado.includes("presente")) {
      return <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">{estado}</Badge>
    }
    if (normalizado.includes("ausente")) {
      return <Badge variant="destructive">{estado}</Badge>
    }
    return <Badge variant="secondary">{estado}</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Dashboard de Comisión {titulo}</h1>
        <p className="text-sm text-muted-foreground">Gestión operativa de la cursada</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">Información General</TabsTrigger>
          <TabsTrigger value="alumnos">Alumnos Inscritos</TabsTrigger>
          <TabsTrigger value="docentes">Docentes</TabsTrigger>
          <TabsTrigger value="asistencias">Asistencias</TabsTrigger>
          <TabsTrigger value="calificaciones">Calificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="rounded-lg border border-border bg-card p-4 text-sm text-foreground">
          {comision === null ? (
            <p className="text-destructive">No se pudo obtener la información de la comisión.</p>
          ) : (
            <>
              <p>Materia: {materiaNombre ?? "—"}</p>
              <p>Cupo máximo: {comision.cupoMaximo}</p>
              <p>Estado: {comision.activa ? "Activa" : "Inactiva"}</p>
            </>
          )}
        </TabsContent>

        <TabsContent value="alumnos" className="space-y-4 rounded-lg border border-border bg-card p-4 text-sm text-foreground">
          <div className="flex justify-end">
            <AgregarAlumnoDialog comisionId={Number(comisionId)} alumnosDisponibles={alumnos ?? []} />
          </div>
          {cursadasDeLaComision === null ? (
            <p className="text-destructive">No se pudo obtener los alumnos inscritos.</p>
          ) : cursadasDeLaComision.length === 0 ? (
            <p className="text-muted-foreground">No hay alumnos inscritos en esta comisión.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alumno</TableHead>
                  <TableHead>Condición Final</TableHead>
                  <TableHead>Nota de Cierre</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cursadasDeLaComision.map((cursada) => {
                  const alumno = alumnoPorId.get(cursada.alumnoId)
                  return (
                    <TableRow key={cursada.id}>
                      <TableCell>
                        {alumno ? `${alumno.nombre} ${alumno.apellido}` : `Alumno #${cursada.alumnoId}`}
                      </TableCell>
                      <TableCell>{cursada.condicionFinal}</TableCell>
                      <TableCell>{cursada.notaCierre ?? "—"}</TableCell>
                      <TableCell className="flex justify-end gap-1">
                        <EditarCursadaDialog cursada={cursada} />
                        <EliminarBoton
                          accion={deleteCursada.bind(null, cursada.id)}
                          entidadLabel={alumno ? `${alumno.nombre} ${alumno.apellido}` : `Alumno #${cursada.alumnoId}`}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="docentes" className="space-y-4 rounded-lg border border-border bg-card p-4 text-sm text-foreground">
          <div className="flex justify-end">
            <AsignarProfesorDialog comisionId={Number(comisionId)} profesoresDisponibles={profesores ?? []} />
          </div>
          {docentesDeLaComision === null ? (
            <p className="text-destructive">No se pudo obtener los docentes asignados.</p>
          ) : docentesDeLaComision.length === 0 ? (
            <p className="text-muted-foreground">No hay profesores asignados a esta comisión.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profesor</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {docentesDeLaComision.map((cp) => {
                  const profesor = profesorPorId.get(cp.profesorId)
                  return (
                    <TableRow key={cp.id}>
                      <TableCell>
                        {profesor ? `${profesor.nombre} ${profesor.apellido}` : `Profesor #${cp.profesorId}`}
                      </TableCell>
                      <TableCell>{cp.rol || "—"}</TableCell>
                      <TableCell className="flex justify-end gap-1">
                        <EditarProfesorAsignadoDialog asignacion={cp} profesoresDisponibles={profesores ?? []} />
                        <EliminarBoton
                          accion={deleteComisionProfesor.bind(null, cp.id)}
                          entidadLabel={profesor ? `${profesor.nombre} ${profesor.apellido}` : `Profesor #${cp.profesorId}`}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="asistencias" className="space-y-4 rounded-lg border border-border bg-card p-4 text-sm text-foreground">
          <div className="flex justify-end">
            <TomarAsistenciaDialog cursadas={cursadasParaAsistencia} asistenciasExistentes={asistenciasExistentes} />
          </div>
          {cursadasDeLaComision === null || asistenciasPorCursada === null ? (
            <p className="text-destructive">No se pudo obtener las asistencias. Intentá nuevamente más tarde.</p>
          ) : fechasAsistencia.length === 0 ? (
            <p className="text-muted-foreground">Todavía no hay asistencias registradas para esta comisión.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alumno</TableHead>
                  {fechasAsistencia.map((fecha) => (
                    <TableHead key={fecha}>{fecha}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {cursadasDeLaComision.map((cursada) => {
                  const alumno = alumnoPorId.get(cursada.alumnoId)
                  const asistencias = asistenciasPorCursada!.get(cursada.id) ?? []
                  return (
                    <TableRow key={cursada.id}>
                      <TableCell>{alumno ? `${alumno.nombre} ${alumno.apellido}` : `Alumno #${cursada.alumnoId}`}</TableCell>
                      {fechasAsistencia.map((fecha) => {
                        const asistencia = asistencias.find((a) => a.fecha === fecha)
                        return (
                          <TableCell key={fecha}>
                            {asistencia ? badgeParaEstado(asistencia.estado) : "—"}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="calificaciones" className="space-y-4 rounded-lg border border-border bg-card p-4 text-sm text-foreground">
          <div className="flex justify-end">
            <NuevaInstanciaDialog cursadas={cursadasParaAsistencia} />
          </div>
          {cursadasDeLaComision === null || calificacionesPorCursada === null ? (
            <p className="text-destructive">No se pudo obtener las calificaciones. Intentá nuevamente más tarde.</p>
          ) : instancias.length === 0 ? (
            <p className="text-muted-foreground">Todavía no hay calificaciones registradas para esta comisión.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alumno</TableHead>
                  {instancias.map((instancia) => (
                    <TableHead key={instancia}>{instancia}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {cursadasDeLaComision.map((cursada) => {
                  const alumno = alumnoPorId.get(cursada.alumnoId)
                  const calificaciones = calificacionesPorCursada!.get(cursada.id) ?? []
                  return (
                    <TableRow key={cursada.id}>
                      <TableCell>{alumno ? `${alumno.nombre} ${alumno.apellido}` : `Alumno #${cursada.alumnoId}`}</TableCell>
                      {instancias.map((instancia) => {
                        const calificacion = calificaciones.find((c) => c.instancia === instancia)
                        return (
                          <TableCell key={instancia}>
                            <EditableNotaCell
                              cursadaId={cursada.id}
                              instancia={instancia}
                              initialNota={calificacion?.nota ?? null}
                              calificacionId={calificacion?.id}
                            />
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

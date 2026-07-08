import { fetchCore } from "@/lib/api-server"
import AgregarMateriaDialog from "@/components/planes/agregar-materia-dialog"
import EditarMateriaPlanDialog from "@/components/planes/editar-materia-plan-dialog"
import EliminarBoton from "@/components/shared/eliminar-boton"
import { deleteMateriaPlan } from "@/app/actions/materia-plan-actions"
import { etiquetaCuatrimestre } from "@/lib/cuatrimestre-carrera"

interface MateriaPlanResponse {
  id: number
  planEstudioId: number
  materiaId: number
  materiaNombre: string
  cuatrimestreDictado: number
  cargaHoraria: number
}

interface MateriaResponse {
  id: number
  nombre: string
  codigoInterno: string
  descripcion: string
  activa: boolean
}

export default async function PlanDetallePage({
  params,
}: {
  params: Promise<{ id: string; planId: string }>
}) {
  const { id, planId } = await params

  const [materiasPlan, materias] = await Promise.all([
    fetchCore<MateriaPlanResponse>("/materias-plan"),
    fetchCore<MateriaResponse>("/materias"),
  ])
  const delPlan = materiasPlan?.filter((mp) => String(mp.planEstudioId) === planId) ?? null

  const porCuatrimestre = delPlan?.reduce<Record<number, MateriaPlanResponse[]>>((acc, mp) => {
    acc[mp.cuatrimestreDictado] ??= []
    acc[mp.cuatrimestreDictado].push(mp)
    return acc
  }, {})

  const cuatrimestres = porCuatrimestre ? Object.keys(porCuatrimestre).map(Number).sort((a, b) => a - b) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Malla Curricular - Plan {planId}</h1>
          <p className="text-sm text-muted-foreground">Carrera {id}</p>
        </div>
        <AgregarMateriaDialog planId={Number(planId)} materiasDisponibles={materias ?? []} />
      </div>

      {delPlan === null ? (
        <p className="text-sm text-destructive">No se pudo obtener la malla curricular. Intentá nuevamente más tarde.</p>
      ) : delPlan.length === 0 ? (
        <p className="text-sm text-muted-foreground">Este plan de estudio no tiene materias asignadas.</p>
      ) : (
        <div className="space-y-4">
          {cuatrimestres.map((cuatrimestre) => (
            <div key={cuatrimestre} className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-2 text-sm font-semibold text-foreground">{etiquetaCuatrimestre(cuatrimestre)}</h2>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {porCuatrimestre![cuatrimestre].map((mp) => (
                  <li key={mp.id} className="flex items-center justify-between">
                    <span>
                      {mp.materiaNombre} <span className="text-xs">({mp.cargaHoraria}hs/semana)</span>
                    </span>
                    <div className="flex gap-1">
                      <EditarMateriaPlanDialog
                        materiaPlan={mp}
                        planId={Number(planId)}
                        materiasDisponibles={materias ?? []}
                      />
                      <EliminarBoton
                        accion={deleteMateriaPlan.bind(null, mp.id)}
                        entidadLabel={mp.materiaNombre}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

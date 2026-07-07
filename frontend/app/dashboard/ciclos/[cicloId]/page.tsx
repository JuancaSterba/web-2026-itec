import Link from "next/link"
import { fetchCore } from "@/lib/api-server"
import NuevoPeriodoDialog from "@/components/periodos/nuevo-periodo-dialog"
import EditarPeriodoDialog from "@/components/periodos/editar-periodo-dialog"
import EliminarBoton from "@/components/shared/eliminar-boton"
import { deletePeriodo } from "@/app/actions/periodo-actions"

interface CicloLectivoResponse {
  id: number
  anio: number
  fechaInicio: string
  fechaFin: string
  activo: boolean
}

interface PeriodoAcademicoResponse {
  id: number
  nombre: string
  fechaInicio: string
  fechaFin: string
  cicloLectivoId: number
}

export default async function CicloDetallePage({
  params,
}: {
  params: Promise<{ cicloId: string }>
}) {
  const { cicloId } = await params

  const [ciclos, periodos] = await Promise.all([
    fetchCore<CicloLectivoResponse>(`/ciclos-lectivos/${cicloId}`),
    fetchCore<PeriodoAcademicoResponse>("/periodos-academicos"),
  ])

  const ciclo = ciclos?.[0] ?? null
  const periodosDelCiclo = periodos?.filter((p) => String(p.cicloLectivoId) === cicloId) ?? null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Dashboard del Ciclo {ciclo?.anio ?? cicloId}
          </h1>
          <p className="text-sm text-muted-foreground">Períodos académicos de este ciclo lectivo</p>
        </div>
        <NuevoPeriodoDialog cicloId={Number(cicloId)} />
      </div>

      {periodosDelCiclo === null ? (
        <p className="text-sm text-destructive">No se pudo obtener los períodos académicos. Intentá nuevamente más tarde.</p>
      ) : periodosDelCiclo.length === 0 ? (
        <p className="text-sm text-muted-foreground">Este ciclo no tiene períodos académicos registrados.</p>
      ) : (
        <div className="space-y-2">
          {periodosDelCiclo.map((periodo) => (
            <div
              key={periodo.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:bg-accent"
            >
              <Link
                href={`/dashboard/ciclos/${cicloId}/periodos/${periodo.id}/comisiones`}
                className="flex-1 text-sm font-medium text-foreground"
              >
                {periodo.nombre}
              </Link>
              <div className="flex gap-1">
                <EditarPeriodoDialog periodo={periodo} cicloId={Number(cicloId)} />
                <EliminarBoton
                  accion={deletePeriodo.bind(null, periodo.id)}
                  entidadLabel={periodo.nombre}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

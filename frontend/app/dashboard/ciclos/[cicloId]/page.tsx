import Link from "next/link"
import { fetchCore } from "@/lib/api-server"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"

interface CicloLectivoResponse {
  id: number
  anio: number
  fechaInicio: string
  fechaFin: string
  activo: boolean
}

interface CarreraResponse {
  id: number
  nombre: string
  resolucionMinisterial: string
  activa: boolean
}

export default async function CicloDetallePage({
  params,
}: {
  params: Promise<{ cicloId: string }>
}) {
  const { cicloId } = await params

  const [ciclos, carreras] = await Promise.all([
    fetchCore<CicloLectivoResponse>(`/ciclos-lectivos/${cicloId}`),
    fetchCore<CarreraResponse>("/carreras"),
  ])

  const ciclo = ciclos?.[0] ?? null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">
          Dashboard del Ciclo {ciclo?.anio ?? cicloId}
        </h1>
        <p className="text-sm text-muted-foreground">Elegí una carrera para ver sus períodos académicos</p>
      </div>

      {carreras === null ? (
        <p className="text-sm text-destructive">No se pudo obtener el listado de carreras. Intentá nuevamente más tarde.</p>
      ) : carreras.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay carreras registradas.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {carreras.map((carrera) => (
            <Link key={carrera.id} href={`/dashboard/ciclos/${cicloId}/carreras/${carrera.id}`}>
              <Card className="h-full transition-colors hover:bg-accent">
                <CardHeader>
                  <CardTitle className="text-base">{carrera.nombre}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

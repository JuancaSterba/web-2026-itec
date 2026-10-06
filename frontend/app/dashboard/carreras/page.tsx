import Link from "next/link"
import { fetchCore } from "@/lib/api-server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import NuevaCarreraDialog from "@/components/carreras/nueva-carrera-dialog"
import EditarCarreraDialog from "@/components/carreras/editar-carrera-dialog"
import EliminarBoton from "@/components/shared/eliminar-boton"
import { deleteCarrera } from "@/app/actions/carrera-actions"

interface CarreraResponse {
  id: number
  nombre: string
  resolucionMinisterial: string
  cupoActual: number | null
  activa: boolean
}

export default async function CarrerasPage() {
  const carreras = await fetchCore<CarreraResponse>("/carreras")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Carreras</h1>
          <p className="text-sm text-muted-foreground">Seleccioná una carrera para ver sus planes de estudio</p>
        </div>
        <NuevaCarreraDialog />
      </div>

      {carreras === null ? (
        <p className="text-sm text-destructive">No se pudo obtener el listado de carreras. Intentá nuevamente más tarde.</p>
      ) : carreras.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay carreras registradas.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {carreras.map((carrera) => (
            <Link key={carrera.id} href={`/dashboard/carreras/${carrera.id}`}>
              <Card className="h-full transition-colors hover:bg-accent">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-base">{carrera.nombre}</CardTitle>
                    <CardDescription>
                      Resolución {carrera.resolucionMinisterial}
                      {carrera.cupoActual != null ? ` · Cupo ${carrera.cupoActual}` : ""}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <EditarCarreraDialog carrera={carrera} />
                    <EliminarBoton
                      accion={deleteCarrera.bind(null, carrera.id)}
                      entidadLabel={carrera.nombre}
                    />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

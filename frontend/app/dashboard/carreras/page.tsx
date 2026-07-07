import Link from "next/link"
import { fetchCore } from "@/lib/api-server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface CarreraResponse {
  id: number
  nombre: string
  resolucionMinisterial: string
  activa: boolean
}

export default async function CarrerasPage() {
  const carreras = await fetchCore<CarreraResponse>("/carreras")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Carreras</h1>
        <p className="text-sm text-muted-foreground">Seleccioná una carrera para ver sus planes de estudio</p>
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
                <CardHeader>
                  <CardTitle className="text-base">{carrera.nombre}</CardTitle>
                  <CardDescription>Resolución {carrera.resolucionMinisterial}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

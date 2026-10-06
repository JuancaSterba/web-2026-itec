import Link from "next/link"
import { fetchCore } from "@/lib/api-server"
import { getUsuarioActual } from "@/lib/auth-server"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import NuevoCicloDialog from "@/components/ciclos/nuevo-ciclo-dialog"
import EditarCicloDialog from "@/components/ciclos/editar-ciclo-dialog"
import EliminarBoton from "@/components/shared/eliminar-boton"
import { deleteCiclo } from "@/app/actions/ciclo-actions"

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
}

export default async function CiclosPage() {
  const [ciclos, carreras, usuario] = await Promise.all([
    fetchCore<CicloLectivoResponse>("/ciclos-lectivos"),
    fetchCore<CarreraResponse>("/carreras"),
    getUsuarioActual(),
  ])

  const isAdmin = usuario?.roles.includes("ADMIN") ?? false
  const ciclosAMostrar = ciclos?.filter((c) => c.activo || isAdmin) ?? null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Ciclos Lectivos</h1>
          <p className="text-sm text-muted-foreground">Seleccioná un ciclo para ver sus períodos académicos</p>
        </div>
        <NuevoCicloDialog carrerasDisponibles={(carreras ?? []).map((c) => ({ id: c.id, nombre: c.nombre }))} />
      </div>

      {ciclosAMostrar === null ? (
        <p className="text-sm text-destructive">No se pudo obtener el listado de ciclos lectivos. Intentá nuevamente más tarde.</p>
      ) : ciclosAMostrar.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay ciclos lectivos registrados o no tenés permisos para verlos.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ciclosAMostrar.map((ciclo) => {
            const card = (
              <Card className="h-full transition-colors hover:bg-accent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">Ciclo Lectivo {ciclo.anio}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Badge variant={ciclo.activo ? "default" : "secondary"}>
                      {ciclo.activo ? "Activo" : "Inactivo"}
                    </Badge>
                    <EditarCicloDialog ciclo={ciclo} />
                    <EliminarBoton
                      accion={deleteCiclo.bind(null, ciclo.id)}
                      entidadLabel={`Ciclo Lectivo ${ciclo.anio}`}
                    />
                  </div>
                </CardHeader>
              </Card>
            )

            return ciclo.activo ? (
              <Link key={ciclo.id} href={`/dashboard/ciclos/${ciclo.id}`}>
                {card}
              </Link>
            ) : (
              <div key={ciclo.id} className="opacity-75">
                {card}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

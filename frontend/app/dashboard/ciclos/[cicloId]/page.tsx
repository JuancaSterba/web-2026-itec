import Link from "next/link"

const periodosMock = [
  { id: "1", nombre: "1º Cuatrimestre" },
  { id: "2", nombre: "2º Cuatrimestre" },
]

export default async function CicloDetallePage({
  params,
}: {
  params: Promise<{ cicloId: string }>
}) {
  const { cicloId } = await params

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Dashboard del Ciclo {cicloId}</h1>
        <p className="text-sm text-muted-foreground">Períodos académicos de este ciclo lectivo</p>
      </div>

      <div className="space-y-2">
        {periodosMock.map((periodo) => (
          <Link
            key={periodo.id}
            href={`/dashboard/ciclos/${cicloId}/periodos/${periodo.id}/comisiones`}
            className="block rounded-lg border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent"
          >
            {periodo.nombre}
          </Link>
        ))}
      </div>
    </div>
  )
}

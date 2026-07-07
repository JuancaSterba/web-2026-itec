import Link from "next/link"

const planesMock = [{ id: "1", nombre: "Plan 2026" }]

export default async function CarreraDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Dashboard de la Carrera {id}</h1>
        <p className="text-sm text-muted-foreground">Planes de estudio asociados a esta carrera</p>
      </div>

      <div className="space-y-2">
        {planesMock.map((plan) => (
          <Link
            key={plan.id}
            href={`/dashboard/carreras/${id}/planes/${plan.id}`}
            className="block rounded-lg border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent"
          >
            {plan.nombre}
          </Link>
        ))}
      </div>
    </div>
  )
}

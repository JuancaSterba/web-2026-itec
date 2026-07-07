export default async function PlanDetallePage({
  params,
}: {
  params: Promise<{ id: string; planId: string }>
}) {
  const { id, planId } = await params

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Malla Curricular - Plan {planId}</h1>
        <p className="text-sm text-muted-foreground">Carrera {id}</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div>1º Cuatrimestre</div>
      </div>
    </div>
  )
}

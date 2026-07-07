import Link from "next/link"

export default function CiclosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Ciclos Lectivos</h1>
        <p className="text-sm text-muted-foreground">Seleccioná un ciclo para ver sus períodos académicos</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard/ciclos/2026"
          className="rounded-lg border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent"
        >
          Ciclo Lectivo 2026
        </Link>
      </div>
    </div>
  )
}

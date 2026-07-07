import Link from "next/link"

const comisionesMock = [
  { id: "1", nombre: "Comisión A - Programación I" },
  { id: "2", nombre: "Comisión B - Bases de Datos" },
]

export default async function OfertaAcademicaPage({
  params,
}: {
  params: Promise<{ cicloId: string; periodoId: string }>
}) {
  const { cicloId, periodoId } = await params

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Oferta Académica</h1>
        <p className="text-sm text-muted-foreground">
          Ciclo {cicloId} · Período {periodoId}
        </p>
      </div>

      <div className="space-y-2">
        {comisionesMock.map((comision) => (
          <Link
            key={comision.id}
            href={`/dashboard/comisiones/${comision.id}`}
            className="block rounded-lg border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent"
          >
            {comision.nombre}
          </Link>
        ))}
      </div>
    </div>
  )
}

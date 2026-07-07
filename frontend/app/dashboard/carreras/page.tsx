import Link from "next/link"

const carrerasMock = [
  { id: "1", nombre: "Desarrollo de Software" },
  { id: "2", nombre: "Redes y Telecomunicaciones" },
]

export default function CarrerasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Carreras</h1>
        <p className="text-sm text-muted-foreground">Seleccioná una carrera para ver sus planes de estudio</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {carrerasMock.map((carrera) => (
          <Link
            key={carrera.id}
            href={`/dashboard/carreras/${carrera.id}`}
            className="rounded-lg border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent"
          >
            {carrera.nombre}
          </Link>
        ))}
      </div>
    </div>
  )
}

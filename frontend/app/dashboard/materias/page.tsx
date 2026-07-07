import { fetchCore } from "@/lib/api-server"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import NuevaMateriaDialog from "@/components/materias/nueva-materia-dialog"

interface MateriaResponse {
  id: number
  nombre: string
  codigoInterno: string
  descripcion: string
  activa: boolean
}

export default async function MateriasPage() {
  const materias = await fetchCore<MateriaResponse>("/materias")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Catálogo de Materias</h1>
          <p className="text-sm text-muted-foreground">Materias activas registradas en el sistema</p>
        </div>
        <NuevaMateriaDialog />
      </div>

      {materias === null ? (
        <p className="text-sm text-destructive">
          No se pudo obtener el catálogo de materias. Intentá nuevamente más tarde.
        </p>
      ) : materias.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay materias registradas.</p>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Código Interno</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materias.map((materia) => (
                <TableRow key={materia.id}>
                  <TableCell>{materia.id}</TableCell>
                  <TableCell>{materia.nombre}</TableCell>
                  <TableCell>{materia.codigoInterno}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

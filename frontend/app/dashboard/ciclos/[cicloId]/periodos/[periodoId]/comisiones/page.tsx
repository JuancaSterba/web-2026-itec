import Link from "next/link"
import { fetchCore } from "@/lib/api-server"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import NuevaComisionDialog from "@/components/comisiones/nueva-comision-dialog"

interface ComisionResponse {
  id: number
  nombreComision: string
  cupoMaximo: number
  activa: boolean
  periodoAcademicoId: number
  materiaPlanId: number
}

interface MateriaPlanResponse {
  id: number
  planEstudioId: number
  materiaId: number
  materiaNombre: string
  cuatrimestreDictado: number
  cargaHoraria: number
}

export default async function OfertaAcademicaPage({
  params,
}: {
  params: Promise<{ cicloId: string; periodoId: string }>
}) {
  const { cicloId, periodoId } = await params

  const [comisiones, materiasPlan] = await Promise.all([
    fetchCore<ComisionResponse>("/comisiones"),
    fetchCore<MateriaPlanResponse>("/materias-plan"),
  ])

  const comisionesDelPeriodo = comisiones?.filter((c) => String(c.periodoAcademicoId) === periodoId) ?? null
  const materiaNombrePorId = new Map((materiasPlan ?? []).map((mp) => [mp.id, mp.materiaNombre]))
  const materiasPlanDisponibles = (materiasPlan ?? []).map((mp) => ({
    id: mp.id,
    etiqueta: `${mp.materiaNombre} (${mp.cuatrimestreDictado}º Cuatrimestre)`,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Oferta Académica</h1>
          <p className="text-sm text-muted-foreground">
            Ciclo {cicloId} · Período {periodoId}
          </p>
        </div>
        <NuevaComisionDialog periodoId={Number(periodoId)} materiasPlanDisponibles={materiasPlanDisponibles} />
      </div>

      {comisionesDelPeriodo === null ? (
        <p className="text-sm text-destructive">No se pudo obtener la oferta académica. Intentá nuevamente más tarde.</p>
      ) : comisionesDelPeriodo.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay comisiones registradas para este período.</p>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comisión</TableHead>
                <TableHead>Materia</TableHead>
                <TableHead>Cupo Máximo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comisionesDelPeriodo.map((comision) => (
                <TableRow key={comision.id} className="cursor-pointer">
                  <TableCell>
                    <Link href={`/dashboard/comisiones/${comision.id}`} className="font-medium hover:underline">
                      {comision.nombreComision}
                    </Link>
                  </TableCell>
                  <TableCell>{materiaNombrePorId.get(comision.materiaPlanId) ?? "—"}</TableCell>
                  <TableCell>{comision.cupoMaximo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

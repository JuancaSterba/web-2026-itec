"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Plus, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ExamenFormDialog } from "@/components/notas/examen-form-dialog"
import { NotasTable } from "@/components/notas/notas-table"
import { listarExamenes, type Examen } from "@/lib/services/notas.service"

// @radix-ui/react-select no esta instalado (ver ComisionFormDialog): select
// nativo con la misma estetica que Input.
const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-all duration-200 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"

interface ExamenesPanelProps {
  comisionId: number
}

export function ExamenesPanel({ comisionId }: ExamenesPanelProps) {
  const [examenes, setExamenes] = useState<Examen[]>([])
  const [loading, setLoading] = useState(true)
  const [examenId, setExamenId] = useState("")
  const [formOpen, setFormOpen] = useState(false)

  const cargarExamenes = () => {
    setLoading(true)
    listarExamenes()
      .then((data) => setExamenes(data.filter((e) => e.comisionId === comisionId)))
      .catch((err: any) => toast.error(err?.message || "No se pudieron cargar los exámenes"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setExamenId("")
    cargarExamenes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comisionId])

  const examenSeleccionado = useMemo(
    () => examenes.find((e) => e.id === Number(examenId)),
    [examenes, examenId]
  )

  const handleExamenCreado = (nuevo: Examen) => {
    setExamenes((prev) => [...prev, nuevo])
    setExamenId(String(nuevo.id))
  }

  return (
    <div className="space-y-6">
      <Card glass className="p-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="examen">Examen</Label>
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : examenes.length === 0 ? (
              <p className="flex h-10 items-center text-sm text-muted-foreground">
                Todavía no hay exámenes en esta comisión.
              </p>
            ) : (
              <select
                id="examen"
                value={examenId}
                onChange={(e) => setExamenId(e.target.value)}
                className={selectClassName}
              >
                <option value="">Seleccioná un examen</option>
                {examenes.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre} ({e.fecha})
                  </option>
                ))}
              </select>
            )}
          </div>
          <Button onClick={() => setFormOpen(true)} className="shrink-0">
            <Plus className="size-4" />
            Nuevo Examen
          </Button>
        </div>
      </Card>

      {!loading && examenes.length === 0 && (
        <Card>
          <div className="flex flex-col items-center gap-3 p-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FileText className="size-7" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-foreground">Todavía no hay exámenes</p>
              <p className="text-sm text-muted-foreground">
                Creá el primero (ej. &ldquo;Primer Parcial&rdquo;) para empezar a cargar notas.
              </p>
            </div>
            <Button onClick={() => setFormOpen(true)} className="mt-2">
              <Plus className="size-4" />
              Nuevo Examen
            </Button>
          </div>
        </Card>
      )}

      {examenSeleccionado && <NotasTable comisionId={comisionId} examenId={examenSeleccionado.id} />}

      <ExamenFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        comisionId={comisionId}
        onSuccess={handleExamenCreado}
      />
    </div>
  )
}

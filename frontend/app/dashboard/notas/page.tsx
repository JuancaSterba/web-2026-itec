"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { ClipboardList } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ExamenesPanel } from "@/components/notas/examenes-panel"
import { listarComisiones, type Comision } from "@/lib/services/comisiones.service"

// @radix-ui/react-select no esta instalado (ver ComisionFormDialog): select
// nativo con la misma estetica que Input.
const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-all duration-200 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"

export default function NotasPage() {
  const [comisiones, setComisiones] = useState<Comision[]>([])
  const [loadingComisiones, setLoadingComisiones] = useState(true)
  const [comisionId, setComisionId] = useState("")

  useEffect(() => {
    listarComisiones()
      .then(setComisiones)
      .catch((err: any) => toast.error(err?.message || "No se pudieron cargar las comisiones"))
      .finally(() => setLoadingComisiones(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Calificaciones</h1>
        <p className="text-sm text-muted-foreground">Exámenes y notas por comisión</p>
      </div>

      <Card glass className="p-4">
        <div className="max-w-sm space-y-2">
          <Label htmlFor="comision">Comisión</Label>
          <select
            id="comision"
            value={comisionId}
            onChange={(e) => setComisionId(e.target.value)}
            disabled={loadingComisiones}
            className={selectClassName}
          >
            <option value="">Seleccioná una comisión</option>
            {comisiones.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} — {c.materiaNombre}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {!comisionId ? (
        <Card>
          <div className="flex flex-col items-center gap-2 p-16 text-center">
            <ClipboardList className="size-8 text-muted-foreground" />
            <p className="font-medium text-foreground">Elegí una comisión</p>
            <p className="text-sm text-muted-foreground">
              Los exámenes y notas aparecen acá una vez que la seleccionás.
            </p>
          </div>
        </Card>
      ) : (
        <ExamenesPanel comisionId={Number(comisionId)} />
      )}
    </div>
  )
}

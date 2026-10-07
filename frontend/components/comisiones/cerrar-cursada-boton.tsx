"use client"

import { useState, useTransition } from "react"
import { unstable_rethrow } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cerrarCursada, previsualizarCierre } from "@/app/actions/cursada-actions"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { CondicionPreview } from "@/types/CondicionPreview"

const MOTIVOS_LIBRE = {
  ASISTENCIA: "no alcanzó el 70 % de asistencia",
  PROMEDIO: "el promedio de parciales es menor a 4",
}

function formatear(valor: number | null, sufijo = ""): string {
  return valor === null ? "—" : `${valor.toLocaleString("es-AR", { maximumFractionDigits: 2 })}${sufijo}`
}

// Antes de cerrar muestra la vista previa (condicion, asistencia y motivo de
// LIBRE, spec 002 RF-11/RF-23); los rechazos del backend van a toast.error
// (sin asistencias, ya cerrada, servicio caido: RF-12, RF-24).
export default function CerrarCursadaBoton({ cursadaId }: { cursadaId: number }) {
  const [isPending, startTransition] = useTransition()
  const [preview, setPreview] = useState<CondicionPreview | null>(null)

  function abrirVistaPrevia() {
    startTransition(async () => {
      try {
        const resultado = await previsualizarCierre(cursadaId)
        if (resultado.error) toast.error(resultado.error)
        else setPreview(resultado.preview)
      } catch (e) {
        unstable_rethrow(e)
        toast.error("No se pudo calcular la condición")
      }
    })
  }

  function confirmarCierre() {
    startTransition(async () => {
      try {
        const resultado = await cerrarCursada(cursadaId)
        if (resultado.error) {
          toast.error(resultado.error)
        } else {
          toast.success("Cursada cerrada")
        }
        setPreview(null)
      } catch (e) {
        unstable_rethrow(e)
        toast.error("No se pudo cerrar la cursada")
      }
    })
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={abrirVistaPrevia} disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
        {isPending ? "Calculando..." : "Cerrar cursada"}
      </Button>

      <AlertDialog open={preview !== null} onOpenChange={(abierto) => !abierto && setPreview(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar la cursada?</AlertDialogTitle>
            <AlertDialogDescription>
              Una vez cerrada, la condición no cambia aunque después se corrijan asistencias.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {preview && (
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">Asistencia</dt>
              <dd>{formatear(preview.porcentajeAsistencia, " %")}</dd>
              <dt className="text-muted-foreground">Promedio de parciales</dt>
              <dd>{formatear(preview.promedioParciales)}</dd>
              <dt className="text-muted-foreground">Condición final</dt>
              <dd className="font-medium">{preview.condicionFinal}</dd>
              {preview.motivoLibre && (
                <>
                  <dt className="text-muted-foreground">Motivo</dt>
                  <dd className="text-destructive">Libre porque {MOTIVOS_LIBRE[preview.motivoLibre]}</dd>
                </>
              )}
            </dl>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <Button type="button" onClick={confirmarCierre} disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Confirmar cierre
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

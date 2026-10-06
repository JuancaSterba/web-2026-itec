"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cerrarMesaExamen } from "@/app/actions/mesa-examen-actions"

interface CerrarActaButtonProps {
  mesaId: number
  estado: "PROGRAMADA" | "CERRADA"
}

export default function CerrarActaButton({ mesaId, estado }: CerrarActaButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  if (estado === "CERRADA") {
    return null
  }

  async function handleCerrar() {
    setIsLoading(true)
    setError(null)
    try {
      await cerrarMesaExamen(mesaId)
      setIsOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error al cerrar el acta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
          <Lock className="size-4" />
          Cerrar Acta
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Está seguro de cerrar el acta?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción es irreversible por defecto. 
            Calculará las notas definitivas, afectará el historial académico de los alumnos inscriptos
            y bloqueará futuras ediciones de notas para esta mesa de examen.
            Asegúrese de que el tribunal haya cargado todas las notas correctamente.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <Button variant="destructive" onClick={handleCerrar} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Sí, cerrar acta
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

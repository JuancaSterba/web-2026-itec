import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CursadasView() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Gestión de Cursadas</h1>
      <p>Listado de Comisiones Activas.</p>
      <Link href="/dashboard/comisiones/1">
        <Button>Ver Comisión de Prueba (ID: 1)</Button>
      </Link>
    </div>
  )
}

import { fetchCore } from "@/lib/api-server"
import { AdministradoresClientView } from "@/components/administradores/administradores-client-view"
import type { Administrador } from "@/lib/services/administradores.service"

export const dynamic = "force-dynamic"

export default async function AdministradoresPage() {
  const administradores = await fetchCore<Administrador[]>("/administradores").catch(() => [])

  return <AdministradoresClientView initialAdministradores={administradores ?? []} />
}

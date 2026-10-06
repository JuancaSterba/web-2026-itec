import { fetchCore } from "@/lib/api-server"
import { ProfesoresClientView } from "@/components/profesores/profesores-client-view"
import type { Profesor } from "@/lib/services/profesores.service"

export const dynamic = "force-dynamic"

export default async function ProfesoresPage() {
  const profesores = await fetchCore<Profesor[]>("/profesores").catch(() => [])

  return <ProfesoresClientView initialProfesores={profesores ?? []} />
}

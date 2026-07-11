import { fetchCore } from "@/lib/api-server"
import { AlumnosClientView } from "@/components/alumnos/alumnos-client-view"
import type { Alumno } from "@/lib/services/alumnos.service"

export const dynamic = "force-dynamic"

export default async function AlumnosPage() {
  const alumnos = await fetchCore<Alumno[]>("/alumnos").catch(() => [])

  return <AlumnosClientView initialAlumnos={alumnos ?? []} />
}

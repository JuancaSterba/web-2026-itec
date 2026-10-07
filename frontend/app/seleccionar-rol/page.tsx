import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SeleccionRol } from "@/components/auth/seleccion-rol"
import { getUsuarioActual } from "@/lib/auth-server"
import { RUTA_LOGIN } from "@/lib/sesion"

// Los roles salen de la sesion (cookie httpOnly), no del navegador (RF-07).
export default async function SeleccionarRolPage() {
  const usuario = await getUsuarioActual()
  if (!usuario) redirect(RUTA_LOGIN)

  return (
    <Card className="w-full max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle className="text-center">Seleccioná tu rol</CardTitle>
      </CardHeader>
      <CardContent>
        <SeleccionRol roles={usuario.roles} />
      </CardContent>
    </Card>
  )
}

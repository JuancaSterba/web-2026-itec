import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { fetchCore } from "@/lib/api-server"
import { getUsuarioActual } from "@/lib/auth-server"
import { RUTA_LOGIN } from "@/lib/sesion"
import type { Perfil } from "@/types/Perfil"

// Datos personales vigentes del Core (RF-11): el endpoint solo devuelve los
// del usuario de la sesion (RF-13). Roles y rol activo salen de la sesion (RF-12).
export default async function PerfilPage() {
  const usuario = await getUsuarioActual()
  if (!usuario) redirect(RUTA_LOGIN)

  const perfil = (await fetchCore<Perfil>("/perfil"))?.[0] ?? null

  const datos: [string, string | undefined][] = [
    ["Nombre", perfil?.nombre],
    ["Apellido", perfil?.apellido],
    ["DNI", perfil?.dni],
    ["Usuario", perfil?.username],
    ["Email", perfil?.email],
    ["Teléfono", perfil?.telefono],
  ]

  return (
    <div className="p-6">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Perfil del Usuario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {perfil ? (
            <dl className="space-y-2">
              {datos.map(([etiqueta, valor]) => (
                <div key={etiqueta}>
                  <dt className="text-sm text-muted-foreground">{etiqueta}</dt>
                  <dd>{valor || "—"}</dd>
                </div>
              ))}
            </dl>
          ) : (
            // RF-14: el error no cierra la sesion.
            <Alert variant="destructive">
              <AlertDescription>No se pudieron obtener tus datos. Intentá de nuevo más tarde.</AlertDescription>
            </Alert>
          )}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Roles</p>
            <div className="flex flex-wrap gap-2">
              {usuario.roles.map((rol) => (
                <Badge key={rol} variant={rol === usuario.rolActivo ? "default" : "outline"}>
                  {rol}
                  {rol === usuario.rolActivo && " (activo)"}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

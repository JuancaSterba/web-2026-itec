import { RequireRole } from "@/components/auth/require-role"
import { CatalogoView } from "@/components/academico/catalogo-view"

export default function CatalogoPage() {
  return (
    <RequireRole roles={["ADMIN", "ADMINISTRATIVO"]}>
      <CatalogoView />
    </RequireRole>
  )
}

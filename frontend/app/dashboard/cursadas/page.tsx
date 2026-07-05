import { RequireRole } from "@/components/auth/require-role"
import { CursadasView } from "@/components/academico/cursadas-view"

export default function CursadasPage() {
  return (
    <RequireRole roles={["ADMIN", "ADMINISTRATIVO"]}>
      <CursadasView />
    </RequireRole>
  )
}

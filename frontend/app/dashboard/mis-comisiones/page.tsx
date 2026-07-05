import { RequireRole } from "@/components/auth/require-role"
import { MisComisionesView } from "@/components/academico/mis-comisiones-view"

export default function MisComisionesPage() {
  return (
    <RequireRole roles={["PROFESOR"]}>
      <MisComisionesView />
    </RequireRole>
  )
}

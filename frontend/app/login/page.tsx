import { LoginForm } from "@/components/auth/login-form"

// Server Component: solo lee si se llego por una sesion vencida (RF-17).
// El formulario y el login viven en LoginForm + loginAction.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ motivo?: string }>
}) {
  const { motivo } = await searchParams
  return <LoginForm sesionExpirada={motivo === "expirada"} />
}

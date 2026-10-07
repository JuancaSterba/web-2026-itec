"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { LogIn, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loginAction } from "@/app/actions/auth-actions"

const AVISO_SESION_EXPIRADA = "Tu sesión expiró, volvé a iniciar sesión"

export function LoginForm({ sesionExpirada }: { sesionExpirada: boolean }) {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Con login correcto, loginAction guarda la cookie httpOnly y redirige; solo
  // vuelve si hubo error (RF-03, RF-04, RF-05).
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      try {
        const resultado = await loginAction({ error: null }, formData)
        if (resultado?.error) {
          setError(resultado.error)
          toast.error(resultado.error)
        }
      } catch (err) {
        console.error("Error login:", err)
        setError("No se pudo iniciar sesión. Intentá de nuevo.")
      }
    })
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Card glass className="w-full max-w-sm">
        <CardHeader>
          <Link
            href="/"
            className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Volver al inicio
          </Link>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="w-5 h-5" />
            Iniciar Sesión
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sesionExpirada && !error && (
            <Alert className="mb-4">
              <AlertDescription>{AVISO_SESION_EXPIRADA}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Usuario</Label>
              <Input id="username" name="username" autoComplete="username" required disabled={isPending} />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  disabled={isPending}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-3 flex items-center"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label="Mostrar/ocultar contraseña"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isPending ? "Ingresando..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

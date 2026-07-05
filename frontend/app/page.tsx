import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import Link from "next/link"
import { ArrowRight, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")

  if (token) {
    redirect("/dashboard")
  }

  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-background px-6 py-24">
      {/* Firma visual: tierra colorada + selva misionera, la vista aerea de la provincia */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[32rem] w-[32rem] animate-blob rounded-full bg-clay/25 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-[36rem] w-[36rem] animate-blob-delayed rounded-full bg-selva/25 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-16 text-center">
        <div className="flex animate-fadeIn flex-col items-center gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground backdrop-blur">
            <GraduationCap className="size-3.5" />
            Instituto Técnico 1 Misiones
          </span>

          <h1 className="text-balance font-display text-5xl font-semibold tracking-tight text-foreground sm:text-6xl md:text-7xl">
            Backoffice <span className="text-gradient-brand">Académico</span>
          </h1>

          <p className="max-w-xl text-balance text-lg text-muted-foreground">
            Alumnos, comisiones, asistencias y calificaciones de toda la
            institución, en un solo lugar.
          </p>

          <Button asChild size="lg" className="mt-2">
            <Link href="/login">
              Ingresar al Sistema
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

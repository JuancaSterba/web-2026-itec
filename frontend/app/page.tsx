import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import Link from "next/link"
import { ArrowRight, GraduationCap, Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
              Iniciar sesión
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <Card glass className="w-full max-w-md text-left animate-fadeIn [animation-delay:150ms]">
          <CardHeader>
            <CardTitle>Buscar alumno</CardTitle>
            <CardDescription>Vista previa del sistema de diseño</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Nombre, DNI o legajo..." className="pl-9" />
            </div>
            <div className="flex items-center gap-2">
              <Button className="flex-1">Buscar</Button>
              <Button variant="outline" className="flex-1">
                Ver todos
              </Button>
              <Button variant="ghost" size="icon" aria-label="Filtros">
                <SlidersHorizontal className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

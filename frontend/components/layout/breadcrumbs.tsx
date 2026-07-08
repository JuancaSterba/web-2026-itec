"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

function formatLabel(segment: string) {
  const decoded = decodeURIComponent(segment)
  if (/^\d+$/.test(decoded)) return `#${decoded}`
  return decoded
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// Paths puramente estructurales, sin page.tsx propio (URL scaffolding para
// llegar a una ruta dinamica hija, pero sin lista propia en ese nivel).
// Clickearlos da 404, asi que se renderizan como texto en vez de Link.
// Matchean el path COMPLETO hasta ese segmento (no solo el nombre del
// segmento) porque el mismo nombre puede ser navegable en un contexto y
// no en otro -- ej "carreras" es real en /dashboard/carreras/1, pero no
// existe /dashboard/ciclos/5/carreras (esa lista vive en /ciclos/5 mismo).
const RUTAS_NO_NAVEGABLES = [
  /^\/dashboard\/ciclos\/[^/]+\/carreras$/,
  /^\/dashboard\/ciclos\/[^/]+\/carreras\/[^/]+\/periodos$/,
  /^\/dashboard\/ciclos\/[^/]+\/carreras\/[^/]+\/periodos\/[^/]+$/,
  /^\/dashboard\/carreras\/[^/]+\/planes$/,
  /^\/dashboard\/comisiones$/,
]

export default function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0) return null

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    return {
      label: formatLabel(segment),
      href,
      navegable: !RUTAS_NO_NAVEGABLES.some((patron) => patron.test(href)),
    }
  })

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 px-6 pt-4 text-sm text-muted-foreground">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1
        return (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="size-3.5 shrink-0" />}
            {isLast || !crumb.navegable ? (
              <span className={cn(isLast && "font-medium text-foreground")}>{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="transition-colors hover:text-foreground">
                {crumb.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}

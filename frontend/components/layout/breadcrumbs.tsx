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

// Segmentos de URL puramente estructurales, sin page.tsx propio
// (ej: /ciclos/[id]/periodos/ no existe, solo /periodos/[periodoId]/comisiones).
// Clickearlos da 404, asi que no se renderizan como Link.
const SEGMENTOS_NO_NAVEGABLES = new Set(["periodos", "planes"])

export default function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0) return null

  const crumbs = segments.map((segment, index) => {
    const anterior = segments[index - 1]
    return {
      label: formatLabel(segment),
      href: "/" + segments.slice(0, index + 1).join("/"),
      navegable: !SEGMENTOS_NO_NAVEGABLES.has(segment) && anterior !== "periodos",
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

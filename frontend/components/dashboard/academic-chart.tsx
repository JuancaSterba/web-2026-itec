"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const bars = [
  { label: "Mar", value: 62 },
  { label: "Abr", value: 74 },
  { label: "May", value: 58 },
  { label: "Jun", value: 81 },
  { label: "Jul", value: 69 },
  { label: "Ago", value: 88 },
]

export default function AcademicChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rendimiento Académico</CardTitle>
        <CardDescription>Promedio de notas por mes · datos de muestra</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-64 items-end justify-between gap-3 px-2">
          {bars.map((bar) => (
            <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-clay to-selva opacity-90 transition-all duration-500 hover:opacity-100"
                style={{ height: `${bar.value}%` }}
              />
              <span className="text-xs font-medium text-muted-foreground">{bar.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

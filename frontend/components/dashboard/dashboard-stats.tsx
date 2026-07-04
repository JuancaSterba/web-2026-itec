"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, Calendar, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

type ChangeType = "positive" | "negative" | "neutral"

const stats: { title: string; value: string; change: string; changeType: ChangeType; icon: typeof Users; accent: string }[] = [
  {
    title: "Alumnos Activos",
    value: "1.234",
    change: "+12%",
    changeType: "positive" as const,
    icon: Users,
    accent: "bg-primary/10 text-primary",
  },
  {
    title: "Profesores Activos",
    value: "89",
    change: "+3%",
    changeType: "positive" as const,
    icon: GraduationCap,
    accent: "bg-secondary/10 text-secondary",
  },
  {
    title: "Comisiones en Curso",
    value: "45",
    change: "0%",
    changeType: "neutral" as const,
    icon: Calendar,
    accent: "bg-muted text-[hsl(var(--chart-3))]",
  },
  {
    title: "Promedio General",
    value: "7,8",
    change: "+0.2",
    changeType: "positive" as const,
    icon: TrendingUp,
    accent: "bg-muted text-[hsl(var(--chart-4))]",
  },
]

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="transition-shadow hover:shadow-glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <div className={cn("flex size-9 items-center justify-center rounded-full", stat.accent)}>
              <stat.icon className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl font-semibold text-foreground">{stat.value}</div>
            <p
              className={cn(
                "text-xs",
                stat.changeType === "positive" && "text-secondary",
                stat.changeType === "negative" && "text-destructive",
                stat.changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {stat.change} desde el mes pasado
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

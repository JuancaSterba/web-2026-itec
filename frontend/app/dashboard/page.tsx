// import DashboardStats from "@/components/dashboard/dashboard-stats" // oculto: KPIs mockeados, PENDIENTES.md Prioridad 1
import RecentActivity from "@/components/dashboard/recent-activity"
import AcademicChart from "@/components/dashboard/academic-chart"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resumen general de la institución</p>
      </div>

      {/* <DashboardStats /> oculto: KPIs mockeados, PENDIENTES.md Prioridad 1 */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AcademicChart />
        <RecentActivity />
      </div>
    </div>
  )
}

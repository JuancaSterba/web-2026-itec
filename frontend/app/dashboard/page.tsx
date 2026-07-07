// import DashboardStats from "@/components/dashboard/dashboard-stats" // oculto: KPIs mockeados, PENDIENTES.md Prioridad 1
// import RecentActivity from "@/components/dashboard/recent-activity" // oculto: datos mockeados, PENDIENTES.md Prioridad 1
// import AcademicChart from "@/components/dashboard/academic-chart" // oculto: datos mockeados, PENDIENTES.md Prioridad 1

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resumen general de la institución</p>
      </div>

      {/* <DashboardStats /> oculto: KPIs mockeados, PENDIENTES.md Prioridad 1 */}
      {/* <AcademicChart /> / <RecentActivity /> ocultos: datos mockeados, PENDIENTES.md Prioridad 1 */}
    </div>
  )
}

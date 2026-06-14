import DashboardStats from "@/components/dashboard/dashboard-stats"
import RecentActivity from "@/components/dashboard/recent-activity"
import AcademicChart from "@/components/dashboard/academic-chart"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AcademicChart />
        <RecentActivity />
      </div>
    </div>
  )
}

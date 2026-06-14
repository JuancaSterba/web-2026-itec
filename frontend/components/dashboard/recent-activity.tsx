import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const activities = [
  {
    id: 1,
    action: "Nuevo alumno registrado",
    user: "Juan Pérez",
    time: "Hace 2 horas",
    type: "success",
  },
  {
    id: 2,
    action: "Calificación actualizada",
    user: "Prof. García",
    time: "Hace 4 horas",
    type: "info",
  },
  {
    id: 3,
    action: "Asistencia registrada",
    user: "Prof. López",
    time: "Hace 6 horas",
    type: "info",
  },
  {
    id: 4,
    action: "Materia creada",
    user: "Admin",
    time: "Hace 1 día",
    type: "success",
  },
]

export default function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4">
              <Badge variant={activity.type === "success" ? "default" : "secondary"}>
                {activity.type === "success" ? "Nuevo" : "Actualización"}
              </Badge>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{activity.action}</p>
                <p className="text-xs text-gray-500">por {activity.user}</p>
              </div>
              <div className="text-xs text-gray-400">{activity.time}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

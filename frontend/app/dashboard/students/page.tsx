import StudentsTable from "@/components/students/students-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Alumnos</h1>
          <p className="text-gray-600">Administre los alumnos del instituto</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Alumno
        </Button>
      </div>

      <StudentsTable />
    </div>
  )
}

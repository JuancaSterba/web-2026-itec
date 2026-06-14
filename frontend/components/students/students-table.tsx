"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Edit, Trash2, Eye } from "lucide-react"
import type { Student } from "@/lib/types"

// Mock data para desarrollo
const mockStudents: Student[] = [
  {
    id: 1,
    name: "Juan Pérez",
    dni: "12345678",
    email: "juan.perez@email.com",
    phone: "1234567890",
    enrollmentDate: "2024-03-01",
    status: "ACTIVE",
    academicStatus: "REGULAR",
  },
  {
    id: 2,
    name: "María García",
    dni: "87654321",
    email: "maria.garcia@email.com",
    phone: "0987654321",
    enrollmentDate: "2024-03-01",
    status: "ACTIVE",
    academicStatus: "IRREGULAR",
  },
  {
    id: 3,
    name: "Carlos López",
    dni: "11223344",
    email: "carlos.lopez@email.com",
    phone: "1122334455",
    enrollmentDate: "2024-02-15",
    status: "INACTIVE",
    academicStatus: "REGULAR",
  },
]

export default function StudentsTable() {
  const [students, setStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setStudents(mockStudents)
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.dni.includes(searchTerm) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando alumnos...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Alumnos</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por nombre, DNI o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Nombre</th>
                <th className="text-left p-2">DNI</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Teléfono</th>
                <th className="text-left p-2">Estado</th>
                <th className="text-left p-2">Estado Académico</th>
                <th className="text-left p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{student.name}</td>
                  <td className="p-2">{student.dni}</td>
                  <td className="p-2">{student.email}</td>
                  <td className="p-2">{student.phone}</td>
                  <td className="p-2">
                    <Badge variant={student.status === "ACTIVE" ? "default" : "secondary"}>
                      {student.status === "ACTIVE" ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="p-2">
                    <Badge variant={student.academicStatus === "REGULAR" ? "default" : "destructive"}>
                      {student.academicStatus === "REGULAR" ? "Regular" : "Irregular"}
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

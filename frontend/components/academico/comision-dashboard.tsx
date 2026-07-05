"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ComisionDashboard({ comisionId }: { comisionId: string }) {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">Comisión {comisionId}</h1>
        <p className="text-muted-foreground">Materia: Programación I | Profesor: Juan Pérez</p>
      </div>

      <Tabs defaultValue="alumnos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alumnos">Alumnos Inscriptos</TabsTrigger>
          <TabsTrigger value="notas">Exámenes y Notas</TabsTrigger>
          <TabsTrigger value="asistencias">Asistencias</TabsTrigger>
        </TabsList>
        <TabsContent value="alumnos">
          <div className="p-4 border rounded-md mt-4">Lista de Alumnos</div>
        </TabsContent>
        <TabsContent value="notas">
          <div className="p-4 border rounded-md mt-4">Gestión de Notas</div>
        </TabsContent>
        <TabsContent value="asistencias">
          <div className="p-4 border rounded-md mt-4">Toma de Asistencia</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

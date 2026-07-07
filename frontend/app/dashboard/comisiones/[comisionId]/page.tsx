import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const alumnosMock = ["Juan Pérez", "María López", "Carlos Gómez"]

export default async function ComisionDetallePage({
  params,
}: {
  params: Promise<{ comisionId: string }>
}) {
  const { comisionId } = await params

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Dashboard de Comisión {comisionId}</h1>
        <p className="text-sm text-muted-foreground">Gestión operativa de la cursada</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">Información General</TabsTrigger>
          <TabsTrigger value="alumnos">Alumnos Inscritos</TabsTrigger>
          <TabsTrigger value="asistencias">Asistencias</TabsTrigger>
          <TabsTrigger value="calificaciones">Calificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="rounded-lg border border-border bg-card p-4 text-sm text-foreground">
          <p>Horarios: Lunes y Miércoles 18:00 - 21:00</p>
          <p>Profesor: Ana Rodríguez</p>
        </TabsContent>

        <TabsContent value="alumnos" className="rounded-lg border border-border bg-card p-4 text-sm text-foreground">
          <ul className="space-y-1">
            {alumnosMock.map((alumno) => (
              <li key={alumno}>{alumno}</li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="asistencias" className="rounded-lg border border-border bg-card p-4 text-sm text-foreground">
          Aquí irá la grilla de presentismo
        </TabsContent>

        <TabsContent value="calificaciones" className="rounded-lg border border-border bg-card p-4 text-sm text-foreground">
          Aquí irá la grilla de notas
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { obtenerComisionPorId, type Comision } from "@/lib/services/comisiones.service"
import { listarMaterias, type Materia } from "@/lib/services/materias.service"
import { listarPlanesEstudio, type PlanEstudio } from "@/lib/services/planes-estudio.service"
import { RosterComisionView } from "@/components/comisiones/roster-comision-view"

export function ComisionDashboard({ comisionId }: { comisionId: string }) {
  const [comision, setComision] = useState<Comision | null>(null)
  const [carreraId, setCarreraId] = useState<number | null>(null)
  const [carreraNombre, setCarreraNombre] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = Number(comisionId)

    setLoading(true)
    Promise.all([obtenerComisionPorId(id), listarMaterias(), listarPlanesEstudio()])
      .then(([comisionData, materias, planes]) => {
        setComision(comisionData)

        const materia = materias.find((m: Materia) => m.id === comisionData.materiaId)
        const plan = materia ? planes.find((p: PlanEstudio) => p.id === materia.planEstudioId) : undefined
        if (plan) {
          setCarreraId(plan.carreraId)
          setCarreraNombre(plan.carreraNombre)
        }
      })
      .catch((err: any) => {
        toast.error(err?.message || "No se pudo cargar la comisión")
      })
      .finally(() => setLoading(false))
  }, [comisionId])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Cargando comisión...
      </div>
    )
  }

  if (!comision) {
    return <p className="py-16 text-center text-sm text-muted-foreground">No se encontró la comisión.</p>
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">{comision.nombre}</h1>
        <p className="text-muted-foreground">
          Materia: {comision.materiaNombre}
          {carreraNombre && <> | Carrera: {carreraNombre}</>} | Profesor: {comision.profesorNombre}{" "}
          {comision.profesorApellido} | Cuatrimestre: {comision.cuatrimestreAnio} - {comision.cuatrimestreNumero}°
        </p>
      </div>

      <Tabs defaultValue="alumnos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alumnos">Alumnos Inscriptos</TabsTrigger>
          <TabsTrigger value="notas">Exámenes y Notas</TabsTrigger>
          <TabsTrigger value="asistencias">Asistencias</TabsTrigger>
        </TabsList>
        <TabsContent value="alumnos">
          <RosterComisionView comisionId={comision.id} carreraId={carreraId} carreraNombre={carreraNombre} />
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

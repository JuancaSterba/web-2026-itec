"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CarrerasView } from "@/components/catalogo/carreras-view"
import { PlanesEstudioView } from "@/components/catalogo/planes-estudio-view"
import { MateriasView } from "@/components/catalogo/materias-view"
import { CuatrimestresView } from "@/components/catalogo/cuatrimestres-view"

export function CatalogoView() {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="font-display text-3xl font-semibold text-foreground">Catálogo Académico</h1>
        <p className="text-muted-foreground">Carreras, planes de estudio, materias y cuatrimestres</p>
      </div>

      <Tabs defaultValue="carreras" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="carreras">Carreras</TabsTrigger>
          <TabsTrigger value="planes">Planes de Estudio</TabsTrigger>
          <TabsTrigger value="materias">Materias</TabsTrigger>
          <TabsTrigger value="cuatrimestres">Cuatrimestres</TabsTrigger>
        </TabsList>
        <TabsContent value="carreras" className="mt-4">
          <CarrerasView />
        </TabsContent>
        <TabsContent value="planes" className="mt-4">
          <PlanesEstudioView />
        </TabsContent>
        <TabsContent value="materias" className="mt-4">
          <MateriasView />
        </TabsContent>
        <TabsContent value="cuatrimestres" className="mt-4">
          <CuatrimestresView />
        </TabsContent>
      </Tabs>
    </div>
  )
}

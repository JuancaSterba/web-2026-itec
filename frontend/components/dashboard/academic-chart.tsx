"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AcademicChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rendimiento Académico</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>Gráfico de rendimiento académico</p>
            <p className="text-sm">Integración con biblioteca de gráficos pendiente</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

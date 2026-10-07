import { unstable_rethrow } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"
import { fetchApi } from "@/lib/api-server"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: mesaId } = await context.params

  try {
    const response = await fetchApi(`/api/v1/mesas-examen/${mesaId}/acta-pdf`, { method: "GET" })

    if (!response.ok) {
      return new NextResponse("Error al generar el acta PDF", { status: response.status })
    }

    const pdfBlob = await response.blob()

    const headers = new Headers()
    headers.set("Content-Type", "application/pdf")
    headers.set("Content-Disposition", `attachment; filename="acta_mesa_${mesaId}.pdf"`)

    return new NextResponse(pdfBlob, {
      status: 200,
      headers,
    })
  } catch (error) {
    // Deja pasar el redirect al login con la sesion vencida (fetchApi).
    unstable_rethrow(error)
    console.error("Error proxying PDF request:", error)
    return new NextResponse("Error interno del servidor", { status: 500 })
  }
}

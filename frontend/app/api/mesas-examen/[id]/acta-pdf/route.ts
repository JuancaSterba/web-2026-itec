import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

function getApiBaseUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const mesaId = params.id
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/core/mesas-examen/${mesaId}/acta-pdf`, {
      method: "GET",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

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
    console.error("Error proxying PDF request:", error)
    return new NextResponse("Error interno del servidor", { status: 500 })
  }
}

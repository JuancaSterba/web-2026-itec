"use server"

import { fetchApi } from "@/lib/api-server"
import type { CondicionPreview } from "@/types/CondicionPreview"
import { revalidatePath } from "next/cache"

export async function createCursada(formData: FormData, comisionId: number) {
  const payload = {
    alumnoId: Number(formData.get("alumnoId")),
    comisionId,
    fechaInscripcion: new Date().toISOString().slice(0, 10),
    condicionFinal: "REGULAR",
  }

  const response = await fetchApi(`/api/v1/cursadas`, {
    method: "POST",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.errors?.[0]?.description ?? "No se pudo matricular al alumno")
  }

  revalidatePath("/dashboard/comisiones/[comisionId]", "page")
}

export async function createCursadasMasivas(alumnoId: number, comisionIds: number[]) {
  const fechaInscripcion = new Date().toISOString().slice(0, 10)

  const respuestas = await Promise.all(
    comisionIds.map((comisionId) =>
      fetchApi(`/api/v1/cursadas`, {
        method: "POST",
        body: JSON.stringify({ alumnoId, comisionId, fechaInscripcion, condicionFinal: "REGULAR" }),
      })
    )
  )

  const fallidas = respuestas.filter((response) => !response.ok)
  if (fallidas.length > 0) {
    const cuerpos = await Promise.all(fallidas.map((r) => r.json().catch(() => null)))
    const mensajes = cuerpos.map((b) => b?.errors?.[0]?.description).filter(Boolean)
    throw new Error(
      mensajes.length > 0
        ? mensajes.join(" / ")
        : "No se pudo matricular al alumno en todas las comisiones del cuatrimestre"
    )
  }

  revalidatePath("/dashboard/ciclos/[cicloId]/carreras/[carreraId]/periodos/[periodoId]/comisiones", "page")
}

export async function updateCursada(formData: FormData, cursadaId: number, alumnoId: number, comisionId: number) {
  const notaCierreRaw = formData.get("notaCierre")

  const payload = {
    alumnoId,
    comisionId,
    condicionFinal: formData.get("condicionFinal"),
    notaCierre: notaCierreRaw ? Number(notaCierreRaw) : null,
  }

  const response = await fetchApi(`/api/v1/cursadas/${cursadaId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo actualizar la cursada")
  }

  revalidatePath("/dashboard/comisiones/[comisionId]", "page")
}

async function mensajeDeError(response: Response, porDefecto: string): Promise<string> {
  const body = await response.json().catch(() => null)
  return body?.errors?.[0]?.description ?? porDefecto
}

// Vista previa del cierre: condicion, porcentaje de asistencia y motivo de
// LIBRE (spec 002, RF-11, RF-23). Devuelve el error del backend en vez de
// lanzarlo: en produccion Next oculta el mensaje de los errores lanzados.
export async function previsualizarCierre(
  cursadaId: number
): Promise<{ preview: CondicionPreview | null; error: string | null }> {
  const response = await fetchApi(`/api/v1/cursadas/${cursadaId}/condicion-preview`)

  if (!response.ok) {
    return { preview: null, error: await mensajeDeError(response, "No se pudo calcular la condición") }
  }

  const json = await response.json()
  return { preview: (json?.data?.[0] as CondicionPreview) ?? null, error: null }
}

// Errores del cierre (sin asistencias, ya cerrada, servicio caido) vuelven
// como texto para mostrarlos con toast.error (RF-12, RF-24).
export async function cerrarCursada(cursadaId: number): Promise<{ error: string | null }> {
  const response = await fetchApi(`/api/v1/cursadas/${cursadaId}/cerrar`, {
    method: "POST",
  })

  if (!response.ok) {
    return { error: await mensajeDeError(response, "No se pudo cerrar la cursada") }
  }

  revalidatePath("/dashboard/comisiones/[comisionId]", "page")
  return { error: null }
}

export async function deleteCursada(cursadaId: number) {
  const response = await fetchApi(`/api/v1/cursadas/${cursadaId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("No se pudo dar de baja la cursada")
  }

  revalidatePath("/dashboard/comisiones/[comisionId]", "page")
}

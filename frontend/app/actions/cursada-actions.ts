"use server"

import { fetchApi } from "@/lib/api-server"
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

export async function cerrarCursada(cursadaId: number) {
  const response = await fetchApi(`/api/v1/cursadas/${cursadaId}/cerrar`, {
    method: "POST",
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.errors?.[0]?.description ?? "No se pudo cerrar la cursada")
  }

  revalidatePath("/dashboard/comisiones/[comisionId]", "page")
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

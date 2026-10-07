"use server"

import { revalidatePath } from "next/cache"
import { fetchApi, fetchCore } from "@/lib/api-server"

interface HorarioClaseDeComision {
  diaSemana: string
}

const DIAS_SEMANA_JS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]

// new Date("YYYY-MM-DD") interpreta la fecha en UTC; getDay() la reinterpretaria
// en la zona horaria local y podria correr el dia. Se arma en UTC de punta a punta.
function diaSemanaDe(fecha: string): string {
  const [anio, mes, dia] = fecha.split("-").map(Number)
  return DIAS_SEMANA_JS[new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay()]
}

export async function saveAsistenciasMasivas(
  comisionId: number,
  fecha: string,
  registros: { cursadaId: number; estado: string; asistenciaId?: number }[]
) {
  // Chequeo previo: evita disparar un PUT/POST por cada alumno (y repetir el
  // mismo error una vez por alumno) cuando la fecha ya de entrada no coincide
  // con ningun horario de la comision. Si el fetch falla (null), no bloquea:
  // que decida el backend por request, como antes.
  const horarios = await fetchCore<HorarioClaseDeComision>(`/horarios/comision/${comisionId}`)
  if (horarios !== null && !horarios.some((h) => h.diaSemana === diaSemanaDe(fecha))) {
    return { error: "La fecha no coincide con ningún día de clase de la comisión" }
  }

  const respuestas = await Promise.all(
    registros.map((registro) => {
      const url = registro.asistenciaId
        ? `/api/v1/asistencias/${registro.asistenciaId}`
        : `/api/v1/asistencias`
      return fetchApi(url, {
        method: registro.asistenciaId ? "PUT" : "POST",
        body: JSON.stringify({ cursadaId: registro.cursadaId, comisionId, fecha, estado: registro.estado }),
      })
    })
  )

  if (respuestas.some((response) => !response.ok)) {
    const cuerpos = await Promise.all(
      respuestas.filter((r) => !r.ok).map((r) => r.json().catch(() => null))
    )
    const mensajes = Array.from(new Set(cuerpos.map((b) => b?.errors?.[0]?.description).filter(Boolean)))
    return {
      error: mensajes.length > 0 ? mensajes.join(" / ") : "No se pudo guardar la lista de asistencias completa",
    }
  }

  revalidatePath("/dashboard/comisiones/[comisionId]", "page")
  return { success: true }
}

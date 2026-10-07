// lib/asistencia.ts
// Regularidad por asistencia (spec 002): el calculo vive en ms-asistencias;
// aca solo se pide el resumen y se arma el texto para mostrarlo.
import { fetchGateway } from "@/lib/api-server"
import type { EstadoRegularidad, ResumenAsistencia } from "@/types/ResumenAsistencia"

export const SIN_REGISTROS = "Sin registros"

// Un resumen por cursada, indexado por cursadaId. Sin cursadas no consulta.
// null si el servicio no respondio (la pantalla muestra el resto igual).
export async function fetchResumenAsistencia(
  cursadaIds: number[]
): Promise<Map<number, ResumenAsistencia> | null> {
  if (cursadaIds.length === 0) return new Map()
  const resumenes = await fetchGateway<ResumenAsistencia>(
    `/api/v1/asistencias/resumen?cursadaIds=${cursadaIds.join(",")}`
  )
  if (!resumenes) return null
  return new Map(resumenes.map((r) => [r.cursadaId, r]))
}

export function formatearPorcentaje(resumen: ResumenAsistencia | undefined): string {
  if (!resumen || resumen.porcentaje === null) return SIN_REGISTROS // RF-08
  return `${resumen.porcentaje.toLocaleString("es-AR", { maximumFractionDigits: 1 })} %`
}

export function etiquetaEstado(estado: EstadoRegularidad | undefined): string {
  if (estado === "REGULAR") return "Regular"
  if (estado === "NO_REGULAR") return "No regular"
  return SIN_REGISTROS
}

export function varianteEstado(estado: EstadoRegularidad | undefined): "default" | "destructive" | "outline" {
  if (estado === "REGULAR") return "default"
  if (estado === "NO_REGULAR") return "destructive"
  return "outline"
}

// Espejo de CondicionPreviewResponse (Core): vista previa del cierre de una cursada.
import type { EstadoRegularidad } from "@/types/ResumenAsistencia"

export interface CondicionPreview {
  cursadaId: number
  // null si queda LIBRE por asistencia sin los 3 parciales.
  promedioParciales: number | null
  condicionFinal: "LIBRE" | "REGULAR" | "PROMOCIONADA" | "APROBADA"
  notaCierre: number | null
  porcentajeAsistencia: number | null
  estadoAsistencia: EstadoRegularidad
  motivoLibre: "ASISTENCIA" | "PROMEDIO" | null
}

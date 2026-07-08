// MateriaPlan.cuatrimestreDictado sigue siendo un entero secuencial 1..N en
// el backend (sin cambios de modelo), pero se carga/muestra como Año +
// Cuatrimestre del año (asumiendo 2 cuatrimestres por año, calendario
// estandar). anio=1,cuat=1 -> 1; anio=1,cuat=2 -> 2; anio=2,cuat=1 -> 3; etc.
export function calcularCuatrimestreDictado(anio: number, cuatrimestreDelAnio: number): number {
  return (anio - 1) * 2 + cuatrimestreDelAnio
}

export function anioYCuatrimestre(cuatrimestreDictado: number): { anio: number; cuatrimestreDelAnio: number } {
  const anio = Math.ceil(cuatrimestreDictado / 2)
  const cuatrimestreDelAnio = cuatrimestreDictado % 2 === 0 ? 2 : 1
  return { anio, cuatrimestreDelAnio }
}

export function etiquetaCuatrimestre(cuatrimestreDictado: number): string {
  const { anio, cuatrimestreDelAnio } = anioYCuatrimestre(cuatrimestreDictado)
  return `${anio}º Año - ${cuatrimestreDelAnio}º Cuatrimestre`
}

export const LIMITE_BAJO_STOCK = 10;

export function obtenerEstadoStock(stock: number): string {
  if (stock === 0) {
    return "Sin stock";
  }

  if (stock <= LIMITE_BAJO_STOCK) {
    return "Bajo stock";
  }

  return "Disponible";
}

export function obtenerClaseEstado(stock: number): string {
  if (stock === 0) {
    return "estado sin-stock";
  }

  if (stock <= LIMITE_BAJO_STOCK) {
    return "estado bajo-stock";
  }

  return "estado disponible";
}

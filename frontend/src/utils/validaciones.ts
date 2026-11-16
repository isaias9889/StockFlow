export function validarDatosProducto(
  nombre: string,
  precio: string,
  stock: string,
  categoriaId: string
): string | null {
  if (nombre.trim() === "") {
    return "El nombre es obligatorio";
  }

  if (precio.trim() === "" || !Number.isFinite(Number(precio)) || Number(precio) < 0) {
    return "El precio debe ser un número mayor o igual a 0";
  }

  if (
    stock.trim() === "" ||
    !Number.isInteger(Number(stock)) ||
    Number(stock) < 0
  ) {
    return "El stock debe ser un número entero mayor o igual a 0";
  }

  if (!Number.isSafeInteger(Number(categoriaId)) || Number(categoriaId) <= 0) {
    return "Selecciona una categoría";
  }

  return null;
}

export function validarCantidadMovimiento(
  cantidad: string,
  tipo: "ENTRADA" | "SALIDA",
  stockActual: number
): string | null {
  if (
    cantidad.trim() === "" ||
    !Number.isInteger(Number(cantidad)) ||
    Number(cantidad) <= 0
  ) {
    return "Ingresa una cantidad entera mayor a 0";
  }

  if (tipo === "SALIDA" && Number(cantidad) > stockActual) {
    return "No hay stock suficiente";
  }

  return null;
}

export function validarNombreCategoria(nombre: string): string | null {
  if (nombre.trim() === "") {
    return "Ingresa un nombre para la categoría";
  }

  return null;
}

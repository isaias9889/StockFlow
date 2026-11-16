export function mensajeDeApi(datos: unknown, respaldo: string): string {
  if (datos && typeof datos === "object") {
    const cuerpo = datos as { message?: unknown; mensaje?: unknown };

    if (typeof cuerpo.message === "string" && cuerpo.message.trim() !== "") {
      return cuerpo.message;
    }

    if (typeof cuerpo.mensaje === "string" && cuerpo.mensaje.trim() !== "") {
      return cuerpo.mensaje;
    }
  }

  return respaldo;
}

export function crearCsv(filas: unknown[][]): string {
  return "\uFEFF" + filas.map(fila => fila.map(valor => {
    let texto = String(valor ?? "");
    if (/^[\s]*[=+@-]/.test(texto)) texto = "'" + texto;
    return `"${texto.replaceAll('"', '""')}"`;
  }).join(";")).join("\r\n");
}

export function descargarCsv(nombre: string, filas: unknown[][]) {
  const url = URL.createObjectURL(new Blob([crearCsv(filas)], { type: "text/csv;charset=utf-8" }));
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

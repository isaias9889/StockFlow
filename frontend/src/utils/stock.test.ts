import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { obtenerEstadoStock } from "./stock.ts";
import { mensajeDeApi } from "./api.ts";
import {
  validarCantidadMovimiento,
  validarDatosProducto,
  validarNombreCategoria,
} from "./validaciones.ts";

describe("obtenerEstadoStock", () => {
  it("trata el 0 como sin stock", () => {
    assert.equal(obtenerEstadoStock(0), "Sin stock");
  });

  it("trata de 1 a 10 como bajo stock", () => {
    assert.equal(obtenerEstadoStock(1), "Bajo stock");
    assert.equal(obtenerEstadoStock(10), "Bajo stock");
  });

  it("trata más de 10 como disponible", () => {
    assert.equal(obtenerEstadoStock(11), "Disponible");
  });
});

describe("mensajeDeApi", () => {
  it("prefiere message y acepta mensaje", () => {
    assert.equal(mensajeDeApi({ message: "El stock no puede ser negativo" }, "x"), 
      "El stock no puede ser negativo"
    );
    assert.equal(mensajeDeApi({ mensaje: "No hay stock suficiente" }, "x"), 
      "No hay stock suficiente"
    );
  });

  it("usa el texto de respaldo si el cuerpo no trae mensaje", () => {
    assert.equal(mensajeDeApi(null, "Error de red"), "Error de red");
  });
});

describe("validaciones del formulario", () => {
  it("rechaza datos inválidos", () => {
    assert.match(validarDatosProducto("Mouse", "-1", "2", "1")!, /precio/i);
    assert.match(validarDatosProducto("Mouse", "Infinity", "2", "1")!, /precio/i);
    assert.equal(validarCantidadMovimiento("5", "SALIDA", 2), "No hay stock suficiente");
    assert.match(validarNombreCategoria("   ")!, /nombre/i);
  });
  it("acepta un producto válido", () => {
    assert.equal(validarDatosProducto("Mouse", "25000", "2", "1"), null);
  });
});

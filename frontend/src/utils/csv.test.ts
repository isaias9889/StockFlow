import { it } from "node:test";
import assert from "node:assert/strict";
import { crearCsv } from "./csv.ts";

it("exporta comillas, saltos y valores vacíos sin romper celdas", () => {
  assert.equal(crearCsv([['A"B', 'línea\nnueva', null]]), '\uFEFF"A""B";"línea\nnueva";""');
});

it("neutraliza fórmulas de hojas de cálculo", () => {
  assert.equal(crearCsv([['=1+1', ' @SUM(A1)', 25]]), '\uFEFF"\'=1+1";"\' @SUM(A1)";"25"');
});

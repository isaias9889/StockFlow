const { it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

async function ejecutar({ cantidad = 3, fallaInsert = false } = {}) {
  const eventos = [];
  const conexion = {
    beginTransaction: async () => eventos.push('begin'),
    query: async (sql) => {
      if (sql.startsWith('SELECT')) { assert.match(sql, /FOR UPDATE/); return [[{ stock: 5 }]]; }
      if (sql.startsWith('UPDATE')) { eventos.push('update'); return []; }
      eventos.push('insert');
      if (fallaInsert) throw new Error('Fallo simulado');
      return [];
    },
    commit: async () => eventos.push('commit'),
    rollback: async () => eventos.push('rollback'),
    release: () => eventos.push('release'),
  };
  const modulo = { exports: {} };
  vm.runInNewContext(fs.readFileSync('dist/controllers/movimientos.controller.js', 'utf8'), {
    exports: modulo.exports,
    require: () => ({ pool: { getConnection: async () => conexion } }),
    console: { error() {} },
  });
  const respuesta = { codigo: 200, status(c) { this.codigo = c; return this; }, json(cuerpo) { this.cuerpo = cuerpo; return this; } };
  await modulo.exports.registrarMovimiento({ body: { producto_id: 1, tipo: 'SALIDA', cantidad } }, respuesta);
  return { eventos, respuesta };
}

it('confirma stock e historial juntos y libera la conexión', async () => {
  const { eventos, respuesta } = await ejecutar();
  assert.equal(respuesta.codigo, 201);
  assert.equal(respuesta.cuerpo.stock_nuevo, 2);
  assert.deepEqual(eventos, ['begin', 'update', 'insert', 'commit', 'release']);
});
it('revierte stock si falla el historial', async () => {
  const { eventos, respuesta } = await ejecutar({ fallaInsert: true });
  assert.equal(respuesta.codigo, 500);
  assert.deepEqual(eventos, ['begin', 'update', 'insert', 'rollback', 'release']);
});
it('rechaza stock insuficiente sin escribir', async () => {
  const { eventos, respuesta } = await ejecutar({ cantidad: 6 });
  assert.equal(respuesta.codigo, 400);
  assert.deepEqual(eventos, ['begin', 'rollback', 'release']);
});
it('rechaza cantidades fraccionarias antes de abrir una transacción', async () => {
  const { eventos, respuesta } = await ejecutar({ cantidad: 1.5 });
  assert.equal(respuesta.codigo, 400);
  assert.deepEqual(eventos, []);
});

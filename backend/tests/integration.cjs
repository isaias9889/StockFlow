// Ejecutar desde backend con npm run test:integration.
// Crea y elimina exclusivamente una base temporal; requiere CREATE DATABASE.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { randomBytes } = require('node:crypto');
const mysql = require('mysql2/promise');
require('dotenv').config({ quiet: true });

async function main() {
  const nombre = `stockflow_test_${randomBytes(8).toString('hex')}`;
  assert.match(nombre, /^stockflow_test_[a-f0-9]{16}$/);
  const admin = await mysql.createConnection({
    host: process.env.DB_HOST, port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    connectTimeout: 5000,
  });
  let creada = false;
  let servidor;
  let pool;
  const original = process.env.DB_NAME;
  try {
    await admin.query(`CREATE DATABASE \`${nombre}\` CHARACTER SET utf8mb4`);
    creada = true;
    await admin.query(`USE \`${nombre}\``);
    const esquema = fs.readFileSync('../database/stockflow.sql', 'utf8');
    for (const tabla of esquema.match(/CREATE TABLE[\s\S]*?;/g)) await admin.query(tabla);
    process.env.DB_NAME = nombre;
    const { app } = require('../dist/server.js');
    pool = require('../dist/database.js').pool;
    servidor = await new Promise(resolve => {
      const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
    });
    const base = `http://127.0.0.1:${servidor.address().port}/api`;
    async function api(ruta, method = 'GET', body) {
      const r = await fetch(base + ruta, {
        method, headers: { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(5000),
      });
      return { status: r.status, data: await r.json() };
    }
    assert.equal((await api('/health')).status, 200);
    const cat = await api('/categorias', 'POST', { nombre: 'Prueba' });
    assert.equal(cat.status, 201);
    const categoria_id = cat.data.id;
    assert.equal((await api(`/categorias/${categoria_id}`, 'PUT', { nombre: 'Categoría editada' })).status, 200);
    const datos = { nombre: 'Producto prueba', precio: 12.50, stock: 10, categoria_id };
    const producto = await api('/productos', 'POST', datos);
    assert.equal(producto.status, 201);
    const id = producto.data.id;
    assert.equal((await api(`/productos/${id}`, 'PUT', { ...datos, precio: 15.75 })).status, 200);
    assert.equal(Number((await api(`/productos/${id}`)).data.precio), 15.75);
    assert.equal((await api('/productos', 'POST', { ...datos, stock: -1 })).status, 400);
    const mover = (tipo, cantidad) => api('/movimientos', 'POST', { producto_id: id, tipo, cantidad, motivo: 'Prueba automática' });
    assert.equal((await mover('ENTRADA', 5)).status, 201);
    assert.equal((await mover('SALIDA', 3)).status, 201);
    assert.equal((await mover('SALIDA', 100)).status, 400);
    const simultaneas = await Promise.all([mover('SALIDA', 8), mover('SALIDA', 8)]);
    assert.deepEqual(simultaneas.map(r => r.status).sort(), [201, 400]);
    assert.equal((await api(`/productos/${id}`)).data.stock, 4);
    const historial = (await api('/movimientos')).data;
    assert.equal(historial.length, 3);
    assert.ok(historial.some(m => m.stock_anterior === 12 && m.stock_nuevo === 4));
    const dashboard = (await api('/dashboard')).data;
    assert.equal(dashboard.unidades_stock, 4);
    assert.equal(dashboard.valor_inventario, 63);
    assert.equal(dashboard.total_entradas, 1);
    assert.equal(dashboard.total_salidas, 2);
    assert.equal((await api(`/productos/${id}`, 'DELETE')).status, 409);
    assert.equal((await api(`/categorias/${categoria_id}`, 'DELETE')).status, 409);
    const eliminable = await api('/productos', 'POST', datos);
    assert.equal((await api(`/productos/${eliminable.data.id}`, 'DELETE')).status, 200);
    const vacia = await api('/categorias', 'POST', { nombre: 'Temporal vacía' });
    assert.equal((await api(`/categorias/${vacia.data.id}`, 'DELETE')).status, 200);
    console.log('PASS: CRUD, precios decimales, validación, movimientos concurrentes, historial, dashboard y conflictos.');
  } finally {
    if (servidor) await new Promise(resolve => servidor.close(resolve));
    if (pool) await pool.end();
    if (original === undefined) delete process.env.DB_NAME;
    else process.env.DB_NAME = original;
    if (creada) await admin.query(`DROP DATABASE \`${nombre}\``);
    await admin.end();
    console.log('Base temporal eliminada.');
  }
}
main().catch(error => { console.error('Integración fallida:', error.code || error.message); process.exitCode = 1; });

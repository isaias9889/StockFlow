import { Request, Response } from "express";
import { pool } from "../database";

export const registrarMovimiento = async (
  req: Request,
  res: Response
) => {
  let conexion;
  try {
    const {
      producto_id,
      tipo,
      cantidad,
      motivo
    } = req.body;
     // Validar datos obligatorios
if (!producto_id || !tipo || cantidad === undefined) {
  return res.status(400).json({
    message: "Faltan datos obligatorios"
  });
}

// Validar tipo
if (tipo !== "ENTRADA" && tipo !== "SALIDA") {
  return res.status(400).json({
    message: "El tipo debe ser ENTRADA o SALIDA"
  });
}

// Validar cantidad
if (
  typeof cantidad !== "number" ||
  !Number.isSafeInteger(cantidad) || cantidad <= 0 || cantidad > 2147483647
) {
  return res.status(400).json({
    message: "La cantidad debe ser mayor a 0"
  });
}
    if (!Number.isSafeInteger(producto_id) || producto_id <= 0 || (motivo != null && (typeof motivo !== "string" || motivo.length > 255))) {
      return res.status(400).json({ message: "Producto o motivo inválido" });
    }
    conexion = await pool.getConnection();
    await conexion.beginTransaction();
    // 1. Buscar el producto
    const [productos]: any = await conexion.query(
      "SELECT * FROM productos WHERE id = ? FOR UPDATE",
      [producto_id]
    );

    if (productos.length === 0) {
      await conexion.rollback();
      return res.status(404).json({
        message: "Producto no encontrado"
      });
    }

    const producto = productos[0];

    const stockAnterior = producto.stock;

    // 2. Calcular nuevo stock
    let stockNuevo = stockAnterior;

    if (tipo === "ENTRADA") {
      stockNuevo = stockAnterior + cantidad;
    }

    if (tipo === "SALIDA") {
      stockNuevo = stockAnterior - cantidad;
    }

    // 3. Evitar stock negativo
    if (stockNuevo < 0 || stockNuevo > 2147483647) {
      await conexion.rollback();
      return res.status(400).json({
        message: "No hay stock suficiente"
      });
    }

    // 4. Actualizar stock del producto
    await conexion.query(
      "UPDATE productos SET stock = ? WHERE id = ?",
      [stockNuevo, producto_id]
    );

    // 5. Guardar el movimiento
    await conexion.query(
      `
      INSERT INTO movimientos_inventario
      (
        producto_id,
        tipo,
        cantidad,
        stock_anterior,
        stock_nuevo,
        motivo
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        producto_id,
        tipo,
        cantidad,
        stockAnterior,
        stockNuevo,
        motivo ?? null
      ]
    );

    await conexion.commit();
    return res.status(201).json({
      message: "Movimiento registrado correctamente",
      stock_anterior: stockAnterior,
      stock_nuevo: stockNuevo
    });

  } catch (error) {
    if (conexion) await conexion.rollback();
    console.error(error);

    return res.status(500).json({
      message: "Error al registrar movimiento"
    });
  } finally {
    conexion?.release();
  }
};
export const listarMovimientos = async (
  req: Request,
  res: Response
) => {
  try {
    const [movimientos] = await pool.query(`
      SELECT
        m.id,
        m.producto_id,
        p.nombre AS producto,
        m.tipo,
        m.cantidad,
        m.stock_anterior,
        m.stock_nuevo,
        m.motivo,
        m.fecha
      FROM movimientos_inventario m
      INNER JOIN productos p
        ON m.producto_id = p.id
      ORDER BY m.fecha DESC
    `);

    return res.json(movimientos);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error al obtener los movimientos"
    });
  }
};
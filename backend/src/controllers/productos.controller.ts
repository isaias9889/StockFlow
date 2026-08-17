import { Request, Response } from "express";
import { pool } from "../database";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
interface ProductoRow extends RowDataPacket {
  id: number;
  nombre: string;
  precio: string;
  stock: number;
}

export async function obtenerProductos(
  req: Request,
  res: Response
) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM productos"
    );

    return res.status(200).json(rows);

  } catch (error) {
    console.error("Error al obtener productos:", error);

    return res.status(500).json({
      message: "Error interno del servidor"
    });
  }
}

export async function obtenerProductoPorId(
  req: Request,
  res: Response
) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "El ID debe ser un número válido"
    });
  }

  try {
    const [rows] = await pool.execute<ProductoRow[]>(
      "SELECT * FROM productos WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Producto no encontrado"
      });
    }

    return res.status(200).json(rows[0]);

  } catch (error) {
    console.error("Error al obtener producto:", error);

    return res.status(500).json({
      message: "Error interno del servidor"
    });
  }
}
export async function crearProducto(
  req: Request,
  res: Response
) {
  const { nombre, precio, stock } = req.body;

  if (typeof nombre !== "string" || nombre.trim() === "") {
    return res.status(400).json({
      message: "El nombre es obligatorio"
    });
  }

  if (typeof precio !== "number") {
    return res.status(400).json({
      message: "El precio debe ser un número"
    });
  }

  if (precio < 0) {
    return res.status(400).json({
      message: "El precio no puede ser negativo"
    });
  }

  if (typeof stock !== "number") {
    return res.status(400).json({
      message: "El stock debe ser un número"
    });
  }

  if (stock < 0) {
    return res.status(400).json({
      message: "El stock no puede ser negativo"
    });
  }

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO productos (nombre, precio, stock)
       VALUES (?, ?, ?)`,
      [nombre.trim(), precio, stock]
    );

    return res.status(201).json({
      id: result.insertId,
      nombre: nombre.trim(),
      precio,
      stock
    });

  } catch (error) {
    console.error("Error al crear producto:", error);

    return res.status(500).json({
      message: "Error interno del servidor"
    });
  }
}
export async function actualizarProducto(
  req: Request,
  res: Response
) {
  const id = Number(req.params.id);
  const { nombre, precio, stock } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "El ID debe ser un número válido"
    });
  }

  if (typeof nombre !== "string" || nombre.trim() === "") {
    return res.status(400).json({
      message: "El nombre es obligatorio"
    });
  }

  if (typeof precio !== "number") {
    return res.status(400).json({
      message: "El precio debe ser un número"
    });
  }

  if (precio < 0) {
    return res.status(400).json({
      message: "El precio no puede ser negativo"
    });
  }

  if (typeof stock !== "number") {
    return res.status(400).json({
      message: "El stock debe ser un número"
    });
  }

  if (stock < 0) {
    return res.status(400).json({
      message: "El stock no puede ser negativo"
    });
  }

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE productos
       SET nombre = ?, precio = ?, stock = ?
       WHERE id = ?`,
      [nombre.trim(), precio, stock, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Producto no encontrado"
      });
    }

    return res.status(200).json({
      id,
      nombre: nombre.trim(),
      precio,
      stock
    });

  } catch (error) {
    console.error("Error al actualizar producto:", error);

    return res.status(500).json({
      message: "Error interno del servidor"
    });
  }
}
export async function eliminarProducto(
  req: Request,
  res: Response
) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "El ID debe ser un número válido"
    });
  }

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM productos WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Producto no encontrado"
      });
    }

    return res.status(200).json({
      message: "Producto eliminado correctamente",
      id
    });

  } catch (error) {
    console.error("Error al eliminar producto:", error);

    return res.status(500).json({
      message: "Error interno del servidor"
    });
  }
}
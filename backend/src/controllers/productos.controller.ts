import { Request, Response } from "express";
import { pool } from "../database";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
interface ProductoRow extends RowDataPacket {
  id: number;
  nombre: string;
  precio: string;
  stock: number;
  categoria_id: number | null;
  categoria: string | null;
}

export async function obtenerProductos(
  req: Request,
  res: Response
) {
  try {
    const [rows] = await pool.query(`
  SELECT
    productos.id,
    productos.nombre,
    productos.precio,
    productos.stock,
    productos.categoria_id,
    categorias.nombre AS categoria
  FROM productos
  LEFT JOIN categorias
    ON productos.categoria_id = categorias.id
    
`);
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

  try {
  const [rows] = await pool.execute<ProductoRow[]>(
  `SELECT
    productos.id,
    productos.nombre,
    productos.precio,
    productos.stock,
    productos.categoria_id,
    categorias.nombre AS categoria
   FROM productos
   LEFT JOIN categorias
     ON productos.categoria_id = categorias.id
   WHERE productos.id = ?`,
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
  const { nombre, precio, stock, categoria_id } = req.body;
  try {
   const [result] = await pool.execute<ResultSetHeader>(
  `INSERT INTO productos (nombre, precio, stock, categoria_id)
   VALUES (?, ?, ?, ?)`,
  [nombre.trim(), precio, stock, categoria_id]
);

    return res.status(201).json({
      id: result.insertId,
      nombre: nombre.trim(),
      precio,
      stock,
      categoria_id
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
const { nombre, precio, stock, categoria_id } = req.body;
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE productos
       SET nombre = ?, precio = ?, stock = ?, categoria_id = ?
       WHERE id = ?`,
      [nombre.trim(), precio, stock, categoria_id, id]
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
      stock,
      categoria_id
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

  } catch (error: unknown) {
    console.error("Error al eliminar producto:", error);

    const codigo =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
        : "";

    if (codigo === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        message: "No se puede eliminar el producto porque tiene movimientos asociados"
      });
    }

    return res.status(500).json({
      message: "Error interno del servidor"
    });
  }
}
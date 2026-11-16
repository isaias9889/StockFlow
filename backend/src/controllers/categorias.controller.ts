import { Request, Response } from "express";
import { pool } from "../database";
import { ResultSetHeader } from "mysql2/promise";

export async function obtenerCategorias(
  req: Request,
  res: Response
) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM categorias"
    );

    return res.status(200).json(rows);

  } catch (error) {
    console.error("Error al obtener categorías:", error);

    return res.status(500).json({
      message: "Error interno del servidor"
    });
  }
}
export async function obtenerCategoriaPorId(
  req: Request,
  res: Response
) {
  const id = Number(req.params.id);

  try {
    const [rows] = await pool.execute<any[]>(
      "SELECT * FROM categorias WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Categoría no encontrada"
      });
    }

    return res.status(200).json(rows[0]);

  } catch (error) {
    console.error("Error al obtener categoría:", error);

    return res.status(500).json({
      message: "Error interno del servidor"
    });
  }
}
export async function crearCategoria(
  req: Request,
  res: Response
) {
  const { nombre } = req.body;

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO categorias (nombre) VALUES (?)",
      [nombre.trim()]
    );

    return res.status(201).json({
      id: result.insertId,
      nombre: nombre.trim()
    });

  } catch (error) {
    console.error("Error al crear categoría:", error);

    return res.status(500).json({
      message: "Error interno del servidor"
    });
  }
}
export async function actualizarCategoria(
  req: Request,
  res: Response
) {
  const id = Number(req.params.id);
  const { nombre } = req.body;

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE categorias SET nombre = ? WHERE id = ?",
      [nombre.trim(), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Categoría no encontrada"
      });
    }

    return res.status(200).json({
      id,
      nombre: nombre.trim()
    });

  } catch (error) {
    console.error("Error al actualizar categoría:", error);

    return res.status(500).json({
      message: "Error interno del servidor"
    });
  }
}
export async function eliminarCategoria(
  req: Request,
  res: Response
) {
  const id = Number(req.params.id);

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM categorias WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Categoría no encontrada"
      });
    }

    return res.status(200).json({
      message: "Categoría eliminada correctamente",
      id
    });

  } catch (error: any) {
  console.error("Error al eliminar categoría:", error);

 
 if (error.code === "ER_ROW_IS_REFERENCED_2") {
    return res.status(409).json({
      message: "No se puede eliminar la categoría porque tiene productos asociados"
    });
  }
  return res.status(500).json({
    message: "Error interno del servidor"
  });
}
  }

import { Request, Response, NextFunction } from "express";
import { pool } from "../database";
import { RowDataPacket } from "mysql2/promise";

export function validarProducto(
  req: Request,
  res: Response,
  next: NextFunction
) {
 const { nombre, precio, stock, categoria_id } = req.body;
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
;
if (stock < 0) {
  return res.status(400).json({
    message: "El stock no puede ser negativo"
  });
}
if (!Number.isInteger(categoria_id) || categoria_id <= 0) {
  return res.status(400).json({
    message: "La categoría debe ser un ID válido"
  });
}
next();
}
export function validarId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "El ID debe ser un número válido"
    });
  }

  next();
}
export async function validarCategoriaExiste(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { categoria_id } = req.body;

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM categorias WHERE id = ?",
      [categoria_id]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        message: "La categoría no existe"
      });
    }

    next();

  } catch (error) {
    console.error("Error al validar categoría:", error);

    return res.status(500).json({
      message: "Error interno del servidor"
    });
  }
}

import { Request, Response, NextFunction } from "express";

export function validarIdCategoria(
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
export function validarCategoria(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { nombre } = req.body;

  if (typeof nombre !== "string" || nombre.trim() === "") {
    return res.status(400).json({
      message: "El nombre de la categoría es obligatorio"
    });
  }

  next();
}
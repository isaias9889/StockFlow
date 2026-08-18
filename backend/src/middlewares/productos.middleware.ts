import { Request, Response, NextFunction } from "express";

export function validarProducto(
  req: Request,
  res: Response,
  next: NextFunction
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
;
if (stock < 0) {
  return res.status(400).json({
    message: "El stock no puede ser negativo"
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

import { Request, Response } from "express";
import { pool } from "../database";
export const obtenerDashboard = async (
  req: Request,
  res: Response
) => {
  try {
    const [resultado]: any = await pool.query(`
      SELECT
    COUNT(*) AS total_productos,
    COALESCE(SUM(stock), 0) AS unidades_stock,
    COALESCE(SUM(CASE WHEN stock <= 10 THEN 1 ELSE 0 END), 0) AS bajo_stock,
    COALESCE(SUM(precio * stock), 0) AS valor_inventario
  FROM productos
    `);

     const [movimientos]: any = await pool.query(`
  SELECT
    COALESCE(
      SUM(CASE WHEN tipo = 'ENTRADA' THEN 1 ELSE 0 END),
      0
    ) AS total_entradas,

    COALESCE(
      SUM(CASE WHEN tipo = 'SALIDA' THEN 1 ELSE 0 END),
      0
    ) AS total_salidas

  FROM movimientos_inventario
`);
const [categorias]: any = await pool.query(`
  SELECT COUNT(*) AS total_categorias
  FROM categorias
`);
    return res.json({
        total_categorias: Number(categorias[0].total_categorias),
   total_productos: Number(resultado[0].total_productos),
  unidades_stock: Number(resultado[0].unidades_stock),
  bajo_stock: Number(resultado[0].bajo_stock),
  valor_inventario: Number(resultado[0].valor_inventario),

  total_entradas: Number(movimientos[0].total_entradas),
  total_salidas: Number(movimientos[0].total_salidas)
    });
   

  } catch (error) {
    console.error("Error al obtener dashboard:", error);

    return res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};
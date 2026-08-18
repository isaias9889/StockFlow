import { Router } from "express";

import {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} from "../controllers/productos.controller";

import {
  validarProducto,
  validarId
} from "../middlewares/productos.middleware";

const router = Router();

router.get("/", obtenerProductos);
router.get("/:id", validarId, obtenerProductoPorId);

router.post("/", validarProducto, crearProducto);

router.put("/:id", validarId, validarProducto, actualizarProducto);

router.delete("/:id", validarId, eliminarProducto);

export default router;
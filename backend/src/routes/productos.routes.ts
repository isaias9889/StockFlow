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
  validarId,
  validarCategoriaExiste
} from "../middlewares/productos.middleware";

const router = Router();

router.get("/", obtenerProductos);
router.get("/:id", validarId, obtenerProductoPorId);

router.post("/", validarProducto, validarCategoriaExiste, crearProducto);

router.put("/:id", validarId, validarProducto, validarCategoriaExiste, actualizarProducto);

router.delete("/:id", validarId, eliminarProducto);

export default router;
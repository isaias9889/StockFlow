import { Router } from "express";
import { obtenerCategorias,obtenerCategoriaPorId,crearCategoria,actualizarCategoria,eliminarCategoria } from "../controllers/categorias.controller";
import { validarCategoria, validarIdCategoria } from "../middlewares/categorias.middleware";

const router = Router();

router.get("/", obtenerCategorias);
router.post("/", validarCategoria, crearCategoria);
router.get("/:id", validarIdCategoria, obtenerCategoriaPorId);
router.put("/:id", validarIdCategoria, validarCategoria, actualizarCategoria);
router.delete("/:id", validarIdCategoria, eliminarCategoria);
export default router;
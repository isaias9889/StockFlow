import express from "express";
import { probarConexion } from "./database";
import productosRoutes from "./routes/productos.routes";
import categoriasRoutes from "./routes/categorias.routes";

const app = express();

app.use(express.json());
app.use("/api/productos", productosRoutes);
app.use("/api/categorias", categoriasRoutes);
const PORT = 3000;

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "StockFlow API funcionando"
  });
});

probarConexion();
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
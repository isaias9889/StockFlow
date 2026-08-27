import express from "express";
import dashboardRoutes from "./routes/dashboard.routes";
import { probarConexion } from "./database";
import movimientosRoutes from "./routes/movimientos.routes";
import productosRoutes from "./routes/productos.routes";
import categoriasRoutes from "./routes/categorias.routes";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/productos", productosRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/dashboard", dashboardRoutes);
const PORT = 3000;
app.use("/api/movimientos", movimientosRoutes);
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
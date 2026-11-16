import express from "express";
import dashboardRoutes from "./routes/dashboard.routes";
import { probarConexion } from "./database";
import movimientosRoutes from "./routes/movimientos.routes";
import productosRoutes from "./routes/productos.routes";
import categoriasRoutes from "./routes/categorias.routes";
import cors from "cors";
export const app = express();
const origen = process.env.CORS_ORIGIN;

app.use(cors(origen ? { origin: origen } : undefined));
app.use(express.json());
app.use("/api/productos", productosRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/dashboard", dashboardRoutes);
const PORT = Number(process.env.PORT) || 3000;
app.use("/api/movimientos", movimientosRoutes);
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "StockFlow API funcionando"
  });
});

if (require.main === module) {
  probarConexion();
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  });
}

import express from "express";

const app = express();

const PORT = 3000;

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "StockFlow API funcionando"
  });
});
const productos = [
  {
    id: 1,
    nombre: "Teclado mecánico",
    precio: 35000,
    stock: 12
  },
  {
    id: 2,
    nombre: "Mouse gamer",
    precio: 25000,
    stock: 20
  },

  {id: 3,
    nombre: "Monitor 24 pulgadas",
    precio: 150000,
    stock: 5
  },
  {
    id: 4,
    nombre: "Auriculares inalámbricos",
    precio: 15000,
    stock: 30
  },
  {
    id: 5,
    nombre: "Silla ergonómica",
    precio: 120000,
    stock: 8
  },
];

app.get("/api/productos", (req, res) => {
  res.json(productos);
});
app.get("/api/productos/:id", (req, res) => {
  const id = Number(req.params.id);

  const producto = productos.find((producto) => producto.id === id);

  if (!producto) {
    return res.status(404).json({
      message: "Producto no encontrado"
    });
  }

  res.json(producto);
});
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
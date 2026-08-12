import express from "express";

const app = express();

app.use(express.json());

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
app.post("/api/productos", (req, res) => {
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

if (stock < 0) {
  return res.status(400).json({
    message: "El stock no puede ser negativo"
  });
}

  const nuevoId =
    productos.length > 0
      ? Math.max(...productos.map((producto) => producto.id)) + 1
      : 1;

  const nuevoProducto = {
    id: nuevoId,
    nombre,
    precio,
    stock
  };

  productos.push(nuevoProducto);

  return res.status(201).json(nuevoProducto);
});
app.put("/api/productos/:id", (req, res) => {
  const id = Number(req.params.id);

  const producto = productos.find((producto) => producto.id === id);

  if (!producto) {
    return res.status(404).json({
      message: "Producto no encontrado"
    });
  }

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

  if (stock < 0) {
    return res.status(400).json({
      message: "El stock no puede ser negativo"
    });
  }

  producto.nombre = nombre;
  producto.precio = precio;
  producto.stock = stock;

  return res.status(200).json(producto);
});
app.delete("/api/productos/:id", (req, res) => {
  const id = Number(req.params.id);

  const indice = productos.findIndex((producto) => producto.id === id);

  if (indice === -1) {
    return res.status(404).json({
      message: "Producto no encontrado"
    });
  }

  const productoEliminado = productos.splice(indice, 1);

  return res.status(200).json({
    message: "Producto eliminado correctamente",
    producto: productoEliminado[0]
  });
});
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
import { useEffect, useState, type FormEvent } from "react";

interface Producto {
  id: number;
  nombre: string;
  precio: string;
  stock: number;
  categoria_id: number;
  categoria: string;
}

interface Categoria {
  id: number;
  nombre: string;
}
interface Movimiento {
  id: number;
  producto_id: number;
  producto: string;
  tipo: "ENTRADA" | "SALIDA";
  cantidad: number;
  stock_anterior: number;
  stock_nuevo: number;
  motivo: string | null;
  fecha: string;
}

function App() {
  // =========================
  // PRODUCTOS Y CATEGORÍAS
  // =========================

  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [mostrarMovimiento, setMostrarMovimiento] = useState(false);
const [tipoFiltroMovimiento, setTipoFiltroMovimiento] = useState("");
const [productoFiltroMovimiento, setProductoFiltroMovimiento] = useState("");
const [productoMovimiento, setProductoMovimiento] =
  useState<Producto | null>(null);
  const [nombreCategoria, setNombreCategoria] = useState("");
  const [categoriaEditando, setCategoriaEditando] =
  useState<number | null>(null);

const [tipoMovimiento, setTipoMovimiento] =
  useState<"ENTRADA" | "SALIDA">("ENTRADA");

const [cantidadMovimiento, setCantidadMovimiento] = useState("");
const [motivoMovimiento, setMotivoMovimiento] = useState("");

  // =========================
  // FORMULARIO
  // =========================

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [productoEditando, setProductoEditando] =
    useState<number | null>(null);

  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [categoriaId, setCategoriaId] = useState("");

  // =========================
  // BUSCADOR Y FILTROS
  // =========================

  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");

  const productosFiltrados = productos.filter((producto) => {
    const coincideBusqueda = producto.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideCategoria =
      categoriaFiltro === "" ||
      producto.categoria_id === Number(categoriaFiltro);

    return coincideBusqueda && coincideCategoria;
  });

  // =========================
  // CARGAR PRODUCTOS
  // =========================

  const cargarProductos = async () => {
    try {
      const respuesta = await fetch(
        "http://localhost:3000/api/productos"
      );

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar los productos");
      }

      const datos = await respuesta.json();

      setProductos(datos);
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  };

  // =========================
  // CARGAR CATEGORÍAS
  // =========================

  const cargarCategorias = async () => {
    try {
      const respuesta = await fetch(
        "http://localhost:3000/api/categorias"
      );

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar las categorías");
      }

      const datos = await respuesta.json();

      setCategorias(datos);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };
   const cargarMovimientos = async () => {
  try {
    const respuesta = await fetch(
      "http://localhost:3000/api/movimientos"
    );

    if (!respuesta.ok) {
      throw new Error("No se pudieron cargar los movimientos");
    }

    const datos = await respuesta.json();

    setMovimientos(datos);
  } catch (error) {
    console.error("Error cargando movimientos:", error);
  }
};

  // =========================
  // CARGAR DATOS AL INICIAR
  // =========================

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
    cargarMovimientos();
  }, []);

  // =========================
  // INDICADORES
  // =========================

  const totalProductos = productos.length;

  const productosBajoStock = productos.filter(
    (producto) => producto.stock <= 10
  ).length;

const totalCategorias = categorias.length;

  // =========================
  // LIMPIAR FORMULARIO
  // =========================

  const limpiarFormulario = () => {
    setNombre("");
    setPrecio("");
    setStock("");
    setCategoriaId("");
    setProductoEditando(null);
  };

  // =========================
  // ABRIR / CERRAR FORMULARIO
  // =========================

  const alternarFormulario = () => {
    if (mostrarFormulario) {
      limpiarFormulario();
      setMostrarFormulario(false);
    } else {
      limpiarFormulario();
      setMostrarFormulario(true);
    }
  };

  // =========================
  // PREPARAR EDICIÓN
  // =========================

  const editarProducto = (producto: Producto) => {
    setProductoEditando(producto.id);

    setNombre(producto.nombre);
    setPrecio(producto.precio);
    setStock(String(producto.stock));
    setCategoriaId(String(producto.categoria_id));

    setMostrarFormulario(true);
  };

  // =========================
  // GUARDAR / ACTUALIZAR
  // =========================

  const guardarProducto = async (e: FormEvent) => {
    e.preventDefault();

    const datosProducto = {
      nombre: nombre,
      precio: Number(precio),
      stock: Number(stock),
      categoria_id: Number(categoriaId),
    };

    try {
      // CREAR PRODUCTO
      if (productoEditando === null) {
        const respuesta = await fetch(
          "http://localhost:3000/api/productos",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify(datosProducto),
          }
        );

        if (!respuesta.ok) {
          throw new Error("No se pudo crear el producto");
        }
      }

      // EDITAR PRODUCTO
      else {
        const respuesta = await fetch(
          `http://localhost:3000/api/productos/${productoEditando}`,
          {
            method: "PUT",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify(datosProducto),
          }
        );

        if (!respuesta.ok) {
          throw new Error("No se pudo actualizar el producto");
        }
      }

      await cargarProductos();

      limpiarFormulario();

      setMostrarFormulario(false);
    } catch (error) {
      console.error(error);

      alert(
        productoEditando === null
          ? "Ocurrió un error al crear el producto"
          : "Ocurrió un error al actualizar el producto"
      );
    }
  };

  // =========================
  // ELIMINAR PRODUCTO
  // =========================

  const eliminarProducto = async (id: number) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que quieres eliminar este producto?"
    );

    if (!confirmar) {
      return;
    }

    try {
      const respuesta = await fetch(
        `http://localhost:3000/api/productos/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!respuesta.ok) {
        throw new Error("No se pudo eliminar el producto");
      }

      setProductos((productosActuales) =>
        productosActuales.filter(
          (producto) => producto.id !== id
        )
      );
    } catch (error) {
      console.error(error);

      alert("Ocurrió un error al eliminar el producto");
    }
  };
const abrirMovimiento = (
  producto: Producto,
  tipo: "ENTRADA" | "SALIDA"
) => {
  setProductoMovimiento(producto);
  setTipoMovimiento(tipo);

  setCantidadMovimiento("");
  setMotivoMovimiento("");

  setMostrarMovimiento(true);
};
const registrarMovimiento = async () => {
  if (!productoMovimiento) {
    return;
  }

  if (
    cantidadMovimiento === "" ||
    Number(cantidadMovimiento) <= 0
  ) {
    alert("Ingresa una cantidad válida");
    return;
  }

  const datosMovimiento = {
    producto_id: productoMovimiento.id,
    tipo: tipoMovimiento,
    cantidad: Number(cantidadMovimiento),
    motivo: motivoMovimiento,
  };

  try {
    const respuesta = await fetch(
      "http://localhost:3000/api/movimientos",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(datosMovimiento),
      }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      alert(datos.mensaje);
      return;
    }

    await cargarProductos();
    await cargarMovimientos();

    setCantidadMovimiento("");
    setMotivoMovimiento("");
    setProductoMovimiento(null);
    setMostrarMovimiento(false);

  } catch (error) {
    console.error(error);

    alert("Ocurrió un error al registrar el movimiento");
  }
};
const movimientosFiltrados = movimientos.filter((movimiento) => {
  const coincideTipo =
    tipoFiltroMovimiento === "" ||
    movimiento.tipo === tipoFiltroMovimiento;

  const coincideProducto =
    productoFiltroMovimiento === "" ||
    movimiento.producto_id === Number(productoFiltroMovimiento);

  return coincideTipo && coincideProducto;
});
const guardarCategoria = async () => {
  if (nombreCategoria.trim() === "") {
    alert("Ingresa un nombre para la categoría");
    return;
  }

  try {
    let respuesta;

    // Si NO estamos editando → crear
    if (categoriaEditando === null) {
      respuesta = await fetch(
        "http://localhost:3000/api/categorias",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: nombreCategoria,
          }),
        }
      );
    }

    // Si estamos editando → actualizar
    else {
      respuesta = await fetch(
        `http://localhost:3000/api/categorias/${categoriaEditando}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: nombreCategoria,
          }),
        }
      );
    }

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      alert(datos.mensaje);
      return;
    }

    // Volver a cargar las categorías
    await cargarCategorias();

    // También recargamos productos porque
    // puede haber cambiado el nombre de su categoría
    await cargarProductos();

    // Limpiar
    setNombreCategoria("");
    setCategoriaEditando(null);

  } catch (error) {
    console.error(error);

    alert("Ocurrió un error al guardar la categoría");
  }
};
const editarCategoria = (categoria: Categoria) => {
  setCategoriaEditando(categoria.id);
  setNombreCategoria(categoria.nombre);
};
const eliminarCategoria = async (id: number) => {
  const confirmar = window.confirm(
    "¿Estás seguro de que quieres eliminar esta categoría?"
  );

  if (!confirmar) {
    return;
  }

  try {
    const respuesta = await fetch(
      `http://localhost:3000/api/categorias/${id}`,
      {
        method: "DELETE",
      }
    );

    const datos = await respuesta.json();

   if (!respuesta.ok) {
  alert(
    datos.mensaje ||
    datos.error ||
    "No se pudo eliminar la categoría"
  );
  return;
}

    await cargarCategorias();
    await cargarProductos();

  } catch (error) {
    console.error(error);

    alert("Ocurrió un error al eliminar la categoría");
  }
};
  return (
    <div className="stockflow-container">

      {/* =========================
          ENCABEZADO
      ========================== */}

      <div className="stockflow-header">

        <div>
          <h1>StockFlow</h1>
          <p>Gestión de Inventario</p>
        </div>

        <button
          className="btn-nuevo"
          onClick={alternarFormulario}
        >
          {mostrarFormulario
            ? "Cerrar formulario"
            : "+ Nuevo producto"}
        </button>

      </div>

      {/* =========================
          FORMULARIO
      ========================== */}

      {mostrarFormulario && (

        <form
          className="form-producto"
          onSubmit={guardarProducto}
        >

          <h2>
            {productoEditando === null
              ? "Nuevo producto"
              : "Editar producto"}
          </h2>

          <input
            type="text"
            placeholder="Nombre del producto"
            value={nombre}
            onChange={(e) =>
              setNombre(e.target.value)
            }
            required
          />

          <input
            type="number"
            placeholder="Precio"
            value={precio}
            onChange={(e) =>
              setPrecio(e.target.value)
            }
            min="0"
            required
          />

          <input
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={(e) =>
              setStock(e.target.value)
            }
            min="0"
            required
          />

          <select
            value={categoriaId}
            onChange={(e) =>
              setCategoriaId(e.target.value)
            }
            required
          >
            <option value="">
              Seleccionar categoría
            </option>

            {categorias.map((categoria) => (
              <option
                key={categoria.id}
                value={categoria.id}
              >
                {categoria.nombre}
              </option>
            ))}

          </select>

          <button
            type="submit"
            className="btn-guardar"
          >
            {productoEditando === null
              ? "Guardar producto"
              : "Actualizar producto"}
          </button>

        </form>

      )}

      {/* =========================
          TARJETAS RESUMEN
      ========================== */}

      <div className="resumen-inventario">

        <div className="tarjeta">
          <p>Total productos</p>
          <h2>{totalProductos}</h2>
        </div>

        <div className="tarjeta">
          <p>Bajo stock</p>
          <h2>{productosBajoStock}</h2>
        </div>

        <div className="tarjeta">
          <p>Categorías</p>
          <h2>{totalCategorias}</h2>
        </div>

      </div>

      {/* =========================
          PRODUCTOS
      ========================== */}

      <div className="tabla-contenedor">

        <h2>Productos</h2>

        {/* BUSCADOR Y FILTRO */}

        <div className="filtros-productos">

          <input
            className="buscador"
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) =>
              setBusqueda(e.target.value)
            }
          />

          <select
            className="filtro-categoria"
            value={categoriaFiltro}
            onChange={(e) =>
              setCategoriaFiltro(e.target.value)
            }
          >

            <option value="">
              Todas las categorías
            </option>

            {categorias.map((categoria) => (
              <option
                key={categoria.id}
                value={categoria.id}
              >
                {categoria.nombre}
              </option>
            ))}

          </select>

        </div>

        {/* TABLA */}

        <table className="tabla-productos">

          <thead>

            <tr>
              <th>ID</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>

          </thead>

          <tbody>

            {productosFiltrados.map((producto) => (

              <tr key={producto.id}>

                <td>
                  {producto.id}
                </td>

                <td>
                  {producto.nombre}
                </td>

                <td>
                  {producto.categoria}
                </td>

                <td>
                  ${producto.precio}
                </td>

                <td>
                  {producto.stock}
                </td>

                <td>

                  <span
                    className={
                      producto.stock <= 10
                        ? "estado bajo-stock"
                        : "estado disponible"
                    }
                  >

                    {producto.stock <= 10
                      ? "Bajo stock"
                      : "Disponible"}

                  </span>

                </td>

                <td>
                  <button
  className="btn-entrada"
  onClick={() =>
    abrirMovimiento(producto, "ENTRADA")
  }
>
  + Entrada
</button>

<button
  className="btn-salida"
  onClick={() =>
    abrirMovimiento(producto, "SALIDA")
  }
>
  - Salida
</button>

                  <button
                    className="btn-editar"
                    onClick={() =>
                      editarProducto(producto)
                    }
                  >
                    Editar
                  </button>

                  <button
                    className="btn-eliminar"
                    onClick={() =>
                      eliminarProducto(producto.id)
                    }
                  >
                    Eliminar
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>
        
        {/* MENSAJE SI NO HAY RESULTADOS */}

        {productosFiltrados.length === 0 && (
          <p>No se encontraron productos.</p>
        )}

      </div>
{mostrarMovimiento && productoMovimiento && (

  <div className="form-movimiento">

    <h2>
      {tipoMovimiento === "ENTRADA"
        ? "Registrar entrada"
        : "Registrar salida"}
    </h2>

    <p>
      Producto: <strong>{productoMovimiento.nombre}</strong>
    </p>

    <p>
      Stock actual: <strong>{productoMovimiento.stock}</strong>
    </p>

    <input
      type="number"
      placeholder="Cantidad"
      value={cantidadMovimiento}
      onChange={(e) =>
        setCantidadMovimiento(e.target.value)
      }
      min="1"
    />

    <input
      type="text"
      placeholder="Motivo"
      value={motivoMovimiento}
      onChange={(e) =>
        setMotivoMovimiento(e.target.value)
      }
    />
<button
  type="button"
  className="btn-registrar-movimiento"
  onClick={registrarMovimiento}
>
  Registrar movimiento
</button>
    <button
      type="button"
      onClick={() => setMostrarMovimiento(false)}
    >
      Cancelar
    </button>

  </div>

)}
      {/* =========================
          HISTORIAL DE MOVIMIENTOS
      ========================== */}

      <div className="historial-contenedor">

        <h2>Historial de movimientos</h2>
        <div className="filtros-movimientos">

  <select
    value={tipoFiltroMovimiento}
    onChange={(e) =>
      setTipoFiltroMovimiento(e.target.value)
    }
  >
    <option value="">
      Todos los tipos
    </option>

    <option value="ENTRADA">
      Entradas
    </option>

    <option value="SALIDA">
      Salidas
    </option>
  </select>

  <select
    value={productoFiltroMovimiento}
    onChange={(e) =>
      setProductoFiltroMovimiento(e.target.value)
    }
  >
    <option value="">
      Todos los productos
    </option>

    {productos.map((producto) => (
      <option
        key={producto.id}
        value={producto.id}
      >
        {producto.nombre}
      </option>
    ))}

  </select>

</div>

        <table className="tabla-movimientos">

          <thead>
            <tr>
              <th>Producto</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Stock anterior</th>
              <th>Stock nuevo</th>
              <th>Motivo</th>
              <th>Fecha</th>
            </tr>
          </thead>

          <tbody>

            {movimientosFiltrados.map((movimiento) => (

              <tr key={movimiento.id}>

                <td>{movimiento.producto}</td>

                <td>{movimiento.tipo}</td>

                <td>{movimiento.cantidad}</td>

                <td>{movimiento.stock_anterior}</td>

                <td>{movimiento.stock_nuevo}</td>

                <td>{movimiento.motivo}</td>

                <td>
                  {new Date(movimiento.fecha).toLocaleString()}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

<div className="categorias-contenedor">

  <h2>Gestión de categorías</h2>
  
<div className="form-categoria">

  <input
    type="text"
    placeholder="Nombre de la categoría"
    value={nombreCategoria}
    onChange={(e) =>
      setNombreCategoria(e.target.value)
    }
  />

  <button
  type="button"
  className="btn-guardar-categoria"
  onClick={guardarCategoria}
>
  {categoriaEditando === null
    ? "Guardar categoría"
    : "Actualizar categoría"}
</button>
{categoriaEditando !== null && (
  <button
    type="button"
    onClick={() => {
      setCategoriaEditando(null);
      setNombreCategoria("");
    }}
  >
    Cancelar
  </button>
)}
</div>
  <table className="tabla-categorias">

    <thead>
      <tr>
        <th>ID</th>
        <th>Categoría</th>
        <th>Acciones</th>
      </tr>
    </thead>

    <tbody>

      {categorias.map((categoria) => (

        <tr key={categoria.id}>

          <td>{categoria.id}</td>

          <td>{categoria.nombre}</td>
            <td>
    <button
      type="button"
      className="btn-editar"
      onClick={() => editarCategoria(categoria)}
  
    >
      Editar
    </button>

  <button
    type="button"
    className="btn-eliminar"
    onClick={() => eliminarCategoria(categoria.id)}
  >
    Eliminar
  </button>
  </td>

        </tr>
        

      ))}

    </tbody>

  </table>

</div>
    </div>
  );
}

export default App;
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

function App() {
  // =========================
  // PRODUCTOS Y CATEGORÍAS
  // =========================

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

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

  // =========================
  // CARGAR DATOS AL INICIAR
  // =========================

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  // =========================
  // INDICADORES
  // =========================

  const totalProductos = productos.length;

  const productosBajoStock = productos.filter(
    (producto) => producto.stock <= 10
  ).length;

  const totalCategorias = new Set(
    productos.map((producto) => producto.categoria)
  ).size;

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
          <p>
            No se encontraron productos.
          </p>
        )}

      </div>

    </div>
  );
}

export default App;
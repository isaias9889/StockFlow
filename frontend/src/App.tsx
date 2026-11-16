import { useEffect, useState, type FormEvent } from "react";
import ResumenInventario from "./components/ResumenInventario";
import type { Dashboard } from "./types/Dashboard";
import Header from "./components/Header";
import { descargarCsv } from "./utils/csv";
import { API_URL } from "./config";
import { mensajeDeApi } from "./utils/api";
import { obtenerClaseEstado, obtenerEstadoStock } from "./utils/stock";
import {
  validarCantidadMovimiento,
  validarDatosProducto,
  validarNombreCategoria,
} from "./utils/validaciones";
interface Producto {
  id: number;
  nombre: string;
  precio: string;
  stock: number;
  categoria_id: number;
  categoria: string;
}

type CampoOrden = "nombre" | "precio" | "stock";
type DireccionOrden = "asc" | "desc";

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
// DASHBOARD
// =========================

  const [dashboard, setDashboard] = useState<Dashboard|null>(null);
  const [cargandoDashboard, setCargandoDashboard] = useState(true);
  const [errorDashboard, setErrorDashboard] = useState<string | null>(null);
  // =========================
  // PRODUCTOS Y CATEGORÍAS
  // =========================
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [errorProductos, setErrorProductos] = useState<string | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [errorCategorias, setErrorCategorias] = useState<string | null>(null);
  const [errorMovimientos, setErrorMovimientos] = useState<string | null>(null);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
  const [errorMovimiento, setErrorMovimiento] = useState<string | null>(null);
  const [errorCategoria, setErrorCategoria] = useState<string | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [guardandoProducto, setGuardandoProducto] = useState(false);
  const [mostrarMovimiento, setMostrarMovimiento] = useState(false);
const [tipoFiltroMovimiento, setTipoFiltroMovimiento] = useState("");
const [productoFiltroMovimiento, setProductoFiltroMovimiento] = useState("");
const [productoMovimiento, setProductoMovimiento] =
  useState<Producto | null>(null);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
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
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [campoOrden, setCampoOrden] = useState<CampoOrden>("nombre");
  const [direccionOrden, setDireccionOrden] = useState<DireccionOrden>("asc");

  const productosFiltrados = productos.filter((producto) => {
    const coincideBusqueda = producto.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideCategoria =
      categoriaFiltro === "" ||
      producto.categoria_id === Number(categoriaFiltro);

    const coincideEstado =
      estadoFiltro === "" ||
      obtenerEstadoStock(producto.stock) === estadoFiltro;

    return coincideBusqueda && coincideCategoria && coincideEstado;
  });

  const productosMostrados = [...productosFiltrados].sort((a, b) => {
    let resultado: number;

    if (campoOrden === "nombre") {
      resultado = a.nombre.localeCompare(b.nombre, "es");
    } else if (campoOrden === "precio") {
      resultado = Number(a.precio) - Number(b.precio);
    } else {
      resultado = a.stock - b.stock;
    }

    return direccionOrden === "asc" ? resultado : -resultado;
  });

  const ordenarPor = (campo: CampoOrden) => {
    if (campoOrden === campo) {
      setDireccionOrden(direccionOrden === "asc" ? "desc" : "asc");
    } else {
      setCampoOrden(campo);
      setDireccionOrden("asc");
    }
  };
  // =========================
  // CARGAR DASHBOARD
  // =========================
  
  const cargarDashboard = async () => {
    setCargandoDashboard(true);
    setErrorDashboard(null);

    try {
      const respuesta = await fetch(
        `${API_URL}/api/dashboard`
      );

      if (!respuesta.ok) {
        throw new Error("No se pudo cargar el dashboard");
      }

      const datos = await respuesta.json();
      setDashboard(datos);
    } catch (error) {
      console.error("Error cargando dashboard:", error);
      setErrorDashboard(
        "No se pudo cargar el resumen del inventario"
      );
    } finally {
      setCargandoDashboard(false);
    }
  };

  // =========================
  // CARGAR PRODUCTOS
  // =========================

  const cargarProductos = async () => {
    setCargandoProductos(true);
    setErrorProductos(null);

    try {
      const respuesta = await fetch(
        `${API_URL}/api/productos`
      );

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar los productos");
      }

      const datos = await respuesta.json();

      setProductos(datos);
    } catch (error) {
      console.error("Error cargando productos:", error);
      setErrorProductos("No se pudieron cargar los productos");
    } finally {
      setCargandoProductos(false);
    }
  };

  // =========================
  // CARGAR CATEGORÍAS
  // =========================

  const cargarCategorias = async () => {
    setErrorCategorias(null);

    try {
      const respuesta = await fetch(
        `${API_URL}/api/categorias`
      );

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar las categorías");
      }

      const datos = await respuesta.json();

      setCategorias(datos);
    } catch (error) {
      console.error("Error cargando categorías:", error);
      setErrorCategorias("No se pudieron cargar las categorías");
    }
  };
   const cargarMovimientos = async () => {
  setErrorMovimientos(null);

  try {
    const respuesta = await fetch(
      `${API_URL}/api/movimientos`
    );

    if (!respuesta.ok) {
      throw new Error("No se pudieron cargar los movimientos");
    }

    const datos = await respuesta.json();

    setMovimientos(datos);
  } catch (error) {
    console.error("Error cargando movimientos:", error);
    setErrorMovimientos("No se pudo cargar el historial de movimientos");
  }
};

  // =========================
  // CARGAR DATOS AL INICIAR
  // =========================

  useEffect(() => {
    const controller = new AbortController();
    async function cargarInicial<T>(
      ruta: string,
      actualizar: (datos: T) => void,
      mostrarError: (mensaje: string) => void,
      terminar?: () => void
    ) {
      try {
        const respuesta = await fetch(`${API_URL}/api/${ruta}`, { signal: controller.signal });
        if (!respuesta.ok) throw new Error(`No se pudo cargar ${ruta}`);
        const datos: T = await respuesta.json();
        if (!controller.signal.aborted) actualizar(datos);
      } catch {
        if (!controller.signal.aborted) mostrarError(`No se pudo cargar ${ruta}`);
      } finally {
        if (!controller.signal.aborted) terminar?.();
      }
    }
    void cargarInicial<Producto[]>("productos", setProductos, setErrorProductos, () => setCargandoProductos(false));
    void cargarInicial<Categoria[]>("categorias", setCategorias, setErrorCategorias);
    void cargarInicial<Movimiento[]>("movimientos", setMovimientos, setErrorMovimientos);
    void cargarInicial<Dashboard>("dashboard", setDashboard, setErrorDashboard, () => setCargandoDashboard(false));
    return () => controller.abort();
  }, []);

  // =========================
  // INDICADORES
  // =========================

 


  // =========================
  // LIMPIAR FORMULARIO
  // =========================

  const limpiarFormulario = () => {
    setNombre("");
    setPrecio("");
    setStock("");
    setCategoriaId("");
    setProductoEditando(null);
    setErrorFormulario(null);
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

    const validacion = validarDatosProducto(
      nombre,
      precio,
      stock,
      categoriaId
    );

    if (validacion) {
      setErrorFormulario(validacion);
      return;
    }

    const datosProducto = {
      nombre: nombre.trim(),
      precio: Number(precio),
      stock: Number(stock),
      categoria_id: Number(categoriaId),
    };

    setGuardandoProducto(true);
    setErrorFormulario(null);

    try {
      const esNuevo = productoEditando === null;
      const respuesta = await fetch(
        esNuevo
          ? `${API_URL}/api/productos`
          : `${API_URL}/api/productos/${productoEditando}`,
        {
          method: esNuevo ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datosProducto),
        }
      );

      const datos = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        throw new Error(
          mensajeDeApi(
            datos,
            esNuevo
              ? "No se pudo crear el producto"
              : "No se pudo actualizar el producto"
          )
        );
      }

      await cargarProductos();
      await cargarDashboard();
      limpiarFormulario();
      setMostrarFormulario(false);
    } catch (error) {
      console.error(error);
      setErrorFormulario(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al guardar el producto"
      );
    } finally {
      setGuardandoProducto(false);
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
        `${API_URL}/api/productos/${id}`,
        {
          method: "DELETE",
        }
      );

      const datos = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        setErrorAccion(
          mensajeDeApi(datos, "No se pudo eliminar el producto")
        );
        return;
      }

      setErrorAccion(null);
      setProductos((productosActuales) =>
        productosActuales.filter(
          (producto) => producto.id !== id
        )
      );
      await cargarDashboard();
    } catch (error) {
      console.error(error);
      setErrorAccion("Ocurrió un error al eliminar el producto");
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
  setErrorMovimiento(null);

  setMostrarMovimiento(true);
};
const registrarMovimiento = async () => {
  if (!productoMovimiento) {
    return;
  }

  const validacion = validarCantidadMovimiento(
    cantidadMovimiento,
    tipoMovimiento,
    productoMovimiento.stock
  );

  if (validacion) {
    setErrorMovimiento(validacion);
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
      `${API_URL}/api/movimientos`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(datosMovimiento),
      }
    );

    const datos = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
      setErrorMovimiento(
        mensajeDeApi(datos, "Ocurrió un error al registrar el movimiento")
      );
      return;
    }

    await cargarProductos();
    await cargarMovimientos();
    await cargarDashboard();

    setCantidadMovimiento("");
    setMotivoMovimiento("");
    setErrorMovimiento(null);
    setProductoMovimiento(null);
    setMostrarMovimiento(false);

  } catch (error) {
    console.error(error);
    setErrorMovimiento("Ocurrió un error al registrar el movimiento");
  }
};
const movimientosFiltrados = movimientos.filter((movimiento) => {
  const coincideTipo =
    tipoFiltroMovimiento === "" ||
    movimiento.tipo === tipoFiltroMovimiento;

  const coincideProducto =
    productoFiltroMovimiento === "" ||
    movimiento.producto_id === Number(productoFiltroMovimiento);

  const fecha = new Date(movimiento.fecha);
  return coincideTipo && coincideProducto && (!fechaDesde || fecha >= new Date(`${fechaDesde}T00:00:00`)) && (!fechaHasta || fecha <= new Date(`${fechaHasta}T23:59:59.999`));
});
const guardarCategoria = async () => {
  const validacion = validarNombreCategoria(nombreCategoria);
  setErrorCategoria(validacion);
  if (validacion) {
    return;
  }

  try {
    let respuesta;

    // Si NO estamos editando → crear
    if (categoriaEditando === null) {
      respuesta = await fetch(
        `${API_URL}/api/categorias`,
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
        `${API_URL}/api/categorias/${categoriaEditando}`,
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
      setErrorCategoria(mensajeDeApi(datos, "No se pudo guardar la categoría"));
      return;
    }

    // Volver a cargar las categorías
    await cargarCategorias();

    // También recargamos productos porque
    // puede haber cambiado el nombre de su categoría
    await cargarProductos();
    //actualizar las tarjetas del dashboard
    await cargarDashboard();
   
    // Limpiar
    setNombreCategoria("");
    setCategoriaEditando(null);

  } catch (error) {
    console.error(error);

    setErrorCategoria("Ocurrió un error al guardar la categoría");
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
      `${API_URL}/api/categorias/${id}`,
      {
        method: "DELETE",
      }
    );

    const datos = await respuesta.json();

   if (!respuesta.ok) {
  setErrorCategoria(mensajeDeApi(datos, "No se pudo eliminar la categoría"));
  return;
}

    await cargarCategorias();
    await cargarProductos();
    await cargarDashboard();
  } catch (error) {
    console.error(error);

    setErrorCategoria("Ocurrió un error al eliminar la categoría");
  }
};
  return (
    
    <div className="stockflow-container">

      {/* =========================
          ENCABEZADO
      ========================== */}

  <Header
  alternarFormulario={alternarFormulario}
/>

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
          {errorFormulario && <p role="alert" className="mensaje-error">{errorFormulario}</p>}

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
            step="0.01"
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
            disabled={guardandoProducto}
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

      <ResumenInventario
        dashboard={dashboard}
        onFiltrarEstado={setEstadoFiltro}
        cargando={cargandoDashboard}
        error={errorDashboard}
      />

      {/* =========================
          PRODUCTOS
      ========================== */}

      <div className="tabla-contenedor">

        <h2>Productos</h2>
        {errorAccion && <p role="alert" className="mensaje-error">{errorAccion}</p>}
        <button type="button" disabled={!productosMostrados.length} onClick={() => descargarCsv("productos.csv", [["ID", "Producto", "Categoría", "Precio", "Stock", "Estado"], ...productosMostrados.map(p => [p.id, p.nombre, p.categoria, p.precio, p.stock, obtenerEstadoStock(p.stock)])])}>Exportar productos CSV</button>

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

          <select
            className="filtro-categoria"
            value={estadoFiltro}
            onChange={(e) =>
              setEstadoFiltro(e.target.value)
            }
          >
            <option value="">Todos los estados</option>
            <option value="Sin stock">Sin stock</option>
            <option value="Bajo stock">Bajo stock</option>
            <option value="Disponible">Disponible</option>
          </select>

        </div>

        {/* TABLA */}

        <table className="tabla-productos">

          <thead>

            <tr>
              <th>ID</th>
              <th
                className="columna-orden"
                onClick={() => ordenarPor("nombre")}
              >
                Producto {campoOrden === "nombre" ? (direccionOrden === "asc" ? "↑" : "↓") : ""}
              </th>
              <th>Categoría</th>
              <th
                className="columna-orden"
                onClick={() => ordenarPor("precio")}
              >
                Precio {campoOrden === "precio" ? (direccionOrden === "asc" ? "↑" : "↓") : ""}
              </th>
              <th
                className="columna-orden"
                onClick={() => ordenarPor("stock")}
              >
                Stock {campoOrden === "stock" ? (direccionOrden === "asc" ? "↑" : "↓") : ""}
              </th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>

          </thead>

          <tbody>

            {productosMostrados.map((producto) => (

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

                <span className={obtenerClaseEstado(producto.stock)}>
  {obtenerEstadoStock(producto.stock)}
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

        {cargandoProductos && (
          <p>Cargando productos...</p>
        )}

        {errorProductos && (
          <p className="mensaje-error">{errorProductos}</p>
        )}

        {!cargandoProductos &&
          !errorProductos &&
          productos.length === 0 && (
            <p>No hay productos.</p>
          )}

        {!cargandoProductos &&
          !errorProductos &&
          productos.length > 0 &&
          productosFiltrados.length === 0 && (
            <p>No se encontraron productos.</p>
          )}

      </div>
{mostrarMovimiento && productoMovimiento && (

  <div className="form-movimiento">

    {errorMovimiento && <p role="alert" className="mensaje-error">{errorMovimiento}</p>}
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
        {errorMovimientos && <p role="alert" className="mensaje-error">{errorMovimientos}</p>}
        {!errorMovimientos && movimientosFiltrados.length === 0 && <p>No hay movimientos para los filtros seleccionados.</p>}
        <button type="button" disabled={!movimientosFiltrados.length} onClick={() => descargarCsv("movimientos.csv", [["Producto", "Tipo", "Cantidad", "Stock anterior", "Stock nuevo", "Motivo", "Fecha"], ...movimientosFiltrados.map(m => [m.producto, m.tipo, m.cantidad, m.stock_anterior, m.stock_nuevo, m.motivo, m.fecha])])}>Exportar movimientos CSV</button>
        <div className="filtros-movimientos">
          <label>Desde <input type="date" value={fechaDesde} max={fechaHasta || undefined} onChange={e => setFechaDesde(e.target.value)} /></label>
          <label>Hasta <input type="date" value={fechaHasta} min={fechaDesde || undefined} onChange={e => setFechaHasta(e.target.value)} /></label>
          <button type="button" onClick={() => { setFechaDesde(""); setFechaHasta(""); setTipoFiltroMovimiento(""); setProductoFiltroMovimiento(""); }}>Limpiar filtros</button>
        </div>
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
  {(errorCategorias || errorCategoria) && <p role="alert" className="mensaje-error">{errorCategoria || errorCategorias}</p>}
  {!errorCategorias && categorias.length === 0 && <p>Crea una categoría para agregar productos.</p>}
  
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

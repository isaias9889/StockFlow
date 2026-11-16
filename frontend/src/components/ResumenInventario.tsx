import type { Dashboard } from "../types/Dashboard";

interface ResumenInventarioProps {
  dashboard: Dashboard | null;
  onFiltrarEstado: (estado: string) => void;
  cargando: boolean;
  error: string | null;
}

function ResumenInventario({
  dashboard,
  onFiltrarEstado,
  cargando,
  error,
}: ResumenInventarioProps) {

  if (cargando) {
    return <p>Cargando resumen...</p>;
  }

  if (error) {
    return <p className="mensaje-error">{error}</p>;
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="resumen-inventario">

      <div
        className="tarjeta tarjeta-clickable"
        onClick={() => onFiltrarEstado("")}
      >
        <p>Total productos</p>
        <h2>{dashboard.total_productos}</h2>
      </div>

      <div
        className="tarjeta tarjeta-clickable"
        onClick={() => onFiltrarEstado("Sin stock")}
      >
        <p>Sin stock</p>
        <h2>{dashboard.sin_stock}</h2>
      </div>

      <div
        className="tarjeta tarjeta-clickable"
        onClick={() => onFiltrarEstado("Bajo stock")}
      >
        <p>Bajo stock</p>
        <h2>{dashboard.bajo_stock}</h2>
      </div>

      <div className="tarjeta">
        <p>Categorías</p>
        <h2>{dashboard.total_categorias}</h2>
      </div>

      <div className="tarjeta">
        <p>Unidades en stock</p>
        <h2>{dashboard.unidades_stock}</h2>
      </div>

      <div className="tarjeta tarjeta-valor">
        <p>Valor del inventario</p>
        <h2>
          ${dashboard.valor_inventario.toLocaleString("es-CL")}
        </h2>
      </div>

      <div className="tarjeta">
        <p>Entradas</p>
        <h2>{dashboard.total_entradas}</h2>
      </div>

      <div className="tarjeta">
        <p>Salidas</p>
        <h2>{dashboard.total_salidas}</h2>
      </div>

    </div>
  );
}

export default ResumenInventario;

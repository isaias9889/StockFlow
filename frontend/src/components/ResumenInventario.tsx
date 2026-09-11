import type { Dashboard } from "../types/Dashboard";

interface ResumenInventarioProps {
  dashboard: Dashboard | null;
}

function ResumenInventario({
  dashboard,
}: ResumenInventarioProps) {

  if (!dashboard) {
    return <p>Cargando resumen...</p>;
  }

  return (
    <div className="resumen-inventario">

      <div className="tarjeta">
        <p>Total productos</p>
        <h2>{dashboard.total_productos}</h2>
      </div>

      <div className="tarjeta">
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

      <div className="tarjeta">
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
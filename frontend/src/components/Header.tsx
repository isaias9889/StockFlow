interface HeaderProps {
  alternarFormulario: () => void;
}

function Header({ alternarFormulario }: HeaderProps) {
  return (
    <header className="stockflow-header">
      <div>
        <h1>StockFlow — Gestión de Inventario</h1>
        <p>Stock, movimientos y categorías en un solo panel</p>
      </div>

      <button
        type="button"
        className="btn-nuevo"
        onClick={alternarFormulario}
      >
        + Nuevo producto
      </button>
    </header>
  );
}

export default Header;
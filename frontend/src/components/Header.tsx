interface HeaderProps {
  alternarFormulario: () => void;
}

function Header({ alternarFormulario }: HeaderProps) {
  return (
    <header>
      <h1>StockFlow — Gestión de Inventario</h1>

      <button onClick={alternarFormulario}>
        + Nuevo producto
      </button>
    </header>
  );
}

export default Header;
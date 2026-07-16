import { Home, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// Par Início/Voltar padrão das páginas internas — texto amarelo, sem fundo (paleta do "Buscar").
const linkClass = "flex items-center gap-1 md:gap-2 font-bold uppercase hover:opacity-80 transition-opacity";
const linkStyle = { color: "#F2C21A", fontSize: "1rem" } as const;

const HomeBackNav = () => {
  const navigate = useNavigate();
  return (
    <>
      <Link to="/" className={linkClass} style={linkStyle}>
        <Home className="w-4 h-4" />
        Início
      </Link>
      <button onClick={() => navigate(-1)} className={linkClass} style={linkStyle}>
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>
    </>
  );
};

export default HomeBackNav;

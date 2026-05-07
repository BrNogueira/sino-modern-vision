import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logoSinos from "@/assets/logo-sinos-imoveis.png";
import SearchBar from "./SearchBar";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  const navLinks = [
    { label: "Início", href: "/" },
    { label: "Imóveis", href: "/imoveis" },
    { label: "Categorias", href: "/#categorias" },
    { label: "Contato", href: "/contato" },
  ];

  // ===== HOME HEADER =====
  if (isHome) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 flex items-center justify-between py-3">
          <Link to="/" className="flex flex-col items-start">
          <img src={logoSinos} alt="Sinos Imóveis" className="w-auto h-[6rem] md:h-[20rem]" />
            <span
              className="text-foreground font-normal -mt-1"
              style={{ lineHeight: "1.5rem", marginLeft: "10px", marginTop: "-20px" }}
            >
              <span className="text-sm md:text-[2rem] whitespace-nowrap"><strong>15 anos</strong> realizando sonhos</span>
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <button
              className="p-2 text-primary-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
              style={{ marginTop: "0" }}
            >
              {isMenuOpen ? <X className="w-10 h-10" strokeWidth={3} /> : <Menu className="w-10 h-10" strokeWidth={3} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div
            className="absolute top-full left-0 right-0 bg-primary/95 backdrop-blur-md border-b border-primary/80 shadow-2xl z-[100]"
            style={{ marginTop: "0" }}
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-primary-foreground hover:text-primary-foreground/70 transition-colors py-2 text-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    );
  }

  // ===== INTERNAL PAGES HEADER =====
  return (
    <header className="relative z-50 bg-primary border-b border-primary/80 shadow-sm">
      <div className="container mx-auto px-4 flex items-center justify-between py-2">
        <Link to="/" className="flex flex-col items-start">
          <img src={logoSinos} alt="Sinos Imóveis" className="w-auto h-32 md:h-64" />
          <span className="text-primary-foreground text-sm md:text-3xl -mt-6 md:-mt-10 ml-2">
            <strong>15 anos</strong> realizando sonhos
          </span>
        </Link>
      </div>

      {/* Search bar identical to home */}
      <div className="container mx-auto px-4 pb-4">
        <SearchBar />
      </div>
    </header>
  );
};

export default Header;

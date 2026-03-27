import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logoSinos from "@/assets/logo-sinos-imoveis.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  const navLinks = [
    { label: "Início", href: "/" },
    { label: "Imóveis", href: "/imoveis" },
    { label: "Categorias", href: "/#categorias" },
    { label: "Contato", href: "/#contato" },
  ];

  const textClass = "text-primary-foreground";
  const menuBtnClass = "text-primary-foreground";

  return (
    <header
      className={`${
        isHome
          ? "absolute top-0 left-0 right-0"
          : "sticky top-0 bg-primary border-b border-primary/80 shadow-sm"
      } z-50`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between py-3">
        {/* Logo */}
        <Link to="/" className="flex flex-col items-start" style={{ marginLeft: "25px" }}>
          <img src={logoSinos} alt="Sinos Imóveis" className="w-auto" style={{ height: isHome ? "20rem" : "12rem" }} />
          {isHome && (
            <span
              className="text-foreground font-normal -mt-1"
              style={{ fontSize: "1.2rem", lineHeight: "1.5rem", marginLeft: "15px", marginTop: "-15px" }}
            >
              <strong>15 anos</strong> realizando sonhos
            </span>
          )}
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <button
            className={`p-2 ${isHome ? 'header__menu-button--home' : 'header__menu-button--inner'} ${menuBtnClass}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-3">
          <button
            className={`p-2 ${isHome ? 'header__menu-button--home' : 'header__menu-button--inner'} ${menuBtnClass}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Menu Dropdown */}
      {isMenuOpen && (
        <div
          className={`absolute top-full left-0 right-0 ${isHome ? "bg-foreground/50 backdrop-blur-sm" : "bg-primary"} border-b border-primary/80 shadow-lg`}
          style={{ marginTop: "-9rem" }}
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
};

export default Header;

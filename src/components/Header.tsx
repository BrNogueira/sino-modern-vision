import { useState } from "react";
import { Menu, X, Star } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useFavorites } from "@/contexts/FavoritesContext";
import logoSinos from "@/assets/logo-sinos-imoveis.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { count } = useFavorites();
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
        <Link to="/" className="flex flex-col items-start">
          <img src={logoSinos} alt="Sinos Imóveis" className={`${isHome ? "h-20 md:h-60" : "h-12 md:h-16"} w-auto`} />
          <span className={`${isHome ? "text-primary-foreground" : "text-primary-foreground/80"} text-xs font-normal mt-0.5`}>
            <strong>15 anos</strong> realizando sonhos
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/favoritos"
            className={`flex items-center gap-1.5 ${textClass} hover:opacity-80 transition-colors`}
          >
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold">Favoritos</span>
            {count > 0 && (
              <span className="bg-accent text-accent-foreground text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {count}
              </span>
            )}
          </Link>

          <button
            className={`p-2 ${menuBtnClass}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-3">
          <Link to="/favoritos" className={`relative ${textClass}`}>
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-bold px-1 rounded-full min-w-[16px] text-center">
                {count}
              </span>
            )}
          </Link>
          <button
            className={`p-2 ${menuBtnClass}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Menu Dropdown */}
      {isMenuOpen && (
        <div className={`absolute top-full left-0 right-0 ${isHome ? "bg-foreground/50 backdrop-blur-sm" : "bg-primary"} border-b border-primary/80 shadow-lg`}>
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

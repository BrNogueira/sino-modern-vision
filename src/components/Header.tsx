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
    { label: "Contato", href: "/contato" },
  ];

  // ===== HOME HEADER =====
  if (isHome) {
    return (
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between py-3">
          <Link to="/" className="flex flex-col items-start" style={{ marginLeft: "25px" }}>
            <img src={logoSinos} alt="Sinos Imóveis" className="w-auto h-[12rem] md:h-[27rem]" />
            <span
              className="text-foreground font-normal -mt-1"
              style={{ lineHeight: "1.5rem", marginLeft: "10px", marginTop: "-25px" }}
            >
              <span className="text-sm md:text-[2rem]"><strong>15 anos</strong> realizando sonhos</span>
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <button
              className="p-2 header__menu-button--home text-primary-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div
            className="absolute top-full left-0 right-0 bg-foreground/50 backdrop-blur-sm border-b border-primary/80 shadow-lg"
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
  }

  // ===== INTERNAL PAGES HEADER =====
  return (
    <>
    <header className="relative z-50 bg-primary border-b border-primary/80 shadow-sm">
      <div className="container mx-auto px-4 flex items-center justify-between py-2">
        <Link to="/" className="flex flex-col items-start" style={{ marginLeft: "25px" }}>
          <img src={logoSinos} alt="Sinos Imóveis" className="w-auto" style={{ height: "8rem" }} />
          <span className="text-primary-foreground" style={{ fontSize: "15px", marginTop: "-20px", marginLeft: "5px" }}>
            <strong>15 anos</strong> realizando sonhos
          </span>
        </Link>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-primary-foreground"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop Nav - inline with logo */}
      <nav className="hidden md:flex items-center gap-6">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.href || 
            (link.href !== "/" && location.pathname.startsWith(link.href.split("#")[0]));
          return (
            <Link
              key={link.label}
              to={link.href}
              className={`text-primary-foreground transition-colors text-base font-medium px-3 py-1 rounded-md ${
                isActive
                  ? "bg-primary-foreground/20 underline underline-offset-4"
                  : "hover:bg-primary-foreground/10 hover:underline underline-offset-4"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-primary border-t border-primary-foreground/20 shadow-lg">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-primary-foreground hover:bg-primary-foreground/10 transition-colors py-2 px-3 rounded-md text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
    
    </>
  );
};

export default Header;

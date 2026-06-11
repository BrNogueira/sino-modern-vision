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

  const renderNavLinks = () => (
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
  );

  const menuButton = (
    <button
      className="p-2 text-primary-foreground"
      onClick={() => setIsMenuOpen(!isMenuOpen)}
      aria-label="Menu"
    >
      {isMenuOpen ? <X className="w-10 h-10" strokeWidth={3} /> : <Menu className="w-10 h-10" strokeWidth={3} />}
    </button>
  );

  // ===== HOME HEADER =====
  if (isHome) {
    return (
      <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="container mx-auto px-4 flex items-center justify-between py-3">
          <Link to="/" className="flex flex-col items-start">
            <img src={logoSinos} alt="Sinos Imóveis" className="w-auto h-[8rem] md:h-[20rem]" />
            <span
              className="text-black font-normal -mt-1"
              style={{ lineHeight: "1.5rem", marginLeft: "10px", marginTop: "-20px" }}
            >
              <span className="text-sm md:text-[2rem] whitespace-nowrap"><strong>15 anos</strong> realizando sonhos</span>
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {menuButton}
          </div>
        </div>

        {isMenuOpen && (
          <div className="fixed inset-x-0 top-[180px] md:top-[400px] bottom-0 bg-primary/95 z-[100] overflow-y-auto">
            {renderNavLinks()}
          </div>
        )}
      </header>
    );
  }

  // ===== INTERNAL PAGES HEADER =====
  return (
    <header className="bg-primary shadow-md mb-8 sticky top-0 z-40 transition-all duration-300">
      <div className="container mx-auto px-4 flex items-center justify-between py-4 gap-8">
        <Link to="/" className="flex flex-col items-start flex-shrink-0 hover:opacity-90 transition-opacity">
          <img src={logoSinos} alt="Sinos Imóveis" className="w-auto h-[6rem] md:h-[10rem] drop-shadow-sm" />
          <span
            className="text-white font-normal"
            style={{ lineHeight: "1.2rem", marginLeft: "8px", marginTop: "-12px" }}
          >
            <span className="text-sm md:text-lg whitespace-nowrap font-medium drop-shadow-sm"><strong>15 anos</strong> realizando sonhos</span>
          </span>
        </Link>

        {/* Search bar on the right for desktop */}
        <div className="hidden lg:block flex-1 max-w-5xl header-search-container">
          <SearchBar />
        </div>


        <div className="flex items-center gap-4">
          <button
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="w-8 h-8 md:w-10 md:h-10" strokeWidth={3} /> : <Menu className="w-8 h-8 md:w-10 md:h-10" strokeWidth={3} />}
          </button>
        </div>
      </div>

      {/* Search bar for mobile/tablet */}
      <div className="lg:hidden px-4 pb-6">
        <SearchBar />
      </div>

      {isMenuOpen && (
        <div className="fixed inset-x-0 top-[220px] lg:top-[160px] bottom-0 bg-primary/95 z-[100] overflow-y-auto backdrop-blur-sm">
          {renderNavLinks()}
        </div>
      )}

    </header>
  );
};

export default Header;
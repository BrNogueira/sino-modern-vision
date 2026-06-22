import { useState } from "react";
import { Menu, X, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logoSinos from "@/assets/logo-sinos-imoveis.png";
import SearchBar from "./SearchBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // No mobile a busca começa recolhida (oculta) e é expandida por um botão.
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isMobile = useIsMobile();

  const navLinks = [
    { label: "Início", href: "/" },
    { label: "Imóveis", href: "/imoveis" },
    { label: "Categorias", href: "/#categorias" },
    { label: "Contato", href: "/contato" },
  ];

  // Desktop overlay menu (unchanged behavior)
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

  // Mobile drawer menu (Sheet) — slides in from the right, no fragile pixel offsets
  const mobileMenu = (
    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <SheetContent
        side="right"
        className="w-[82vw] max-w-sm bg-primary text-primary-foreground border-0 p-0"
      >
        <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/15">
          <img src={logoSinos} alt="Sinos Imóveis" className="h-12 w-auto" />
          <span className="text-sm font-medium text-primary-foreground/90 leading-tight">
            <strong>15 anos</strong> realizando sonhos
          </span>
        </div>
        <nav className="flex flex-col px-3 py-4 gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center min-h-[52px] px-4 rounded-lg text-lg font-medium text-primary-foreground hover:bg-white/10 active:bg-white/15 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
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
            <button
              className="p-2 text-primary-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              {isMenuOpen && !isMobile ? <X className="w-10 h-10" strokeWidth={3} /> : <Menu className="w-10 h-10" strokeWidth={3} />}
            </button>
          </div>
        </div>

        {/* Mobile: drawer */}
        {isMobile && mobileMenu}

        {/* Desktop: overlay (unchanged) */}
        {!isMobile && isMenuOpen && (
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


        <div className="flex items-center gap-2">
          {/* Mobile: botão para expandir/recolher a busca */}
          {isMobile && (
            <button
              className="flex items-center gap-1 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setIsSearchOpen((v) => !v)}
              aria-label={isSearchOpen ? "Recolher busca" : "Expandir busca"}
              aria-expanded={isSearchOpen}
            >
              <Search className="w-7 h-7" strokeWidth={2.5} />
              {isSearchOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          )}
          <button
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            {isMenuOpen && !isMobile ? <X className="w-8 h-8 md:w-10 md:h-10" strokeWidth={3} /> : <Menu className="w-8 h-8 md:w-10 md:h-10" strokeWidth={3} />}
          </button>
        </div>
      </div>

      {/* Search bar for mobile/tablet — no mobile, oculta até expandir */}
      {(!isMobile || isSearchOpen) && (
        <div className="lg:hidden px-4 pb-6">
          <SearchBar />
        </div>
      )}

      {/* Mobile: drawer */}
      {isMobile && mobileMenu}

      {/* Desktop: overlay (unchanged) */}
      {!isMobile && isMenuOpen && (
        <div className="fixed inset-x-0 top-[220px] lg:top-[160px] bottom-0 bg-primary/95 z-[100] overflow-y-auto backdrop-blur-sm">
          {renderNavLinks()}
        </div>
      )}

    </header>
  );
};

export default Header;

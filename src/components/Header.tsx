import { useState } from "react";
import { Menu, X } from "lucide-react";
import logoSinos from "@/assets/logo-sinos-imoveis.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: "Início", href: "#" },
    { label: "Imóveis", href: "#imoveis" },
    { label: "Categorias", href: "#categorias" },
    { label: "Sobre", href: "#sobre" },
    { label: "Contato", href: "#contato" },
  ];

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between py-4">
        {/* Logo */}
        <a href="#" className="flex flex-col items-start">
          <img src={logoSinos} alt="Sinos Imóveis" className="h-16 md:h-20 w-auto" />
          <span className="text-primary-foreground text-xs md:text-sm font-normal mt-1">
            <strong>15 anos</strong> realizando sonhos
          </span>
        </a>

        {/* Hamburger */}
        <button
          className="p-2 text-primary-foreground"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu"
        >
          {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
      </div>

      {/* Mobile/Desktop Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-primary border-b border-primary/80 shadow-lg">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-primary-foreground hover:text-accent transition-colors py-2 text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

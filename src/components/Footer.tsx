import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contato" className="bg-card text-foreground pt-16 pb-8 border-t border-accent/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-xl">S</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-accent leading-none">Sinos</span>
                <span className="text-xs text-muted-foreground tracking-wide">IMÓVEIS</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Há mais de 15 anos ajudando famílias a encontrarem o lar dos sonhos na região do Vale dos Sinos.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              {["Início", "Imóveis", "Categorias", "Sobre Nós", "Contato"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-muted-foreground hover:text-accent transition-colors text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Categorias</h4>
            <ul className="space-y-2">
              {["Casas", "Apartamentos", "Terrenos", "Sítios", "Comerciais"].map((cat) => (
                <li key={cat}>
                  <a href="#" className="text-muted-foreground hover:text-accent transition-colors text-sm">
                    {cat}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <Phone className="w-5 h-5 text-accent" />
                <span className="text-muted-foreground">(51) 3333-0000</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="w-5 h-5 text-accent" />
                <span className="text-muted-foreground">contato@sinosimoveis.com.br</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="w-5 h-5 text-accent flex-shrink-0" />
                <span className="text-muted-foreground">
                  Rua General Osório, 123<br />
                  Centro, Novo Hamburgo - RS
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2024 Sinos Imóveis. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-300"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-300"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-300"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

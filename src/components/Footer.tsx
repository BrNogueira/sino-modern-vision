import { Phone, MapPin, Mail, Instagram } from "lucide-react";
import logoSinos from "@/assets/logo-sinos-imoveis.png";

const Footer = () => {
  return (
    <footer id="contato" className="bg-primary text-primary-foreground">
      {/* Quote */}
      <div className="bg-accent/30 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-foreground text-lg md:text-xl italic max-w-2xl mx-auto">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          </p>
        </div>
      </div>

      {/* Footer Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          {/* Logo */}
          <div className="flex flex-col items-center md:items-start">
            <img src={logoSinos} alt="Sinos Imóveis" className="h-16 w-auto" />
            <span className="text-primary-foreground/80 text-xs mt-1">
              <strong>15 anos</strong> realizando sonhos
            </span>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5" />
              <span className="text-lg font-semibold">(XX) XXXXX-XXXX</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-primary-foreground/80 text-xs">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              </span>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-primary-foreground/80 text-xs">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              </span>
            </div>
          </div>

          {/* Social + Simulador */}
          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
            <a href="#" className="text-primary-foreground font-semibold hover:underline">
              Simulador Caixa
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

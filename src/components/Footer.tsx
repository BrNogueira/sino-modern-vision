import { Phone, MapPin, Mail, Clock, Facebook, Instagram, Youtube } from "lucide-react";
import logoSinos from "@/assets/logo-sinos-imoveis.png";

const Footer = () => {
  return (
    <footer id="contato" className="text-white">

      {/* Main footer */}
      <div style={{ backgroundColor: "#0a6936", borderTop: "4px solid #f5c518", borderBottom: "4px solid #f5c518" }}>
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">

            {/* Col 1: Logo + slogan */}
            <div className="flex flex-col items-center md:items-start gap-2">
              <img src={logoSinos} alt="Sinos Imóveis" className="h-48 w-auto" style={{ height: '12rem', width: 'auto' }} />
              <span className="text-white/80 mt-1 text-2xl">
                <strong>15 anos</strong> realizando sonhos
              </span>
              <span className="text-white/60 mt-4 text-2xl">CRECI: 23250</span>
            </div>

            {/* Col 2: Contact info */}
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 shrink-0" />
                <span className="font-semibold text-2xl">(51) 3596-1446 | (51) 99595-1446</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="text-white/80 leading-relaxed text-2xl">
                  Rua João Aloisio Algayer, 1565 - Lomba Grande/NH
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 shrink-0" />
                <a href="mailto:atendimento@sinosimoveis.com.br" className="text-white/80 hover:text-white transition-colors text-2xl">
                  atendimento@sinosimoveis.com.br
                </a>
              </div>
              <div className="flex items-start gap-3 mt-2">
                <Clock className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-white/80 text-xs leading-relaxed">
                  <p className="font-semibold text-white mb-1 text-2xl">Horário de atendimento</p>
                  <p className="text-2xl">Seg à sexta: 8h30 às 12h e das 13h30 às 18h</p>
                  <p className="text-2xl">Sábados: 8h30 às 12h</p>
                  <p className="mt-1 italic text-white/60 text-2xl">
                    Obs.: Demais horários e domingos atendemos com hora marcada.
                  </p>
                </div>
              </div>
            </div>

            {/* Col 3: Social + Simulador */}
            <div className="flex flex-col items-center md:items-end gap-5">
              <div>
                <p className="font-semibold mb-3 text-center md:text-right text-3xl">Redes Sociais</p>
                <div className="flex items-center gap-4 justify-center md:justify-end">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-16 h-16 rounded-full flex items-center justify-center transition-opacity hover:opacity-80" style={{ backgroundColor: '#1877F2', color: '#fff' }}>
                    <Facebook className="w-9 h-9" />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-16 h-16 rounded-full flex items-center justify-center transition-opacity hover:opacity-80" style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', color: '#fff' }}>
                    <Instagram className="w-9 h-9" />
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-16 h-16 rounded-full flex items-center justify-center transition-opacity hover:opacity-80" style={{ backgroundColor: '#FF0000', color: '#fff' }}>
                    <Youtube className="w-9 h-9" />
                  </a>
                </div>
              </div>
              <a
                href="https://www8.caixa.gov.br/siopiinternet-web/simulaOperacaoInternet.do?method=inicializarCasoUso"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-semibold hover:underline mt-2 text-2xl"
              >
                Simulador Caixa
              </a>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/15">
          <div className="container mx-auto px-4 py-4 text-center">
            <p className="text-white/50 text-2xl">
              © {new Date().getFullYear()} Sinos Imóveis. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

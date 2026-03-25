import { Phone, MapPin, Mail, Instagram, Clock, Facebook } from "lucide-react";
import logoSinos from "@/assets/logo-sinos-imoveis.png";

const Footer = () => {
  return (
    <footer id="contato" className="text-white">

      {/* Main footer */}
      <div style={{ backgroundColor: "#0a6936" }}>
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">

            {/* Col 1: Logo + slogan */}
            <div className="flex flex-col items-center md:items-start gap-2">
              <img src={logoSinos} alt="Sinos Imóveis" className="h-16 w-auto" />
              <span className="text-white/80 text-xs mt-1">
                <strong>15 anos</strong> realizando sonhos
              </span>
              <span className="text-white/60 text-[10px] mt-4">CRECI: 23250</span>
            </div>

            {/* Col 2: Contact info */}
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 shrink-0" />
                <span className="text-lg font-semibold">(51) 3596-1446 | (51) 99595-1446</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="text-white/80 text-xs leading-relaxed">
                  Rua João Aloisio Algayer, 1565 - Lomba Grande/NH
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 shrink-0" />
                <a href="mailto:atendimento@sinosimoveis.com.br" className="text-white/80 text-xs hover:text-white transition-colors">
                  atendimento@sinosimoveis.com.br
                </a>
              </div>
              <div className="flex items-start gap-3 mt-2">
                <Clock className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-white/80 text-xs leading-relaxed">
                  <p className="font-semibold text-white text-sm mb-1">Horário de atendimento</p>
                  <p>Seg à sexta: 8h30 às 12h e das 13h30 às 18h</p>
                  <p>Sábados: 8h30 às 12h</p>
                  <p className="mt-1 italic text-white/60 text-[11px]">
                    Obs.: Demais horários e domingos atendemos com hora marcada.
                  </p>
                </div>
              </div>
            </div>

            {/* Col 3: Social + Simulador */}
            <div className="flex flex-col items-center md:items-end gap-5">
              <div>
                <p className="text-sm font-semibold mb-3 text-center md:text-right">Redes Sociais</p>
                <div className="flex items-center gap-3">
                  <a
                    href="https://www.instagram.com/sinosimoveis"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.facebook.com/sinosimoveis"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                </div>
              </div>
              <a
                href="https://www8.caixa.gov.br/siopiinternet-web/simulaOperacaoInternet.do?method=inicializarCasoUso"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-semibold text-sm hover:underline mt-2"
              >
                Simulador Caixa
              </a>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/15">
          <div className="container mx-auto px-4 py-4 text-center">
            <p className="text-white/50 text-xs">
              © {new Date().getFullYear()} Sinos Imóveis. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

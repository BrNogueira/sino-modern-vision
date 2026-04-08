import { Phone, MapPin, Mail, Clock } from "lucide-react";
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
                  {/* Instagram */}
                  <a
                    href="https://www.instagram.com/sinosimoveis"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  </a>
                  {/* Facebook */}
                  <a
                    href="https://www.facebook.com/sinosimoveis"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#1877F2" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                  {/* YouTube */}
                  <a
                    href="https://www.youtube.com/@sinosimoveis"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#FF0000" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                  {/* TikTok */}
                  <a
                    href="https://www.tiktok.com/@sinosimoveis"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#000000" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
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

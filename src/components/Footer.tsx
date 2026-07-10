import { Phone, MapPin, Mail, Clock, Facebook, Instagram, Youtube, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import logoSinos from "@/assets/logo-sinos-imoveis.webp";

const GREEN = "#0a6936";
const YELLOW = "#f5c518";

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: YELLOW }}>
    {children}
  </p>
);

const socials = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

const Footer = () => {
  return (
    <footer id="contato" className="text-white" style={{ backgroundColor: GREEN }}>
      {/* fio de acento */}
      <div style={{ height: 2, backgroundColor: YELLOW }} />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Marca */}
          <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
            <img src={logoSinos} alt="Sinos Imóveis" className="h-12 w-auto" loading="lazy" />
            <p className="text-white/70 text-sm">
              <strong className="font-semibold text-white">15 anos</strong> realizando sonhos
            </p>
            <span className="inline-flex items-center rounded-full border border-white/20 px-3 py-0.5 text-[11px] tracking-wider text-white/70">
              CRECI 23250
            </span>
          </div>

          {/* Contato */}
          <div>
            <SectionLabel>Contato</SectionLabel>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 shrink-0" style={{ color: YELLOW }} />
                <span>(51) 3596-1446 · (51) 99595-1446</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: YELLOW }} />
                <span className="text-white/80 leading-relaxed">
                  Rua João Aloisio Algayer, 1565 — Lomba Grande / NH
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 shrink-0" style={{ color: YELLOW }} />
                <a href="mailto:atendimento@sinosimoveis.com.br" className="text-white/80 hover:text-white transition-colors break-all">
                  atendimento@sinosimoveis.com.br
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: YELLOW }} />
                <div className="text-white/70 leading-relaxed">
                  <p>Seg a sex: 8h30–12h e 13h30–18h</p>
                  <p>Sáb: 8h30–12h</p>
                  <p className="text-white/50 text-xs mt-1 italic">Domingos e demais horários com hora marcada.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Social + simulador */}
          <div className="flex flex-col items-center md:items-end">
            <SectionLabel>Redes sociais</SectionLabel>
            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 text-white transition-colors hover:bg-[#f5c518] hover:text-[#0a6936]"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            <a
              href="https://www8.caixa.gov.br/siopiinternet-web/simulaOperacaoInternet.do?method=inicializarCasoUso"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
            >
              Simulador Caixa
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Sinos Imóveis. Todos os direitos reservados.</p>
          <Link to="/politica-de-privacidade" className="hover:text-white transition-colors">
            Política de Privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

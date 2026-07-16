import { Link } from "react-router-dom";
import enderecoIcon from "@/assets/endereco-footer.png";
import contatoIcon from "@/assets/contato-footer.png";
import mailIcon from "@/assets/mail-footer.png";
import simuladorImg from "@/assets/simulador-footer.png";
import facebookIcon from "@/assets/icone-facebook.png";
import instagramIcon from "@/assets/icone-instagram.png";

const GREEN = "#0a6936";
const YELLOW = "#ffcb05";

const Footer = () => {
  return (
    <footer id="contato" className="text-white" style={{ backgroundColor: GREEN }}>
      <div style={{ height: 2, backgroundColor: YELLOW }} />

      <div className="container mx-auto px-4 pt-10 pb-8 text-sm">
        <div className="flex flex-col md:flex-row gap-8 md:gap-6 justify-between max-w-[980px] mx-auto">

          {/* Esquerda */}
          <div className="md:w-[360px] md:pr-8">
            <h2 className="font-bold italic uppercase text-white text-2xl pb-2">Sinos Imóveis</h2>
            <p className="flex items-center gap-1.5 leading-9">
              <img src={enderecoIcon} alt="" className="w-9 h-9 shrink-0" loading="lazy" />
              <span>Rua João Aloisio Algayer, 1565 - Lomba Grande/NH</span>
            </p>
            <p className="flex items-center gap-1.5 leading-9">
              <img src={contatoIcon} alt="" className="w-9 h-9 shrink-0" loading="lazy" />
              <span>
                <a href="tel:5135961446" className="text-white hover:underline">(51)3596 1446</a>
                &nbsp;|&nbsp;
                <a href="https://web.whatsapp.com/send?phone=5551995951446&text=" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">(51)99595-1446</a>
              </span>
            </p>
            <p className="flex items-center gap-1.5 leading-9">
              <img src={mailIcon} alt="" className="w-9 h-9 shrink-0" loading="lazy" />
              <a href="mailto:atendimento@sinosimoveis.com.br" className="text-white hover:underline break-all">atendimento@sinosimoveis.com.br</a>
            </p>
            <div className="italic mt-4">
              <Link to="/admin" className="text-white hover:underline"><strong>Admin</strong></Link>
              {" | "}
              <Link to="/admin" className="text-white hover:underline"><strong>Corretor</strong></Link>
            </div>
          </div>

          {/* Meio */}
          <div className="md:w-[346px] text-xs leading-[22px]">
            <h3 className="text-[15px] mb-2.5">Redes Sociais:</h3>
            <div className="mb-4 flex gap-1.5">
              <a href="https://www.facebook.com/sinosimoveis" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <img src={facebookIcon} alt="Facebook" className="w-[30px] h-[30px]" loading="lazy" />
              </a>
              <a href="https://www.instagram.com/sinosimoveis" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <img src={instagramIcon} alt="Instagram" className="w-[30px] h-[30px]" loading="lazy" />
              </a>
            </div>
            <h4 className="text-base" style={{ color: YELLOW }}>Horário de atendimento:</h4>
            <p className="text-base font-bold">Seg à sexta: 8h30 às 12h e das 13h30 às 18h</p>
            <p className="text-base font-bold">Sábados:&nbsp;8h30 às 12h</p>
            <p>Obs.: Demais horários e domingos atendemos com hora marcada.</p>
          </div>

          {/* Direita */}
          <div className="hidden md:block w-[209px] text-right">
            <a
              href="http://www8.caixa.gov.br/siopiinternet/simulaOperacaoInternet.do?method=inicializarCasoUso"
              target="_blank"
              rel="noopener noreferrer"
              className="block mb-6"
            >
              <img src={simuladorImg} alt="Simulador Financeiro Caixa" className="w-[209px] h-auto rounded-lg" loading="lazy" />
            </a>
            <strong className="text-xs italic font-bold" style={{ color: YELLOW }}>CRECI: 23250</strong>
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

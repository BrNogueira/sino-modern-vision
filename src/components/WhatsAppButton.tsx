import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  return (
    <a
      href="https://web.whatsapp.com/send?phone=555195951446"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-110"
      style={{ backgroundColor: "#1FA855" }}
      aria-label="Contato via WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-white" />
    </a>
  );
};

export default WhatsAppButton;

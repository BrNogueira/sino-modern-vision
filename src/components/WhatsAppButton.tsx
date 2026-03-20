import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  return (
    <a
      href="https://web.whatsapp.com/send?phone=555195951446"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 md:hidden flex items-center justify-center w-12 h-12 rounded-xl shadow-md transition-opacity hover:opacity-90"
      style={{ backgroundColor: "#1FA855" }}
    >
      <MessageCircle className="w-6 h-6 text-white" />
    </a>
  );
};

export default WhatsAppButton;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "true");
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg animate-in fade-in slide-in-from-bottom-full duration-500">
      <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground text-center md:text-left">
          <p>
            Nós utilizamos cookies para melhorar sua experiência e oferecer conteúdos personalizados. 
            Ao continuar navegando, você concorda com a nossa{" "}
            <Link to="/politica-de-privacidade" className="text-emerald-600 hover:underline font-medium">
              Política de Privacidade
            </Link>.
          </p>
        </div>
        <div className="flex gap-4 shrink-0">
          <Button variant="outline" size="sm" onClick={handleAccept}>
            Recusar
          </Button>
          <Button size="sm" onClick={handleAccept} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Aceitar Cookies
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
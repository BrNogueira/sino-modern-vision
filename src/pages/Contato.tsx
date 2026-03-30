import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Phone, MapPin, Mail, Clock, Instagram, Facebook, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contato = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", mensagem: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = encodeURIComponent(
      `Olá! Meu nome é ${form.nome}.\n${form.email ? `Email: ${form.email}\n` : ""}${form.telefone ? `Tel: ${form.telefone}\n` : ""}\n${form.mensagem}`
    );
    window.open(`https://web.whatsapp.com/send?phone=555195951446&text=${msg}`, "_blank");
    toast({ title: "Redirecionando para WhatsApp", description: "Sua mensagem será enviada pelo WhatsApp." });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3">
              Fale Conosco
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              Estamos prontos para atender você. Entre em contato por WhatsApp, telefone ou preencha o formulário.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Envie sua mensagem</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Nome *</label>
                  <Input
                    required
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">E-mail</label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Telefone</label>
                    <Input
                      value={form.telefone}
                      onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                      placeholder="(51) 99999-9999"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Mensagem *</label>
                  <Textarea
                    required
                    rows={5}
                    value={form.mensagem}
                    onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                    placeholder="Como podemos ajudar?"
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto gap-2" style={{ backgroundColor: "#1FA855" }}>
                  <MessageCircle className="w-4 h-4" />
                  Enviar via WhatsApp
                </Button>
              </form>
            </div>

            {/* Info */}
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Informações de contato</h2>

              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">(51) 3596-1446</p>
                    <p className="text-muted-foreground text-sm">(51) 99595-1446</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Endereço</p>
                    <p className="text-muted-foreground text-sm">Rua João Aloisio Algayer, 1565 - Lomba Grande/NH</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">E-mail</p>
                    <a href="mailto:atendimento@sinosimoveis.com.br" className="text-primary text-sm hover:underline">
                      atendimento@sinosimoveis.com.br
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Horário de atendimento</p>
                    <p className="text-muted-foreground text-sm">Seg à sexta: 8h30 às 12h e 13h30 às 18h</p>
                    <p className="text-muted-foreground text-sm">Sábados: 8h30 às 12h</p>
                    <p className="text-muted-foreground/70 text-xs mt-1 italic">
                      Demais horários e domingos: com hora marcada.
                    </p>
                  </div>
                </div>
              </div>

              {/* Social */}
              <div>
                <p className="font-semibold text-foreground mb-3">Redes Sociais</p>
                <div className="flex gap-3">
                  <a
                    href="https://www.instagram.com/sinosimoveis"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Instagram className="w-5 h-5 text-foreground" />
                  </a>
                  <a
                    href="https://www.facebook.com/sinosimoveis"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Facebook className="w-5 h-5 text-foreground" />
                  </a>
                  <a
                    href="https://web.whatsapp.com/send?phone=555195951446"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#1FA855" }}
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Map embed */}
              <div className="rounded-lg overflow-hidden border border-border">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3467.0!2d-51.08!3d-29.68!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sRua+Jo%C3%A3o+Aloisio+Algayer%2C+1565+-+Lomba+Grande%2C+Novo+Hamburgo!5e0!3m2!1spt-BR!2sbr"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Localização Sinos Imóveis"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Contato;

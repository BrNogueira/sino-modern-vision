import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-3xl mx-auto prose prose-emerald dark:prose-invert">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Política de Privacidade</h1>
          
          <p className="text-muted-foreground mb-6">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-emerald-600">1. Introdução</h2>
            <p>
              A sua privacidade é importante para nós. É política do nosso site respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site e outros sites que possuímos e operamos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-emerald-600">2. Coleta de Informações</h2>
            <p>
              Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-emerald-600">3. Uso de Informações</h2>
            <p>
              Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.
            </p>
            <p>
              Você é livre para recusar a nossa solicitação de informações pessoais, entendendo que talvez não possamos fornecer alguns dos serviços desejados.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-emerald-600">4. Cookies</h2>
            <p>
              Utilizamos cookies para melhorar a sua experiência em nosso site. Os cookies são pequenos arquivos que um site ou o seu provedor de serviços transfere para o disco rígido do seu computador através do navegador (se você permitir) que permite que os sistemas do site ou do provedor de serviços reconheçam o seu navegador e capturem e lembrem de certas informações.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-emerald-600">5. Segurança</h2>
            <p>
              Protegemos as informações coletadas dentro de meios comercialmente aceitáveis para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-emerald-600">6. Compromisso do Usuário</h2>
            <p>
              O usuário se compromete a fazer uso adequado dos conteúdos e da informação que o site oferece e com caráter enunciativo, mas não limitativo:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Não se envolver em atividades que sejam ilegais ou contrárias à boa fé a à ordem pública;</li>
              <li>Não causar danos aos sistemas físicos (hardwares) e lógicos (softwares) do site;</li>
              <li>Não tentar acessar, e se for o caso, utilizar as contas de e-mail de outros usuários.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-emerald-600">7. Contato</h2>
            <p>
              Se você tiver alguma dúvida sobre como lidamos com dados do usuário e informações pessoais, entre em contato conosco através da nossa página de contato.
            </p>
          </section>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default PrivacyPolicy;
import { useState } from "react";
import { useAdminProperties } from "@/contexts/AdminPropertiesContext";
import { generateVRSyncXml } from "@/lib/vrsyncXmlGenerator";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Download, RefreshCw, ExternalLink, Copy, FileCode2, CheckCircle2, AlertCircle, Globe } from "lucide-react";

const CanalProPage = () => {
  const { properties } = useAdminProperties();
  const { toast } = useToast();
  const [xmlPreview, setXmlPreview] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  const activeProperties = properties.filter((p) => p.ativo);

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "";
  const feedUrl = projectId
    ? `https://${projectId}.supabase.co/functions/v1/canal-pro-feed`
    : "";

  const handleGenerateXml = () => {
    setIsGenerating(true);
    try {
      const xml = generateVRSyncXml(properties);
      setXmlPreview(xml);
      setLastGenerated(new Date().toLocaleString("pt-BR"));
      toast({
        title: "XML gerado com sucesso!",
        description: `${activeProperties.length} imóveis ativos incluídos no feed.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar XML",
        description: "Verifique os dados dos imóveis.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadXml = () => {
    const xml = generateVRSyncXml(properties);
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sinosimoveis-feed-vrsync-${new Date().toISOString().split("T")[0]}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Download iniciado!", description: "O arquivo XML foi baixado." });
  };

  const handleCopyFeedUrl = () => {
    if (feedUrl) {
      navigator.clipboard.writeText(feedUrl);
      toast({ title: "URL copiada!", description: "Cole no Canal Pro em Configurações > Integração de Anúncios." });
    }
  };

  const handleTestFeed = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("canal-pro-feed", {
        body: { properties },
      });
      
      if (error) throw error;
      
      // data will be the XML string
      setXmlPreview(typeof data === "string" ? data : JSON.stringify(data, null, 2));
      setLastGenerated(new Date().toLocaleString("pt-BR"));
      toast({
        title: "Feed testado com sucesso!",
        description: "A edge function respondeu corretamente.",
      });
    } catch (error: any) {
      // If edge function not deployed, generate locally
      handleGenerateXml();
      toast({
        title: "Edge function não disponível",
        description: "XML gerado localmente. Deploy a edge function para habilitar o feed online.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Canal Pro — Integração Grupo ZAP</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie o feed XML VRSync para publicação automática nos portais ZAP Imóveis, VivaReal e OLX.
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Imóveis</p>
                <p className="text-2xl font-bold">{properties.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ativos no Feed</p>
                <p className="text-2xl font-bold text-green-600">{activeProperties.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inativos</p>
                <p className="text-2xl font-bold text-orange-600">
                  {properties.length - activeProperties.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feed URL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            URL do Feed XML
          </CardTitle>
          <CardDescription>
            Copie esta URL e cole no Canal Pro em{" "}
            <strong>Configurações → Integração de Anúncios</strong>. O bot do Grupo ZAP baixa o XML a cada 12h automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {feedUrl ? (
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted px-3 py-2 rounded-md text-sm break-all">
                {feedUrl}
              </code>
              <Button variant="outline" size="sm" onClick={handleCopyFeedUrl}>
                <Copy className="h-4 w-4 mr-1" />
                Copiar
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              A URL do feed será gerada após o deploy da edge function. Configure o{" "}
              <code>VITE_SUPABASE_PROJECT_ID</code> no projeto.
            </p>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs">VRSync</Badge>
            <span>Formato oficial recomendado pelo Grupo ZAP</span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode2 className="h-5 w-5" />
            Ações
          </CardTitle>
          <CardDescription>
            Gere, teste ou baixe o feed XML dos seus imóveis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleGenerateXml} disabled={isGenerating}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
              Gerar XML Local
            </Button>
            <Button variant="outline" onClick={handleTestFeed} disabled={isGenerating}>
              <Globe className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
              Testar Edge Function
            </Button>
            <Button variant="outline" onClick={handleDownloadXml}>
              <Download className="h-4 w-4 mr-2" />
              Baixar XML
            </Button>
            <a
              href="https://canalpro.grupozap.com/login"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary">
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Canal Pro
              </Button>
            </a>
          </div>

          {lastGenerated && (
            <p className="text-xs text-muted-foreground">
              Última geração: {lastGenerated}
            </p>
          )}
        </CardContent>
      </Card>

      {/* XML Preview */}
      {xmlPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Prévia do XML</CardTitle>
            <CardDescription>
              {activeProperties.length} imóveis ativos no feed VRSync
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-[500px] whitespace-pre-wrap">
              {xmlPreview}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Como configurar no Canal Pro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Acesse{" "}
              <a
                href="https://canalpro.grupozap.com/login"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                canalpro.grupozap.com
              </a>{" "}
              e faça login
            </li>
            <li>Clique no ícone do perfil → <strong>Configurações de conta</strong></li>
            <li>Acesse <strong>Integração de anúncios</strong></li>
            <li>No campo <strong>"Nome do software"</strong>, digite: <code>Sinos Imóveis</code></li>
            <li>No campo <strong>"URL do XML"</strong>, cole a URL do feed acima</li>
            <li>Clique em <strong>Salvar</strong></li>
            <li>O processamento ocorre 2x por dia (a cada 12 horas)</li>
          </ol>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="font-medium text-foreground">⚠️ Importante:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>O User-Agent <code>VivaRealBot/1.0</code> deve estar liberado no servidor</li>
              <li>Imóveis criados via XML não podem ser editados manualmente no Canal Pro</li>
              <li>Somente imóveis <strong>ativos</strong> são incluídos no feed</li>
              <li>Fotos devem ser em formato JPG e máximo 7MB</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CanalProPage;

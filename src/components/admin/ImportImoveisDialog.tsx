import { useRef, useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAdminProperties } from "@/contexts/AdminPropertiesContext";
import { buildImportPreview, type CsvImportPreview, type LogicalField } from "@/lib/csvImport";

const FIELD_LABELS: Record<LogicalField, string> = {
  codigo: "Código",
  categoria: "Categoria",
  titulo: "Título",
  cidade: "Cidade",
  bairro: "Bairro",
  preco: "Preço",
  area_terreno: "Área terreno",
  area_construida: "Área construída",
  condicoes_pagamento: "Condições de pagamento",
  descricao: "Descrição",
  imagem_principal: "Imagem principal",
  todas_imagens: "Todas as imagens",
  total_fotos: "Total de fotos",
  url: "URL",
};
const ALL_FIELDS = Object.keys(FIELD_LABELS) as LogicalField[];

type Result = { inserted: number; errors: { index: number; message: string }[] };

export function ImportImoveisDialog() {
  const { importImoveis } = useAdminProperties();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState<CsvImportPreview | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Result | null>(null);

  const reset = () => {
    setFileName(""); setPreview(null); setResult(null);
    setProgress(0); setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFile = async (file: File) => {
    setResult(null);
    setFileName(file.name);
    try {
      const text = await file.text();
      const p = buildImportPreview(text);
      setPreview(p);
      if (p.mapped.length === 0)
        toast({ title: "CSV vazio", description: "Nenhuma linha de dados encontrada.", variant: "destructive" });
    } catch (e) {
      toast({
        title: "Erro ao ler arquivo",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    if (!preview) return;
    const validRows = preview.mapped.filter((m) => m.errors.length === 0).map((m) => m.row);
    if (validRows.length === 0) {
      toast({ title: "Nada a importar", description: "Nenhuma linha válida no CSV.", variant: "destructive" });
      return;
    }
    setImporting(true); setProgress(0);
    try {
      const res = await importImoveis(validRows, (done, total) =>
        setProgress(Math.round((done / total) * 100)),
      );
      setResult(res);
      toast({
        title: "Importação concluída",
        description: `${res.inserted} imóvel(is) importado(s)${res.errors.length ? `, ${res.errors.length} com erro` : ""}.`,
        variant: res.errors.length ? "destructive" : "default",
      });
    } catch (e) {
      toast({
        title: "Erro na importação",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const previewRows = preview?.mapped.slice(0, 8) ?? [];

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="gap-2">
          <Upload className="w-4 h-4" />
          Importar CSV
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar imóveis via CSV</DialogTitle>
          <DialogDescription>
            Colunas reconhecidas: codigo, categoria, titulo, cidade, bairro, preco, area_terreno,
            area_construida, condicoes_pagamento, descricao, imagem_principal, todas_imagens,
            total_fotos, url.
          </DialogDescription>
        </DialogHeader>

        {/* Dropzone */}
        {!result && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`w-full border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
              dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-foreground font-medium">
              {fileName || "Clique ou arraste um arquivo .csv aqui"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Delimitador detectado automaticamente (vírgula, ponto-e-vírgula, tab ou |)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </button>
        )}

        {/* Preview / validação */}
        {preview && !result && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="w-3.5 h-3.5" /> {preview.validCount} válidas
              </span>
              {preview.errorCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                  <X className="w-3.5 h-3.5" /> {preview.errorCount} com erro
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                delimitador "{preview.delimiter === "\t" ? "tab" : preview.delimiter}"
              </span>
            </div>

            {preview.missingFields.length > 0 && (
              <div className="flex items-start gap-2 text-xs bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 rounded-lg p-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Colunas obrigatórias não encontradas:{" "}
                  {preview.missingFields.map((f) => FIELD_LABELS[f]).join(", ")}. As linhas afetadas serão puladas.
                </span>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Mapeamento:{" "}
              {ALL_FIELDS.filter((f) => preview.columnMap[f]).map((f) => (
                <span key={f} className="inline-block mr-2">
                  <span className="font-medium text-foreground">{FIELD_LABELS[f]}</span>
                  {" ← "}
                  <code>{preview.columnMap[f]}</code>
                </span>
              ))}
            </div>

            <div className="border border-border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Fotos</TableHead>
                    <TableHead>Situação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((m, i) => {
                    const r = m.row as Record<string, any>;
                    const ok = m.errors.length === 0;
                    return (
                      <TableRow key={i} className={ok ? "" : "bg-destructive/5"}>
                        <TableCell className="font-mono text-xs">{r.codigo_imovel || "—"}</TableCell>
                        <TableCell className="max-w-[180px] truncate">{r.titulo_imovel || "—"}</TableCell>
                        <TableCell>{r.cidade || "—"}</TableCell>
                        <TableCell>{r.preco_venda ? `R$ ${Number(r.preco_venda).toLocaleString("pt-BR")}` : "—"}</TableCell>
                        <TableCell>{Array.isArray(r.fotos) ? r.fotos.length : 0}</TableCell>
                        <TableCell className="text-xs">
                          {ok ? (
                            m.warnings.length ? (
                              <span className="text-yellow-600">{m.warnings.join("; ")}</span>
                            ) : (
                              <span className="text-primary">ok</span>
                            )
                          ) : (
                            <span className="text-destructive">{m.errors.join("; ")}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {preview.mapped.length > previewRows.length && (
              <p className="text-xs text-muted-foreground text-center">
                Mostrando {previewRows.length} de {preview.mapped.length} linhas.
              </p>
            )}

            {importing && (
              <div className="space-y-1">
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground text-center">{progress}%</p>
              </div>
            )}
          </div>
        )}

        {/* Resultado */}
        {result && (
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="font-medium">{result.inserted} imóvel(is) importado(s) com sucesso.</span>
            </div>
            {result.errors.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm text-destructive font-medium">
                  {result.errors.length} linha(s) com erro:
                </p>
                <div className="max-h-40 overflow-y-auto text-xs bg-destructive/5 rounded-lg p-2 space-y-0.5">
                  {result.errors.slice(0, 50).map((e) => (
                    <div key={e.index}>
                      Linha {e.index + 2}: <span className="text-destructive">{e.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {result ? (
            <>
              <Button variant="outline" onClick={reset}>Importar outro</Button>
              <Button onClick={() => setOpen(false)}>Concluir</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={importing}>
                Cancelar
              </Button>
              <Button onClick={handleImport} disabled={!preview || preview.validCount === 0 || importing}>
                {importing ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Importando...</>
                ) : (
                  `Importar ${preview?.validCount ?? 0} imóvel(is)`
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useMemo, useRef, useState } from "react";
import { Search, MapPin, MapPinned, Loader2 } from "lucide-react";
import { toast } from "sonner";
import PropertyMap from "@/components/PropertyMap";
import { useAdminProperties } from "@/contexts/AdminPropertiesContext";
import { zapToProperty } from "@/lib/zapToProperty";
import { geocodeAddress, sleep } from "@/lib/geocode";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LEGEND = [
  { type: "Casa", color: "bg-red-500" },
  { type: "Apartamento", color: "bg-blue-500" },
  { type: "Terreno", color: "bg-green-500" },
  { type: "Sítio", color: "bg-purple-500" },
  { type: "Comercial", color: "bg-orange-500" },
  { type: "Condomínio", color: "bg-yellow-500" },
];

const ALL = "__all__";

const MapaPage = () => {
  const { properties: dbProperties, loading, updateProperty } = useAdminProperties();

  const [transacao, setTransacao] = useState<string>(ALL);
  const [tipo, setTipo] = useState<string>(ALL);
  const [cidade, setCidade] = useState<string>(ALL);
  const [busca, setBusca] = useState("");

  // Geocodificação em lote dos imóveis sem coordenadas.
  const [geo, setGeo] = useState<{ running: boolean; done: number; total: number; ok: number }>(
    { running: false, done: 0, total: 0, ok: 0 },
  );
  const cancelGeo = useRef(false);

  // Imóveis ativos, com endereço, mas sem coordenadas — candidatos a geocodificar.
  const pendentes = useMemo(
    () =>
      dbProperties.filter(
        (p) =>
          p.ativo &&
          !(p.latitude && p.longitude) &&
          !!p.cidade &&
          (!!p.endereco || !!p.bairro),
      ),
    [dbProperties],
  );

  async function geocodificarPendentes() {
    if (geo.running || pendentes.length === 0) return;
    cancelGeo.current = false;
    setGeo({ running: true, done: 0, total: pendentes.length, ok: 0 });

    let done = 0;
    let ok = 0;
    for (const p of pendentes) {
      if (cancelGeo.current) break;
      const result = await geocodeAddress({
        endereco: p.endereco,
        numero: p.numero,
        bairro: p.bairro,
        cidade: p.cidade,
        estado: p.estado,
        cep: p.cep,
      });
      if (result) {
        try {
          await updateProperty(p.id, {
            latitude: String(result.lat),
            longitude: String(result.lng),
          });
          ok++;
        } catch {
          /* erro ao salvar — ignora e segue */
        }
      }
      done++;
      setGeo((g) => ({ ...g, done, ok }));
      // Política do Nominatim: no máximo 1 requisição por segundo.
      await sleep(1100);
    }

    setGeo((g) => ({ ...g, running: false }));
    toast.success(
      `Geocodificação concluída: ${ok} de ${done} imóveis localizados.`,
    );
  }

  // Imóveis ativos convertidos para o formato do mapa.
  const allProperties = useMemo(
    () => dbProperties.filter((p) => p.ativo).map(zapToProperty),
    [dbProperties],
  );

  // Apenas os que possuem coordenadas aparecem no mapa.
  const geoProperties = useMemo(
    () => allProperties.filter((p) => p.latitude != null && p.longitude != null),
    [allProperties],
  );

  // Opções dos filtros derivadas dos próprios dados.
  const tipos = useMemo(
    () => [...new Set(geoProperties.map((p) => p.type).filter(Boolean))].sort(),
    [geoProperties],
  );
  const cidades = useMemo(
    () => [...new Set(geoProperties.map((p) => p.city).filter(Boolean))].sort(),
    [geoProperties],
  );

  const filtered = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return geoProperties.filter((p) => {
      if (transacao !== ALL && p.transactionType !== transacao) return false;
      if (tipo !== ALL && p.type !== tipo) return false;
      if (cidade !== ALL && p.city !== cidade) return false;
      if (q) {
        const haystack = `${p.title} ${p.code} ${p.location}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [geoProperties, transacao, tipo, cidade, busca]);

  const semCoordenadas = allProperties.length - geoProperties.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Mapa</h1>
        <p className="text-sm text-muted-foreground">
          Visualize imóveis cadastrados no mapa
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:flex-row md:items-end md:flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Buscar (título, código ou local)
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar imóvel..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="min-w-[150px]">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Transação
          </label>
          <Select value={transacao} onValueChange={setTransacao}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas</SelectItem>
              <SelectItem value="venda">Venda</SelectItem>
              <SelectItem value="aluguel">Aluguel</SelectItem>
              <SelectItem value="venda/aluguel">Venda/Aluguel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[150px]">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Tipo
          </label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos</SelectItem>
              {tipos.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[150px]">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Cidade
          </label>
          <Select value={cidade} onValueChange={setCidade}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas</SelectItem>
              {cidades.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resumo + legenda */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          <strong className="text-foreground">{filtered.length}</strong> imóveis no mapa
          {semCoordenadas > 0 && (
            <span className="text-xs">
              ({semCoordenadas} sem coordenadas cadastradas)
            </span>
          )}
        </span>

        <div className="flex flex-wrap gap-3 text-xs">
          {LEGEND.map((item) => (
            <span key={item.type} className="flex items-center gap-1.5">
              <span className={`h-3 w-3 rounded-full ${item.color}`} />
              {item.type}
            </span>
          ))}
        </div>
      </div>

      {/* Geocodificação de imóveis sem coordenadas */}
      {pendentes.length > 0 && (
        <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            <strong className="text-foreground">{pendentes.length}</strong> imóveis com
            endereço, mas sem coordenadas — não aparecem no mapa.
            {geo.running && (
              <span className="ml-1">
                Processando {geo.done}/{geo.total} ({geo.ok} localizados)…
              </span>
            )}
          </div>
          {geo.running ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                cancelGeo.current = true;
              }}
            >
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              Parar
            </Button>
          ) : (
            <Button size="sm" onClick={geocodificarPendentes}>
              <MapPinned className="mr-1 h-4 w-4" />
              Geocodificar agora
            </Button>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex h-[75vh] w-full items-center justify-center rounded-xl border border-border bg-card text-muted-foreground">
          Carregando imóveis...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-[75vh] w-full flex-col items-center justify-center rounded-xl border border-border bg-card text-muted-foreground">
          <MapPin className="mb-2 h-8 w-8 opacity-40" />
          Nenhum imóvel encontrado com os filtros atuais.
        </div>
      ) : (
        <PropertyMap properties={filtered} className="h-[75vh] w-full" />
      )}
    </div>
  );
};

export default MapaPage;

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";

const PesquisarPage = () => {
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Pesquisar</h1>
        <p className="text-sm text-muted-foreground">Busque imóveis, clientes ou proprietários</p>
      </div>
      <div className="flex gap-2 max-w-lg">
        <Input placeholder="Digite sua busca..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button><Search className="w-4 h-4" /></Button>
      </div>
      <div className="bg-card border border-border rounded-xl p-6">
        <p className="text-muted-foreground text-sm">Nenhum resultado encontrado.</p>
      </div>
    </div>
  );
};

export default PesquisarPage;

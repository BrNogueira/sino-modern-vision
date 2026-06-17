/* AdminPropertiesContext - persistência via Lovable Cloud */
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ZapImovel,
  defaultFeatureFlags,
  defaultGarantias,
} from "@/types/zapImoveis";

interface AdminPropertiesContextType {
  properties: ZapImovel[];
  loading: boolean;
  addProperty: (property: Omit<ZapImovel, "id" | "createdAt" | "updatedAt">) => Promise<ZapImovel | null>;
  updateProperty: (id: string, property: Partial<ZapImovel>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  getProperty: (id: string) => ZapImovel | undefined;
  /** Importação em lote (CSV). `rows` em snake_case prontos para a tabela imoveis. */
  importImoveis: (
    rows: Record<string, unknown>[],
    onProgress?: (done: number, total: number) => void,
  ) => Promise<{ inserted: number; errors: { index: number; message: string }[] }>;
  refresh: () => Promise<void>;
}

const AdminPropertiesContext = createContext<AdminPropertiesContextType | null>(null);

import { fromRow } from "@/lib/imovelMapper";

const toRow = (p: Partial<ZapImovel>): any => {
  const row: any = {};
  if (p.codigoImovel !== undefined) row.codigo_imovel = p.codigoImovel;
  if (p.tituloImovel !== undefined) row.titulo_imovel = p.tituloImovel;
  if (p.tipoImovel !== undefined) row.tipo_imovel = p.tipoImovel;
  if (p.subTipoImovel !== undefined) row.sub_tipo_imovel = p.subTipoImovel;
  if (p.categoriaImovel !== undefined) row.categoria_imovel = p.categoriaImovel;
  if (p.tipoOferta !== undefined) row.tipo_oferta = p.tipoOferta;
  if (p.modalidade !== undefined) row.modalidade = p.modalidade;
  if (p.cep !== undefined) row.cep = p.cep;
  if (p.estado !== undefined) row.estado = p.estado;
  if (p.cidade !== undefined) row.cidade = p.cidade;
  if (p.zona !== undefined) row.zona = p.zona;
  if (p.bairro !== undefined) row.bairro = p.bairro;
  if (p.endereco !== undefined) row.endereco = p.endereco;
  if (p.numero !== undefined) row.numero = p.numero;
  if (p.complemento !== undefined) row.complemento = p.complemento;
  if (p.latitude !== undefined) row.latitude = p.latitude;
  if (p.longitude !== undefined) row.longitude = p.longitude;
  if (p.precoVenda !== undefined) row.preco_venda = p.precoVenda;
  if (p.precoAluguel !== undefined) row.preco_aluguel = p.precoAluguel;
  if (p.iptu !== undefined) row.iptu = p.iptu;
  if (p.valorCondominio !== undefined) row.valor_condominio = p.valorCondominio;
  if (p.areaTotal !== undefined) row.area_total = p.areaTotal;
  if (p.areaUtil !== undefined) row.area_util = p.areaUtil;
  if (p.areaDimensions !== undefined) row.area_dimensions = p.areaDimensions;
  if (p.qtdDormitorios !== undefined) row.qtd_dormitorios = p.qtdDormitorios;
  if (p.qtdSuites !== undefined) row.qtd_suites = p.qtdSuites;
  if (p.qtdBanheiros !== undefined) row.qtd_banheiros = p.qtdBanheiros;
  if (p.qtdVagas !== undefined) row.qtd_vagas = p.qtdVagas;
  if (p.observacao !== undefined) row.observacao = p.observacao;
  if (p.descricaoCurta !== undefined) row.descricao_curta = p.descricaoCurta;
  if (p.fotos !== undefined) row.fotos = p.fotos;
  if (p.videoUrl !== undefined) row.video_url = p.videoUrl;
  if (p.linkTourVirtual !== undefined) row.link_tour_virtual = p.linkTourVirtual;
  if (p.features !== undefined) row.features = p.features;
  if (p.garantias !== undefined) row.garantias = p.garantias;
  if (p.anoConstrucao !== undefined) row.ano_construcao = p.anoConstrucao;
  if (p.proprietarioNome !== undefined) row.proprietario_nome = p.proprietarioNome;
  if (p.proprietarioTelefone !== undefined) row.proprietario_telefone = p.proprietarioTelefone;
  if (p.proprietarioEmail !== undefined) row.proprietario_email = p.proprietarioEmail;
  if (p.proprietarioDocumento !== undefined) row.proprietario_documento = p.proprietarioDocumento;
  if (p.ativo !== undefined) row.ativo = p.ativo;
  if (p.destaque !== undefined) row.destaque = p.destaque;
  if (p.exclusivo !== undefined) row.exclusivo = p.exclusivo;
  if (p.categoriaId !== undefined) row.categoria_id = p.categoriaId;
  return row;
};

export const AdminPropertiesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<ZapImovel[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("imoveis")
      .select("id,codigo_imovel,titulo_imovel,tipo_imovel,sub_tipo_imovel,categoria_imovel,tipo_oferta,modalidade,cep,estado,cidade,zona,bairro,endereco,numero,complemento,latitude,longitude,preco_venda,preco_aluguel,iptu,valor_condominio,area_total,area_util,area_dimensions,qtd_dormitorios,qtd_suites,qtd_banheiros,qtd_vagas,descricao_curta,fotos,video_url,link_tour_virtual,ano_construcao,proprietario_nome,proprietario_telefone,proprietario_email,proprietario_documento,ativo,destaque,exclusivo,categoria_id,created_at,updated_at")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to load imoveis:", error);
      setProperties([]);
    } else {
      setProperties((data || []).map(fromRow));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addProperty = useCallback(
    async (property: Omit<ZapImovel, "id" | "createdAt" | "updatedAt">) => {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = { ...toRow(property), created_by: user?.id ?? null };
      const { data, error } = await supabase
        .from("imoveis")
        .insert(payload)
        .select()
        .single();
      if (error) {
        console.error("Failed to insert imovel:", error);
        throw error;
      }
      const created = fromRow(data);
      setProperties((prev) => [created, ...prev]);
      return created;
    },
    [],
  );

  const updateProperty = useCallback(async (id: string, updates: Partial<ZapImovel>) => {
    const { data, error } = await supabase
      .from("imoveis")
      .update(toRow(updates))
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.error("Failed to update imovel:", error);
      throw error;
    }
    const updated = fromRow(data);
    setProperties((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }, []);

  const deleteProperty = useCallback(async (id: string) => {
    const { error } = await supabase.from("imoveis").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete imovel:", error);
      throw error;
    }
    setProperties((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getProperty = useCallback(
    (id: string) => properties.find((p) => p.id === id),
    [properties],
  );

  const importImoveis = useCallback(
    async (
      rows: Record<string, unknown>[],
      onProgress?: (done: number, total: number) => void,
    ) => {
      const { data: { user } } = await supabase.auth.getUser();
      const createdBy = user?.id ?? null;
      const CHUNK = 50;
      let inserted = 0;
      const errors: { index: number; message: string }[] = [];

      for (let i = 0; i < rows.length; i += CHUNK) {
        const chunk = rows.slice(i, i + CHUNK).map((r) => ({ ...r, created_by: createdBy }));
        const { data, error } = await supabase.from("imoveis").insert(chunk).select();
        if (error) {
          // Falha no lote → reinsere linha a linha para isolar os registros ruins.
          for (let j = 0; j < chunk.length; j++) {
            const { error: e1 } = await supabase.from("imoveis").insert(chunk[j]).select();
            if (e1) errors.push({ index: i + j, message: e1.message });
            else inserted++;
          }
        } else {
          inserted += Array.isArray(data) ? data.length : chunk.length;
        }
        onProgress?.(Math.min(i + CHUNK, rows.length), rows.length);
      }

      await refresh();
      return { inserted, errors };
    },
    [refresh],
  );

  return (
    <AdminPropertiesContext.Provider
      value={{ properties, loading, addProperty, updateProperty, deleteProperty, getProperty, importImoveis, refresh }}
    >
      {children}
    </AdminPropertiesContext.Provider>
  );
};

export const useAdminProperties = () => {
  const ctx = useContext(AdminPropertiesContext);
  if (!ctx) throw new Error("useAdminProperties must be used within AdminPropertiesProvider");
  return ctx;
};

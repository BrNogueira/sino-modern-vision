import React, { createContext, useContext, useState, useCallback } from "react";
import {
  ZapImovel,
  defaultCaracteristicas,
  defaultGarantias,
} from "@/types/zapImoveis";

interface AdminPropertiesContextType {
  properties: ZapImovel[];
  addProperty: (property: Omit<ZapImovel, "id" | "createdAt" | "updatedAt">) => void;
  updateProperty: (id: string, property: Partial<ZapImovel>) => void;
  deleteProperty: (id: string) => void;
  getProperty: (id: string) => ZapImovel | undefined;
}

const AdminPropertiesContext = createContext<AdminPropertiesContextType | null>(null);

const initialProperties: ZapImovel[] = [
  {
    id: "1",
    codigoImovel: "CA0001",
    tituloImovel: "Casa Moderna Alto Padrão em Campo Bom",
    tipoImovel: "Casa",
    subTipoImovel: "Casa Padrão",
    categoriaImovel: "Térrea",
    tipoOferta: 2,
    estado: "Rio Grande do Sul",
    cidade: "Campo Bom",
    zona: "",
    bairro: "Colina do Sol",
    endereco: "Rua das Flores",
    numero: "123",
    complemento: "",
    cep: "93700000",
    latitude: "-29.6842",
    longitude: "-51.0497",
    precoVenda: 1590000,
    precoAluguel: null,
    iptu: 3500,
    valorCondominio: null,
    areaTotal: 450,
    areaUtil: 280,
    qtdDormitorios: 3,
    qtdSuites: 3,
    qtdBanheiros: 4,
    qtdVagas: 2,
    observacao: "Esta magnífica casa moderna representa o ápice do luxo e conforto. Com arquitetura contemporânea e acabamentos de alto padrão, oferece uma experiência de moradia incomparável.",
    fotos: [],
    videoUrl: "",
    linkTourVirtual: "",
    caracteristicas: { ...defaultCaracteristicas, piscina: true, churrasqueira: true, jardim: true },
    garantias: defaultGarantias,
    anoConstrucao: 2023,
    ativo: true,
    destaque: true,
    exclusivo: true,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    id: "2",
    codigoImovel: "AP0002",
    tituloImovel: "Apartamento 2 Dormitórios Centro Novo Hamburgo",
    tipoImovel: "Apartamento",
    subTipoImovel: "Apartamento Padrão",
    categoriaImovel: "Padrão",
    tipoOferta: 1,
    estado: "Rio Grande do Sul",
    cidade: "Novo Hamburgo",
    zona: "",
    bairro: "Centro",
    endereco: "Av. Pedro Adams Filho",
    numero: "456",
    complemento: "Apto 301",
    cep: "93310000",
    latitude: "-29.6878",
    longitude: "-51.1309",
    precoVenda: null,
    precoAluguel: 1800,
    iptu: 120,
    valorCondominio: 450,
    areaTotal: null,
    areaUtil: 65,
    qtdDormitorios: 2,
    qtdSuites: 0,
    qtdBanheiros: 1,
    qtdVagas: 1,
    observacao: "Apartamento funcional e bem localizado no centro de Novo Hamburgo. Próximo a comércios e transporte público.",
    fotos: [],
    videoUrl: "",
    linkTourVirtual: "",
    caracteristicas: { ...defaultCaracteristicas, interfone: true, salaoFestas: true },
    garantias: { ...defaultGarantias, seguroFianca: true },
    anoConstrucao: 2018,
    ativo: true,
    destaque: false,
    exclusivo: false,
    createdAt: "2024-02-10",
    updatedAt: "2024-02-10",
  },
];

export const AdminPropertiesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<ZapImovel[]>(initialProperties);

  const addProperty = useCallback((property: Omit<ZapImovel, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString().split("T")[0];
    const newProp: ZapImovel = {
      ...property,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setProperties((prev) => [newProp, ...prev]);
  }, []);

  const updateProperty = useCallback((id: string, updates: Partial<ZapImovel>) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString().split("T")[0] } : p
      )
    );
  }, []);

  const deleteProperty = useCallback((id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getProperty = useCallback(
    (id: string) => properties.find((p) => p.id === id),
    [properties]
  );

  return (
    <AdminPropertiesContext.Provider value={{ properties, addProperty, updateProperty, deleteProperty, getProperty }}>
      {children}
    </AdminPropertiesContext.Provider>
  );
};

export const useAdminProperties = () => {
  const ctx = useContext(AdminPropertiesContext);
  if (!ctx) throw new Error("useAdminProperties must be used within AdminPropertiesProvider");
  return ctx;
};

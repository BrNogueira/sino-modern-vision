export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      condominios: {
        Row: {
          administradora: string | null
          ativo: boolean
          bairro: string | null
          cep: string | null
          cidade: string | null
          created_at: string
          created_by: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          observacoes: string | null
          qtd_blocos: number | null
          qtd_unidades: number | null
          sindico: string | null
          telefone_sindico: string | null
          tem_academia: boolean | null
          tem_churrasqueira: boolean | null
          tem_elevador: boolean | null
          tem_piscina: boolean | null
          tem_portaria: boolean | null
          tem_salao_festas: boolean | null
          updated_at: string
          valor_condominio: number | null
        }
        Insert: {
          administradora?: string | null
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          created_at?: string
          created_by?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          qtd_blocos?: number | null
          qtd_unidades?: number | null
          sindico?: string | null
          telefone_sindico?: string | null
          tem_academia?: boolean | null
          tem_churrasqueira?: boolean | null
          tem_elevador?: boolean | null
          tem_piscina?: boolean | null
          tem_portaria?: boolean | null
          tem_salao_festas?: boolean | null
          updated_at?: string
          valor_condominio?: number | null
        }
        Update: {
          administradora?: string | null
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          created_at?: string
          created_by?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          qtd_blocos?: number | null
          qtd_unidades?: number | null
          sindico?: string | null
          telefone_sindico?: string | null
          tem_academia?: boolean | null
          tem_churrasqueira?: boolean | null
          tem_elevador?: boolean | null
          tem_piscina?: boolean | null
          tem_portaria?: boolean | null
          tem_salao_festas?: boolean | null
          updated_at?: string
          valor_condominio?: number | null
        }
        Relationships: []
      }
      imoveis: {
        Row: {
          ano_construcao: number | null
          area_dimensions: string | null
          area_total: number | null
          area_util: number | null
          ativo: boolean
          bairro: string | null
          categoria_imovel: string
          cep: string
          cidade: string
          codigo_imovel: string
          complemento: string | null
          created_at: string
          created_by: string | null
          descricao_curta: string | null
          destaque: boolean
          endereco: string | null
          estado: string
          exclusivo: boolean
          features: Json
          fotos: Json
          garantias: Json
          id: string
          iptu: number | null
          latitude: string | null
          link_tour_virtual: string | null
          longitude: string | null
          modalidade: string[]
          numero: string | null
          observacao: string | null
          preco_aluguel: number | null
          preco_venda: number | null
          proprietario_documento: string | null
          proprietario_email: string | null
          proprietario_nome: string | null
          proprietario_telefone: string | null
          qtd_banheiros: number | null
          qtd_dormitorios: number | null
          qtd_suites: number | null
          qtd_vagas: number | null
          sub_tipo_imovel: string
          tipo_imovel: string
          tipo_oferta: number
          titulo_imovel: string
          updated_at: string
          valor_condominio: number | null
          video_url: string | null
          zona: string | null
        }
        Insert: {
          ano_construcao?: number | null
          area_dimensions?: string | null
          area_total?: number | null
          area_util?: number | null
          ativo?: boolean
          bairro?: string | null
          categoria_imovel?: string
          cep?: string
          cidade?: string
          codigo_imovel: string
          complemento?: string | null
          created_at?: string
          created_by?: string | null
          descricao_curta?: string | null
          destaque?: boolean
          endereco?: string | null
          estado?: string
          exclusivo?: boolean
          features?: Json
          fotos?: Json
          garantias?: Json
          id?: string
          iptu?: number | null
          latitude?: string | null
          link_tour_virtual?: string | null
          longitude?: string | null
          modalidade?: string[]
          numero?: string | null
          observacao?: string | null
          preco_aluguel?: number | null
          preco_venda?: number | null
          proprietario_documento?: string | null
          proprietario_email?: string | null
          proprietario_nome?: string | null
          proprietario_telefone?: string | null
          qtd_banheiros?: number | null
          qtd_dormitorios?: number | null
          qtd_suites?: number | null
          qtd_vagas?: number | null
          sub_tipo_imovel: string
          tipo_imovel: string
          tipo_oferta?: number
          titulo_imovel: string
          updated_at?: string
          valor_condominio?: number | null
          video_url?: string | null
          zona?: string | null
        }
        Update: {
          ano_construcao?: number | null
          area_dimensions?: string | null
          area_total?: number | null
          area_util?: number | null
          ativo?: boolean
          bairro?: string | null
          categoria_imovel?: string
          cep?: string
          cidade?: string
          codigo_imovel?: string
          complemento?: string | null
          created_at?: string
          created_by?: string | null
          descricao_curta?: string | null
          destaque?: boolean
          endereco?: string | null
          estado?: string
          exclusivo?: boolean
          features?: Json
          fotos?: Json
          garantias?: Json
          id?: string
          iptu?: number | null
          latitude?: string | null
          link_tour_virtual?: string | null
          longitude?: string | null
          modalidade?: string[]
          numero?: string | null
          observacao?: string | null
          preco_aluguel?: number | null
          preco_venda?: number | null
          proprietario_documento?: string | null
          proprietario_email?: string | null
          proprietario_nome?: string | null
          proprietario_telefone?: string | null
          qtd_banheiros?: number | null
          qtd_dormitorios?: number | null
          qtd_suites?: number | null
          qtd_vagas?: number | null
          sub_tipo_imovel?: string
          tipo_imovel?: string
          tipo_oferta?: number
          titulo_imovel?: string
          updated_at?: string
          valor_condominio?: number | null
          video_url?: string | null
          zona?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          bairros_interesse: string | null
          corretor_id: string | null
          created_at: string
          created_by: string | null
          email: string | null
          faixa_preco_max: number | null
          faixa_preco_min: number | null
          id: string
          imovel_interesse_id: string | null
          interesse: string | null
          nome: string
          observacoes: string | null
          origem: string | null
          status: string
          telefone: string | null
          tipo_interesse: string | null
          updated_at: string
        }
        Insert: {
          bairros_interesse?: string | null
          corretor_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          faixa_preco_max?: number | null
          faixa_preco_min?: number | null
          id?: string
          imovel_interesse_id?: string | null
          interesse?: string | null
          nome: string
          observacoes?: string | null
          origem?: string | null
          status?: string
          telefone?: string | null
          tipo_interesse?: string | null
          updated_at?: string
        }
        Update: {
          bairros_interesse?: string | null
          corretor_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          faixa_preco_max?: number | null
          faixa_preco_min?: number | null
          id?: string
          imovel_interesse_id?: string | null
          interesse?: string | null
          nome?: string
          observacoes?: string | null
          origem?: string | null
          status?: string
          telefone?: string | null
          tipo_interesse?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active: boolean
          avatar_url: string | null
          created_at: string
          creci: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          creci?: string | null
          email?: string
          full_name?: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          creci?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          can_delete: boolean
          can_edit: boolean
          can_view: boolean
          id: string
          module: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          id?: string
          module: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          id?: string
          module?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ensure_admin_by_email: {
        Args: { target_email: string }
        Returns: undefined
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "corretor" | "financeiro" | "gerente"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "corretor", "financeiro", "gerente"],
    },
  },
} as const

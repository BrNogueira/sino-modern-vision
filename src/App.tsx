import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { AdminPropertiesProvider } from "@/contexts/AdminPropertiesContext";
import { CategoriasProvider } from "@/contexts/CategoriasContext";
import { ChangeLogProvider } from "@/contexts/ChangeLogContext";
import CookieConsent from "./components/CookieConsent";

// Funil público principal — eager (carrega no bundle inicial).
import Index from "./pages/Index";
import PropertyDetail from "./pages/PropertyDetail";
import Listing from "./pages/Listing";

// Páginas secundárias e todo o painel admin — code-split (chunks sob demanda),
// para que visitantes públicos não baixem o admin no bundle inicial.
const Favorites = lazy(() => import("./pages/Favorites"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Contato = lazy(() => import("./pages/Contato"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProperties = lazy(() => import("./pages/admin/AdminProperties"));
const PropertyForm = lazy(() => import("./pages/admin/PropertyForm"));
const AdminCorretorProfile = lazy(() => import("./pages/admin/AdminCorretorProfile"));
const AdminCorretorImoveis = lazy(() => import("./pages/admin/AdminCorretorImoveis"));
const AdminUsuarios = lazy(() => import("./pages/admin/AdminUsuarios"));
const AdminUserCreate = lazy(() => import("./pages/admin/AdminUserCreate"));
const AdminPermissoes = lazy(() => import("./pages/admin/AdminPermissoes"));
const AdminCondominios = lazy(() => import("./pages/admin/AdminCondominios"));
const AdminCategorias = lazy(() => import("./pages/admin/AdminCategorias"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads"));
const AdminRelatorios = lazy(() => import("./pages/admin/AdminRelatorios"));
const AdminCorretores = lazy(() => import("./pages/admin/AdminCorretores"));
const AdminAgenda = lazy(() => import("./pages/admin/AdminAgenda"));
const AdminConfiguracoes = lazy(() => import("./pages/admin/AdminConfiguracoes"));
const AgenciamentosPage = lazy(() => import("./pages/admin/corretor/AgenciamentosPage"));
const PreCadastrosPage = lazy(() => import("./pages/admin/corretor/PreCadastrosPage"));
const MapaPage = lazy(() => import("./pages/admin/corretor/MapaPage"));
const PesquisarPage = lazy(() => import("./pages/admin/corretor/PesquisarPage"));
const AgendaPage = lazy(() => import("./pages/admin/corretor/AgendaPage"));
const CadastroProprietarioPage = lazy(() => import("./pages/admin/corretor/CadastroProprietarioPage"));
const CadastroClientePage = lazy(() => import("./pages/admin/corretor/CadastroClientePage"));
const CanalProPage = lazy(() => import("./pages/admin/CanalProPage"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FavoritesProvider>
        <AdminAuthProvider>
          <AdminPropertiesProvider>
          <CategoriasProvider>
          <ChangeLogProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <CookieConsent />
              <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/imoveis" element={<Listing />} />
                <Route path="/favoritos" element={<Favorites />} />
                <Route path="/imovel/:slug" element={<PropertyDetail />} />
                <Route path="/contato" element={<Contato />} />
                <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />

                {/* Admin */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="imoveis" element={<AdminProperties />} />
                  <Route path="imoveis/novo" element={<PropertyForm />} />
                  <Route path="imoveis/editar/:id" element={<PropertyForm />} />
                  <Route path="usuarios" element={<AdminUsuarios />} />
                  <Route path="usuarios/novo" element={<AdminUserCreate />} />
                  <Route path="permissoes" element={<AdminPermissoes />} />
                  <Route path="condominios" element={<AdminCondominios />} />
                  <Route path="categorias" element={<AdminCategorias />} />
                  <Route path="leads" element={<AdminLeads />} />
                  <Route path="agenda" element={<AdminAgenda />} />
                  <Route path="relatorios" element={<AdminRelatorios />} />
                  <Route path="corretores" element={<AdminCorretores />} />
                  <Route path="configuracoes" element={<AdminConfiguracoes />} />
                  <Route path="corretor" element={<AdminCorretorProfile />} />
                  <Route path="corretor/imoveis" element={<AdminCorretorImoveis />} />
                  <Route path="corretor/agenciamentos" element={<AgenciamentosPage />} />
                  <Route path="corretor/pre-cadastros" element={<PreCadastrosPage />} />
                  <Route path="corretor/mapa" element={<MapaPage />} />
                  <Route path="corretor/pesquisar" element={<PesquisarPage />} />
                  <Route path="corretor/agenda" element={<AgendaPage />} />
                  <Route path="corretor/proprietario" element={<CadastroProprietarioPage />} />
                  <Route path="corretor/cliente" element={<CadastroClientePage />} />
                  <Route path="canal-pro" element={<CanalProPage />} />
                  <Route path="agenda" element={<AgendaPage />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
            </BrowserRouter>
          </ChangeLogProvider>
          </CategoriasProvider>
          </AdminPropertiesProvider>
        </AdminAuthProvider>
      </FavoritesProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

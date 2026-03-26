import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { AdminPropertiesProvider } from "@/contexts/AdminPropertiesContext";
import { ChangeLogProvider } from "@/contexts/ChangeLogContext";
import Index from "./pages/Index";
import PropertyDetail from "./pages/PropertyDetail";
import Listing from "./pages/Listing";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProperties from "./pages/admin/AdminProperties";
import PropertyForm from "./pages/admin/PropertyForm";
import AdminCorretorProfile from "./pages/admin/AdminCorretorProfile";
import AdminCorretorImoveis from "./pages/admin/AdminCorretorImoveis";
import AgenciamentosPage from "./pages/admin/corretor/AgenciamentosPage";
import PreCadastrosPage from "./pages/admin/corretor/PreCadastrosPage";
import MapaPage from "./pages/admin/corretor/MapaPage";
import PesquisarPage from "./pages/admin/corretor/PesquisarPage";
import AgendaPage from "./pages/admin/corretor/AgendaPage";
import CadastroProprietarioPage from "./pages/admin/corretor/CadastroProprietarioPage";
import CadastroClientePage from "./pages/admin/corretor/CadastroClientePage";
import CanalProPage from "./pages/admin/CanalProPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FavoritesProvider>
        <AdminAuthProvider>
          <AdminPropertiesProvider>
          <ChangeLogProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/imoveis" element={<Listing />} />
                <Route path="/favoritos" element={<Favorites />} />
                <Route path="/imovel/:slug" element={<PropertyDetail />} />

                {/* Admin */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="imoveis" element={<AdminProperties />} />
                  <Route path="imoveis/novo" element={<PropertyForm />} />
                  <Route path="imoveis/editar/:id" element={<PropertyForm />} />
                  <Route path="corretor" element={<AdminCorretorProfile />} />
                  <Route path="corretor/imoveis" element={<AdminCorretorImoveis />} />
                  <Route path="corretor/agenciamentos" element={<AgenciamentosPage />} />
                  <Route path="corretor/pre-cadastros" element={<PreCadastrosPage />} />
                  <Route path="corretor/mapa" element={<MapaPage />} />
                  <Route path="corretor/pesquisar" element={<PesquisarPage />} />
                  <Route path="corretor/agenda" element={<AgendaPage />} />
                  <Route path="corretor/proprietario" element={<CadastroProprietarioPage />} />
                  <Route path="corretor/cliente" element={<CadastroClientePage />} />
                </Route>

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ChangeLogProvider>
          </AdminPropertiesProvider>
        </AdminAuthProvider>
      </FavoritesProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

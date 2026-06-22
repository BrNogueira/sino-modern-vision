import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Star, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAdminProperties } from "@/contexts/AdminPropertiesContext";
import { zapToProperty } from "@/lib/zapToProperty";
import { properties as staticProperties } from "@/data/properties";

const Favorites = () => {
  const { favorites } = useFavorites();
  const { properties: dbProperties, loading } = useAdminProperties();

  // Mesma fonte usada na listagem e no detalhe: imóveis reais do banco,
  // com fallback para os estáticos quando o banco está vazio.
  const allProperties = useMemo(() => {
    const fromDb = dbProperties.filter((p) => p.ativo).map(zapToProperty);
    return fromDb.length > 0 ? fromDb : staticProperties;
  }, [dbProperties]);

  const favoriteProperties = useMemo(
    () => allProperties.filter((p) => favorites.includes(p.code)),
    [allProperties, favorites]
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 pt-8 pb-16">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              <h1 className="text-2xl font-bold text-foreground">Imóveis Favoritos</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {favoriteProperties.length} imóvel(is) salvo(s)
            </p>
          </div>
        </div>

        {favoriteProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteProperties.map((property) => (
              <PropertyCard key={property.code} property={property} />
            ))}
          </div>
        ) : loading && favorites.length > 0 ? (
          <div className="text-center py-20">
            <Star className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4 animate-pulse" />
            <p className="text-xl text-muted-foreground">Carregando seus favoritos...</p>
          </div>
        ) : (
          <div className="text-center py-20">
            <Star className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">Nenhum imóvel favoritado</p>
            <p className="text-sm text-muted-foreground mt-2">
              Clique na estrela nos cards de imóveis para salvar seus favoritos
            </p>
            <Link
              to="/"
              className="inline-block mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Ver imóveis
            </Link>
          </div>
        )}
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Favorites;

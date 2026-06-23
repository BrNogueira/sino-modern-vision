import { Link } from "react-router-dom";
import { useCategorias } from "@/contexts/CategoriasContext";
import { useAdminProperties } from "@/contexts/AdminPropertiesContext";
import propertyCasa from "@/assets/property-casa.jpg";

const CategoriesSection = () => {
  const { categorias, loading } = useCategorias();
  const { properties } = useAdminProperties();

  // Show only ativo categorias (per spec). Inactive ones are hidden entirely.
  const visibleCategorias = categorias.filter((c) => c.ativo);

  if (loading) {
    return (
      <section id="categorias" className="pt-0 pb-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (visibleCategorias.length === 0) {
    return null;
  }

  const countFor = (categoriaId: string) =>
    properties.filter((p) => p.categoriaId === categoriaId && p.ativo).length;

  return (
    <section id="categorias" className="pt-0 pb-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl text-center text-foreground mb-10">
          Escolha sua categoria:
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {visibleCategorias.map((cat) => {
            const count = countFor(cat.id);
            const image = cat.fotoUrl || propertyCasa;
            return (
              <Link
                key={cat.id}
                to={`/imoveis?categoria=${encodeURIComponent(cat.slug)}`}
                className="group relative aspect-square rounded-xl overflow-hidden block shadow-md hover:shadow-lg transition-shadow"
              >
                <img
                  src={image}
                  alt={cat.nome}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-green-800/80 via-green-700/40 to-transparent"
                  style={{ top: "50%" }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                  <span className="text-primary-foreground text-2xl font-semibold md:text-2xl font-sans block">
                    {cat.nome}
                  </span>
                  {count > 0 && (
                    <span className="text-primary-foreground/85 text-xs">
                      {count} {count === 1 ? "imóvel" : "imóveis"}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;

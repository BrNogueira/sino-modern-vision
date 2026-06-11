import { useMemo } from "react";
import PropertyCard from "./PropertyCard";
import { properties as staticProperties } from "@/data/properties";
import { useAdminProperties } from "@/contexts/AdminPropertiesContext";
import { zapToProperty } from "@/lib/zapToProperty";

const PropertyCarousel = () => {
  const { properties: dbProperties } = useAdminProperties();

  const featured = useMemo(() => {
    const fromDb = dbProperties
      .filter((p) => p.ativo && (p.destaque || p.exclusivo))
      .map(zapToProperty);
    const fromStatic = staticProperties.filter((p) => p.featured || p.exclusive);
    // DB items first so newly added properties show up immediately
    return [...fromDb, ...fromStatic];
  }, [dbProperties]);

  return (
    <section id="imoveis" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl text-foreground">
            Destaques e Exclusividades
          </h2>
          <div className="w-20 h-0.5 bg-primary mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8 md:mt-[70px]">
          {featured.map((property) => (
            <PropertyCard key={property.code} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertyCarousel;

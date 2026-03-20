import PropertyCard from "./PropertyCard";
import { properties } from "@/data/properties";

const PropertyCarousel = () => {
  const featured = properties.filter((p) => p.featured);

  return (
    <section id="imoveis" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl text-foreground">
            Destaques e Exclusividades
          </h2>
          <div className="w-20 h-0.5 bg-primary mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((property) => (
            <PropertyCard key={property.code} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertyCarousel;

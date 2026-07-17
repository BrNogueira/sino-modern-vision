import { useMemo } from "react";
import PropertyCard from "./PropertyCard";
import { properties as staticProperties } from "@/data/properties";
import { useAdminProperties } from "@/contexts/AdminPropertiesContext";
import { zapToProperty } from "@/lib/zapToProperty";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

const MAX_HOME = 9;

const PropertyCarousel = () => {
  const { properties: dbProperties } = useAdminProperties();

  const featured = useMemo(() => {
    // Imóveis ativos vindos do banco (já ordenados por created_at desc).
    const active = dbProperties.filter((p) => p.ativo);
    const highlighted = active.filter((p) => p.destaque || p.exclusivo);
    const rest = active.filter((p) => !(p.destaque || p.exclusivo));
    // Destaques/exclusivos primeiro, depois os mais recentes, até MAX_HOME.
    const fromDb = [...highlighted, ...rest].slice(0, MAX_HOME).map(zapToProperty);
    // Demos estáticos só como fallback quando ainda não há imóveis no banco.
    const fromStatic =
      fromDb.length === 0 ? staticProperties.filter((p) => p.featured || p.exclusive) : [];
    return [...fromDb, ...fromStatic];
  }, [dbProperties]);

  if (featured.length === 0) return null;

  return (
    <section id="imoveis" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl text-foreground">
            Destaques e Exclusividades
          </h2>
          <div className="w-20 h-0.5 bg-primary mx-auto mt-4" />
        </div>

        {/* Carrossel exibindo 3 imóveis por vez no desktop (2 em tablet, 1 no mobile).
            O viewport do Embla tem overflow-hidden e cortaria o popup de descrição
            que aparece abaixo do card — o pb/-mb dá área de clip extra para ele. */}
        <Carousel
          opts={{ align: "start", loop: featured.length > 3 }}
          className="w-full px-0 md:px-12 mt-8 md:mt-[70px] [&>div]:pb-72 [&>div]:-mb-72"
        >
          <CarouselContent className="-ml-8">
            {featured.map((property) => (
              <CarouselItem
                key={property.code}
                className="pl-8 basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <PropertyCard property={property} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
};

export default PropertyCarousel;

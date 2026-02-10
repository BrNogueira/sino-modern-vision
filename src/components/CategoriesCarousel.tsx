import CategoryCard from "./CategoryCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";

import propertyApartment from "@/assets/property-apartment.jpg";
import propertySitio from "@/assets/property-sitio.jpg";
import propertyTerreno from "@/assets/property-terreno.jpg";
import propertyCasa from "@/assets/property-casa.jpg";
import propertyComercial from "@/assets/property-comercial.jpg";

const categories = [
  {
    image: propertyCasa,
    title: "Casas",
    count: 145,
  },
  {
    image: propertyApartment,
    title: "Apartamentos",
    count: 89,
  },
  {
    image: propertyTerreno,
    title: "Terrenos",
    count: 67,
  },
  {
    image: propertySitio,
    title: "Sítios",
    count: 34,
  },
  {
    image: propertyComercial,
    title: "Comerciais",
    count: 52,
  },
  {
    image: propertyCasa,
    title: "Condomínios",
    count: 28,
  },
];

const CategoriesCarousel = () => {
  return (
    <section id="categorias" className="py-20 bg-card">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            Explore
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
            Categorias de Imóveis
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Encontre o tipo de imóvel ideal para você. Navegue por nossas categorias e descubra as melhores opções.
          </p>
        </div>

        {/* Carousel */}
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {categories.map((category, index) => (
              <CarouselItem
                key={index}
                className="pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <CategoryCard {...category} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center gap-4 mt-8">
            <CarouselPrevious className="static translate-x-0 translate-y-0 h-12 w-12 border-2 border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground" />
            <CarouselNext className="static translate-x-0 translate-y-0 h-12 w-12 border-2 border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default CategoriesCarousel;

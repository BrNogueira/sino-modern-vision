import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import PropertyCard from "./PropertyCard";
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

const properties = [
  {
    image: propertyCasa,
    title: "Casa Moderna com Piscina",
    location: "Novo Hamburgo, RS",
    price: "R$ 850.000",
    type: "Casa",
    bedrooms: 4,
    bathrooms: 3,
    area: 280,
  },
  {
    image: propertyApartment,
    title: "Apartamento Vista Mar",
    location: "São Leopoldo, RS",
    price: "R$ 420.000",
    type: "Apartamento",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
  },
  {
    image: propertyTerreno,
    title: "Terreno em Condomínio Fechado",
    location: "Campo Bom, RS",
    price: "R$ 180.000",
    type: "Terreno",
    area: 450,
  },
  {
    image: propertySitio,
    title: "Sítio com Lago Privativo",
    location: "Estância Velha, RS",
    price: "R$ 1.200.000",
    type: "Sítio",
    bedrooms: 5,
    bathrooms: 4,
    area: 15000,
  },
  {
    image: propertyComercial,
    title: "Sala Comercial Centro",
    location: "Novo Hamburgo, RS",
    price: "R$ 320.000",
    type: "Comercial",
    bathrooms: 2,
    area: 85,
  },
];

const PropertyCarousel = () => {
  return (
    <section id="imoveis" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">
              Destaques
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
              Imóveis em Destaque
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Confira nossa seleção especial de imóveis com as melhores oportunidades do mercado
            </p>
          </div>
          <Button variant="outline" size="lg" className="border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground">
            Ver todos os imóveis
          </Button>
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
            {properties.map((property, index) => (
              <CarouselItem
                key={index}
                className="pl-4 md:basis-1/2 lg:basis-1/3"
              >
                <PropertyCard {...property} />
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

export default PropertyCarousel;

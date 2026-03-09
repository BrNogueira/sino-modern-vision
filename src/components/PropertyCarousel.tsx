import PropertyCard from "./PropertyCard";
import propertyApartment from "@/assets/property-apartment.jpg";
import propertySitio from "@/assets/property-sitio.jpg";
import propertyTerreno from "@/assets/property-terreno.jpg";
import propertyCasa from "@/assets/property-casa.jpg";

const properties = [
  {
    image: propertyCasa,
    title: "Casa com 25 suítes",
    location: "Estância Velha",
    price: "R$ 1.9500.00",
    type: "Casa",
    bedrooms: 2,
    bathrooms: 4,
    area: 4,
  },
  {
    image: propertyApartment,
    title: "Casa com 25 suítes",
    location: "Estância Velha",
    price: "R$ 1.9500.00",
    type: "Casa",
    bedrooms: 2,
    bathrooms: 4,
    area: 4,
  },
  {
    image: propertyTerreno,
    title: "Casa com 25 suítes",
    location: "Estância Velha",
    price: "R$ 1.9500.00",
    type: "Casa",
    bedrooms: 2,
    bathrooms: 4,
    area: 4,
  },
  {
    image: propertySitio,
    title: "Casa com 25 suítes",
    location: "Estância Velha",
    price: "R$ 1.9500.00",
    type: "Casa",
    bedrooms: 2,
    bathrooms: 4,
    area: 4,
  },
];

const PropertyCarousel = () => {
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
          {properties.map((property, index) => (
            <PropertyCard key={index} {...property} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertyCarousel;

import propertyApartment from "@/assets/property-apartment.jpg";
import propertySitio from "@/assets/property-sitio.jpg";
import propertyTerreno from "@/assets/property-terreno.jpg";
import propertyCasa from "@/assets/property-casa.jpg";
import propertyComercial from "@/assets/property-comercial.jpg";

const categories = [
  { image: propertyCasa, title: "Aluguel" },
  { image: propertySitio, title: "Sítios" },
  { image: propertyCasa, title: "Casas" },
  { image: propertyTerreno, title: "Terrenos" },
  { image: propertyTerreno, title: "Terrenos de Esquina" },
  { image: propertyApartment, title: "Apartamentos" },
  { image: propertyApartment, title: "Coberturas" },
  { image: propertyCasa, title: "Condomínios Horizontais" },
  { image: propertyComercial, title: "Lançamentos" },
  { image: propertyComercial, title: "Comerciais" },
  { image: propertyComercial, title: "Pavilhões" },
  { image: propertySitio, title: "Permuta" },
];

const CategoriesSection = () => {
  return (
    <section id="categorias" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl text-center text-foreground mb-10">
          Escolha sua categoria:
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, index) => (
            <a
              key={index}
              href="#"
              className="group relative h-40 md:h-48 rounded-xl overflow-hidden block shadow-md hover:shadow-lg transition-shadow"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-800/80 via-green-700/40 to-transparent" style={{ top: '50%' }} />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <span className="text-primary-foreground text-sm md:text-base font-normal">
                  {cat.title}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;

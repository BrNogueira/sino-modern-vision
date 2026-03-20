import { Link } from "react-router-dom";
import propertyApartment from "@/assets/property-apartment.jpg";
import propertySitio from "@/assets/property-sitio.jpg";
import propertyTerreno from "@/assets/property-terreno.jpg";
import propertyCasa from "@/assets/property-casa.jpg";
import propertyComercial from "@/assets/property-comercial.jpg";

const categories = [
  { image: propertyCasa, title: "Aluguel", filter: "transacao=Aluguel" },
  { image: propertySitio, title: "Sítios", filter: "tipo=Sítio" },
  { image: propertyCasa, title: "Casas", filter: "tipo=Casa" },
  { image: propertyTerreno, title: "Terrenos", filter: "tipo=Terreno" },
  { image: propertyTerreno, title: "Terrenos de Esquina", filter: "tipo=Terreno de Esquina" },
  { image: propertyApartment, title: "Apartamentos", filter: "tipo=Apartamento" },
  { image: propertyApartment, title: "Coberturas", filter: "tipo=Cobertura" },
  { image: propertyCasa, title: "Condomínios Horizontais", filter: "tipo=Condomínio Horizontal" },
  { image: propertyComercial, title: "Lançamentos", filter: "tipo=Lançamento" },
  { image: propertyComercial, title: "Comerciais", filter: "tipo=Comercial" },
  { image: propertyComercial, title: "Pavilhões", filter: "tipo=Pavilhão" },
  { image: propertySitio, title: "Permuta", filter: "transacao=Permuta" },
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
            <Link
              key={index}
              to={`/imoveis?${cat.filter}`}
              className="group relative aspect-square rounded-xl overflow-hidden block shadow-md hover:shadow-lg transition-shadow"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-800/80 via-green-700/40 to-transparent" style={{ top: '50%' }} />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                <span className="text-primary-foreground text-sm md:text-base font-normal">
                  {cat.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;

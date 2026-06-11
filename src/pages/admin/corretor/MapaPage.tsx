import PropertyMap from "@/components/PropertyMap";
import { properties } from "@/data/properties";

const MapaPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Mapa</h1>
      <p className="text-sm text-muted-foreground">Visualize imóveis cadastrados no mapa</p>
    </div>

    {/* Legend */}
    <div className="flex flex-wrap gap-3 text-xs">
      {[
        { type: "Casa", color: "bg-red-500" },
        { type: "Apartamento", color: "bg-blue-500" },
        { type: "Terreno", color: "bg-green-500" },
        { type: "Sítio", color: "bg-purple-500" },
        { type: "Comercial", color: "bg-orange-500" },
        { type: "Condomínio", color: "bg-yellow-500" },
      ].map((item) => (
        <span key={item.type} className="flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded-full ${item.color}`} />
          {item.type}
        </span>
      ))}
    </div>

    <PropertyMap properties={properties} className="h-[75vh] w-full" />
  </div>
);

export default MapaPage;

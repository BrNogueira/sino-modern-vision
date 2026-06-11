import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { type Property } from "@/data/properties";

const DEFAULT_CENTER: [number, number] = [-29.7656, -51.0339];
const DEFAULT_ZOOM = 12;

const TYPE_COLORS: Record<string, string> = {
  Casa: "#e53e3e",
  Apartamento: "#3182ce",
  Terreno: "#38a169",
  Sítio: "#805ad5",
  Comercial: "#dd6b20",
  Condomínio: "#d69e2e",
};

const createIcon = (type: string, highlighted = false) => {
  const color = TYPE_COLORS[type] || "#e53e3e";
  const size = highlighted ? 18 : 12;
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;background:${color};border:2px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.4);${highlighted ? "animation:bounce .6s ease infinite alternate" : ""}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const generateSlug = (title: string) =>
  title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

interface PropertyMapProps {
  properties: Property[];
  highlightCode?: string;
  className?: string;
}

const PropertyMap = ({ properties, highlightCode, className = "h-[70vh] w-full" }: PropertyMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up previous instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const geoProperties = properties.filter((p) => p.latitude && p.longitude);
    const highlighted = highlightCode ? geoProperties.find((p) => p.code === highlightCode) : null;

    const center: [number, number] = highlighted
      ? [highlighted.latitude!, highlighted.longitude!]
      : DEFAULT_CENTER;
    const zoom = highlighted ? 15 : DEFAULT_ZOOM;

    const map = L.map(mapRef.current, { center, zoom });
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    geoProperties.forEach((property) => {
      const isHighlighted = property.code === highlightCode;
      const marker = L.marker([property.latitude!, property.longitude!], {
        icon: createIcon(property.type, isHighlighted),
        zIndexOffset: isHighlighted ? 999 : 0,
      }).addTo(map);

      marker.bindPopup(`
        <div style="max-width:220px;font-family:sans-serif;">
          <strong style="font-size:14px;">${property.title}</strong>
          <p style="margin:4px 0;color:#666;font-size:12px;">${property.type} • CÓD: ${property.code}</p>
          <p style="margin:4px 0;font-size:13px;font-weight:600;color:#0a6936;">${property.priceFormatted}</p>
          <p style="margin:2px 0;color:#888;font-size:11px;">${property.location}</p>
        </div>
      `);

      marker.on("dblclick", () => {
        navigate(`/imovel/${generateSlug(property.title)}`);
      });
    });

    // Force a resize after mount
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [properties, highlightCode, navigate]);

  return (
    <div className={`rounded-xl overflow-hidden border border-border ${className}`}>
      <style>{`@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-6px); } }`}</style>
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default PropertyMap;

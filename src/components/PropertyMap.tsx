/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { type Property } from "@/data/properties";

const GOOGLE_MAPS_API_KEY = "AIzaSyBWfv_IOOgHTpY4ZdTp8sRDcP17ml7_4SA";
const DEFAULT_CENTER = { lat: -29.7656, lng: -51.0339 };
const DEFAULT_ZOOM = 12;

/** Color mapping by property type */
const TYPE_COLORS: Record<string, string> = {
  Casa: "red",
  Apartamento: "blue",
  Terreno: "green",
  Sítio: "purple",
  Comercial: "orange",
  Condomínio: "yellow",
};

const getMarkerIcon = (type: string): string => {
  const color = TYPE_COLORS[type] || "red";
  return `https://maps.google.com/mapfiles/ms/icons/${color}-dot.png`;
};

const generateSlug = (title: string) =>
  title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Loads the Google Maps script once */
let scriptLoadPromise: Promise<void> | null = null;
const loadGoogleMaps = (): Promise<void> => {
  if (scriptLoadPromise) return scriptLoadPromise;
  if ((window as any).google?.maps) return Promise.resolve();

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
};

interface PropertyMapProps {
  properties: Property[];
  /** Optional: highlight a single property and center on it */
  highlightCode?: string;
  className?: string;
}

const PropertyMap = ({ properties, highlightCode, className = "h-[70vh] w-full" }: PropertyMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const navigate = useNavigate();

  const initMap = useCallback(() => {
    if (!mapRef.current || !(window as any).google?.maps) return;

    const geoProperties = properties.filter((p) => p.latitude && p.longitude);

    // Determine center
    const highlighted = highlightCode
      ? geoProperties.find((p) => p.code === highlightCode)
      : null;

    const center = highlighted
      ? { lat: highlighted.latitude!, lng: highlighted.longitude! }
      : DEFAULT_CENTER;

    const zoom = highlighted ? 15 : DEFAULT_ZOOM;

    const gmaps = (window as any).google.maps;
    const map = new gmaps.Map(mapRef.current, {
      zoom,
      center,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });

    mapInstanceRef.current = map;

    // Create markers
    geoProperties.forEach((property) => {
      const isHighlighted = property.code === highlightCode;

      const marker = new gmaps.Marker({
        position: { lat: property.latitude!, lng: property.longitude! },
        map,
        title: `${property.title} - CÓD: ${property.code}`,
        icon: getMarkerIcon(property.type),
        animation: isHighlighted ? gmaps.Animation.BOUNCE : undefined,
        zIndex: isHighlighted ? 999 : 1,
      });

      // Info window
      const infoWindow = new gmaps.InfoWindow({
        content: `
          <div style="max-width:220px;font-family:sans-serif;">
            <strong style="font-size:14px;">${property.title}</strong>
            <p style="margin:4px 0;color:#666;font-size:12px;">${property.type} • CÓD: ${property.code}</p>
            <p style="margin:4px 0;font-size:13px;font-weight:600;color:#0a6936;">${property.priceFormatted}</p>
            <p style="margin:2px 0;color:#888;font-size:11px;">${property.location}</p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });

      marker.addListener("dblclick", () => {
        navigate(`/imovel/${generateSlug(property.title)}`);
      });

      // Stop bounce after 2s for highlighted
      if (isHighlighted) {
        setTimeout(() => marker.setAnimation(null), 2000);
      }
    });
  }, [properties, highlightCode, navigate]);

  useEffect(() => {
    loadGoogleMaps().then(initMap).catch(console.error);
  }, [initMap]);

  return (
    <div className={`rounded-xl overflow-hidden border border-border ${className}`}>
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default PropertyMap;

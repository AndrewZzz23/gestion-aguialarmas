import * as L from "leaflet";
import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";

/** Ibagué. */
export const CENTRO_MAPA: LatLngTuple = [4.4389, -75.2322];

/** El mapa no deja salir de Ibagué y sus alrededores (sur-occidente, nor-oriente). */
export const LIMITES_MAPA: LatLngBoundsExpression = [
  [4.33, -75.36],
  [4.56, -75.05],
];
export const ZOOM_MINIMO = 12;

export interface CapaBase {
  id: "calles" | "relieve" | "satelite";
  nombre: string;
  url: string;
  atribucion: string;
  zoomMaximo: number;
}

/**
 * Capas base del mapa. En desarrollo se usan proveedores gratuitos con límites de uso;
 * en producción se reemplazan por Azure Maps (RT-07) con VITE_MAPA_CALLES, VITE_MAPA_RELIEVE y VITE_MAPA_SATELITE:
 *   calles   → tilesetId=microsoft.base.road
 *   relieve  → tilesetId=microsoft.terra.main
 *   satélite → tilesetId=microsoft.imagery
 */
export const CAPAS_BASE: CapaBase[] = [
  {
    id: "calles",
    nombre: "Calles",
    url: import.meta.env.VITE_MAPA_CALLES ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    atribucion: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    zoomMaximo: 19,
  },
  {
    id: "relieve",
    nombre: "Relieve",
    url: import.meta.env.VITE_MAPA_RELIEVE ?? "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    atribucion:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
    zoomMaximo: 17,
  },
  {
    id: "satelite",
    nombre: "Satélite",
    url:
      import.meta.env.VITE_MAPA_SATELITE ??
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    atribucion: "Imágenes &copy; Esri",
    zoomMaximo: 19,
  },
];

const CLAVE_CAPA = "aguialarmas.mapa.capa";

/** Recuerda la última capa elegida en este navegador. */
export function capaGuardada(): CapaBase["id"] {
  try {
    const id = localStorage.getItem(CLAVE_CAPA);
    return CAPAS_BASE.some((c) => c.id === id) ? (id as CapaBase["id"]) : "calles";
  } catch {
    return "calles";
  }
}

export function guardarCapa(id: CapaBase["id"]) {
  try {
    localStorage.setItem(CLAVE_CAPA, id);
  } catch {
    // Sin almacenamiento (modo privado): simplemente no se recuerda.
  }
}

/** Mapa de Ibagué con sus límites y el selector Calles / Relieve / Satélite. Lo usan todos los mapas de la web. */
export function crearMapaBase(contenedor: HTMLElement): L.Map {
  const mapa = L.map(contenedor, {
    center: CENTRO_MAPA,
    zoom: 13,
    minZoom: ZOOM_MINIMO,
    maxZoom: 19,
    maxBounds: LIMITES_MAPA,
    maxBoundsViscosity: 1,
  });

  const inicial = capaGuardada();
  const capas: Record<string, L.TileLayer> = {};
  for (const c of CAPAS_BASE) {
    const capa = L.tileLayer(c.url, { attribution: c.atribucion, maxNativeZoom: c.zoomMaximo, maxZoom: 19 });
    capa.on("add", () => guardarCapa(c.id));
    capas[c.nombre] = capa;
    if (c.id === inicial) capa.addTo(mapa);
  }
  L.control.layers(capas, undefined, { position: "topright", collapsed: false }).addTo(mapa);
  return mapa;
}

/** La API usa [longitud, latitud] (GeoJSON); Leaflet usa [latitud, longitud]. */
export const aLatLng = ([lng, lat]: readonly [number, number]): LatLngTuple => [lat, lng];

import type { Punto, Ruta } from "@aguialarmas/shared";
import { area as areaDe } from "@turf/area";
import { difference } from "@turf/difference";
import { featureCollection, polygon } from "@turf/helpers";
import type { Feature, MultiPolygon, Polygon } from "geojson";

export type ResultadoRecorte =
  | { tipo: "igual" }
  | { tipo: "recortada"; area: Punto[]; vecinas: string[]; partesDescartadas: number }
  | { tipo: "dentro"; vecinas: string[] }
  | { tipo: "rodea"; vecinas: string[] };

function cerrar(area: Punto[]): Punto[] {
  const [primero, ultimo] = [area[0], area[area.length - 1]];
  return primero[0] === ultimo[0] && primero[1] === ultimo[1] ? area : [...area, primero];
}

/** La pieza más grande; el resto se descarta (pasa cuando la ruta cruza de lado a lado una vecina). */
function piezaMayor(f: Feature<Polygon | MultiPolygon>): { anillos: Punto[][]; descartadas: number } {
  if (f.geometry.type === "Polygon") {
    return { anillos: f.geometry.coordinates as Punto[][], descartadas: 0 };
  }
  const piezas = f.geometry.coordinates.map((c) => polygon(c));
  piezas.sort((a, b) => areaDe(b) - areaDe(a));
  return { anillos: piezas[0].geometry.coordinates as Punto[][], descartadas: piezas.length - 1 };
}

/**
 * Quita de la ruta dibujada el área que pisa a las rutas vecinas, para que su borde siga
 * exactamente el de ellas (incluidos los picos). La API rechaza de todas formas cualquier cruce.
 */
export function recortarContraVecinas(area: Punto[], vecinas: Ruta[]): ResultadoRecorte {
  let actual: Feature<Polygon | MultiPolygon> = polygon([cerrar(area)]);
  const areaInicial = areaDe(actual);
  const pisadas: string[] = [];

  for (const vecina of vecinas) {
    const antes = areaDe(actual);
    const resto = difference(featureCollection([actual, polygon([cerrar(vecina.area)])]));
    if (resto === null) {
      return { tipo: "dentro", vecinas: [vecina.nombre] };
    }
    // Menos de 1 m² de diferencia es redondeo de bordes compartidos, no un cruce.
    if (antes - areaDe(resto) > 1) {
      pisadas.push(vecina.nombre);
      actual = resto;
    }
  }

  if (pisadas.length === 0 || areaInicial - areaDe(actual) <= 1) {
    return { tipo: "igual" };
  }

  const { anillos, descartadas } = piezaMayor(actual);
  if (anillos.length > 1) {
    // Quedó con un hueco: la ruta encierra por completo a otra.
    return { tipo: "rodea", vecinas: pisadas };
  }

  return { tipo: "recortada", area: anillos[0].slice(0, -1), vecinas: pisadas, partesDescartadas: descartadas };
}

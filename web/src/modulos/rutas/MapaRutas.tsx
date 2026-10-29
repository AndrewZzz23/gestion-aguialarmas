// El orden importa: Leaflet global primero, después Geoman.
import "@/lib/leaflet-global";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import type { Punto, Ruta } from "@aguialarmas/shared";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { crearMapaBase } from "@/lib/mapa";

export interface Borrador {
  /** Cambia cuando empieza otro borrador (nueva ruta o editar otra); recrea la capa editable. */
  clave: string;
  area: Punto[];
  color: string;
}

interface Props {
  rutas: Ruta[];
  seleccionadaId: string | null;
  /** Ruta que se está editando: se oculta porque el borrador la reemplaza. */
  ocultarId: string | null;
  dibujando: boolean;
  borrador: Borrador | null;
  onSeleccionar: (id: string) => void;
  onDibujada: (area: Punto[]) => void;
  onBorradorCambiado: (area: Punto[]) => void;
}

// La API usa [longitud, latitud] (GeoJSON); Leaflet usa [latitud, longitud] y cierra el anillo solo.
function aLatLngs(area: Punto[]): L.LatLngTuple[] {
  const puntos = area.map(([lng, lat]): L.LatLngTuple => [lat, lng]);
  const [primero, ultimo] = [puntos[0], puntos[puntos.length - 1]];
  if (puntos.length > 1 && primero[0] === ultimo[0] && primero[1] === ultimo[1]) {
    puntos.pop();
  }
  return puntos;
}

function aPuntos(capa: L.Polygon): Punto[] {
  return (capa.getLatLngs()[0] as L.LatLng[]).map((ll): Punto => [ll.lng, ll.lat]);
}

export function MapaRutas(props: Props) {
  const { rutas, seleccionadaId, ocultarId, dibujando, borrador } = props;
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<L.Map | null>(null);
  const capaRutas = useRef<L.LayerGroup | null>(null);
  const capaBorrador = useRef<L.Polygon | null>(null);
  const encuadrado = useRef(false);

  // Los manejadores de Leaflet se registran una vez; leen siempre las props más recientes.
  const eventos = useRef(props);
  useEffect(() => {
    eventos.current = props;
  });

  useEffect(() => {
    const m = crearMapaBase(contenedor.current!);
    // En desarrollo StrictMode crea el mapa dos veces: el nuevo también debe encuadrarse.
    encuadrado.current = false;

    m.pm.setLang("es");
    m.pm.setGlobalOptions({ snappable: true, snapDistance: 15, allowSelfIntersection: false });
    m.on("pm:create", (e) => {
      const capa = e.layer as L.Polygon;
      const area = aPuntos(capa);
      m.removeLayer(capa);
      eventos.current.onDibujada(area);
    });
    capaRutas.current = L.layerGroup().addTo(m);
    mapa.current = m;
    return () => {
      m.remove();
      mapa.current = null;
    };
  }, []);

  useEffect(() => {
    const grupo = capaRutas.current!;
    grupo.clearLayers();
    for (const ruta of rutas) {
      if (ruta.id === ocultarId) continue;
      const seleccionada = ruta.id === seleccionadaId;
      L.polygon(aLatLngs(ruta.area), {
        color: ruta.color,
        weight: seleccionada ? 4 : 2,
        fillOpacity: seleccionada ? 0.35 : 0.18,
      })
        .bindTooltip(ruta.nombre, { permanent: true, direction: "center", className: "etiqueta-ruta" })
        .on("click", () => eventos.current.onSeleccionar(ruta.id))
        .addTo(grupo);
    }

    if (!encuadrado.current && rutas.length > 0) {
      mapa.current!.fitBounds(L.featureGroup(grupo.getLayers() as L.Polygon[]).getBounds(), { padding: [40, 40] });
      encuadrado.current = true;
    }
  }, [rutas, seleccionadaId, ocultarId]);

  useEffect(() => {
    const ruta = eventos.current.rutas.find((r) => r.id === seleccionadaId);
    if (ruta) {
      mapa.current!.flyToBounds(L.latLngBounds(aLatLngs(ruta.area)), { padding: [60, 60], duration: 0.5 });
    }
    // Solo al cambiar de selección, no cada vez que se recargan las rutas.
  }, [seleccionadaId]);

  useEffect(() => {
    const m = mapa.current!;
    if (dibujando) {
      m.pm.enableDraw("Polygon", { snappable: true, allowSelfIntersection: false });
    } else {
      m.pm.disableDraw();
    }
  }, [dibujando]);

  const claveBorrador = borrador?.clave;
  useEffect(() => {
    capaBorrador.current?.remove();
    capaBorrador.current = null;
    const inicial = eventos.current.borrador;
    if (!inicial) return;

    const capa = L.polygon(aLatLngs(inicial.area), { color: inicial.color, weight: 3, fillOpacity: 0.3, dashArray: "6 6" });
    capa.addTo(mapa.current!);
    capa.pm.enable({ allowSelfIntersection: false, snappable: true });
    capa.on("pm:edit", () => eventos.current.onBorradorCambiado(aPuntos(capa)));
    capaBorrador.current = capa;
  }, [claveBorrador]);

  const colorBorrador = borrador?.color;
  useEffect(() => {
    if (colorBorrador) capaBorrador.current?.setStyle({ color: colorBorrador });
  }, [colorBorrador]);

  return <div ref={contenedor} className="size-full" />;
}

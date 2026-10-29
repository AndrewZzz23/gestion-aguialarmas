import type { Cuenta, Punto, Ruta } from "@aguialarmas/shared";
import * as L from "leaflet";
import { useEffect, useRef } from "react";
import { aLatLng, crearMapaBase } from "@/lib/mapa";

export interface UbicacionEditable {
  /** null mientras no se haya hecho clic en el mapa. */
  punto: Punto | null;
  radioM: number;
}

interface Props {
  rutas: Ruta[];
  cuentas: Cuenta[];
  seleccionadaId: string | null;
  /** Cuenta que se está editando: se oculta porque la reemplaza el pin editable. */
  ocultarId: string | null;
  /** Si hay valor, el mapa está en modo ubicar: un clic pone el pin y se puede arrastrar. */
  editable: UbicacionEditable | null;
  onSeleccionar: (id: string) => void;
  onUbicar: (punto: Punto) => void;
}

const pin = L.divIcon({
  className: "",
  html: '<div class="pin-cuenta"></div>',
  iconSize: [28, 28],
  // El cuadro rotado 45° deja la punta ~34 px abajo del borde superior.
  iconAnchor: [14, 34],
});

/** Sedes de un cliente sobre el mapa, con su perímetro de llegada (AM-18) y las rutas de fondo. */
export function MapaCuentas(props: Props) {
  const { rutas, cuentas, seleccionadaId, ocultarId, editable } = props;
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<L.Map | null>(null);
  const capaRutas = useRef<L.LayerGroup | null>(null);
  const capaCuentas = useRef<L.LayerGroup | null>(null);
  const capaEdicion = useRef<{ marcador: L.Marker; circulo: L.Circle } | null>(null);
  const encuadrado = useRef(false);

  const eventos = useRef(props);
  useEffect(() => {
    eventos.current = props;
  });

  useEffect(() => {
    const m = crearMapaBase(contenedor.current!);
    // En desarrollo StrictMode crea el mapa dos veces: el nuevo también debe encuadrarse.
    encuadrado.current = false;
    capaRutas.current = L.layerGroup().addTo(m);
    capaCuentas.current = L.layerGroup().addTo(m);
    m.on("click", (e) => {
      if (eventos.current.editable) eventos.current.onUbicar([e.latlng.lng, e.latlng.lat]);
    });
    mapa.current = m;
    return () => {
      m.remove();
      mapa.current = null;
    };
  }, []);

  // Rutas de fondo, solo como referencia.
  useEffect(() => {
    const grupo = capaRutas.current!;
    grupo.clearLayers();
    for (const ruta of rutas) {
      L.polygon(ruta.area.map(aLatLng), { color: ruta.color, weight: 1.5, fillOpacity: 0.08, interactive: false })
        .bindTooltip(ruta.nombre, { permanent: true, direction: "center", className: "etiqueta-ruta etiqueta-ruta-tenue" })
        .addTo(grupo);
    }
  }, [rutas]);

  useEffect(() => {
    const grupo = capaCuentas.current!;
    grupo.clearLayers();
    const ubicadas = cuentas.filter((c) => c.ubicacion && c.id !== ocultarId);
    for (const cuenta of ubicadas) {
      const centro = aLatLng(cuenta.ubicacion!);
      const seleccionada = cuenta.id === seleccionadaId;
      const color = cuenta.activo ? "#141414" : "#A8A29E";
      L.circle(centro, { radius: cuenta.radioLlegadaM, color, weight: seleccionada ? 2.5 : 1, fillColor: "#FFD200", fillOpacity: seleccionada ? 0.3 : 0.12, interactive: false }).addTo(grupo);
      L.circleMarker(centro, { radius: seleccionada ? 8 : 6, color: "#FFFFFF", weight: 2, fillColor: color, fillOpacity: 1 })
        .bindTooltip(cuenta.nombre, { direction: "top", offset: [0, -6] })
        .on("click", () => eventos.current.onSeleccionar(cuenta.id))
        .addTo(grupo);
    }

    if (!encuadrado.current && ubicadas.length > 0) {
      const limites = L.latLngBounds(ubicadas.map((c) => aLatLng(c.ubicacion!)));
      // Con una sola sede (o todas en el mismo punto) el encuadre mide cero: se centra directo.
      if (limites.getNorthEast().equals(limites.getSouthWest())) mapa.current!.setView(limites.getCenter(), 16);
      else mapa.current!.fitBounds(limites.pad(0.3), { maxZoom: 16 });
      encuadrado.current = true;
    }
  }, [cuentas, seleccionadaId, ocultarId]);

  useEffect(() => {
    const cuenta = eventos.current.cuentas.find((c) => c.id === seleccionadaId);
    if (cuenta?.ubicacion) mapa.current!.flyTo(aLatLng(cuenta.ubicacion), Math.max(mapa.current!.getZoom(), 16), { duration: 0.5 });
  }, [seleccionadaId]);

  // Pin editable con su círculo; se mueve con clic en el mapa o arrastrándolo.
  const punto = editable?.punto;
  const radio = editable?.radioM;
  useEffect(() => {
    const m = mapa.current!;
    m.getContainer().style.cursor = editable ? "crosshair" : "";
    if (!punto || radio === undefined) {
      capaEdicion.current?.marcador.remove();
      capaEdicion.current?.circulo.remove();
      capaEdicion.current = null;
      return;
    }

    if (!capaEdicion.current) {
      const circulo = L.circle(aLatLng(punto), { radius: radio, color: "#8A6D00", weight: 2, dashArray: "6 6", fillColor: "#FFD200", fillOpacity: 0.25 }).addTo(m);
      const marcador = L.marker(aLatLng(punto), { icon: pin, draggable: true, autoPan: true }).addTo(m);
      marcador.on("drag", () => circulo.setLatLng(marcador.getLatLng()));
      marcador.on("dragend", () => {
        const ll = marcador.getLatLng();
        eventos.current.onUbicar([ll.lng, ll.lat]);
      });
      capaEdicion.current = { marcador, circulo };
    } else {
      capaEdicion.current.marcador.setLatLng(aLatLng(punto));
      capaEdicion.current.circulo.setLatLng(aLatLng(punto));
      capaEdicion.current.circulo.setRadius(radio);
    }
  }, [punto, radio, editable]);

  return <div ref={contenedor} className="size-full" />;
}

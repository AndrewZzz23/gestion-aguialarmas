import * as Leaflet from "leaflet";

// Geoman es un plugin escrito para el Leaflet global (window.L) y le agrega L.PM.
// Con Vite, Leaflet llega como módulo, así que se expone una copia extensible antes de importar Geoman.
// Las clases (L.Map, L.Polygon…) son las mismas, así que los mapas creados con el módulo reciben `map.pm`.
(globalThis as unknown as { L: typeof Leaflet }).L = { ...Leaflet };

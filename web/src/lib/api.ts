import { crearClienteApi } from "@aguialarmas/shared";
import { renovarSesion, useSesion } from "./sesion";

// Vacío en local: Vite redirige /api a la API (ver vite.config.ts).
export const api = crearClienteApi({
  urlBase: import.meta.env.VITE_API_URL ?? "",
  obtenerToken: () => useSesion.getState().tokenAcceso,
  renovarSesion,
});

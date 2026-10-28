import { crearClienteApi } from "@aguialarmas/shared";

// Vacío en local: Vite redirige /api a la API (ver vite.config.ts).
export const api = crearClienteApi({
  urlBase: import.meta.env.VITE_API_URL ?? "",
});

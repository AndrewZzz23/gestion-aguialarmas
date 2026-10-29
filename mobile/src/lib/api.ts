import { crearClienteApi } from "@aguialarmas/shared";
import { renovarSesion, urlApi, useSesion } from "./sesion";

// En el celular "localhost" es el propio celular: usa la IP de tu PC en la red (mobile/.env.local).
export const api = crearClienteApi({
  urlBase: urlApi,
  obtenerToken: () => useSesion.getState().tokenAcceso,
  renovarSesion,
});

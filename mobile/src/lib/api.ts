import { crearClienteApi } from "@aguialarmas/shared";

// En el celular "localhost" es el propio celular: usa la IP de tu PC en la red, ej. http://192.168.1.20:5080
export const api = crearClienteApi({
  urlBase: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5080",
});

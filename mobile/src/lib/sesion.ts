import { crearClienteApi, type Sesion, type Usuario } from "@aguialarmas/shared";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

/**
 * Sesión de la app (AM-01). El token de acceso (15 min) vive solo en memoria;
 * el de renovación (30 días, rota en cada uso) se guarda cifrado con SecureStore
 * para no pedir la contraseña cada vez que se abre la app.
 */
interface EstadoSesion {
  usuario: Usuario | null;
  tokenAcceso: string | null;
  /** True mientras se recupera la sesión guardada al abrir la app. */
  restaurando: boolean;
}

export const useSesion = create<EstadoSesion>(() => ({ usuario: null, tokenAcceso: null, restaurando: true }));

const CLAVE = "aguialarmas.renovacion";
export const urlApi = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5080";
// Cliente sin token: solo para autenticación, así no depende de lib/api (que depende de este archivo).
const auth = crearClienteApi({ urlBase: urlApi });

const leerRenovacion = () => SecureStore.getItemAsync(CLAVE).catch(() => null);

async function guardarRenovacion(token: string | null) {
  try {
    if (token) await SecureStore.setItemAsync(CLAVE, token);
    else await SecureStore.deleteItemAsync(CLAVE);
  } catch {
    // Sin almacenamiento seguro: la sesión dura hasta cerrar la app.
  }
}

export async function iniciarSesion(sesion: Sesion) {
  await guardarRenovacion(sesion.tokenRenovacion);
  useSesion.setState({ usuario: sesion.usuario, tokenAcceso: sesion.tokenAcceso, restaurando: false });
}

export async function cerrarSesion() {
  const token = await leerRenovacion();
  await guardarRenovacion(null);
  useSesion.setState({ usuario: null, tokenAcceso: null, restaurando: false });
  if (token) await auth.salir(token).catch(() => undefined);
}

// Varias peticiones pueden vencer a la vez: todas esperan la misma renovación.
let renovando: Promise<string | null> | null = null;

export function renovarSesion(): Promise<string | null> {
  renovando ??= (async () => {
    const token = await leerRenovacion();
    if (!token) return null;
    try {
      const sesion = await auth.renovar(token);
      await iniciarSesion(sesion);
      return sesion.tokenAcceso;
    } catch {
      await guardarRenovacion(null);
      useSesion.setState({ usuario: null, tokenAcceso: null, restaurando: false });
      return null;
    } finally {
      renovando = null;
    }
  })();
  return renovando;
}

/** Al abrir la app: recupera la sesión guardada, si la hay. */
export async function restaurarSesion() {
  if (await leerRenovacion()) await renovarSesion();
  useSesion.setState({ restaurando: false });
}

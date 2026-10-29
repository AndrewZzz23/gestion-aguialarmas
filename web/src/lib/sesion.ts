import { crearClienteApi, type Sesion, type Usuario } from "@aguialarmas/shared";
import { create } from "zustand";
import { queryClient } from "./consultas";

/**
 * Sesión de la web (WA-01). El token de acceso (15 min) vive solo en memoria;
 * el de renovación (30 días, rota en cada uso) se guarda en el navegador para no pedir
 * la contraseña cada vez que se recarga la página.
 */
interface EstadoSesion {
  usuario: Usuario | null;
  tokenAcceso: string | null;
  /** True mientras se intenta recuperar la sesión guardada al abrir la página. */
  restaurando: boolean;
}

export const useSesion = create<EstadoSesion>(() => ({ usuario: null, tokenAcceso: null, restaurando: true }));

const CLAVE = "aguialarmas.renovacion";
// Cliente sin token: solo para renovar, así no depende de lib/api (que depende de este archivo).
const auth = crearClienteApi({ urlBase: import.meta.env.VITE_API_URL ?? "" });

function leerRenovacion(): string | null {
  try {
    return localStorage.getItem(CLAVE);
  } catch {
    return null;
  }
}

function guardarRenovacion(token: string | null) {
  try {
    if (token) localStorage.setItem(CLAVE, token);
    else localStorage.removeItem(CLAVE);
  } catch {
    // Sin almacenamiento: la sesión dura hasta cerrar la pestaña.
  }
}

export function iniciarSesion(sesion: Sesion) {
  guardarRenovacion(sesion.tokenRenovacion);
  useSesion.setState({ usuario: sesion.usuario, tokenAcceso: sesion.tokenAcceso, restaurando: false });
}

export async function cerrarSesion() {
  const token = leerRenovacion();
  guardarRenovacion(null);
  useSesion.setState({ usuario: null, tokenAcceso: null, restaurando: false });
  queryClient.clear();
  if (token) await auth.salir(token).catch(() => undefined);
}

// Varias peticiones pueden vencer a la vez: todas esperan la misma renovación.
let renovando: Promise<string | null> | null = null;

export function renovarSesion(): Promise<string | null> {
  renovando ??= (async () => {
    const token = leerRenovacion();
    if (!token) return null;
    try {
      const sesion = await auth.renovar(token);
      iniciarSesion(sesion);
      return sesion.tokenAcceso;
    } catch {
      guardarRenovacion(null);
      useSesion.setState({ usuario: null, tokenAcceso: null, restaurando: false });
      return null;
    } finally {
      renovando = null;
    }
  })();
  return renovando;
}

/** Al abrir la página: recupera la sesión guardada, si la hay. */
export async function restaurarSesion() {
  if (leerRenovacion()) await renovarSesion();
  useSesion.setState({ restaurando: false });
}

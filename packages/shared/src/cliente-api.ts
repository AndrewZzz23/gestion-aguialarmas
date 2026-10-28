import type { z } from "zod";
import { EstadoApi, Ruta } from "./modelos";

export class ErrorApi extends Error {
  readonly estado: number;

  constructor(estado: number, mensaje: string) {
    super(mensaje);
    this.name = "ErrorApi";
    this.estado = estado;
  }
}

export interface OpcionesClienteApi {
  /** Ej.: http://localhost:5080 en local; la URL de Azure en producción. */
  urlBase: string;
  /** Devuelve el token del usuario cuando exista autenticación. */
  obtenerToken?: () => string | null | Promise<string | null>;
}

/** Cliente de la API usado igual por la web y por la app. */
export function crearClienteApi({ urlBase, obtenerToken }: OpcionesClienteApi) {
  async function pedir<T>(esquema: z.ZodType<T>, ruta: string, init?: RequestInit): Promise<T> {
    const token = obtenerToken ? await obtenerToken() : null;
    const respuesta = await fetch(`${urlBase}${ruta}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });

    if (!respuesta.ok) {
      throw new ErrorApi(respuesta.status, `La API respondió ${respuesta.status} en ${ruta}`);
    }

    return esquema.parse(await respuesta.json());
  }

  return {
    estado: () => pedir(EstadoApi, "/api/estado"),
    rutas: () => pedir(Ruta.array(), "/api/rutas"),
  };
}

export type ClienteApi = ReturnType<typeof crearClienteApi>;

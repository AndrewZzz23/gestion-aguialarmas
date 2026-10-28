import { z } from "zod";
import { EstadoApi, Ruta, type GuardarRuta } from "./modelos";

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

const SinContenido = z.undefined();

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
      // Las reglas de negocio llegan como ProblemDetails con el mensaje listo para mostrar.
      const problema = await respuesta.json().catch(() => null);
      const mensaje = typeof problema?.detail === "string" ? problema.detail : `La API respondió ${respuesta.status} en ${ruta}`;
      throw new ErrorApi(respuesta.status, mensaje);
    }

    if (respuesta.status === 204) {
      return esquema.parse(undefined);
    }

    return esquema.parse(await respuesta.json());
  }

  const enviar = (metodo: string, cuerpo?: unknown): RequestInit => ({
    method: metodo,
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });

  return {
    estado: () => pedir(EstadoApi, "/api/estado"),
    rutas: () => pedir(Ruta.array(), "/api/rutas"),
    crearRuta: (datos: GuardarRuta) => pedir(Ruta, "/api/rutas", enviar("POST", datos)),
    actualizarRuta: (id: string, datos: GuardarRuta) => pedir(Ruta, `/api/rutas/${id}`, enviar("PUT", datos)),
    inactivarRuta: (id: string) => pedir(SinContenido, `/api/rutas/${id}/inactivar`, enviar("POST")),
  };
}

export type ClienteApi = ReturnType<typeof crearClienteApi>;

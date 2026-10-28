import { z } from "zod";
import { EstadoApi, Ruta, Sesion, Usuario, type GuardarRuta, type GuardarUsuario } from "./modelos";

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
  /** Token de acceso vigente, si hay sesión. */
  obtenerToken?: () => string | null | Promise<string | null>;
  /**
   * Se llama cuando la API responde 401 con el token vencido. Debe renovar la sesión y devolver
   * el token nuevo, o null si no se pudo (entonces la app vuelve a la pantalla de ingreso).
   */
  renovarSesion?: () => Promise<string | null>;
}

const SinContenido = z.undefined();

/** Cliente de la API usado igual por la web y por la app. */
export function crearClienteApi({ urlBase, obtenerToken, renovarSesion }: OpcionesClienteApi) {
  async function pedir<T>(esquema: z.ZodType<T>, ruta: string, init?: RequestInit, reintento = true): Promise<T> {
    const token = obtenerToken ? await obtenerToken() : null;
    const respuesta = await fetch(`${urlBase}${ruta}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });

    // Token de acceso vencido: se renueva una vez y se repite la petición.
    if (respuesta.status === 401 && token && reintento && renovarSesion && !ruta.startsWith("/api/auth/")) {
      if (await renovarSesion()) {
        return pedir(esquema, ruta, init, false);
      }
    }

    if (!respuesta.ok) {
      // Las reglas de negocio llegan como ProblemDetails con el mensaje listo para mostrar.
      const problema = await respuesta.json().catch(() => null);
      const mensaje =
        typeof problema?.detail === "string"
          ? problema.detail
          : respuesta.status === 403
            ? "Tu rol no tiene permiso para esta acción."
            : `La API respondió ${respuesta.status} en ${ruta}`;
      throw new ErrorApi(respuesta.status, mensaje);
    }

    if (respuesta.status === 202 || respuesta.status === 204) {
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

    // Autenticación (WA-01)
    ingresar: (correo: string, contrasena: string) => pedir(Sesion, "/api/auth/ingresar", enviar("POST", { correo, contrasena })),
    renovar: (tokenRenovacion: string) => pedir(Sesion, "/api/auth/renovar", enviar("POST", { tokenRenovacion })),
    salir: (tokenRenovacion: string) => pedir(SinContenido, "/api/auth/salir", enviar("POST", { tokenRenovacion })),
    recuperarContrasena: (correo: string) => pedir(SinContenido, "/api/auth/recuperar", enviar("POST", { correo })),
    restablecerContrasena: (correo: string, token: string, contrasena: string) =>
      pedir(SinContenido, "/api/auth/restablecer", enviar("POST", { correo, token, contrasena })),

    // Usuarios (WA-02)
    usuarios: () => pedir(Usuario.array(), "/api/usuarios"),
    crearUsuario: (datos: GuardarUsuario) => pedir(Usuario, "/api/usuarios", enviar("POST", datos)),
    actualizarUsuario: (id: string, datos: GuardarUsuario) => pedir(Usuario, `/api/usuarios/${id}`, enviar("PUT", datos)),
    inactivarUsuario: (id: string) => pedir(SinContenido, `/api/usuarios/${id}/inactivar`, enviar("POST")),
    reactivarUsuario: (id: string) => pedir(SinContenido, `/api/usuarios/${id}/reactivar`, enviar("POST")),
    reenviarAcceso: (id: string) => pedir(SinContenido, `/api/usuarios/${id}/reenviar-acceso`, enviar("POST")),

    // Rutas (WA-28)
    rutas: () => pedir(Ruta.array(), "/api/rutas"),
    crearRuta: (datos: GuardarRuta) => pedir(Ruta, "/api/rutas", enviar("POST", datos)),
    actualizarRuta: (id: string, datos: GuardarRuta) => pedir(Ruta, `/api/rutas/${id}`, enviar("PUT", datos)),
    inactivarRuta: (id: string) => pedir(SinContenido, `/api/rutas/${id}/inactivar`, enviar("POST")),
  };
}

export type ClienteApi = ReturnType<typeof crearClienteApi>;

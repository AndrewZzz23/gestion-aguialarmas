import { z } from "zod";

/** Roles del sistema (WA-02). */
export const Rol = z.enum([
  "Administrador",
  "UsuarioAdministrativo",
  "DirectorTecnico",
  "Almacenista",
  "Tecnico",
  "Supervisor",
]);
export type Rol = z.infer<typeof Rol>;

/** Estados de la orden (WA-14). Se confirman en la fase 1. */
export const EstadoOrden = z.enum([
  "EnEspera",
  "Clasificada",
  "Asignada",
  "EnEjecucion",
  "Suspendida",
  "Finalizada",
  "Anulada",
]);
export type EstadoOrden = z.infer<typeof EstadoOrden>;

/** Marcaciones de la app: en cada una se toma el GPS (AM-17). */
export const TipoMarcacion = z.enum([
  "InicioJornada",
  "VoyEnCamino",
  "Llegada",
  "InicioTarea",
  "Pausa",
  "Reanudacion",
  "Cierre",
  "Salida",
  "FinJornada",
]);
export type TipoMarcacion = z.infer<typeof TipoMarcacion>;

/** Punto [longitud, latitud], en el mismo orden que GeoJSON. */
export const Punto = z.tuple([z.number(), z.number()]);
export type Punto = z.infer<typeof Punto>;

/** Área de la ciudad dibujada en el mapa (WA-28). */
export const Ruta = z.object({
  id: z.uuid(),
  nombre: z.string(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  /** Anillo exterior del polígono. */
  area: z.array(Punto),
});
export type Ruta = z.infer<typeof Ruta>;

export const GuardarRuta = z.object({
  nombre: z.string().trim().min(1, "Escribe el nombre de la ruta").max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Elige un color"),
  area: z.array(Punto).min(3, "Dibuja al menos 3 puntos"),
});
export type GuardarRuta = z.infer<typeof GuardarRuta>;

export const EstadoApi = z.object({
  sistema: z.string(),
  version: z.string(),
  horaUtc: z.string(),
});
export type EstadoApi = z.infer<typeof EstadoApi>;

/** Usuario del sistema (WA-02). */
export const Usuario = z.object({
  id: z.uuid(),
  nombre: z.string(),
  correo: z.string(),
  rol: Rol,
  activo: z.boolean(),
  /** False mientras la persona no haya usado el enlace del correo para crear su contraseña. */
  contrasenaDefinida: z.boolean(),
  bloqueado: z.boolean(),
});
export type Usuario = z.infer<typeof Usuario>;

export const GuardarUsuario = z.object({
  nombre: z.string().trim().min(1, "Escribe el nombre").max(150),
  correo: z.email("El correo no es válido").trim(),
  rol: Rol,
});
export type GuardarUsuario = z.infer<typeof GuardarUsuario>;

export const Sesion = z.object({
  tokenAcceso: z.string(),
  expiraUtc: z.string(),
  tokenRenovacion: z.string(),
  usuario: Usuario,
});
export type Sesion = z.infer<typeof Sesion>;

/** Mismo criterio que Usuario.ValidarContrasena en la API. */
export const Contrasena = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .regex(/\p{L}/u, "Debe tener al menos una letra")
  .regex(/\d/, "Debe tener al menos un número");

export const nombresRol: Record<Rol, string> = {
  Administrador: "Administrador",
  UsuarioAdministrativo: "Usuario administrativo",
  DirectorTecnico: "Director técnico",
  Almacenista: "Almacenista",
  Tecnico: "Técnico",
  Supervisor: "Supervisor",
};

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

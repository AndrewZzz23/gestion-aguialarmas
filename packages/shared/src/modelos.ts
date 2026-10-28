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

export const Ruta = z.object({
  id: z.uuid(),
  nombre: z.string(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});
export type Ruta = z.infer<typeof Ruta>;

export const EstadoApi = z.object({
  sistema: z.string(),
  version: z.string(),
  horaUtc: z.string(),
});
export type EstadoApi = z.infer<typeof EstadoApi>;

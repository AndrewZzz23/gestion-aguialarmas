import type { Rol } from "./modelos";

/**
 * Qué puede hacer cada rol (WA-03). Igual que Permisos.cs en la API, que es la que manda:
 * aquí solo sirve para mostrar u ocultar pantallas y botones. Si cambias uno, cambia el otro.
 */
export const permisos = {
  "usuarios.gestionar": ["Administrador"],
  "rutas.ver": ["Administrador", "UsuarioAdministrativo", "DirectorTecnico", "Supervisor"],
  "rutas.gestionar": ["Administrador", "UsuarioAdministrativo"],
} as const satisfies Record<string, readonly Rol[]>;

export type Permiso = keyof typeof permisos;

export function puede(rol: Rol | undefined, permiso: Permiso): boolean {
  return rol !== undefined && (permisos[permiso] as readonly Rol[]).includes(rol);
}

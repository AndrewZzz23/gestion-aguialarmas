import { QueryClient } from "@tanstack/react-query";

/** Caché de datos del servidor (TanStack Query). Se vacía al cerrar sesión. */
export const queryClient = new QueryClient();

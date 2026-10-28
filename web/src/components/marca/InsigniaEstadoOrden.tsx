import type { EstadoOrden } from "@aguialarmas/shared";
import { Badge } from "@/components/ui/badge";

type Variante = NonNullable<React.ComponentProps<typeof Badge>["variant"]>;

const estilos: Record<EstadoOrden, { texto: string; variante: Variante }> = {
  EnEspera: { texto: "En espera", variante: "secondary" },
  Clasificada: { texto: "Clasificada", variante: "info" },
  Asignada: { texto: "Asignada", variante: "negro" },
  EnEjecucion: { texto: "En ejecución", variante: "default" },
  Suspendida: { texto: "Suspendida", variante: "aviso" },
  Finalizada: { texto: "Finalizada", variante: "exito" },
  Anulada: { texto: "Anulada", variante: "outline" },
};

/** Color de cada estado de la orden (WA-14), igual en tablero, detalle e informes. */
export function InsigniaEstadoOrden({ estado }: { estado: EstadoOrden }) {
  const { texto, variante } = estilos[estado];
  return <Badge variant={variante}>{texto}</Badge>;
}

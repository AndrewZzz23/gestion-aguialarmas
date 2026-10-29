import { colores, espacios, radios, tipografia, type EstadoOrden } from "@aguialarmas/shared";
import { StyleSheet, Text, View } from "react-native";
import { familia } from "./fuentes";

/** Mismos colores por estado que la web (web/src/components/marca/InsigniaEstadoOrden.tsx). */
const estilosEstado: Record<EstadoOrden, { texto: string; fondo: string; color: string }> = {
  EnEspera: { texto: "En espera", fondo: colores.superficieSuave, color: colores.grafito },
  Clasificada: { texto: "Clasificada", fondo: colores.infoFondo, color: colores.info },
  Asignada: { texto: "Asignada", fondo: colores.negro, color: "#FFFFFF" },
  EnEjecucion: { texto: "En ejecución", fondo: colores.amarillo, color: colores.negro },
  Suspendida: { texto: "Suspendida", fondo: colores.avisoFondo, color: colores.aviso },
  Finalizada: { texto: "Finalizada", fondo: colores.exitoFondo, color: colores.exito },
  Anulada: { texto: "Anulada", fondo: colores.superficie, color: colores.grafitoSuave },
};

export function InsigniaEstadoOrden({ estado }: { estado: EstadoOrden }) {
  const e = estilosEstado[estado];
  return (
    <View style={[estilos.insignia, { backgroundColor: e.fondo }, estado === "Anulada" && estilos.borde]}>
      <Text style={[estilos.texto, { color: e.color }]}>{e.texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  insignia: {
    alignSelf: "flex-start",
    paddingHorizontal: espacios[3],
    paddingVertical: espacios[1],
    borderRadius: radios.total,
  },
  borde: { borderWidth: 1, borderColor: colores.borde },
  texto: { fontFamily: familia.seminegrilla, fontSize: tipografia.tamanos.xs },
});

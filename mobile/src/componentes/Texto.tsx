import { colores, tipografia } from "@aguialarmas/shared";
import { StyleSheet, Text, type TextProps } from "react-native";
import { familia } from "./fuentes";

type Variante = "titulo" | "subtitulo" | "cuerpo" | "secundario" | "etiqueta";

export function Texto({ variante = "cuerpo", style, ...props }: TextProps & { variante?: Variante }) {
  return <Text style={[estilos[variante], style]} {...props} />;
}

const estilos = StyleSheet.create({
  titulo: { fontFamily: familia.negrilla, fontSize: tipografia.tamanos.xxl, color: colores.grafito },
  subtitulo: { fontFamily: familia.negrilla, fontSize: tipografia.tamanos.lg, color: colores.grafito },
  cuerpo: { fontFamily: familia.normal, fontSize: tipografia.tamanos.base, color: colores.grafito },
  secundario: { fontFamily: familia.normal, fontSize: tipografia.tamanos.sm, color: colores.grafitoSuave },
  etiqueta: { fontFamily: familia.seminegrilla, fontSize: tipografia.tamanos.sm, color: colores.grafito },
});

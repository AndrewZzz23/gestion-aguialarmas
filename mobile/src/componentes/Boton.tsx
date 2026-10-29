import { colores, espacios, radios, tipografia } from "@aguialarmas/shared";
import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from "react-native";
import { familia } from "./fuentes";

type Variante = "principal" | "negro" | "contorno" | "peligro";

const fondos: Record<Variante, { normal: string; presionado: string; texto: string; borde?: string }> = {
  principal: { normal: colores.amarillo, presionado: colores.amarilloHover, texto: colores.negro },
  negro: { normal: colores.negro, presionado: "#2A2A2A", texto: "#FFFFFF" },
  contorno: { normal: colores.superficie, presionado: colores.superficieSuave, texto: colores.grafito, borde: colores.bordeCampo },
  peligro: { normal: colores.peligroFondo, presionado: "#FED7AA", texto: colores.peligro },
};

/** Botones grandes (52 px) para usarlos con una mano en campo. Amarillo solo para la acción principal. */
export function Boton({
  titulo,
  variante = "principal",
  cargando = false,
  disabled,
  ...props
}: PressableProps & { titulo: string; variante?: Variante; cargando?: boolean }) {
  const c = fondos[variante];
  const inactivo = disabled || cargando;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={inactivo}
      style={({ pressed }) => [
        estilos.base,
        { backgroundColor: pressed ? c.presionado : c.normal },
        c.borde ? { borderWidth: 1, borderColor: c.borde } : null,
        inactivo && estilos.inactivo,
      ]}
      {...props}
    >
      {cargando ? <ActivityIndicator color={c.texto} /> : <Text style={[estilos.texto, { color: c.texto }]}>{titulo}</Text>}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: espacios[5],
    borderRadius: radios.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  texto: { fontFamily: familia.seminegrilla, fontSize: tipografia.tamanos.base },
  inactivo: { opacity: 0.5 },
});

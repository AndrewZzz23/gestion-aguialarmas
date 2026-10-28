import { colores, espacios, radios } from "@aguialarmas/shared";
import { StyleSheet, View, type ViewProps } from "react-native";

export function Tarjeta({ style, ...props }: ViewProps) {
  return <View style={[estilos.tarjeta, style]} {...props} />;
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radios.xl,
    padding: espacios[5],
    gap: espacios[3],
  },
});

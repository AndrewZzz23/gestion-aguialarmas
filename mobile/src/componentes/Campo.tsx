import { colores, espacios, radios, tipografia } from "@aguialarmas/shared";
import { useState } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { familia } from "./fuentes";
import { Texto } from "./Texto";

/** Campo de texto con etiqueta, ayuda y error. El error se muestra en naranja, nunca en rojo. */
export function Campo({
  etiqueta,
  ayuda,
  error,
  style,
  ...props
}: TextInputProps & { etiqueta: string; ayuda?: string; error?: string }) {
  const [enfocado, setEnfocado] = useState(false);

  return (
    <View style={estilos.contenedor}>
      <Texto variante="etiqueta">{etiqueta}</Texto>
      <TextInput
        placeholderTextColor={colores.grafitoSuave}
        style={[
          estilos.entrada,
          enfocado && { borderColor: colores.amarilloOscuro, borderWidth: 2 },
          error ? { borderColor: colores.peligro } : null,
          style,
        ]}
        onFocus={(e) => {
          setEnfocado(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setEnfocado(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error ? (
        <Texto variante="secundario" style={{ color: colores.peligro }}>
          {error}
        </Texto>
      ) : ayuda ? (
        <Texto variante="secundario">{ayuda}</Texto>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: espacios[1] + 2 },
  entrada: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colores.bordeCampo,
    borderRadius: radios.md,
    paddingHorizontal: espacios[3],
    backgroundColor: colores.superficie,
    fontFamily: familia.normal,
    fontSize: tipografia.tamanos.base,
    color: colores.grafito,
  },
});

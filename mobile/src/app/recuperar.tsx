import { colores } from "@aguialarmas/shared";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Boton, Campo, Texto } from "../componentes";
import { api } from "../lib/api";

/** WA-01: el enlace del correo abre la web para crear la contraseña nueva. */
export default function Recuperar() {
  const [correo, setCorreo] = useState("");
  const recuperar = useMutation({ mutationFn: () => api.recuperarContrasena(correo) });

  return (
    <ScrollView contentContainerStyle={estilos.contenedor} keyboardShouldPersistTaps="handled">
      {recuperar.isSuccess ? (
        <View style={estilos.exito}>
          <Texto variante="subtitulo" style={{ color: colores.exito }}>
            Revisa tu correo
          </Texto>
          <Texto>
            Si {correo} tiene una cuenta, le llegó un enlace que vence en 1 hora. Ábrelo para crear la contraseña nueva y vuelve a
            ingresar.
          </Texto>
        </View>
      ) : (
        <>
          <Texto variante="secundario">Te enviamos un enlace a tu correo para crear una contraseña nueva.</Texto>
          {recuperar.isError && <Texto style={{ color: colores.peligro }}>{recuperar.error.message}</Texto>}
          <Campo etiqueta="Correo" value={correo} onChangeText={setCorreo} autoCapitalize="none" keyboardType="email-address" autoFocus />
          <Boton titulo="Enviar enlace" cargando={recuperar.isPending} disabled={!correo} onPress={() => recuperar.mutate()} />
        </>
      )}
      <Boton titulo="Volver a ingresar" variante="contorno" onPress={() => router.back()} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { padding: 24, gap: 16 },
  exito: { backgroundColor: colores.exitoFondo, borderRadius: 12, padding: 16, gap: 8 },
});

import { colores, rolesApp } from "@aguialarmas/shared";
import { useMutation } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Boton, Campo, familia, Texto } from "../componentes";
import { api } from "../lib/api";
import { iniciarSesion } from "../lib/sesion";

/** AM-01: ingreso con las credenciales creadas en la web. */
export default function Ingresar() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  const ingresar = useMutation({
    mutationFn: async () => {
      const sesion = await api.ingresar(correo, contrasena);
      if (!rolesApp.includes(sesion.usuario.rol)) {
        // La sesión se abrió en la API: se cierra para no dejarla viva.
        await api.salir(sesion.tokenRenovacion).catch(() => undefined);
        throw new Error("Esta app es para técnicos, supervisores y almacenistas. Ingresa por la web.");
      }
      return sesion;
    },
    onSuccess: iniciarSesion,
  });

  return (
    <KeyboardAvoidingView style={estilos.raiz} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={estilos.marca}>
        <View style={estilos.recuadroAguila}>
          <Image source={require("../../assets/aguila.png")} style={estilos.aguila} resizeMode="contain" />
        </View>
        <Texto style={estilos.nombre}>Aguialarmas</Texto>
        <Texto style={estilos.subtitulo}>TÉCNICOS</Texto>
      </View>

      <ScrollView contentContainerStyle={estilos.formulario} keyboardShouldPersistTaps="handled">
        <Texto variante="titulo">Ingresar</Texto>
        {ingresar.isError && (
          <View style={estilos.error}>
            <Texto style={{ color: colores.peligro }}>{ingresar.error.message}</Texto>
          </View>
        )}
        <Campo
          etiqueta="Correo"
          value={correo}
          onChangeText={setCorreo}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="username"
        />
        <Campo
          etiqueta="Contraseña"
          value={contrasena}
          onChangeText={setContrasena}
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          onSubmitEditing={() => ingresar.mutate()}
        />
        <Boton titulo="Ingresar" cargando={ingresar.isPending} disabled={!correo || !contrasena} onPress={() => ingresar.mutate()} />
        <Link href="/recuperar" style={estilos.enlace}>
          ¿Olvidaste tu contraseña?
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: colores.fondo },
  marca: { backgroundColor: colores.negro, alignItems: "center", paddingTop: 72, paddingBottom: 32, gap: 6 },
  recuadroAguila: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 6, marginBottom: 8 },
  aguila: { width: 72, height: 72 },
  nombre: { color: "#FFFFFF", fontSize: 26, fontFamily: familia.negrilla },
  subtitulo: { color: colores.amarillo, fontSize: 12, letterSpacing: 3, fontFamily: familia.seminegrilla },
  formulario: { padding: 24, gap: 16 },
  error: { backgroundColor: colores.peligroFondo, borderRadius: 10, padding: 12 },
  enlace: { color: colores.amarilloOscuro, fontFamily: familia.seminegrilla, textAlign: "center", paddingVertical: 8 },
});

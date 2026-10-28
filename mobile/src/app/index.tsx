import { useQuery } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { api } from "../lib/api";

export default function Inicio() {
  const estado = useQuery({ queryKey: ["estado"], queryFn: api.estado });

  return (
    <View style={estilos.contenedor}>
      <Stack.Screen options={{ title: "Gestión Aguialarmas" }} />
      <Text style={estilos.titulo}>App del técnico</Text>
      {estado.isPending && <ActivityIndicator color="#1F4E79" />}
      {estado.isError && (
        <Text style={estilos.aviso}>No hay conexión con la API. Revisa EXPO_PUBLIC_API_URL.</Text>
      )}
      {estado.data && (
        <Text style={estilos.texto}>
          Conectado a {estado.data.sistema} · v{estado.data.version}
        </Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, padding: 24, gap: 12, justifyContent: "center" },
  titulo: { fontSize: 24, fontWeight: "700", color: "#14243A" },
  texto: { fontSize: 16, color: "#4A5563" },
  aviso: { fontSize: 16, color: "#5C4A00" },
});

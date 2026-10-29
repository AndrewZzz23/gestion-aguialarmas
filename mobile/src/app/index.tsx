import { colores, EstadoOrden } from "@aguialarmas/shared";
import { useQuery } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from "react-native";
import { Boton, Campo, InsigniaEstadoOrden, Tarjeta, Texto } from "../componentes";
import { api } from "../lib/api";

export default function Inicio() {
  const estado = useQuery({ queryKey: ["estado"], queryFn: api.estado });

  return (
    <ScrollView contentContainerStyle={estilos.contenedor}>
      <Stack.Screen options={{ title: "Aguialarmas" }} />

      <View style={estilos.encabezado}>
        <Image source={require("../../assets/aguila.png")} style={estilos.aguila} resizeMode="contain" />
        <View>
          <Texto variante="titulo">App del técnico</Texto>
          {estado.isPending && <ActivityIndicator color={colores.negro} />}
          {estado.isError && (
            <Texto variante="secundario" style={{ color: colores.aviso }}>
              No hay conexión con la API. Revisa EXPO_PUBLIC_API_URL.
            </Texto>
          )}
          {estado.data && <Texto variante="secundario">Conectado · v{estado.data.version}</Texto>}
        </View>
      </View>

      {/* Muestra de los componentes base; se reemplaza por la agenda del técnico (AM-03). */}
      <Tarjeta>
        <Texto variante="subtitulo">OT-0142 · Éxito Calle 60</Texto>
        <Texto variante="secundario">Mantenimiento CCTV · Zona 2 · Bodega</Texto>
        <InsigniaEstadoOrden estado="Asignada" />
        <Boton titulo="Voy en camino" />
        <Boton titulo="Ver detalle" variante="contorno" />
      </Tarjeta>

      <Tarjeta>
        <Texto variante="subtitulo">Estados de la orden</Texto>
        <View style={estilos.fila}>
          {EstadoOrden.options.map((e) => (
            <InsigniaEstadoOrden key={e} estado={e} />
          ))}
        </View>
      </Tarjeta>

      <Tarjeta>
        <Campo etiqueta="Diagnóstico" placeholder="Qué encontraste" ayuda="Se guarda en el cierre de la orden." />
        <Campo etiqueta="Serial" placeholder="Ej.: HK-2231" error="Este serial no está en la bodega de la cuenta." />
        <Boton titulo="Pausar" variante="negro" />
        <Boton titulo="Reportar daño" variante="peligro" />
      </Tarjeta>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { padding: 20, gap: 16 },
  encabezado: { flexDirection: "row", alignItems: "center", gap: 12 },
  aguila: { width: 56, height: 56 },
  fila: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});

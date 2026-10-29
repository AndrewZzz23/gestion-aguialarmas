import { colores } from "@aguialarmas/shared";
import { useFonts } from "@expo-google-fonts/montserrat";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { familia, fuentesMontserrat } from "../componentes";
import { restaurarSesion, useSesion } from "../lib/sesion";

SplashScreen.preventAutoHideAsync();
void restaurarSesion();

export default function Layout() {
  const [queryClient] = useState(() => new QueryClient());
  const [fuentesListas, errorFuentes] = useFonts(fuentesMontserrat);
  const restaurando = useSesion((s) => s.restaurando);
  const conSesion = useSesion((s) => s.usuario !== null);
  const listo = (fuentesListas || errorFuentes !== null) && !restaurando;

  useEffect(() => {
    if (listo) SplashScreen.hideAsync();
  }, [listo]);

  if (!listo) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colores.negro },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { fontFamily: familia.negrilla },
          contentStyle: { backgroundColor: colores.fondo },
        }}
      >
        {/* AM-01: sin sesión solo se ven ingresar y recuperar; con sesión, el resto de la app. */}
        <Stack.Protected guard={conSesion}>
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!conSesion}>
          <Stack.Screen name="ingresar" options={{ headerShown: false }} />
          <Stack.Screen name="recuperar" options={{ title: "Recuperar contraseña" }} />
        </Stack.Protected>
      </Stack>
    </QueryClientProvider>
  );
}

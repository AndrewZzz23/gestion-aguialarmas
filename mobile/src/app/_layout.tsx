import { colores } from "@aguialarmas/shared";
import { useFonts } from "@expo-google-fonts/montserrat";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { familia, fuentesMontserrat } from "../componentes";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [queryClient] = useState(() => new QueryClient());
  const [fuentesListas, errorFuentes] = useFonts(fuentesMontserrat);

  useEffect(() => {
    if (fuentesListas || errorFuentes) {
      SplashScreen.hideAsync();
    }
  }, [fuentesListas, errorFuentes]);

  if (!fuentesListas && !errorFuentes) {
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
      />
    </QueryClientProvider>
  );
}

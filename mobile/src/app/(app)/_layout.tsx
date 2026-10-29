import { colores } from "@aguialarmas/shared";
import { Stack } from "expo-router";
import { familia } from "../../componentes";

/** Pantallas con sesión (técnico, supervisor y almacenista). */
export default function LayoutApp() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colores.negro },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontFamily: familia.negrilla },
        contentStyle: { backgroundColor: colores.fondo },
      }}
    />
  );
}

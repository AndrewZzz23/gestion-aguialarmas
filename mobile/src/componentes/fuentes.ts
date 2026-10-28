import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";

/** Se cargan en src/app/_layout.tsx con useFonts. */
export const fuentesMontserrat = {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
};

/** En React Native cada peso es una familia distinta: usar esto en vez de fontWeight. */
export const familia = {
  normal: "Montserrat_400Regular",
  medio: "Montserrat_500Medium",
  seminegrilla: "Montserrat_600SemiBold",
  negrilla: "Montserrat_700Bold",
} as const;

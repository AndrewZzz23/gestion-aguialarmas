/**
 * Identidad visual de Aguialarmas para la web y la app (ver docs/decisiones/0002-identidad-visual.md).
 * Base: logo y página de la empresa (negro, amarillo #FFD200, rojo, Montserrat).
 * La web replica estos valores como variables CSS en web/src/index.css: si cambias uno, cambia el otro.
 */
export const colores = {
  /** Barra superior, menú lateral y encabezados de la app. */
  negro: "#141414",
  /** Texto principal. */
  grafito: "#1C1917",
  /** Texto secundario, etiquetas y ayudas. Contraste 6:1 sobre blanco. */
  grafitoSuave: "#5C5853",

  /** Amarillo de la marca: botón principal, elemento seleccionado. Nunca como color de texto sobre blanco. */
  amarillo: "#FFD200",
  amarilloHover: "#EBC100",
  /** Fondo de hover y resaltados suaves. */
  amarilloSuave: "#FFF4BF",
  /** Foco de teclado y texto de acento sobre blanco (contraste 4.6:1). */
  amarilloOscuro: "#8A6D00",

  /** Rojo del logo. Solo para el logo: no se usa en textos, botones ni alertas. */
  rojoMarca: "#FF0000",

  fondo: "#F5F5F4",
  superficie: "#FFFFFF",
  superficieSuave: "#F0EFED",
  borde: "#E2E0DC",
  bordeCampo: "#D6D3CE",

  /** Estados. Los errores y acciones destructivas van en naranja quemado, nunca en rojo. */
  peligro: "#C2410C",
  peligroFondo: "#FFEDD5",
  aviso: "#B45309",
  avisoFondo: "#FEF3C7",
  exito: "#2F7D32",
  exitoFondo: "#E8F5E9",
  info: "#1F5F99",
  infoFondo: "#E6F0FA",
} as const;

/** Colores para distinguir las rutas en el mapa (WA-28). Sin rojo, para no confundirlas con alertas. */
export const coloresRutas = [
  "#FFD200",
  "#141414",
  "#1F5F99",
  "#2F7D32",
  "#B45309",
  "#7C3AED",
  "#0E7490",
  "#BE185D",
] as const;

export const tipografia = {
  familia: "Montserrat",
  pesos: { normal: 400, medio: 500, seminegrilla: 600, negrilla: 700 },
  /** Tamaños en px. */
  tamanos: { xs: 12, sm: 14, base: 16, lg: 18, xl: 22, xxl: 28 },
} as const;

/** Radios en px. La página usa 20 px en tarjetas grandes; en formularios y botones se usa uno menor. */
export const radios = { sm: 8, md: 10, lg: 12, xl: 20, total: 999 } as const;

/** Escala de espacios en px (múltiplos de 4). */
export const espacios = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40 } as const;

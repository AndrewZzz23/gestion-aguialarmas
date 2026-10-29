# 0002 · Identidad visual y librería de componentes

Fecha: 2026-10-27 · Estado: aceptada

## Contexto
Los colores iniciales del proyecto (azules) no salían de la marca. La identidad real de Aguialarmas, tomada del logo y de https://aguialarmas.com, es **negro, amarillo `#FFD200` y rojo**, con tipografía **Montserrat** y bordes redondeados.

## Decisión
- **Marca real, adaptada a un sistema de gestión:**
  - Negro `#141414` para la barra, el menú y los encabezados de la app.
  - Amarillo `#FFD200` para la acción principal y lo seleccionado (con texto negro). Nunca como color de texto sobre blanco: para eso está el amarillo oscuro `#8A6D00`.
  - Fondo gris claro `#F5F5F4` y tarjetas blancas.
  - El **rojo queda solo en el logo**. Errores y acciones destructivas en naranja quemado `#C2410C`; avisos en ámbar `#B45309`.
  - Montserrat en toda la interfaz; títulos en negrilla.
- **Fuente de verdad:** `packages/shared/src/tema.ts` (colores, tipografía, radios, espacios). La web replica los valores en `web/src/index.css`.
- **Web:** Tailwind CSS 4 + shadcn/ui (base Radix). Los componentes quedan en `web/src/components/ui/` y se editan libremente. Componentes propios de la marca en `web/src/components/marca/`. La guía visual está en la ruta `/estilos`.
- **App:** componentes propios en `mobile/src/componentes/` (Texto, Boton, Tarjeta, Campo, InsigniaEstadoOrden) con los mismos tokens. Botones de 52 px para usarlos con una mano en campo.
- **Logo:** el águila recortada (`web/public/aguila.png`, `mobile/assets/aguila.png`) va dentro de un recuadro blanco sobre fondo negro, porque el cuerpo del águila es negro. El logo completo trae la leyenda de Supervigilancia y se reserva para documentos e informes.
- **Estados de la orden** con un color fijo, igual en web y app: En espera (gris), Clasificada (azul info), Asignada (negro), En ejecución (amarillo), Suspendida (ámbar), Finalizada (verde), Anulada (contorno).

## Consecuencias
- Para agregar un componente de shadcn: `cd web && pnpm dlx shadcn@latest add <componente>`.
- Si cambia un color, se cambia en `tema.ts` y en `index.css`.
- Los íconos de la app en `mobile/assets/` (ícono, ícono adaptativo, splash) siguen siendo los genéricos de Expo; se reemplazan con el logo antes de publicar en Google Play (fase 4).

# 0001 · Stack tecnológico

Fecha: 2026-10-27 · Estado: aceptada

## Decisión
- **API:** .NET 10 con Clean Architecture, EF Core y Azure SQL. NetTopologySuite para rutas (polígonos) y perímetros de llegada.
- **Web:** React + TypeScript + Vite, TanStack Query para datos del servidor, Zustand para estado local, Leaflet + Geoman para dibujar rutas.
- **App Android:** React Native con Expo y Expo Router.
- **Monorepo** en GitHub con pnpm workspaces; `packages/shared` con tipos Zod y el cliente de la API para web y app.
- **Local sin Azure:** SQL Server, Azurite y Mailpit en Docker. En producción: Azure SQL, Blob Storage y correo por Azure Communication Services (SMTP).

## Por qué
- El desarrollador ya trabaja con .NET 10, EF Core, Azure SQL, React y TypeScript.
- React Native permite compartir tipos y cliente con la web y conseguir apoyo fácil. La app no necesita rastreo en segundo plano (GPS solo por acción), así que no exige desarrollo nativo.
- Todo corre local mientras se crea la cuenta de Azure del cliente; el cambio a la nube es de configuración.

## Consecuencias
- Las librerías de Expo se instalan con `npx expo install` para respetar el SDK.
- Si aparece una necesidad nativa puntual, se resuelve con un módulo de Expo (Expo Modules API).

# Gestión Aguialarmas — guía para agentes

Monorepo: `api/` (.NET 10), `web/` (React + Vite), `mobile/` (Expo, ver `mobile/AGENTS.md`), `packages/shared/` (tipos y cliente API), `docker/` (servicios locales), `docs/`.

## Reglas del negocio que no se negocian
- Nada se borra: heredar de `Entidad` y usar `Inactivar()`. El `AuditoriaInterceptor` lanza error si algo se marca como borrado.
- Cada cambio se audita automáticamente al guardar con EF Core; no escribir auditoría a mano.
- GPS solo por acción (marcaciones). No implementar rastreo en segundo plano.
- Vocabulario del dominio en español y como en `docs/glosario.md`. "Ruta" = área de la ciudad (antes "sector"). "Zona" = zona de la instalación de una cuenta.
- Coordenadas: WGS84 (SRID 4326). En NetTopologySuite y GeoJSON va longitud primero.

## Convenciones
- C#: espacios de nombres por archivo, `Nullable` activo, constructores primarios, una entidad por archivo en `Domain/<Modulo>/`.
- Configuración EF en `Infrastructure/Persistencia/Configuraciones.cs` (o un archivo por módulo cuando crezca).
- TypeScript estricto. Los tipos que comparten web y app van en `packages/shared` con Zod.
- Mobile: instalar librerías con `npx expo install` para respetar versiones del SDK.
- Colores de la marca: azul noche `#14243A`, azul `#1F4E79`, azul claro `#8FB3D9`, fondo `#F3F5F8`. Sin texto rojo en la interfaz.

## Comandos
- `pnpm -r typecheck` · `pnpm build:web`
- `cd api && dotnet build && dotnet test`
- `pnpm infra:up` para SQL Server, Azurite y Mailpit.

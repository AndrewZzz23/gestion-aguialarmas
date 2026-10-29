# Gestión Aguialarmas — guía para agentes

Sistema de órdenes de trabajo, técnicos e inventario para Aguialarmas LTDA. Monorepo:
`api/` (.NET 10), `web/` (React + Vite), `mobile/` (Expo, ver `mobile/AGENTS.md`), `packages/shared/` (tipos y cliente API), `docker/` (servicios locales), `docs/`.

## Lee solo lo que necesites (en este orden)
| Si vas a… | Lee |
|---|---|
| Entender el proyecto y las decisiones del cliente | `docs/contexto.md` |
| Implementar un requisito (WA-, AM-, AL-, IN-, RT-) | Solo ese ID en `docs/requisitos.md` (busca el ID, no leas todo) |
| Tocar órdenes, marcaciones o inventario | `docs/flujos.md` |
| Crear o cambiar entidades / tablas | `docs/modelo-datos.md` |
| Decidir dónde va el código | `docs/arquitectura.md` |
| Saber qué sigue | `docs/plan.md` |
| Dudas de vocabulario | `docs/glosario.md` |
Reglas aún sin definir por el cliente: `docs/pendientes-fase-1.md`. Si un requisito depende de una de ellas, pregunta antes de inventarla.

## Reglas del negocio que no se negocian
- Nada se borra: heredar de `Entidad` y usar `Inactivar()`. El `AuditoriaInterceptor` lanza error si algo se marca como borrado.
- Cada cambio se audita automáticamente al guardar con EF Core; no escribir auditoría a mano.
- GPS solo por acción (marcaciones). No implementar rastreo en segundo plano.
- Vocabulario del dominio en español y como en `docs/glosario.md`. "Ruta" = área de la ciudad (antes "sector"). "Zona" = zona de la instalación de una cuenta.
- Coordenadas: WGS84 (SRID 4326). En NetTopologySuite y GeoJSON va longitud primero.
- Lo que no está en `docs/requisitos.md` es cambio de alcance: no lo agregues por iniciativa propia.

## Convenciones
- C#: espacios de nombres por archivo, `Nullable` activo, constructores primarios, una entidad por archivo en `Domain/<Modulo>/`.
- Configuración EF en `Infrastructure/Persistencia/Configuraciones.cs` (o un archivo por módulo cuando crezca).
- TypeScript estricto. Los tipos que comparten web y app van en `packages/shared` con Zod.
- Mobile: instalar librerías con `npx expo install` para respetar versiones del SDK.
- Identidad visual (ver `docs/decisiones/0002-identidad-visual.md`): negro `#141414`, amarillo `#FFD200` (acción principal, con texto negro; nunca como texto sobre blanco), fondo `#F5F5F4`, Montserrat. El rojo es solo del logo: sin texto rojo en la interfaz; errores en naranja `#C2410C`, avisos en ámbar `#B45309`. Tokens en `packages/shared/src/tema.ts`.
- Web: componentes shadcn/ui en `web/src/components/ui/` (agregar con `pnpm dlx shadcn@latest add <componente>`) y Tailwind; referencia visual en la ruta `/estilos`. App: componentes en `mobile/src/componentes/`.
- Ramas `feature/<ID>-<descripcion>` desde `develop`; commits y PRs citan el ID del requisito.
- Al terminar una tarea, marca la casilla correspondiente en `docs/plan.md`.

## Comandos
- `pnpm -r typecheck` · `pnpm build:web`
- `cd api && dotnet build && dotnet test`
- `pnpm infra:up` para SQL Server, Azurite y Mailpit.

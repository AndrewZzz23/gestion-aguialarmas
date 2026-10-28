# Gestión Aguialarmas

Sistema de gestión de órdenes de trabajo, técnicos e inventario para **Aguialarmas LTDA.** (Ibagué).
Desarrollado por **Jairo Andrés Zubieta Bermúdez (AZ)**.

| Parte | Carpeta | Tecnología |
|---|---|---|
| API | `api/` | .NET 10 · ASP.NET Core · EF Core · Azure SQL (SQL Server) · NetTopologySuite |
| Web administrativa | `web/` | React 19 · TypeScript · Vite · TanStack Query · Zustand · React Router · Leaflet |
| App del técnico (Android) | `mobile/` | React Native · Expo · Expo Router |
| Código compartido | `packages/shared/` | Tipos, validaciones (Zod) y cliente de la API para web y app |
| Servicios locales | `docker/` | SQL Server 2022 · Azurite (Blob Storage) · Mailpit (correo) |
| Documentación | `docs/` | Requisitos, decisiones técnicas, glosario |

## Requisitos en tu PC

- [.NET SDK 10](https://dotnet.microsoft.com/download)
- Node.js 22 o superior y pnpm (`corepack enable`)
- Docker Desktop
- Android: la app **Expo Go** en el celular, o Android Studio con un emulador
- Herramienta de EF Core: `dotnet tool install --global dotnet-ef`

## Arrancar en local

```bash
# 1. Servicios locales (SQL Server, Azurite, Mailpit)
pnpm infra:up

# 2. Dependencias de web, app y paquete compartido
pnpm install

# 3. API (http://localhost:5080)
cd api
dotnet restore
dotnet ef migrations add Inicial -p src/Aguialarmas.Infrastructure -s src/Aguialarmas.Api -o Persistencia/Migraciones
dotnet ef database update -p src/Aguialarmas.Infrastructure -s src/Aguialarmas.Api
dotnet run --project src/Aguialarmas.Api

# 4. Web (http://localhost:5173), en otra terminal
pnpm dev:web

# 5. App, en otra terminal: copia mobile/.env.example a mobile/.env con la IP de tu PC
pnpm dev:mobile
```

| Servicio | Dirección |
|---|---|
| API | http://localhost:5080 · estado en `/api/estado`, salud en `/health`, OpenAPI en `/openapi/v1.json` |
| Web | http://localhost:5173 |
| Correos de prueba | http://localhost:8025 |
| SQL Server | `localhost,1433` · usuario `sa` · clave en `docker/.env` (por defecto `Aguia_Dev_2026!`) |

## Reglas que aplican a todo el código

- **No se borra nada.** Las entidades heredan de `Entidad` y se inactivan (`Inactivar()`). El interceptor de auditoría bloquea los borrados físicos.
- **Todo queda en la auditoría** (WA-04): quién, cuándo, qué entidad, valor anterior y valor nuevo.
- **GPS por acción**, no en tiempo real: la ubicación se toma solo en las marcaciones de la app (AM-17).
- Nombres del dominio en español, iguales a los del documento de requisitos (cuenta, zona, plantilla, ruta, bodega…).

## Estructura de la API (Clean Architecture)

```
api/src/
├── Aguialarmas.Domain          → entidades y reglas del negocio (sin dependencias de infraestructura)
├── Aguialarmas.Application     → casos de uso e interfaces (IUsuarioActual, IAlmacenArchivos, IServicioCorreo)
├── Aguialarmas.Infrastructure  → EF Core, auditoría, Blob Storage, correo SMTP
└── Aguialarmas.Api             → endpoints HTTP, configuración y arranque
```

## Ramas

- `main`: lo que está en producción.
- `develop`: integración de lo terminado.
- `feature/<id>-<descripcion>`: una por requisito o tarea (ej. `feature/WA-28-rutas-mapa`).

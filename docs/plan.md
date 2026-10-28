# Plan de trabajo

Duración aproximada: 5 meses (22 semanas) desde el anticipo. Arranque: 27-oct-2026.
Cada entregable va a ambiente de pruebas → 5 días hábiles de validación del cliente → capacitación (máx. 4 h).

| Fase | Semanas | Entregable | Requisitos |
|---|---|---|---|
| 1. Levantamiento y diseño | 3 | Documento de requisitos aprobado, modelo de datos, bocetos | Todos (detalle) |
| 2. Web administrativa | 9 | **E1** Web de órdenes · **E2** Web de inventario · **E3** Web de técnicos | E1: WA-01–10, WA-12–24, WA-28, WA-29, WA-32, WA-33, IN-01, IN-02, IN-05 · E2: AL-01–15, IN-06–08 · E3: WA-11, WA-25, WA-26, WA-30, WA-31, WA-34, WA-35, IN-03, IN-04 |
| 3. App móvil | 6 | **E4** App Android | AM-01–21, AL-16, AL-17 |
| 4. Pruebas e implementación | 4 | Producción, Google Play, carga inicial, capacitación final | RT-01–09 |

## Estado actual
- [x] Monorepo, CI, Docker local (SQL Server, Azurite, Mailpit)
- [x] API base: Entidad con inactivación, auditoría automática, Cliente, Cuenta, Ruta
- [x] Web y app base conectadas a `/api/estado`
- [ ] Primer `dotnet build` y migración `Inicial` en el PC de Andrew
- [ ] Cuenta de Azure del cliente (pendiente)

## Fase 1 — siguientes tareas
- [ ] Cerrar los pendientes de [pendientes-fase-1.md](pendientes-fase-1.md) con el cliente
- [ ] Modelo de datos completo en código (ver [modelo-datos.md](modelo-datos.md))
- [ ] Autenticación y roles (WA-01, WA-02, WA-03): JWT emitido por la API
- [ ] Bocetos ajustados: ruta, capacidades, inventario por bodegas, GPS por acción
- [ ] Plantillas Excel de carga masiva (WA-32)

## Backlog por entregable

### E1 · Web de órdenes
- [ ] Usuarios, roles y login con recuperación de contraseña (WA-01–03)
- [ ] Consulta de auditoría con filtros y exportación (WA-04)
- [ ] Clientes, cuentas, clasificaciones, planos y zonas (WA-05–09)
- [ ] Plantillas (WA-10) y rutas dibujadas en el mapa (WA-28)
- [ ] Listas configurables y carga desde Excel (WA-29, WA-32)
- [ ] Órdenes: creación, clasificación, estados, prioridad y duplicados (WA-12–16)
- [ ] Asignación con capacidades, otras sedes, tablero y sugeridas (WA-17–20)
- [ ] Detalle de la orden, ficha de la cuenta y correo de programación (WA-21, WA-22, WA-33)
- [ ] Alertas (WA-23, WA-24) e informes IN-01, IN-02, IN-05

### E2 · Web de inventario
- [ ] Artículos, bodegas, estados y seriales (AL-01–03)
- [ ] Documentos: entrada, solicitud, aprobación, traslado, reposición, devolución, nota (AL-04–10)
- [ ] Consecutivos, anulación, validación de existencias, mínimos, kardex (AL-11–14)
- [ ] Existencias por bodega e inventario en la ficha de la cuenta (AL-15, WA-22)
- [ ] Informes IN-06–08

### E3 · Web de técnicos
- [ ] Técnicos y capacidades (WA-11, WA-34)
- [ ] Tiempo en curso para el director (WA-35)
- [ ] Mapa de última ubicación, recorrido, novedades y filtros (WA-25, WA-26, WA-30, WA-31)
- [ ] Informes de tiempos y jornadas (IN-03, IN-04)

### E4 · App Android
- [ ] Login, jornada, agenda y detalle (AM-01–06)
- [ ] Marcaciones con GPS, validación de llegada y "voy en camino" (AM-07, AM-15, AM-17–19, AM-21)
- [ ] Cronómetro, notificaciones, pausas y justificación (AM-08–11)
- [ ] Cierre técnico y supervisor, órdenes sugeridas (AM-12–14)
- [ ] Solicitud de material adicional (AM-20)
- [ ] Perfil almacenista: entregas y recibos con foto (AL-16, AL-17)

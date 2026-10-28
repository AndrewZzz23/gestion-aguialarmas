# Contexto del proyecto

## El cliente
**Aguialarmas LTDA.** (Ibagué, NIT 809.005.743-1): empresa de seguridad electrónica (alarmas, CCTV, control de acceso).
Atiende a sus clientes en sus sedes ("cuentas") con técnicos de campo. Hoy controla órdenes, tiempos e inventario de forma manual.

## Qué se construye
Una plataforma con tres partes conectadas a una misma API en Azure:

1. **Web administrativa**: crear, clasificar y asignar órdenes de trabajo; seguir a los técnicos; configurar datos maestros; inventario; informes.
2. **App Android del técnico** (y del supervisor y el almacenista): agenda del día, marcaciones con GPS, cronómetro de la orden, pausas, justificaciones, cierre con fotos, solicitudes de material.
3. **Inventario** (web + app): bodegas, documentos de inventario, kardex.

## Usuarios (roles)
| Rol | Qué hace |
|---|---|
| Administrador | Usuarios, configuración, auditoría, aprueba notas de inventario |
| Usuario administrativo | Crea órdenes (OTG), datos maestros |
| Director técnico | Clasifica OTG en OTC u OTO, asigna técnicos, ve el tiempo en curso, hace las solicitudes de inventario y aprueba las del técnico |
| Supervisor | Ejecuta plantillas de uso supervisor, registra hallazgos por zona, sugiere órdenes |
| Técnico | Ejecuta las órdenes desde la app, solicita material adicional |
| Almacenista | Entradas por compra, despacha traslados, recibe devoluciones y reposiciones |

## Decisiones de negocio ya cerradas (después de aprobar la propuesta)
- **GPS por acción**, no en tiempo real. Se toma la ubicación solo en las marcaciones: inicio y fin de jornada, voy en camino, llegada, inicio, pausa, reanudación, cierre y salida. No hay rastreo en segundo plano.
- **El director ve el tiempo corriendo** de cada orden en ejecución (descontando pausas).
- **Técnicos con capacidades**: catálogo de conocimientos (CCTV, alarmas, etc.) con nivel. La plantilla pide capacidades y la asignación sugiere a quien las tiene.
- **Plantillas de uso supervisor**: solo las ven y ejecutan los supervisores.
- **"Ruta" reemplaza a "sector"**: es solo el nombre del área de la ciudad. No es un orden de visita.
- **Inventario por bodegas**: el inventario siempre es de Aguialarmas. Hay bodega principal, bodega de dañados y una bodega por cuenta. La "salida" es un traslado de la principal a la bodega de la cuenta.
- **Artículos recuperables o consumibles** (los chazos y tornillos no se recuperan). Los equipos llevan serial y se ven instalados en la ficha de la cuenta.
- **Solicitud de inventario**: solo la hace el director técnico y siempre va ligada a una orden. El técnico puede pedir material extra, pero lo aprueba el director.
- **Reposición**: cuando se daña un equipo en la cuenta, sale uno nuevo y el dañado queda pendiente por devolver hasta que llega a la bodega de dañados. Confirmar el nombre que usa el cliente.
- **Nota de inventario** para dar de alta o de baja (dañado, pérdida, sobrante).

## Reglas transversales
- Nada se borra: se inactiva o se anula. Todo cambio queda en la auditoría con valor anterior y valor nuevo.
- Duplicados: misma cuenta + zona + plantilla con una orden pendiente → no se crea; se agrega nota y sube la prioridad.
- Correos al contacto de la cuenta: al programar o reprogramar la orden, y cuando el técnico marca "voy en camino".
- Carga masiva de catálogos desde Excel.

## Entregables y forma de trabajo
4 entregables en unos 5 meses. Detalle en [plan.md](plan.md).
Cada entregable: ambiente de pruebas → 5 días hábiles para que el cliente cargue información y valide → capacitación de máximo 4 horas.
Garantía de 1 mes desde la validación del último entregable; después, solo errores que impidan operar.

## Material de referencia
- Requisitos con IDs: [requisitos.md](requisitos.md)
- Qué incluye, aceptación y garantía: [alcance-y-condiciones.md](alcance-y-condiciones.md)
- Glosario: [glosario.md](glosario.md)
- Bocetos de pantallas (web y app): canvas de diseño en Claude, pedírselo a Andrew. Son ilustrativos y todavía usan la palabra "sector".

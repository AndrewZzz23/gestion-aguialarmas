# Requisitos del sistema

Fuente: propuesta/contrato aceptado (versión del 8-oct-2026, firmada el 26-oct-2026).
Es la lista cerrada del alcance: lo que no está aquí es cambio de alcance.
Los IDs (WA-, AM-, AL-, IN-, RT-) se usan en ramas, commits, PRs e issues.

> Los campos exactos de formularios, estados y reglas marcadas "se define en la fase 1"
> están pendientes: ver [pendientes-fase-1.md](pendientes-fase-1.md).

### 2. Definiciones

| Término | Definición |
|---|---|
| Cuenta | Sucursal o sede física de un cliente del CLIENTE, con ubicación geográfica propia. |
| Zona | Área de una cuenta, asociada a su mapa de instalación. |
| Plantilla | Tipo de labor predefinido con prioridad, tiempo estimado, capacidad requerida y requisitos. |
| OTG / OTC / OTO | Orden de trabajo general (creación), de campo (con desplazamiento) y de oficina. |
| Ruta | Área de la ciudad definida por el CLIENTE en el mapa (por ejemplo Centro, Norte, Sur, Oriente), distinta de las zonas de una instalación. |
| Capacidad | Conocimiento técnico que tiene un técnico (por ejemplo CCTV, alarmas, control de acceso) y que una plantilla puede exigir. |
| Bodega | Lugar donde está el inventario del CLIENTE: la bodega principal, la bodega de dañados y una bodega por cada cuenta. El inventario siempre es del CLIENTE; lo que cambia es la bodega donde está. |
| Artículo recuperable | Artículo que se instala en una cuenta y puede volver a bodega (por ejemplo cámaras, sensores, paneles). |
| Artículo consumible | Artículo que se gasta al instalarse y no se recupera (por ejemplo chazos, tornillos, cinta). |
| Documento de inventario | Comprobante con consecutivo propio que registra un movimiento de inventario (entrada, traslado, reposición, devolución o nota). |
| Error | Comportamiento del Sistema distinto a lo descrito en este documento o en el documento de requisitos aprobado. |
| Cambio de alcance | Toda funcionalidad nueva, o modificación de una ya aprobada, no descrita en este documento. |

### 3. Alcance funcional

El Sistema incluye únicamente los requisitos numerados en esta sección. Cada requisito se valida con los criterios de la sección 8.

**Principio general:** en el Sistema no se borra información. Los registros (clientes, cuentas, plantillas, órdenes, artículos, documentos de inventario y demás) se inactivan o se anulan, y queda registrado quién hizo cada cambio y cuándo.

#### 3.1 Web administrativa

**Usuarios y seguridad**

| ID | Requisito |
|---|---|
| WA-01 | Inicio de sesión con usuario y contraseña, y recuperación de contraseña por correo. |
| WA-02 | Gestión de usuarios (crear, editar, inactivar) con los roles: Administrador, Usuario administrativo, Director técnico, Almacenista, Técnico y Supervisor. |
| WA-03 | Cada rol accede solo a las pantallas y acciones que le corresponden. |
| WA-04 | Auditoría (registro de todo lo que pasa en el Sistema): cada acción de los usuarios en la web y en la app queda registrada con usuario, fecha, hora, módulo, registro afectado, valor anterior y valor nuevo. Incluye inicios y cierres de sesión, creación, modificación, inactivación y anulación de registros, asignaciones y reasignaciones, cambios de estado, movimientos de inventario y cargas desde Excel. El registro no se puede modificar ni borrar. El Administrador lo consulta con filtros por usuario, fecha, módulo y registro, y lo exporta a Excel. |

**Datos maestros**

| ID | Requisito |
|---|---|
| WA-05 | Gestión de clientes (crear, editar, inactivar, consultar). |
| WA-06 | Gestión de cuentas por cliente: nombre, dirección, contacto, clasificación, ruta y ubicación en el mapa. |
| WA-07 | Gestión de clasificaciones de cliente (crear, editar, inactivar) con su nivel de prioridad. |
| WA-08 | Carga de uno o más mapas por cuenta, en formato imagen (JPG, PNG) o PDF. |
| WA-09 | Gestión de zonas por cuenta (crear, editar, inactivar). Las zonas se registran como lista con nombre y descripción; no incluye dibujo de zonas sobre el mapa. |
| WA-10 | Gestión de plantillas (crear, editar, inactivar): nombre, descripción, tipo, uso (técnico o supervisor), capacidades requeridas, prioridad, tiempo estimado, indicador de recoger equipo en la central, indicador de requerir material o herramienta e indicador de requerir plano. Las plantillas de uso supervisor solo las ven y ejecutan los supervisores. (Campos adicionales serán definidos en la ejecución.) |
| WA-11 | Gestión de técnicos: datos básicos, tipo (técnico o supervisor) y capacidades, cada una con su nivel (básico o avanzado). |
| WA-34 | Gestión del catálogo de capacidades técnicas (crear, editar, inactivar). |
| WA-28 | Gestión de rutas de la ciudad (crear, editar, inactivar) dibujadas sobre el mapa con nombre y color, y asignación de cada cuenta a una ruta. |
| WA-29 | Listas configurables por el CLIENTE: motivos de pausa y causas de demora (las usan los técnicos en la app). |
| WA-32 | Carga masiva desde Excel: los catálogos (clientes, cuentas, zonas, clasificaciones, rutas, capacidades, plantillas, técnicos y artículos de inventario) se pueden cargar desde un archivo Excel con el formato que entrega el Sistema. Al cargar, el Sistema informa las filas con error para corregirlas. |

**Órdenes de trabajo**

| ID | Requisito |
|---|---|
| WA-12 | Creación de órdenes (OTG): consecutivo, fecha y hora de creación, usuario creador, cliente, cuenta, zona, plantilla, prioridad, comentarios y archivos anexos. |
| WA-13 | Clasificación de la orden como OTC u OTO: el Director técnico la define, y cambio de OTO a OTC cuando aplique. |
| WA-14 | Estados de la orden: En espera, Clasificada, Asignada, En ejecución, Suspendida, Finalizada y Anulada. (Los estados definitivos se confirman en la fase 1.) |
| WA-15 | Cálculo de la prioridad de atención a partir de la prioridad de la clasificación de la cuenta y la de la plantilla, con la regla que se defina en la fase 1. |
| WA-16 | Control de duplicados: al crear una orden con la misma cuenta, zona y plantilla de una orden pendiente, el Sistema no crea una nueva; agrega una nota a la existente y aumenta su prioridad. |
| WA-17 | Asignación de órdenes OTC a un técnico con fecha y hora programadas, y reasignación. El Sistema muestra primero los técnicos que tienen las capacidades que pide la plantilla y avisa si se asigna a uno que no las tiene. Las plantillas de uso supervisor solo se asignan a supervisores. |
| WA-18 | Al asignar, el Sistema muestra las órdenes pendientes del mismo cliente final en otras cuentas, con el criterio definido en la fase 1. |
| WA-19 | Tablero de asignación por estados, con filtrado por orden, cliente, sede, ruta y asignación, entre otros campos propios de la orden. |
| WA-20 | Órdenes sugeridas por supervisores, para aprobar (convirtiéndolas en OTG) o rechazar con motivo. |
| WA-21 | Detalle de la orden: tipo (OTC u OTO) definido por el Director técnico, datos de la orden, línea de tiempo con todos sus eventos (creación, clasificación, asignación, solicitudes y traslados de material, llegada, pausas, alertas, justificaciones y cierre), resumen de tiempo estimado frente a real, formulario de cierre, evidencias y material trasladado, devuelto y usado. Exportable a PDF. |
| WA-22 | Ficha de la cuenta: datos, clasificación, ruta, ubicación con su perímetro de llegada, plano de la instalación, zonas y los hallazgos por zona, otras sedes del mismo cliente con sus órdenes pendientes, historial de órdenes e inventario de la cuenta (equipos instalados con serial, zona y estado; equipos pendientes por devolver; historial de movimientos y consumibles usados). |
| WA-33 | Aviso de programación por correo: al asignar o reprogramar una orden, el Sistema envía un correo al contacto de la cuenta con la fecha, la hora, el técnico asignado y el tipo de trabajo. |

**Seguimiento y alertas**

| ID | Requisito |
|---|---|
| WA-35 | Tiempo en curso: el Director técnico ve en el tablero y en el detalle de cada orden en ejecución el tiempo transcurrido frente al tiempo estimado de la plantilla, descontando las pausas, actualizado en pantalla. |
| WA-23 | Alerta cuando un técnico supera el tiempo estimado de la orden en ejecución. |
| WA-24 | Alerta cuando el técnico marca su llegada a una cuenta fuera de la hora programada o fuera del perímetro de la cuenta, o no la marca a la hora programada. |

**Ubicación de técnicos**

| ID | Requisito |
|---|---|
| WA-25 | Mapa de última ubicación: última ubicación reportada por cada técnico en sus marcaciones (AM-17), con la hora del reporte, su estado (en desplazamiento, en cuenta, suspendido) y la orden en curso. |
| WA-26 | Recorrido del día por técnico en el mapa, con los puntos de cada marcación y la hora de llegada y salida de cada cuenta. |
| WA-30 | Panel de novedades: llegadas, tiempo superado, retrasos, pausas, justificaciones, órdenes sugeridas, solicitudes y movimientos de material y duplicados evitados, con hora. |
| WA-31 | Filtros del mapa: todos los técnicos, solo con alerta o por ruta. |

#### 3.2 App móvil del técnico (Android)

| ID | Requisito |
|---|---|
| AM-01 | Inicio de sesión con las credenciales creadas en la web. |
| AM-02 | Marcación de inicio y fin de labores del día: registra fecha, hora y ubicación GPS. |
| AM-03 | Listado de órdenes asignadas al técnico, ordenadas por fecha, hora y prioridad. |
| AM-04 | Detalle de la orden: cliente, cuenta, dirección, zona, plantilla, tiempo estimado, comentarios, anexos y material trasladado para la orden. |
| AM-05 | Visualización del mapa de la cuenta solo cuando la plantilla lo requiere. |
| AM-06 | Apertura de la ubicación de la cuenta en la aplicación de mapas del celular para navegar hasta ella. |
| AM-07 | Marcación de llegada e inicio de la tarea: registra hora y ubicación GPS, y la distancia frente a la ubicación de la cuenta. |
| AM-08 | Contador del tiempo de ejecución frente al tiempo estimado de la plantilla. |
| AM-09 | Notificación al técnico cuando esté por cumplirse el tiempo estimado de la plantilla (con la anticipación definida en la fase 1) y cuando lo supere. |
| AM-10 | Al superar el tiempo estimado, registro obligatorio de justificación: causa (lista configurable, WA-29), detalle y fotografías opcionales. La oficina recibe la alerta y la justificación. |
| AM-11 | Suspensión de la tarea con motivo (lista configurable más comentario) y reanudación. El tiempo suspendido no se cuenta como tiempo de ejecución. |
| AM-12 | Formulario de cierre del técnico: diagnóstico, solución, recomendaciones, zona afectada y evidencia fotográfica (hasta 10 fotos por orden). |
| AM-13 | Formulario de cierre del supervisor: hallazgos por zona, observaciones y evidencia fotográfica (hasta 10 fotos por orden). |
| AM-14 | Creación de órdenes sugeridas por el supervisor, indicando cuenta, zona, plantilla y descripción. |
| AM-15 | Marcación de salida de la cuenta, registrando hora y ubicación GPS. |
| AM-17 | Registro de ubicación por acción: la ubicación GPS se toma solo en cada marcación (inicio y fin de labores, voy en camino, llegada, inicio, pausa, reanudación, cierre y salida). No hay seguimiento continuo de la ubicación. |
| AM-18 | Validación de llegada: al marcar la llegada, el Sistema compara la ubicación con el perímetro de la cuenta; si queda por fuera, la llegada queda marcada y genera la alerta de WA-24. |
| AM-19 | Cuando el técnico marca su llegada a la cuenta, la app permite iniciar la tarea. |
| AM-20 | Solicitud de material adicional desde la orden: el técnico la envía desde la app y le llega al Director técnico, que la aprueba o la rechaza (AL-06). |
| AM-21 | Aviso de “voy en camino”: el técnico marca desde la app que sale hacia la cuenta y el Sistema envía un correo al contacto de la cuenta informándole que el técnico va en camino. |

#### 3.3 Inventario

El inventario siempre es del CLIENTE y se maneja por bodegas: la bodega principal, la bodega de dañados y una bodega por cada cuenta. Cuando se instala o se entrega material, no hay una salida: hay un traslado de la bodega principal a la bodega de la cuenta. Cada movimiento queda en un documento de inventario con consecutivo propio. En la web administrativa se registran los documentos y se consultan existencias, historial e informes; en la app el almacenista registra las entregas y los recibos con evidencia fotográfica.

**En la web administrativa (documentos, datos e informes)**

| ID | Requisito |
|---|---|
| AL-01 | Gestión de artículos (crear, editar, inactivar): código, nombre, unidad de medida, tipo (recuperable o consumible), control por serial (sí o no) y existencia mínima. |
| AL-02 | Bodegas: bodega principal, bodega de dañados y una bodega por cuenta, que se crea automáticamente al crear la cuenta. |
| AL-03 | Estados de los artículos recuperables: Disponible, Instalado, Dañado, Pendiente por devolver, En garantía y De baja. |
| AL-04 | Entrada por compra: ingresa mercancía a la bodega principal con proveedor, número de factura, artículos, cantidades, seriales, costo, fecha, observación y usuario. |
| AL-05 | Solicitud de inventario: la hace solo el Director técnico, asociada obligatoriamente a una orden, con los artículos y cantidades que necesita. |
| AL-06 | Aprobación de las solicitudes de material adicional de los técnicos (AM-20): el Director técnico las aprueba, y quedan como solicitud de inventario de la orden, o las rechaza con motivo. |
| AL-07 | Traslado: al despachar una solicitud de inventario, el material pasa de la bodega principal a la bodega de la cuenta de la orden. Los recuperables quedan instalados en la cuenta, con su serial y zona; los consumibles quedan registrados como usados. |
| AL-08 | Reposición: cambio de un equipo dañado en la cuenta. Se traslada el equipo nuevo a la cuenta y el dañado queda pendiente por devolver; la reposición sigue abierta hasta que el dañado entra a la bodega de dañados. |
| AL-09 | Devolución: sobrantes o equipos retirados que vuelven de la bodega de la cuenta a la bodega principal o a la de dañados. |
| AL-10 | Nota de inventario: alta o baja de inventario (equipo dañado sin reparación, pérdida, sobrante encontrado), con motivo obligatorio y aprobación del Administrador. |
| AL-11 | Cada tipo de documento tiene su consecutivo. Los documentos no se borran: se anulan, y la anulación queda en la auditoría. |
| AL-12 | El Sistema no permite trasladar cantidades mayores a la existencia disponible en la bodega de origen. |
| AL-13 | Aviso de los artículos que quedan por debajo de la existencia mínima. |
| AL-14 | Historial por artículo y bodega con todos sus documentos, saldo y fotos de evidencia (kardex). |
| AL-15 | Consulta de existencias por bodega, incluida la bodega de cada cuenta (WA-22), y bandeja de solicitudes pendientes de aprobación y de despacho. |

**En la app (registros)**

| ID | Requisito |
|---|---|
| AL-16 | Perfil de almacenista en la app, con acceso solo a las funciones de inventario. |
| AL-17 | Registro en la app de la entrega de los traslados y del recibo de devoluciones y reposiciones, con artículo, cantidad, serial, fecha, usuario y evidencia fotográfica. |

#### 3.4 Informes

Todos los informes se consultan en la web con filtros por todos los campos de la entidad, por rango de fechas y con exportación a Excel.

| ID | Informe |
|---|---|
| IN-01 | Histórico de órdenes por cliente final, general y por plantilla. |
| IN-02 | Histórico de órdenes por cuenta. |
| IN-03 | Tiempos ganados y perdidos: general y por técnico, plantilla y cliente, con gráfico, totales del rango elegido y detalle (tiempo real descontando pausas frente a tiempo estimado). |
| IN-04 | Jornadas por técnico: inicio y fin de labores con ubicación. |
| IN-05 | Órdenes por estado y por técnico. |
| IN-06 | Movimientos de inventario por documento, por bodega (incluida cada cuenta), por orden y por artículo. |
| IN-07 | Artículos por debajo de la existencia mínima. |
| IN-08 | Equipos pendientes por devolver y reposiciones abiertas. |

#### 3.5 Requisitos técnicos

| ID | Requisito |
|---|---|
| RT-01 | El Sistema funciona en la nube de Microsoft (Azure), donde se guardan los datos, las fotos y los documentos, en una cuenta a nombre del CLIENTE. |
| RT-02 | La web funciona en computador con los navegadores Chrome, Edge y Firefox actualizados. |
| RT-03 | La app funciona en celulares Android versión 10 o superior. |
| RT-04 | La información viaja protegida (cifrada) entre la app, la web y el servidor. |
| RT-05 | Copias de seguridad automáticas de la información. |
| RT-06 | Capacidad inicial para hasta 15 usuarios de oficina y almacén y 30 técnicos. |
| RT-07 | Los mapas usan el servicio de mapas de Azure, incluido en los costos de Azure del CLIENTE. |
| RT-08 | La app usa la ubicación solo en el momento de cada marcación, mientras está en uso; no requiere permiso de ubicación en segundo plano. |
| RT-09 | Los correos a los clientes se envían con un servicio de correo de Azure, cuyo costo de uso está incluido en los costos de Azure del CLIENTE. |

### 4. Fases, entregables y tiempos

El proyecto se ejecuta en 4 fases y 4 entregables durante aproximadamente 5 meses (22 semanas), contadas desde el pago del anticipo y la entrega de la información requerida. Cada entregable cierra con su periodo de validación (sección 8) y su capacitación (sección 6).

| Fase | Duración estimada | Entregables | Requisitos que cubre |
|---|---|---|---|
| 1. Levantamiento y diseño | 3 semanas | Documento de requisitos con las reglas pendientes resueltas (estados, prioridad, alertas, formularios, perímetro de llegada), diseño de la información y bocetos de las pantallas, aprobado por escrito por el CLIENTE. | Todos (detalle) |
| 2. Web administrativa | 9 semanas | Entregable 1: web de creación y asignación de órdenes. Entregable 2: web de inventario. Entregable 3: web de técnicos (capacidades, tiempo en curso, mapa, recorrido y novedades). Funcionando en ambiente de pruebas. | E1: WA-01 a WA-10, WA-12 a WA-24, WA-28, WA-29, WA-32, WA-33, IN-01, IN-02, IN-05. E2: AL-01 a AL-15, IN-06 a IN-08. E3: WA-11, WA-25, WA-26, WA-30, WA-31, WA-34, WA-35, IN-03, IN-04 |
| 3. App móvil | 6 semanas | Entregable 4: app Android para técnicos, supervisores y almacenista, con registro de ubicación en cada marcación, validación de llegada a las cuentas y registros de inventario, conectada a la plataforma. | AM-01 a AM-21, AL-16, AL-17 |
| 4. Pruebas, implementación y capacitación | 4 semanas | Pruebas con usuarios del CLIENTE, corrección de errores, publicación en Google Play, puesta en producción, carga inicial de datos y capacitación final. | RT-01 a RT-09 y cierre |

Los tiempos dependen de la disponibilidad oportuna de información, validaciones y retroalimentación por parte de Aguialarmas.

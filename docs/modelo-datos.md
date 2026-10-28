# Modelo de datos (borrador)

Base para el diseño de la fase 1. Los campos exactos se ajustan cuando el cliente entregue sus formatos.
Convenciones: todas las entidades heredan de `Entidad` (Id Guid v7, Activo, CreadoEn/Por, ModificadoEn/Por). Coordenadas en SRID 4326.
✅ = ya existe en el código.

## Seguridad y auditoría
| Entidad | Campos clave |
|---|---|
| Usuario | Nombre, Correo, Rol, TecnicoId? |
| ✅ RegistroAuditoria | FechaUtc, Usuario, Modulo, Entidad, EntidadId, Accion, ValorAnterior, ValorNuevo (JSON) |

## Datos maestros
| Entidad | Campos clave |
|---|---|
| ✅ Cliente | Nombre, Identificacion |
| ✅ Cuenta | ClienteId, Nombre, Direccion, Contacto, CorreoContacto, ClasificacionId, RutaId, Ubicacion (Point), RadioLlegadaM |
| Clasificacion | Nombre (A1, B2…), Prioridad |
| ✅ Ruta | Nombre, Color, Area (Polygon) |
| ZonaCuenta | CuentaId, Numero, Nombre, Descripcion |
| PlanoCuenta | CuentaId, RutaArchivo, Tipo (imagen/PDF) |
| Plantilla | Nombre, Descripcion, Tipo, Uso (Tecnico/Supervisor), Prioridad, TiempoEstimadoMin, RecogerEquipo, RequiereMaterial, RequierePlano |
| PlantillaCapacidad | PlantillaId, CapacidadId, NivelMinimo |
| Capacidad | Nombre (CCTV, alarmas, control de acceso…) |
| Tecnico | Nombre, Documento, Celular, Tipo (Tecnico/Supervisor), UsuarioId |
| TecnicoCapacidad | TecnicoId, CapacidadId, Nivel (Basico/Avanzado) |
| MotivoPausa / CausaDemora | Nombre (listas configurables, WA-29) |

## Órdenes
| Entidad | Campos clave |
|---|---|
| Orden | Consecutivo, Tipo (OTG/OTC/OTO), Estado, CuentaId, ZonaId?, PlantillaId, PrioridadCalculada, Comentarios, TecnicoId?, ProgramadaPara?, OrigenSugeridaId? |
| OrdenNota | OrdenId, Texto (incluye las notas de duplicados) |
| OrdenAnexo | OrdenId, RutaArchivo, Nombre |
| OrdenSugerida | SupervisorId, CuentaId, ZonaId, PlantillaId, Descripcion, Estado, MotivoRechazo |
| Marcacion | TecnicoId, OrdenId?, Tipo, FechaUtc, Ubicacion (Point), PrecisionM, DistanciaCuentaM?, FueraDePerimetro |
| Pausa | OrdenId, MotivoPausaId, Comentario, Inicio, Fin? |
| Justificacion | OrdenId, CausaDemoraId, Detalle, Fotos |
| CierreOrden | OrdenId, Diagnostico, Solucion, Recomendaciones, ZonaAfectadaId, Hallazgos (supervisor), Fotos (máx. 10) |
| Alerta | OrdenId?, TecnicoId, Tipo (TiempoSuperado, LlegadaFueraHora, FueraPerimetro…), FechaUtc |

## Inventario
| Entidad | Campos clave |
|---|---|
| Articulo | Codigo, Nombre, Unidad, Tipo (Recuperable/Consumible), ControlaSerial, ExistenciaMinima |
| Bodega | Tipo (Principal/Danados/Cuenta), Nombre, CuentaId? |
| UnidadSerial | ArticuloId, Serial, BodegaId, Estado (Disponible, Instalado, Danado, PendientePorDevolver, EnGarantia, DeBaja), ZonaId? |
| DocumentoInventario | Tipo (EntradaCompra, Traslado, Reposicion, Devolucion, NotaInventario), Consecutivo, Fecha, BodegaOrigenId?, BodegaDestinoId?, OrdenId?, Proveedor?, Factura?, Estado (Activo/Anulado), Observacion |
| DocumentoInventarioLinea | DocumentoId, ArticuloId, Cantidad, UnidadSerialId?, CostoUnitario? |
| SolicitudInventario | OrdenId, Origen (Director/Tecnico), Estado (Pendiente, Aprobada, Rechazada, Despachada), MotivoRechazo |
| SolicitudInventarioLinea | SolicitudId, ArticuloId, Cantidad |
| EvidenciaInventario | DocumentoId, RutaArchivo |

**Existencias** = vista o tabla de saldos por ArticuloId + BodegaId calculada desde las líneas de los documentos activos.
**Consecutivos**: una tabla `Consecutivo (Tipo, Ultimo)` con bloqueo al incrementar.

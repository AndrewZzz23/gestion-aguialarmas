# Flujos principales

## 1. Ciclo de vida de una orden

```mermaid
stateDiagram-v2
    [*] --> EnEspera: Crear OTG (WA-12)\no aprobar sugerida (WA-20)
    EnEspera --> Clasificada: Director define OTC u OTO (WA-13)
    Clasificada --> Asignada: Asignar técnico + fecha/hora (WA-17)\ncorreo a la cuenta (WA-33)
    Asignada --> Asignada: Reasignar / reprogramar
    Asignada --> EnEjecucion: Técnico marca llegada e inicia (AM-07, AM-19)
    EnEjecucion --> Suspendida: Pausa con motivo (AM-11)
    Suspendida --> EnEjecucion: Reanudar
    EnEjecucion --> Finalizada: Cierre (AM-12/AM-13)\njustificación si superó el estimado (AM-10)
    EnEspera --> Anulada
    Clasificada --> Anulada
    Asignada --> Anulada
```
Los estados definitivos se confirman en la fase 1 (WA-14).

## 2. Marcaciones del técnico en la app (GPS por acción)

| Marcación | Qué registra | Efecto |
|---|---|---|
| Inicio de jornada | Hora + GPS | Abre la jornada (IN-04) |
| Voy en camino | Hora + GPS | Correo a la cuenta (AM-21) |
| Llegada | Hora + GPS + distancia a la cuenta | Valida el perímetro; si está por fuera o fuera de hora → alerta (AM-18, WA-24) |
| Inicio de tarea | Hora + GPS | Arranca el cronómetro (AM-08, WA-35) |
| Pausa / Reanudación | Hora + GPS + motivo | El tiempo en pausa no cuenta (AM-11) |
| Cierre | Hora + GPS + formulario + fotos | Finaliza la orden; tiempos ganados/perdidos (IN-03) |
| Salida | Hora + GPS | Recorrido del día (WA-26) |
| Fin de jornada | Hora + GPS | Cierra la jornada |

**Tiempo real de la orden** = (cierre − inicio de tarea) − suma de pausas. Se compara con el tiempo estimado de la plantilla.

## 3. Inventario por bodegas

```mermaid
flowchart LR
    P[Proveedor] -- Entrada por compra (AL-04) --> BP[(Bodega principal)]
    BP -- Traslado (AL-07) --> BC[(Bodega de la cuenta)]
    BC -- Devolución (AL-09) --> BP
    BC -- Reposición: el dañado (AL-08) --> BD[(Bodega de dañados)]
    BP -- Reposición: el nuevo (AL-08) --> BC
    BD -- Nota de inventario: baja (AL-10) --> X[De baja]
```

**Cómo nace un traslado**
1. El director técnico crea la **solicitud de inventario** ligada a una orden (AL-05).
   - O el técnico pide material extra desde la app (AM-20) → el director la aprueba (AL-06) → queda como solicitud de la orden.
2. El almacenista **despacha**: se genera el traslado de la bodega principal a la bodega de la cuenta y se registra la entrega en la app con foto (AL-07, AL-17).
3. Recuperables → quedan **Instalados** en la cuenta, con serial y zona. Consumibles → quedan **usados** (no vuelven, no quedan pendientes).

**Reglas**
- No se traslada más de lo disponible en la bodega de origen (AL-12).
- Cada tipo de documento tiene su consecutivo; los documentos no se borran, se anulan (AL-11).
- Existencias = suma de movimientos por artículo y bodega (kardex, AL-14).

## 4. Estados de un artículo recuperable (con serial)

```mermaid
stateDiagram-v2
    [*] --> Disponible: Entrada por compra
    Disponible --> Instalado: Traslado a la cuenta
    Instalado --> Dañado: Se reporta daño
    Dañado --> PendientePorDevolver: Reposición abierta
    PendientePorDevolver --> EnGarantia: Llega a bodega de dañados
    PendientePorDevolver --> DeBaja: Nota de inventario
    EnGarantia --> Disponible: Vuelve reparado
    EnGarantia --> DeBaja: Nota de inventario
    Instalado --> Disponible: Devolución
```

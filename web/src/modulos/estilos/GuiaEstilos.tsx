import { EstadoOrden } from "@aguialarmas/shared";
import { CircleCheck, Info, Plus, TriangleAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { InsigniaEstadoOrden } from "@/components/marca/InsigniaEstadoOrden";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const colores = [
  { nombre: "Negro", valor: "#141414", clase: "bg-marca-negro" },
  { nombre: "Amarillo", valor: "#FFD200", clase: "bg-marca-amarillo" },
  { nombre: "Amarillo oscuro", valor: "#8A6D00", clase: "bg-marca-amarillo-oscuro" },
  { nombre: "Fondo", valor: "#F5F5F4", clase: "bg-background border" },
  { nombre: "Peligro", valor: "#C2410C", clase: "bg-destructive" },
  { nombre: "Aviso", valor: "#B45309", clase: "bg-aviso" },
  { nombre: "Éxito", valor: "#2F7D32", clase: "bg-exito" },
  { nombre: "Información", valor: "#1F5F99", clase: "bg-info" },
];

const ordenesEjemplo = [
  { consecutivo: "OT-0142", cuenta: "Éxito Calle 60", plantilla: "Mantenimiento CCTV", tecnico: "Carlos Ruiz", estado: "EnEjecucion" },
  { consecutivo: "OT-0141", cuenta: "Clínica Minerva", plantilla: "Revisión de alarma", tecnico: "Diana López", estado: "Asignada" },
  { consecutivo: "OT-0139", cuenta: "Colegio San Simón", plantilla: "Instalación de sensor", tecnico: "—", estado: "EnEspera" },
  { consecutivo: "OT-0137", cuenta: "Banco Agrario Centro", plantilla: "Control de acceso", tecnico: "Carlos Ruiz", estado: "Suspendida" },
  { consecutivo: "OT-0130", cuenta: "Éxito Calle 60", plantilla: "Mantenimiento CCTV", tecnico: "Diana López", estado: "Finalizada" },
] satisfies { estado: EstadoOrden; [k: string]: string }[];

function Seccion({ titulo, descripcion, children }: { titulo: string; descripcion?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
        {descripcion && <CardDescription>{descripcion}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/** Muestra de la identidad visual y los componentes base. Sirve de referencia al construir pantallas. */
export function GuiaEstilos() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl">Guía de estilos</h1>
        <p className="text-muted-foreground">
          Identidad de Aguialarmas: negro, amarillo y Montserrat. El rojo queda solo en el logo.
        </p>
      </div>

      <Seccion titulo="Colores" descripcion="Los errores y alertas van en naranja o ámbar, nunca en rojo.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {colores.map((c) => (
            <div key={c.nombre} className="grid gap-1.5">
              <div className={`h-14 rounded-lg ${c.clase}`} />
              <span className="text-sm font-semibold">{c.nombre}</span>
              <span className="text-xs text-muted-foreground">{c.valor}</span>
            </div>
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Tipografía" descripcion="Montserrat en toda la interfaz.">
        <div className="grid gap-2">
          <p className="text-3xl font-bold">Título de página · 28 px negrilla</p>
          <p className="text-xl font-bold">Título de sección · 22 px negrilla</p>
          <p className="text-base">Texto normal · 16 px. Orden asignada a Carlos Ruiz para el martes a las 10:00.</p>
          <p className="text-sm text-muted-foreground">Texto secundario · 14 px. Creada hace 2 horas por Laura.</p>
        </div>
      </Seccion>

      <Seccion titulo="Botones" descripcion="Amarillo para la acción principal de cada pantalla (solo una). Negro o contorno para las demás.">
        <div className="flex flex-wrap items-center gap-3">
          <Button>
            <Plus data-icon="inline-start" /> Crear orden
          </Button>
          <Button variant="negro">Asignar técnico</Button>
          <Button variant="outline">Cancelar</Button>
          <Button variant="secondary">Exportar a Excel</Button>
          <Button variant="ghost">Ver detalle</Button>
          <Button variant="destructive">
            <Trash2 data-icon="inline-start" /> Anular
          </Button>
          <Button variant="link">Ver historial</Button>
          <Button disabled>Deshabilitado</Button>
        </div>
      </Seccion>

      <Seccion titulo="Estados de la orden" descripcion="Cada estado tiene siempre el mismo color (WA-14).">
        <div className="flex flex-wrap gap-2">
          {EstadoOrden.options.map((e) => (
            <InsigniaEstadoOrden key={e} estado={e} />
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Alertas">
        <div className="grid gap-3 md:grid-cols-2">
          <Alert variant="info">
            <Info />
            <AlertTitle>Orden duplicada evitada</AlertTitle>
            <AlertDescription>Se agregó una nota a OT-0139 y subió su prioridad.</AlertDescription>
          </Alert>
          <Alert variant="exito">
            <CircleCheck />
            <AlertTitle>Correo enviado</AlertTitle>
            <AlertDescription>El contacto de la cuenta recibió la programación.</AlertDescription>
          </Alert>
          <Alert variant="aviso">
            <TriangleAlert />
            <AlertTitle>Tiempo estimado superado</AlertTitle>
            <AlertDescription>Carlos Ruiz lleva 25 minutos de más en OT-0142.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertTitle>Llegada fuera del perímetro</AlertTitle>
            <AlertDescription>Marcó la llegada a 340 m de la cuenta.</AlertDescription>
          </Alert>
        </div>
      </Seccion>

      <Seccion titulo="Formulario">
        <FieldGroup className="max-w-xl">
          <Field>
            <FieldLabel htmlFor="cuenta">Cuenta</FieldLabel>
            <Select>
              <SelectTrigger id="cuenta">
                <SelectValue placeholder="Selecciona la cuenta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Éxito Calle 60</SelectItem>
                <SelectItem value="2">Clínica Minerva</SelectItem>
                <SelectItem value="3">Colegio San Simón</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="zona">Zona</FieldLabel>
            <Input id="zona" placeholder="Ej.: Zona 2 · Bodega" />
            <FieldDescription>Área de la instalación donde se hará el trabajo.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="comentarios">Comentarios</FieldLabel>
            <Textarea id="comentarios" placeholder="Lo que reporta el cliente" />
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="material" />
            <FieldLabel htmlFor="material">Requiere material</FieldLabel>
          </Field>
        </FieldGroup>
      </Seccion>

      <Seccion titulo="Tabla">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Orden</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead>Plantilla</TableHead>
              <TableHead>Técnico</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordenesEjemplo.map((o) => (
              <TableRow key={o.consecutivo}>
                <TableCell className="font-semibold">{o.consecutivo}</TableCell>
                <TableCell>{o.cuenta}</TableCell>
                <TableCell>{o.plantilla}</TableCell>
                <TableCell>{o.tecnico}</TableCell>
                <TableCell>
                  <InsigniaEstadoOrden estado={o.estado} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Seccion>

      <Seccion titulo="Pestañas, diálogo y notificaciones">
        <div className="grid gap-6">
          <Tabs defaultValue="datos" className="max-w-xl">
            <TabsList>
              <TabsTrigger value="datos">Datos</TabsTrigger>
              <TabsTrigger value="zonas">Zonas</TabsTrigger>
              <TabsTrigger value="inventario">Inventario</TabsTrigger>
            </TabsList>
            <TabsContent value="datos" className="text-sm text-muted-foreground">
              Dirección, contacto, clasificación y ruta de la cuenta.
            </TabsContent>
            <TabsContent value="zonas" className="text-sm text-muted-foreground">
              Zonas de la instalación con sus hallazgos.
            </TabsContent>
            <TabsContent value="inventario" className="text-sm text-muted-foreground">
              Equipos instalados con serial, zona y estado.
            </TabsContent>
          </Tabs>

          <div className="flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Abrir diálogo</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>¿Anular la orden OT-0139?</DialogTitle>
                  <DialogDescription>
                    La orden no se borra: queda anulada y el cambio se registra en la auditoría.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button variant="destructive">Anular</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => toast.success("Orden OT-0143 creada")}>
              Notificación de éxito
            </Button>
            <Button variant="outline" onClick={() => toast.warning("La orden ya existía: se agregó una nota")}>
              Notificación de aviso
            </Button>
            <Button variant="outline" onClick={() => toast.info("Carlos Ruiz marcó llegada a Éxito Calle 60")}>
              Notificación de información
            </Button>
            <Button variant="outline" onClick={() => toast.error("La ruta se cruza con \"Centro\"")}>
              Notificación de error
            </Button>
            <Badge variant="outline">Las notificaciones salen abajo a la derecha</Badge>
          </div>
        </div>
      </Seccion>
    </div>
  );
}

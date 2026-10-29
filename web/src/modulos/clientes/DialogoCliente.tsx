import { GuardarCliente, type Cliente } from "@aguialarmas/shared";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

interface Props {
  abierto: boolean;
  /** null = cliente nuevo. */
  cliente: Pick<Cliente, "id" | "nombre" | "identificacion"> | null;
  onCerrar: () => void;
  onGuardado: (cliente: Cliente) => void;
}

export function DialogoCliente({ abierto, cliente, onCerrar, onGuardado }: Props) {
  return (
    <Dialog open={abierto} onOpenChange={(a) => !a && onCerrar()}>
      <DialogContent>
        {/* El key reinicia el formulario cada vez que se abre con otro cliente. */}
        {abierto && <Formulario key={cliente?.id ?? "nuevo"} cliente={cliente} onCerrar={onCerrar} onGuardado={onGuardado} />}
      </DialogContent>
    </Dialog>
  );
}

function Formulario({ cliente, onCerrar, onGuardado }: Omit<Props, "abierto">) {
  const [nombre, setNombre] = useState(cliente?.nombre ?? "");
  const [identificacion, setIdentificacion] = useState(cliente?.identificacion ?? "");

  const guardar = useMutation({
    mutationFn: (datos: GuardarCliente) => (cliente ? api.actualizarCliente(cliente.id, datos) : api.crearCliente(datos)),
    onSuccess: (c) => {
      toast.success(cliente ? `${c.nombre} actualizado` : `Cliente ${c.nombre} creado`);
      onGuardado(c);
    },
    onError: (e) => toast.error(e.message),
  });

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const datos = GuardarCliente.safeParse({ nombre, identificacion: identificacion.trim() || null });
    if (!datos.success) return toast.error(datos.error.issues[0].message);
    guardar.mutate(datos.data);
  }

  return (
    <form onSubmit={enviar} className="grid gap-6">
      <DialogHeader>
        <DialogTitle>{cliente ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
        <DialogDescription>Después le agregas sus cuentas (sedes) con la ubicación en el mapa.</DialogDescription>
      </DialogHeader>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="nombre-cliente">Nombre</FieldLabel>
          <Input id="nombre-cliente" autoFocus placeholder="Ej.: Almacenes Éxito S.A." value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="identificacion">NIT o cédula</FieldLabel>
          <Input id="identificacion" placeholder="Opcional" value={identificacion} onChange={(e) => setIdentificacion(e.target.value)} />
          <FieldDescription>Si lo escribes, no se puede repetir en otro cliente.</FieldDescription>
        </Field>
      </FieldGroup>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={guardar.isPending}>
          {guardar.isPending ? "Guardando…" : cliente ? "Guardar" : "Crear cliente"}
        </Button>
      </DialogFooter>
    </form>
  );
}

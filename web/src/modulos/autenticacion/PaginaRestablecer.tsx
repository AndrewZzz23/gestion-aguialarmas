import { Contrasena } from "@aguialarmas/shared";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { MarcoAutenticacion } from "./MarcoAutenticacion";

/** Se abre desde el enlace del correo: cuenta nueva (activar=1) o recuperación de contraseña. */
export function PaginaRestablecer() {
  const [parametros] = useSearchParams();
  const navegar = useNavigate();
  const correo = parametros.get("correo") ?? "";
  const token = parametros.get("token") ?? "";
  const esActivacion = parametros.get("activar") === "1";
  const [contrasena, setContrasena] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const restablecer = useMutation({
    mutationFn: () => api.restablecerContrasena(correo, token, contrasena),
    onSuccess: () => {
      toast.success("Contraseña guardada. Ya puedes ingresar.");
      navegar("/ingresar", { replace: true });
    },
  });

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const validacion = Contrasena.safeParse(contrasena);
    if (!validacion.success) return setErrorLocal(validacion.error.issues[0].message);
    if (contrasena !== confirmacion) return setErrorLocal("Las contraseñas no coinciden.");
    setErrorLocal(null);
    restablecer.mutate();
  }

  if (!correo || !token) {
    return (
      <MarcoAutenticacion titulo="Enlace incompleto">
        <Alert variant="aviso">
          <AlertDescription>Abre el enlace completo que te llegó al correo, o pide uno nuevo.</AlertDescription>
        </Alert>
        <Link to="/recuperar" className="text-sm font-medium text-marca-amarillo-oscuro hover:underline">
          Pedir un enlace nuevo
        </Link>
      </MarcoAutenticacion>
    );
  }

  const error = errorLocal ?? (restablecer.isError ? restablecer.error.message : null);

  return (
    <MarcoAutenticacion
      titulo={esActivacion ? "Bienvenido a Aguialarmas" : "Contraseña nueva"}
      descripcion={esActivacion ? `Crea la contraseña de tu cuenta ${correo}.` : `Para ${correo}.`}
    >
      <form onSubmit={enviar}>
        <FieldGroup>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Field>
            <FieldLabel htmlFor="contrasena">Contraseña</FieldLabel>
            <Input id="contrasena" type="password" autoComplete="new-password" autoFocus required value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
            <FieldDescription>Mínimo 8 caracteres, con letras y números.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="confirmacion">Repite la contraseña</FieldLabel>
            <Input id="confirmacion" type="password" autoComplete="new-password" required value={confirmacion} onChange={(e) => setConfirmacion(e.target.value)} />
          </Field>
          <Button type="submit" size="lg" disabled={restablecer.isPending}>
            {restablecer.isPending ? "Guardando…" : "Guardar contraseña"}
          </Button>
        </FieldGroup>
      </form>
    </MarcoAutenticacion>
  );
}

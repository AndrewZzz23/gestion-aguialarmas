import { useMutation } from "@tanstack/react-query";
import { MailCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { MarcoAutenticacion } from "./MarcoAutenticacion";

/** WA-01: recuperación de contraseña por correo. */
export function PaginaRecuperar() {
  const [correo, setCorreo] = useState("");
  const recuperar = useMutation({ mutationFn: () => api.recuperarContrasena(correo) });

  return (
    <MarcoAutenticacion titulo="Recuperar contraseña" descripcion="Te enviamos un enlace para crear una contraseña nueva.">
      {recuperar.isSuccess ? (
        <Alert variant="exito">
          <MailCheck />
          <AlertTitle>Revisa tu correo</AlertTitle>
          <AlertDescription>
            Si {correo} tiene una cuenta, le llegó un enlace que vence en 1 hora. Revisa también la carpeta de spam.
          </AlertDescription>
        </Alert>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            recuperar.mutate();
          }}
        >
          <FieldGroup>
            {recuperar.isError && (
              <Alert variant="destructive">
                <AlertDescription>{recuperar.error.message}</AlertDescription>
              </Alert>
            )}
            <Field>
              <FieldLabel htmlFor="correo">Correo</FieldLabel>
              <Input id="correo" type="email" autoFocus required value={correo} onChange={(e) => setCorreo(e.target.value)} />
            </Field>
            <Button type="submit" size="lg" disabled={recuperar.isPending}>
              {recuperar.isPending ? "Enviando…" : "Enviar enlace"}
            </Button>
          </FieldGroup>
        </form>
      )}
      <Link to="/ingresar" className="text-sm font-medium text-marca-amarillo-oscuro hover:underline">
        ← Volver a ingresar
      </Link>
    </MarcoAutenticacion>
  );
}

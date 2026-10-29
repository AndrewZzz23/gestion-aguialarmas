import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

// El sistema solo tiene tema claro, por eso no usa next-themes.
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      richColors
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          // Colores por tipo con la paleta del sistema (richColors). El error va en naranja, nunca en rojo.
          "--success-bg": "var(--exito-fondo)",
          "--success-text": "var(--exito)",
          "--success-border": "color-mix(in srgb, var(--exito) 30%, transparent)",
          "--warning-bg": "var(--aviso-fondo)",
          "--warning-text": "var(--aviso)",
          "--warning-border": "color-mix(in srgb, var(--aviso) 30%, transparent)",
          "--info-bg": "var(--info-fondo)",
          "--info-text": "var(--info)",
          "--info-border": "color-mix(in srgb, var(--info) 30%, transparent)",
          "--error-bg": "var(--peligro-fondo)",
          "--error-text": "var(--destructive)",
          "--error-border": "color-mix(in srgb, var(--destructive) 30%, transparent)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

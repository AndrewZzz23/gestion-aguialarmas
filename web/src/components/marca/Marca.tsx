import { cn } from "cn";

/**
 * Águila de Aguialarmas con el nombre. El cuerpo del águila es negro,
 * por eso va dentro de un recuadro blanco cuando se pone sobre fondo oscuro.
 */
export function Marca({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <span className="grid size-9 place-items-center rounded-lg bg-white p-0.5">
        <img src="/aguila.png" alt="" className="size-full object-contain" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-lg font-extrabold tracking-tight">Aguialarmas</span>
        <span className="text-[0.7rem] font-semibold tracking-[0.18em] text-marca-amarillo uppercase">
          Gestión
        </span>
      </span>
    </span>
  );
}

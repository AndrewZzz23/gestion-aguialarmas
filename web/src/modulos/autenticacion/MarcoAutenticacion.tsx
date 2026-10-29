/** Pantallas sin sesión (ingresar, recuperar, restablecer): panel negro de marca a la izquierda y el formulario a la derecha. */
export function MarcoAutenticacion({ titulo, descripcion, children }: { titulo: string; descripcion?: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1fr_1.1fr]">
      <aside className="hidden flex-col justify-between bg-marca-negro p-10 text-white lg:flex">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-xl bg-white p-1">
            <img src="/aguila.png" alt="" className="size-full object-contain" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-2xl font-extrabold tracking-tight">Aguialarmas</span>
            <span className="text-xs font-semibold tracking-[0.2em] text-marca-amarillo uppercase">Gestión</span>
          </span>
        </div>
        <div className="grid gap-3">
          <p className="max-w-md text-3xl leading-tight font-bold">
            Órdenes, técnicos e inventario en <span className="text-marca-amarillo">un solo lugar</span>.
          </p>
          <p className="text-sm text-white/60">Seguridad privada · Ibagué, Tolima</p>
        </div>
      </aside>

      <main className="grid place-items-center bg-background px-4 py-12">
        <div className="grid w-full max-w-sm gap-6">
          <div className="flex items-center gap-3 lg:hidden">
            <img src="/aguila.png" alt="" className="size-10" />
            <span className="text-xl font-extrabold">Aguialarmas</span>
          </div>
          <div className="grid gap-1">
            <h1 className="text-2xl">{titulo}</h1>
            {descripcion && <p className="text-sm text-muted-foreground">{descripcion}</p>}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

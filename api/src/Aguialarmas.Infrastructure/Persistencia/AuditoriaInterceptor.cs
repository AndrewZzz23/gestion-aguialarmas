using System.Text.Json;
using Aguialarmas.Application.Abstracciones;
using Aguialarmas.Domain.Auditoria;
using Aguialarmas.Domain.Comun;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;
using NetTopologySuite.Geometries;

namespace Aguialarmas.Infrastructure.Persistencia;

/// <summary>
/// Llena los campos de creación/modificación, escribe la auditoría (WA-04)
/// y bloquea los borrados físicos: en este sistema todo se inactiva.
/// </summary>
public sealed class AuditoriaInterceptor(IUsuarioActual usuario, TimeProvider reloj) : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        if (eventData.Context is not null)
        {
            Procesar(eventData.Context);
        }

        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        if (eventData.Context is not null)
        {
            Procesar(eventData.Context);
        }

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void Procesar(DbContext contexto)
    {
        var ahora = reloj.GetUtcNow().UtcDateTime;
        var registros = new List<RegistroAuditoria>();

        foreach (var entrada in contexto.ChangeTracker.Entries<Entidad>().ToList())
        {
            switch (entrada.State)
            {
                case EntityState.Added:
                    entrada.Entity.MarcarCreado(usuario.Nombre, ahora);
                    registros.Add(Registro(entrada, ahora, AccionAuditoria.Crear, null, Valores(entrada, soloModificados: false, originales: false)));
                    break;

                case EntityState.Modified:
                    entrada.Entity.MarcarModificado(usuario.Nombre, ahora);
                    var activo = entrada.Property(nameof(Entidad.Activo));
                    var accion = activo.IsModified
                        ? ((bool)activo.CurrentValue! ? AccionAuditoria.Reactivar : AccionAuditoria.Inactivar)
                        : AccionAuditoria.Modificar;
                    registros.Add(Registro(entrada, ahora, accion,
                        Valores(entrada, soloModificados: true, originales: true),
                        Valores(entrada, soloModificados: true, originales: false)));
                    break;

                case EntityState.Deleted:
                    throw new InvalidOperationException(
                        $"No se permite borrar {entrada.Metadata.ClrType.Name}: use Inactivar().");
            }
        }

        if (registros.Count > 0)
        {
            contexto.Set<RegistroAuditoria>().AddRange(registros);
        }
    }

    private RegistroAuditoria Registro(EntityEntry<Entidad> entrada, DateTime ahora, AccionAuditoria accion, string? antes, string? despues)
    {
        var tipo = entrada.Metadata.ClrType;
        var modulo = tipo.Namespace?.Split('.').LastOrDefault() ?? "General";
        return RegistroAuditoria.Crear(ahora, usuario.Nombre, modulo, tipo.Name, entrada.Entity.Id, accion, antes, despues);
    }

    private static string? Valores(EntityEntry entrada, bool soloModificados, bool originales)
    {
        var datos = new Dictionary<string, object?>();
        foreach (var propiedad in entrada.Properties)
        {
            if (soloModificados && !propiedad.IsModified)
            {
                continue;
            }

            var valor = originales ? propiedad.OriginalValue : propiedad.CurrentValue;
            datos[propiedad.Metadata.Name] = valor is Geometry g ? g.AsText() : valor;
        }

        return datos.Count == 0 ? null : JsonSerializer.Serialize(datos);
    }
}

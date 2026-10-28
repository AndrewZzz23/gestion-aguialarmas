namespace Aguialarmas.Domain.Auditoria;

/// <summary>
/// Una fila por cada cambio en el sistema (WA-04). No se modifica ni se borra.
/// </summary>
public sealed class RegistroAuditoria
{
    public long Id { get; private set; }
    public DateTime FechaUtc { get; private set; }
    public string Usuario { get; private set; } = string.Empty;
    public string Modulo { get; private set; } = string.Empty;
    public string Entidad { get; private set; } = string.Empty;
    public Guid EntidadId { get; private set; }
    public AccionAuditoria Accion { get; private set; }
    public string? ValorAnterior { get; private set; }
    public string? ValorNuevo { get; private set; }

    private RegistroAuditoria() { }

    public static RegistroAuditoria Crear(
        DateTime fechaUtc, string usuario, string modulo, string entidad, Guid entidadId,
        AccionAuditoria accion, string? valorAnterior, string? valorNuevo) => new()
    {
        FechaUtc = fechaUtc,
        Usuario = usuario,
        Modulo = modulo,
        Entidad = entidad,
        EntidadId = entidadId,
        Accion = accion,
        ValorAnterior = valorAnterior,
        ValorNuevo = valorNuevo,
    };
}

public enum AccionAuditoria
{
    Crear = 1,
    Modificar = 2,
    Inactivar = 3,
    Reactivar = 4,
    IniciarSesion = 5,
    CerrarSesion = 6,
}

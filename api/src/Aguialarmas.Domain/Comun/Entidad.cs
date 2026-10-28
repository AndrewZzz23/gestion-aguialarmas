namespace Aguialarmas.Domain.Comun;

/// <summary>
/// Base de todas las entidades del negocio.
/// Regla del sistema: no se borra nada; los registros se inactivan y cada cambio queda en la auditoría.
/// </summary>
public abstract class Entidad
{
    public Guid Id { get; protected set; } = Guid.CreateVersion7();

    public bool Activo { get; private set; } = true;

    public DateTime CreadoEn { get; private set; }
    public string CreadoPor { get; private set; } = string.Empty;
    public DateTime? ModificadoEn { get; private set; }
    public string? ModificadoPor { get; private set; }

    public void Inactivar() => Activo = false;

    public void Reactivar() => Activo = true;

    // Las llena el interceptor de auditoría al guardar; el código de negocio no las toca.
    public void MarcarCreado(string usuario, DateTime fechaUtc)
    {
        CreadoPor = usuario;
        CreadoEn = fechaUtc;
    }

    public void MarcarModificado(string usuario, DateTime fechaUtc)
    {
        ModificadoPor = usuario;
        ModificadoEn = fechaUtc;
    }
}

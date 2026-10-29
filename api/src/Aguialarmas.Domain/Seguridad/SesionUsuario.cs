namespace Aguialarmas.Domain.Seguridad;

/// <summary>
/// Sesión abierta en un navegador o celular, identificada por su token de renovación.
/// No se borra: se revoca al salir, al renovar (rotación) o al inactivar al usuario.
/// El inicio y el cierre se registran en la auditoría como IniciarSesion / CerrarSesion.
/// </summary>
public sealed class SesionUsuario
{
    public static readonly TimeSpan Duracion = TimeSpan.FromDays(30);

    public Guid Id { get; private set; } = Guid.CreateVersion7();
    public Guid UsuarioId { get; private set; }
    public string HashToken { get; private set; } = string.Empty;
    public string? Dispositivo { get; private set; }
    public DateTime CreadaUtc { get; private set; }
    public DateTime ExpiraUtc { get; private set; }
    public DateTime? RevocadaUtc { get; private set; }

    private SesionUsuario() { }

    public SesionUsuario(Guid usuarioId, string hashToken, string? dispositivo, DateTime ahoraUtc)
    {
        UsuarioId = usuarioId;
        HashToken = hashToken;
        Dispositivo = dispositivo is { Length: > 200 } ? dispositivo[..200] : dispositivo;
        CreadaUtc = ahoraUtc;
        ExpiraUtc = ahoraUtc + Duracion;
    }

    public bool Vigente(DateTime ahoraUtc) => RevocadaUtc is null && ExpiraUtc > ahoraUtc;

    public void Revocar(DateTime ahoraUtc) => RevocadaUtc ??= ahoraUtc;
}

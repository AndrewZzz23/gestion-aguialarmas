using System.Net.Mail;
using Aguialarmas.Domain.Comun;

namespace Aguialarmas.Domain.Seguridad;

/// <summary>Persona que entra a la web o a la app (WA-01, WA-02). Se inactiva, no se borra.</summary>
public sealed class Usuario : Entidad
{
    public const int IntentosAntesDeBloquear = 5;
    public static readonly TimeSpan DuracionBloqueo = TimeSpan.FromMinutes(15);

    public string Nombre { get; private set; } = string.Empty;

    /// <summary>En minúsculas; es el nombre de usuario para entrar.</summary>
    public string Correo { get; private set; } = string.Empty;

    public Rol Rol { get; private set; }

    /// <summary>Null hasta que la persona define su contraseña con el enlace del correo.</summary>
    [DatoSensible]
    public string? HashContrasena { get; private set; }

    public int IntentosFallidos { get; private set; }
    public DateTime? BloqueadoHastaUtc { get; private set; }

    /// <summary>Hash del token del enlace para definir o recuperar la contraseña.</summary>
    [DatoSensible]
    public string? HashTokenContrasena { get; private set; }

    public DateTime? TokenContrasenaExpiraUtc { get; private set; }

    private Usuario() { }

    public Usuario(string nombre, string correo, Rol rol)
    {
        CambiarDatos(nombre, correo, rol);
    }

    public void CambiarDatos(string nombre, string correo, Rol rol)
    {
        if (string.IsNullOrWhiteSpace(nombre))
        {
            throw new ExcepcionDominio("El nombre del usuario es obligatorio.");
        }

        if (!Enum.IsDefined(rol))
        {
            throw new ExcepcionDominio("El rol no es válido.");
        }

        Nombre = nombre.Trim();
        Correo = NormalizarCorreo(correo);
        Rol = rol;
    }

    public static string NormalizarCorreo(string correo)
    {
        var limpio = (correo ?? string.Empty).Trim().ToLowerInvariant();
        if (!MailAddress.TryCreate(limpio, out var direccion) || direccion.Address != limpio)
        {
            throw new ExcepcionDominio("El correo no es válido.");
        }

        return limpio;
    }

    /// <summary>Mínimo 8 caracteres, con letras y números.</summary>
    public static void ValidarContrasena(string contrasena)
    {
        if (string.IsNullOrEmpty(contrasena) || contrasena.Length < 8
            || !contrasena.Any(char.IsLetter) || !contrasena.Any(char.IsDigit))
        {
            throw new ExcepcionDominio("La contraseña debe tener mínimo 8 caracteres, con letras y números.");
        }
    }

    public bool EstaBloqueado(DateTime ahoraUtc) => BloqueadoHastaUtc > ahoraUtc;

    public void RegistrarIngresoFallido(DateTime ahoraUtc)
    {
        IntentosFallidos++;
        if (IntentosFallidos >= IntentosAntesDeBloquear)
        {
            BloqueadoHastaUtc = ahoraUtc + DuracionBloqueo;
            IntentosFallidos = 0;
        }
    }

    public void RegistrarIngresoExitoso()
    {
        if (IntentosFallidos != 0 || BloqueadoHastaUtc is not null)
        {
            IntentosFallidos = 0;
            BloqueadoHastaUtc = null;
        }
    }

    public void SolicitarCambioContrasena(string hashToken, DateTime expiraUtc)
    {
        HashTokenContrasena = hashToken;
        TokenContrasenaExpiraUtc = expiraUtc;
    }

    public bool TokenContrasenaVigente(string hashToken, DateTime ahoraUtc) =>
        HashTokenContrasena is not null && HashTokenContrasena == hashToken && TokenContrasenaExpiraUtc > ahoraUtc;

    /// <summary>Recibe el hash ya calculado; la contraseña en claro se valida antes con <see cref="ValidarContrasena"/>.</summary>
    public void EstablecerContrasena(string hashContrasena)
    {
        HashContrasena = hashContrasena;
        HashTokenContrasena = null;
        TokenContrasenaExpiraUtc = null;
        IntentosFallidos = 0;
        BloqueadoHastaUtc = null;
    }
}

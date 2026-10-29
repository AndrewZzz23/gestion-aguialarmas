using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Aguialarmas.Domain.Seguridad;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace Aguialarmas.Api.Seguridad;

public sealed class JwtOpciones
{
    public const string Seccion = "Jwt";

    public string Emisor { get; set; } = "aguialarmas";
    public string Audiencia { get; set; } = "aguialarmas";

    /// <summary>Mínimo 32 caracteres. Local: appsettings.Development.json. Producción: configuración del App Service o Key Vault.</summary>
    public string Clave { get; set; } = string.Empty;

    public static readonly TimeSpan DuracionAcceso = TimeSpan.FromMinutes(15);

    public SymmetricSecurityKey LlaveFirma()
    {
        if (Encoding.UTF8.GetByteCount(Clave) < 32)
        {
            throw new InvalidOperationException("Falta Jwt:Clave en la configuración (mínimo 32 caracteres).");
        }

        return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Clave));
    }
}

public static class Reclamos
{
    public const string Id = "sub";
    public const string Correo = "email";
    public const string Nombre = "name";
    public const string Rol = "role";
}

public sealed class ServicioTokens(IOptions<JwtOpciones> opciones, TimeProvider reloj)
{
    public (string Token, DateTime ExpiraUtc) CrearTokenAcceso(Usuario usuario)
    {
        var o = opciones.Value;
        var expira = reloj.GetUtcNow().UtcDateTime + JwtOpciones.DuracionAcceso;
        var token = new JsonWebTokenHandler().CreateToken(new SecurityTokenDescriptor
        {
            Issuer = o.Emisor,
            Audience = o.Audiencia,
            Expires = expira,
            Subject = new ClaimsIdentity(
            [
                new Claim(Reclamos.Id, usuario.Id.ToString()),
                new Claim(Reclamos.Correo, usuario.Correo),
                new Claim(Reclamos.Nombre, usuario.Nombre),
                new Claim(Reclamos.Rol, usuario.Rol.ToString()),
            ]),
            SigningCredentials = new SigningCredentials(o.LlaveFirma(), SecurityAlgorithms.HmacSha256),
        });
        return (token, expira);
    }

    /// <summary>Token aleatorio para el enlace del correo o la renovación de sesión. Solo se guarda su hash.</summary>
    public static string NuevoTokenAleatorio() => Base64UrlEncoder.Encode(RandomNumberGenerator.GetBytes(32));

    public static string Hash(string token) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
}

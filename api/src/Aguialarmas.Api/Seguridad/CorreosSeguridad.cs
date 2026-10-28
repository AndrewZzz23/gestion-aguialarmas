using System.Net;
using Aguialarmas.Application.Abstracciones;
using Aguialarmas.Domain.Seguridad;

namespace Aguialarmas.Api.Seguridad;

/// <summary>Correos para definir o recuperar la contraseña (WA-01). El enlace abre la web en /restablecer.</summary>
public sealed class CorreosSeguridad(IServicioCorreo correo, IConfiguration configuracion)
{
    public static readonly TimeSpan VigenciaActivacion = TimeSpan.FromDays(3);
    public static readonly TimeSpan VigenciaRecuperacion = TimeSpan.FromHours(1);

    public Task EnviarActivacionAsync(Usuario usuario, string token, CancellationToken ct) =>
        correo.EnviarAsync(usuario.Correo, "Tu cuenta en Gestión Aguialarmas", Plantilla(
            usuario,
            "Te crearon una cuenta en el sistema de gestión de Aguialarmas. Define tu contraseña para entrar:",
            "Definir mi contraseña",
            Enlace(usuario, token, activar: true),
            "El enlace vence en 3 días."), ct);

    public Task EnviarRecuperacionAsync(Usuario usuario, string token, CancellationToken ct) =>
        correo.EnviarAsync(usuario.Correo, "Recupera tu contraseña · Gestión Aguialarmas", Plantilla(
            usuario,
            "Pediste cambiar tu contraseña. Usa este enlace para crear una nueva:",
            "Crear contraseña nueva",
            Enlace(usuario, token, activar: false),
            "El enlace vence en 1 hora. Si no fuiste tú, ignora este correo: tu contraseña sigue igual."), ct);

    private string Enlace(Usuario usuario, string token, bool activar)
    {
        var web = (configuracion["UrlWeb"] ?? "").TrimEnd('/');
        var consulta = $"correo={Uri.EscapeDataString(usuario.Correo)}&token={Uri.EscapeDataString(token)}";
        return $"{web}/restablecer?{consulta}{(activar ? "&activar=1" : "")}";
    }

    private static string Plantilla(Usuario usuario, string texto, string boton, string enlace, string nota) => $"""
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1C1917">
          <div style="background:#141414;color:#fff;padding:16px 24px;font-weight:bold;font-size:18px">
            Aguialarmas <span style="color:#FFD200;font-size:12px;letter-spacing:2px">GESTIÓN</span>
          </div>
          <div style="padding:24px;border:1px solid #E2E0DC;border-top:0">
            <p>Hola, {WebUtility.HtmlEncode(usuario.Nombre)}:</p>
            <p>{texto}</p>
            <p style="margin:28px 0">
              <a href="{WebUtility.HtmlEncode(enlace)}" style="background:#FFD200;color:#141414;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">{boton}</a>
            </p>
            <p style="color:#5C5853;font-size:13px">{nota}</p>
          </div>
        </div>
        """;
}

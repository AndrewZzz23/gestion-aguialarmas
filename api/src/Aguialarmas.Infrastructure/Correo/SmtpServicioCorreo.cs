using Aguialarmas.Application.Abstracciones;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Aguialarmas.Infrastructure.Correo;

public sealed class CorreoOpciones
{
    public const string Seccion = "Correo";

    /// <summary>Local: Mailpit (localhost:1025). Producción: SMTP de Azure Communication Services.</summary>
    public string Host { get; set; } = "localhost";
    public int Puerto { get; set; } = 1025;
    public bool UsarTls { get; set; }
    public string? Usuario { get; set; }
    public string? Clave { get; set; }
    public string Remitente { get; set; } = "no-responder@aguialarmas.local";
    public string NombreRemitente { get; set; } = "Aguialarmas";
}

public sealed class SmtpServicioCorreo(IOptions<CorreoOpciones> opciones) : IServicioCorreo
{
    public async Task EnviarAsync(string para, string asunto, string cuerpoHtml, CancellationToken ct = default)
    {
        var o = opciones.Value;
        var mensaje = new MimeMessage();
        mensaje.From.Add(new MailboxAddress(o.NombreRemitente, o.Remitente));
        mensaje.To.Add(MailboxAddress.Parse(para));
        mensaje.Subject = asunto;
        mensaje.Body = new BodyBuilder { HtmlBody = cuerpoHtml }.ToMessageBody();

        using var cliente = new SmtpClient();
        await cliente.ConnectAsync(o.Host, o.Puerto, o.UsarTls ? SecureSocketOptions.StartTls : SecureSocketOptions.None, ct);
        if (!string.IsNullOrEmpty(o.Usuario))
        {
            await cliente.AuthenticateAsync(o.Usuario, o.Clave, ct);
        }

        await cliente.SendAsync(mensaje, ct);
        await cliente.DisconnectAsync(true, ct);
    }
}

namespace Aguialarmas.Application.Abstracciones;

/// <summary>Usuario que está haciendo la operación (para auditoría).</summary>
public interface IUsuarioActual
{
    string Nombre { get; }
}

/// <summary>Fotos, planos y anexos. Local: Azurite. Producción: Azure Blob Storage.</summary>
public interface IAlmacenArchivos
{
    Task<string> GuardarAsync(string carpeta, string nombreArchivo, Stream contenido, string tipoContenido, CancellationToken ct = default);

    Task<Stream> AbrirAsync(string ruta, CancellationToken ct = default);
}

/// <summary>Correos a las cuentas (programación de la orden, "voy en camino"). Local: Mailpit.</summary>
public interface IServicioCorreo
{
    Task EnviarAsync(string para, string asunto, string cuerpoHtml, CancellationToken ct = default);
}

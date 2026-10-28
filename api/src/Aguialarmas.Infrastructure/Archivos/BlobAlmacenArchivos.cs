using Aguialarmas.Application.Abstracciones;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Options;

namespace Aguialarmas.Infrastructure.Archivos;

public sealed class AlmacenamientoOpciones
{
    public const string Seccion = "Almacenamiento";

    /// <summary>Local: "UseDevelopmentStorage=true" (Azurite).</summary>
    public string ConnectionString { get; set; } = "UseDevelopmentStorage=true";

    public string Contenedor { get; set; } = "aguialarmas";
}

public sealed class BlobAlmacenArchivos(IOptions<AlmacenamientoOpciones> opciones) : IAlmacenArchivos
{
    private readonly BlobContainerClient _contenedor =
        new BlobServiceClient(opciones.Value.ConnectionString).GetBlobContainerClient(opciones.Value.Contenedor);

    public async Task<string> GuardarAsync(string carpeta, string nombreArchivo, Stream contenido, string tipoContenido, CancellationToken ct = default)
    {
        await _contenedor.CreateIfNotExistsAsync(cancellationToken: ct);

        var ruta = $"{carpeta.Trim('/')}/{Guid.CreateVersion7():N}-{Path.GetFileName(nombreArchivo)}";
        var blob = _contenedor.GetBlobClient(ruta);
        await blob.UploadAsync(contenido, new BlobUploadOptions
        {
            HttpHeaders = new BlobHttpHeaders { ContentType = tipoContenido },
        }, ct);

        return ruta;
    }

    public async Task<Stream> AbrirAsync(string ruta, CancellationToken ct = default)
    {
        var descarga = await _contenedor.GetBlobClient(ruta).DownloadStreamingAsync(cancellationToken: ct);
        return descarga.Value.Content;
    }
}

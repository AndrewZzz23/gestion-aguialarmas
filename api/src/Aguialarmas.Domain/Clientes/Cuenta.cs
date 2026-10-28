using Aguialarmas.Domain.Comun;
using NetTopologySuite.Geometries;

namespace Aguialarmas.Domain.Clientes;

/// <summary>Sede física de un cliente, con ubicación en el mapa y perímetro de llegada.</summary>
public sealed class Cuenta : Entidad
{
    public const int RadioLlegadaPorDefectoM = 100;

    public Guid ClienteId { get; private set; }
    public string Nombre { get; private set; } = string.Empty;
    public string Direccion { get; private set; } = string.Empty;
    public string? Contacto { get; private set; }
    public string? CorreoContacto { get; private set; }

    /// <summary>Ruta (área de la ciudad) donde queda la cuenta. Se calcula con su ubicación.</summary>
    public Guid? RutaId { get; private set; }

    /// <summary>Punto WGS84 (SRID 4326): X = longitud, Y = latitud.</summary>
    public Point? Ubicacion { get; private set; }

    public int RadioLlegadaM { get; private set; } = RadioLlegadaPorDefectoM;

    private Cuenta() { }

    public Cuenta(Guid clienteId, string nombre, string direccion)
    {
        ClienteId = clienteId;
        Nombre = nombre.Trim();
        Direccion = direccion.Trim();
    }

    public void UbicarEn(double latitud, double longitud, int? radioLlegadaM = null)
    {
        Ubicacion = new Point(longitud, latitud) { SRID = 4326 };
        if (radioLlegadaM is > 0)
        {
            RadioLlegadaM = radioLlegadaM.Value;
        }
    }

    public void AsignarRuta(Guid? rutaId) => RutaId = rutaId;

    public void CambiarContacto(string? contacto, string? correo)
    {
        Contacto = contacto?.Trim();
        CorreoContacto = correo?.Trim();
    }
}

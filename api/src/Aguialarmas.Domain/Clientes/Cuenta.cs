using System.Net.Mail;
using Aguialarmas.Domain.Comun;
using NetTopologySuite.Geometries;

namespace Aguialarmas.Domain.Clientes;

/// <summary>Sede física de un cliente, con ubicación en el mapa y perímetro de llegada. WA-06.</summary>
public sealed class Cuenta : Entidad
{
    public const int RadioLlegadaPorDefectoM = 100;
    public const int RadioLlegadaMinimoM = 20;
    public const int RadioLlegadaMaximoM = 1000;

    public Guid ClienteId { get; private set; }
    public string Nombre { get; private set; } = string.Empty;
    public string Direccion { get; private set; } = string.Empty;
    public string? Contacto { get; private set; }

    /// <summary>Recibe los avisos de programación y de "voy en camino" (WA-33, AM-21).</summary>
    public string? CorreoContacto { get; private set; }

    /// <summary>Ruta (área de la ciudad) donde queda la cuenta. Se calcula con su ubicación.</summary>
    public Guid? RutaId { get; private set; }

    /// <summary>Punto WGS84 (SRID 4326): X = longitud, Y = latitud.</summary>
    public Point? Ubicacion { get; private set; }

    /// <summary>Distancia máxima para que la llegada del técnico cuente como dentro de la cuenta (AM-18).</summary>
    public int RadioLlegadaM { get; private set; } = RadioLlegadaPorDefectoM;

    private Cuenta() { }

    public Cuenta(Guid clienteId, string nombre, string direccion)
    {
        ClienteId = clienteId;
        CambiarDatos(nombre, direccion);
    }

    public void CambiarDatos(string nombre, string direccion)
    {
        if (string.IsNullOrWhiteSpace(nombre))
        {
            throw new ExcepcionDominio("El nombre de la cuenta es obligatorio.");
        }

        if (string.IsNullOrWhiteSpace(direccion))
        {
            throw new ExcepcionDominio("La dirección de la cuenta es obligatoria.");
        }

        Nombre = nombre.Trim();
        Direccion = direccion.Trim();
    }

    public void UbicarEn(double latitud, double longitud, int? radioLlegadaM = null)
    {
        if (latitud is < -90 or > 90 || longitud is < -180 or > 180)
        {
            throw new ExcepcionDominio("La ubicación de la cuenta no es válida.");
        }

        Ubicacion = new Point(longitud, latitud) { SRID = 4326 };
        if (radioLlegadaM is not null)
        {
            CambiarRadioLlegada(radioLlegadaM.Value);
        }
    }

    public void CambiarRadioLlegada(int metros)
    {
        if (metros is < RadioLlegadaMinimoM or > RadioLlegadaMaximoM)
        {
            throw new ExcepcionDominio($"El perímetro de llegada debe estar entre {RadioLlegadaMinimoM} y {RadioLlegadaMaximoM} metros.");
        }

        RadioLlegadaM = metros;
    }

    public void AsignarRuta(Guid? rutaId) => RutaId = rutaId;

    public void CambiarContacto(string? contacto, string? correo)
    {
        var correoLimpio = string.IsNullOrWhiteSpace(correo) ? null : correo.Trim().ToLowerInvariant();
        if (correoLimpio is not null && !MailAddress.TryCreate(correoLimpio, out _))
        {
            throw new ExcepcionDominio("El correo de contacto no es válido.");
        }

        Contacto = string.IsNullOrWhiteSpace(contacto) ? null : contacto.Trim();
        CorreoContacto = correoLimpio;
    }
}

using System.Text.RegularExpressions;
using Aguialarmas.Domain.Comun;
using NetTopologySuite.Geometries;

namespace Aguialarmas.Domain.Rutas;

/// <summary>Área de la ciudad dibujada en el mapa (antes "sector"). WA-28.</summary>
public sealed partial class Ruta : Entidad
{
    public string Nombre { get; private set; } = string.Empty;
    public string Color { get; private set; } = "#1F4E79";

    /// <summary>Polígono WGS84 (SRID 4326).</summary>
    public Polygon Area { get; private set; } = null!;

    private Ruta() { }

    public Ruta(string nombre, string color, Polygon area)
    {
        CambiarDatos(nombre, color);
        CambiarArea(area);
    }

    public void CambiarDatos(string nombre, string color)
    {
        if (string.IsNullOrWhiteSpace(nombre))
        {
            throw new ExcepcionDominio("El nombre de la ruta es obligatorio.");
        }

        if (!ColorHex().IsMatch(color ?? string.Empty))
        {
            throw new ExcepcionDominio("El color de la ruta debe tener el formato #RRGGBB.");
        }

        Nombre = nombre.Trim();
        Color = color!.ToUpperInvariant();
    }

    public void CambiarArea(Polygon area)
    {
        if (!area.IsValid)
        {
            throw new ExcepcionDominio("El polígono de la ruta no es válido (se cruza consigo mismo).");
        }

        area.SRID = 4326;
        Area = area;
    }

    public bool Contiene(Point punto) => Area.Contains(punto);

    /// <summary>
    /// Cada cuenta pertenece a una sola ruta, así que dos rutas no pueden compartir área.
    /// Tocarse por el borde sí se permite (rutas vecinas dibujadas con imán).
    /// </summary>
    public bool SeCruzaCon(Ruta otra) => Area.Intersects(otra.Area) && Area.Intersection(otra.Area).Area > AreaMinimaCruce;

    // En grados²: ~10 m² en Ibagué. Absorbe errores de redondeo al dibujar bordes compartidos.
    private const double AreaMinimaCruce = 1e-9;

    [GeneratedRegex("^#[0-9A-Fa-f]{6}$")]
    private static partial Regex ColorHex();
}

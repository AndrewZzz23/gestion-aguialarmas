using Aguialarmas.Domain.Comun;
using NetTopologySuite.Geometries;

namespace Aguialarmas.Domain.Rutas;

/// <summary>Área de la ciudad dibujada en el mapa (antes "sector"). WA-28.</summary>
public sealed class Ruta : Entidad
{
    public string Nombre { get; private set; } = string.Empty;
    public string Color { get; private set; } = "#1F4E79";

    /// <summary>Polígono WGS84 (SRID 4326).</summary>
    public Polygon Area { get; private set; } = null!;

    private Ruta() { }

    public Ruta(string nombre, string color, Polygon area)
    {
        Nombre = nombre.Trim();
        Color = color;
        CambiarArea(area);
    }

    public void CambiarArea(Polygon area)
    {
        if (!area.IsValid)
        {
            throw new ArgumentException("El polígono de la ruta no es válido (se cruza consigo mismo).", nameof(area));
        }

        area.SRID = 4326;
        Area = area;
    }

    public bool Contiene(Point punto) => Area.Contains(punto);
}

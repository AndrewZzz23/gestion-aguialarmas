using Aguialarmas.Domain.Comun;

namespace Aguialarmas.Domain.Clientes;

/// <summary>Cliente final de Aguialarmas. Tiene una o varias cuentas (sedes). WA-05.</summary>
public sealed class Cliente : Entidad
{
    public string Nombre { get; private set; } = string.Empty;

    /// <summary>NIT o cédula. Opcional, pero si se escribe no se puede repetir.</summary>
    public string? Identificacion { get; private set; }

    private readonly List<Cuenta> _cuentas = [];
    public IReadOnlyCollection<Cuenta> Cuentas => _cuentas;

    private Cliente() { }

    public Cliente(string nombre, string? identificacion)
    {
        CambiarDatos(nombre, identificacion);
    }

    public void CambiarDatos(string nombre, string? identificacion)
    {
        if (string.IsNullOrWhiteSpace(nombre))
        {
            throw new ExcepcionDominio("El nombre del cliente es obligatorio.");
        }

        Nombre = nombre.Trim();
        Identificacion = string.IsNullOrWhiteSpace(identificacion) ? null : identificacion.Trim();
    }
}

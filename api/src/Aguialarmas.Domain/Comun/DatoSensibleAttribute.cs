namespace Aguialarmas.Domain.Comun;

/// <summary>El valor no se escribe en la auditoría (hashes de contraseña, tokens); allí queda como "***".</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class DatoSensibleAttribute : Attribute;

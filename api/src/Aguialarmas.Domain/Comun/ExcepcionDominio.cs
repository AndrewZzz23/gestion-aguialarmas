namespace Aguialarmas.Domain.Comun;

/// <summary>Regla del negocio incumplida. La API la responde como 400 con el mensaje tal cual, para mostrarlo al usuario.</summary>
public sealed class ExcepcionDominio(string mensaje) : Exception(mensaje);

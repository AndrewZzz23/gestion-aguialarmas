namespace Aguialarmas.Domain.Seguridad;

/// <summary>Roles del sistema (WA-02). Mismos nombres que en packages/shared/src/modelos.ts.</summary>
public enum Rol
{
    Administrador = 1,
    UsuarioAdministrativo = 2,
    DirectorTecnico = 3,
    Almacenista = 4,
    Tecnico = 5,
    Supervisor = 6,
}

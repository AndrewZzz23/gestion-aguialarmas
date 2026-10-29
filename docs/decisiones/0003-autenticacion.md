# 0003 · Autenticación propia con JWT

Fecha: 2026-10-27 · Estado: aceptada

## Contexto
WA-01 pide usuario y contraseña con recuperación por correo; WA-02, usuarios con 6 roles; WA-03, que cada rol vea solo lo suyo; WA-04, que los inicios y cierres de sesión queden en la auditoría. Son unos 45 usuarios (RT-06), la mayoría técnicos sin cuenta corporativa de Microsoft.

## Opciones
- **Microsoft Entra ID / External ID**: sin costo con este volumen (Entra ID Free; External ID gratis hasta 50.000 usuarios activos al mes). Sin embargo, exige el tenant del cliente (todavía no hay cuenta de Azure) y una pantalla de Microsoft en la app del técnico, y deja los inicios de sesión fuera de nuestra auditoría. Azure AD B2C ya no se vende a clientes nuevos.
- **Autenticación propia en la API**: es lo que pide el contrato, funciona sin internet en desarrollo, no hay nada que migrar (vive en la misma base de datos) y la auditoría queda completa.

## Decisión
Autenticación propia:
- **`Usuario`** hereda de `Entidad`: se inactiva, no se borra, y cada cambio queda en la auditoría. Contraseñas con `PasswordHasher` de ASP.NET Core Identity (PBKDF2). Los campos marcados con `[DatoSensible]` quedan como `***` en la auditoría.
- **Tokens:** de acceso JWT de 15 minutos (HS256, `Jwt:Clave`), y de renovación de 30 días que rota en cada uso y se revoca al salir, al restablecer la contraseña o al inactivar al usuario. Solo se guarda el hash de los tokens.
- **Bloqueo:** 15 minutos después de 5 intentos fallidos. Contraseña de mínimo 8 caracteres, con letras y números.
- **Cuentas nuevas:** el administrador no define contraseñas. A la persona le llega un enlace (válido 3 días) para crearla. La recuperación usa el mismo flujo (enlace válido 1 hora).
- **Permisos:** todo endpoint exige sesión por defecto (`FallbackPolicy`). Los permisos por rol están en `Api/Seguridad/Permisos.cs`, que es la que manda, y en `packages/shared/src/permisos.ts`, que solo sirve para mostrar u ocultar pantallas en la web y la app.
- **Primer administrador:** se crea al arrancar si no hay usuarios, con la sección `AdminInicial`.
- **Web:** el token de acceso vive en memoria y el de renovación en `localStorage`. **App (AM-01):** se guardará con `expo-secure-store`.

## Consecuencias
- En Azure: `Jwt__Clave` (aleatoria, 64+ caracteres) y `UrlWeb` van en la configuración del App Service o en Key Vault. `AdminInicial__*` solo se usan en el primer arranque y luego se quitan.
- Si más adelante la oficina quiere entrar con su cuenta de Microsoft 365, se puede agregar Entra ID como opción adicional sin cambiar el login de los técnicos.

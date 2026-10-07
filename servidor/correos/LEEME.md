# Correos de Supabase (Fans Of)

Supabase usa una sola plantilla por tipo de correo (no hay una por idioma), así que cada una va en **español con un bloque en inglés debajo**. Todas conservan `{{ .ConfirmationURL }}` (sin él el enlace no funciona).

Dónde se pega: Supabase → **Authentication → Emails → Templates**. Para cada fila: pon el *Subject*, borra el contenido y pega el HTML del archivo; **Save**.

| Pestaña de Supabase | Archivo | Subject |
|---|---|---|
| Magic link («Ya tengo cuenta») | `magic-link.html` | `Tu enlace para entrar en Fans Of · Your Fans Of sign-in link` |
| Change email address (guardar con email) | `cambio-de-email.html` | `Confirma tu correo en Fans Of · Confirm your email` |
| Confirm sign up (por si se activa) | `confirmar-registro.html` | `Confirma tu cuenta de Fans Of · Confirm your account` |

Invite user, Reset password y Reauthentication no se usan (no hay contraseñas ni invitaciones): se dejan como están.

Remitente: en Authentication → SMTP Settings, *Sender name* = `Fans Of` (el correo es el de la cuenta de Gmail).
Si cambias un texto, cámbialo aquí también, para que el repo refleje lo que hay en Supabase.

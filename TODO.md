# Pendiente

Lo que queda por hacer y no hay que olvidar. Detalle de cada punto en PLAN-CUENTAS.md.

## Para Rafael (mensaje de Daniel, 7-10-2026): publicar en Google Play
¡¡Esfínter!! Rafael, repásalo y dile algo a Daniel. Cuando esté hablado, borrad esta sección (y la línea que la anuncia en CLAUDE.md).
- [ ] **Página de privacidad** (ES/EN): obligatoria ya (la partida va a la nube) y Google Play pide su enlace. La hace Claude de Daniel (es el punto de «Cuentas» de abajo).
- [ ] **App de Android con Capacitor**: envolver el juego web en una app. La hace Claude de Daniel.
- [ ] **Ficha de la tienda**: capturas, imagen de cabecera 1024×500, descripción ES/EN, repaso del icono. La hace Claude de Daniel.
- [ ] **Cuenta de desarrollador de Google Play** (pago único), a nombre de uno de los dos. ¿Quién?
- [ ] **12 probadores durante 14 días seguidos**: obligatorio en cuentas personales nuevas antes de poder publicar. Es lo que más tarda: buscarlos ya (amigos y familia con Android).
- [ ] **Formularios de Google**: el de edades (IARC) y el de seguridad de datos (qué guarda la app).
- [ ] **Nube (Rafael)**: correos de Supabase en español y la dirección de la app en las Redirect URLs para que el enlace del email funcione dentro de la app (ya están en «Cuentas»).
- [ ] **Nombre de recambio**: Google revisa a mano y podría rechazarlo por parecerse a Blizzard/Warcraft Rumble. Tener uno pensado.
- No hace falta para la primera versión: PvP online, tienda con dinero real ni el botón de Google.

## Cuentas (publicado el 6-10-2026: Rumble 0.9.30, TD 0.13.0)
- [ ] Página de privacidad corta (ES/EN): qué se guarda (la partida y el email si lo das), para qué, dónde (Supabase, UE) y cómo borrarlo. Enlazarla desde Opciones y desde la biblioteca.
- [ ] Botón «Continuar con Google»: crear la credencial OAuth en Google Cloud (lo hace el dueño), activar Google en Supabase y añadir el botón en core/js/sistema/cuenta-pantalla.js.
- [ ] Textos de los correos de Supabase en español (Authentication → Emails → Templates): hoy salen en inglés.
- [ ] Correo: Gmail vale para empezar (~500 al día). Con muchos jugadores, pasar a un dominio propio (por ejemplo con Resend).
- [ ] Herramientas en el panel DEV: estado de la nube, forzar subida/bajada, simular sin conexión.
- [ ] Limpieza: tarea mensual que borre invitados sin actividad en 60 días (y el usuario de prueba con la partida «prueba»).
- [ ] App de Android (Capacitor): añadir su dirección a las Redirect URLs de Supabase para que funcione el enlace del email.
- [ ] Probar el modo sin conexión con la cuenta (python herramientas/servidor.py --con-sw).

## Después
- [ ] Modo ahorro y contador de FPS también en el TD (en el Rumble desde 0.9.39). Hacerlo común en core para que los dos juegos usen el mismo código. Ahora se prioriza el Rumble.
- [ ] PvP online (Rumble primero, luego TD): Rumble determinista (aleatorio con semilla y paso fijo), emparejamiento, modos Estándar y Salvaje.
- [ ] Tienda con dinero real: recursos, gachapón e inventario en el servidor; cobro con Paddle o Lemon Squeezy; probabilidades visibles.
- [ ] Antes de cobrar: darse de alta (autónomo o sociedad) y condiciones de venta.

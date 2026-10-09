# App Android (Capacitor) de Fans of Rumble
Envoltorio que empaqueta el juego dentro de la app (funciona sin conexión; la nube sigue siendo Supabase).
- id: `com.microblizz.fansofrumble`. Primera versión: solo Rumble.
- Construir (necesita Node y Android Studio/JDK 17+):
  1. `python herramientas/android_www.py` (copia core/ y games/rumble/ a `www/`)
  2. `cd android-app && npm install && npx cap sync android`
  3. `npx cap open android` → Build → Generate Signed App Bundle (.aab). La clave de firma (.jks) NO va al repo; guardarla con copia de seguridad (si se pierde, no se puede actualizar la app; con Play App Signing Google guarda la clave final).
- Pendiente: icono/splash propios, versión (`versionCode`), enlace del email de Supabase (Redirect URL con el esquema de la app), AdMob y Play Billing, probar sin conexión.
- Plugins: `@capacitor/app` (botón ATRÁS; antes faltaba en package.json, así que el botón no funcionaba) y `@capacitor/local-notifications` (avisos al móvil, 9-10-2026).
- Avisos al móvil: los programa `games/rumble/js/20d-avisos.js` al salir de la app y los borra al volver (sin servidor). Icono pequeño: `res/drawable/ic_stat_aviso.xml`. El permiso se pide tras la primera victoria; interruptor en Opciones (solo se ve en la app). Probar en un móvil de verdad: ganar una partida, aceptar, salir de la app y mirar los avisos pendientes (o adelantar la hora del móvil).


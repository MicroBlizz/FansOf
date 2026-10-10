# App Android (Capacitor) de Fans of Rumble
Una app por juego (rumble, td, survivors, skate, tacticas), cada una con su id `com.microblizz.fansof<juego>`. Empaqueta el juego dentro de la app (funciona sin conexión; la nube sigue siendo Supabase).
- **APK de depuración sin instalar nada**: GitHub → Actions → «Android APK» → Run workflow (juegos: `rumble,td`…) → el `.apk` sale como artefacto de la ejecución.
- Construir (necesita Node y Android Studio/JDK 17+):
  1. `python herramientas/android_www.py td` (copia core/ y el juego a `www/` y fija nombre e id)
  2. `cd android-app && npm ci && npx cap sync android`
  3. `npx cap open android` → Build → Generate Signed App Bundle (.aab). La clave de firma (.jks) NO va al repo; guardarla con copia de seguridad (si se pierde, no se puede actualizar la app; con Play App Signing Google guarda la clave final).
- Pendiente: icono/splash propios, versión (`versionCode`), enlace del email de Supabase (Redirect URL con el esquema de la app), AdMob y Play Billing, probar sin conexión.
- Plugins: `@capacitor/app` (botón ATRÁS; antes faltaba en package.json, así que el botón no funcionaba) y `@capacitor/local-notifications` (avisos al móvil, 9-10-2026).
- Avisos al móvil: los programa `games/rumble/js/20d-avisos.js` al salir de la app y los borra al volver (sin servidor). Icono pequeño: `res/drawable/ic_stat_aviso.xml`. El permiso se pide tras la primera victoria; interruptor en Opciones (solo se ve en la app). Probar en un móvil de verdad: ganar una partida, aceptar, salir de la app y mirar los avisos pendientes (o adelantar la hora del móvil).


## Probar en el móvil sin cuenta de Google Play
Tras ejecutar el workflow, los APK quedan en https://github.com/MicroBlizz/FansOf/releases/tag/apk-latest (descarga directa desde el móvil). Instalar: abrir el .apk descargado → permitir «instalar apps de esta fuente» cuando lo pida. Son de depuración (firma de prueba): para publicar se generará el .aab firmado.

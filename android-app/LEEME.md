# App Android (Capacitor) de Fans of Rumble
Envoltorio que empaqueta el juego dentro de la app (funciona sin conexión; la nube sigue siendo Supabase).
- id: `com.microblizz.fansofrumble`. Primera versión: solo Rumble.
- Construir (necesita Node y Android Studio/JDK 17+):
  1. `python herramientas/android_www.py` (copia core/ y games/rumble/ a `www/`)
  2. `cd android-app && npm install && npx cap sync android`
  3. `npx cap open android` → Build → Generate Signed App Bundle (.aab). La clave de firma (.jks) NO va al repo; guardarla con copia de seguridad (si se pierde, no se puede actualizar la app; con Play App Signing Google guarda la clave final).
- Pendiente: icono/splash propios, versión (`versionCode`), enlace del email de Supabase (Redirect URL con el esquema de la app), AdMob y Play Billing, probar sin conexión.

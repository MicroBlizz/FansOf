# Publicar en Google Play (plan, 8-10-2026)

Notas de Pepins en TODO.md («Para Rafael»). Aquí, el orden y lo que decide cada uno.

## Decisiones que quedan
1. **Titular de la cuenta de desarrollador** (25 USD, pago único). Recomendación: Arkioner (ya es el titular de GitHub/Supabase/Pages). Cuenta *personal* = 12 probadores durante 14 días y Google muestra el nombre legal del titular en la ficha. Cuenta de *organización* evita los 12 probadores pero exige número D-U-N-S y empresa registrada: hoy no hay.
2. **Primer juego**: Rumble (el principal). Los demás, después, cada uno con su app (la partida es independiente por juego).
3. **Nombre en la tienda**: ver «Nombre» abajo.

## Orden de trabajo
1. Cuenta de desarrollador (bloquea los 14 días: empezar ya).
2. Reclutar 12 probadores con Android (grupo cerrado de Google Groups o correos): se les añade en «Prueba cerrada». Son 14 días seguidos con los 12 dentro.
3. App Capacitor (carpeta `android/`, a crear en el PC; la nube no tiene Android SDK). Recomendado **empaquetar los archivos del juego dentro de la app** (no solo cargar la URL): Google rechaza «webs envueltas» sin valor propio y así funciona sin conexión. Hace falta copiar `core/` y `games/rumble/` conservando rutas (`../../core/...`) a `www/`.
4. Ficha: icono 512×512, cabecera 1024×500, 2–8 capturas de móvil, descripción corta (80) y larga (4000) ES/EN.
5. Formularios: edades (IARC), seguridad de datos, anuncios, público objetivo, política de privacidad, borrado de cuenta.
6. Redirect URLs de Supabase para el enlace del email desde la app (esquema/ruta de la app).

## Respuestas ya pensadas para los formularios
- **Política de privacidad**: https://microblizz.github.io/FansOf/privacidad/ (ya existe, ES/EN).
- **Borrado de cuenta**: dentro de la app (Opciones → Cuenta → BORRAR CUENTA) y la misma página de privacidad. Google pide una URL web que lo explique: usar la de privacidad (revisar que lo diga en un apartado visible).
- **Público objetivo**: 13+ / «no dirigido a niños» (el aviso de 14+ al vincular cuenta va con esto). Así se evita el programa Familias.
- **Anuncios**: hoy el anuncio es de prueba. Si la versión de Play no los lleva, marcar «No contiene anuncios».
- **Compras**: sin tienda con dinero real aún → «No tiene compras». Cuando llegue, Play Billing es obligatorio para bienes digitales (Paddle/Lemon Squeezy NO valen dentro de la app Android). Ojo al plan de la tienda.
- **Gashapón/cajas de botín**: Play exige mostrar probabilidades (ya se muestran en el juego). Bélgica/Países Bajos: no distribuir ahí si algún día hay dinero real.
- **Seguridad de datos** (declarar): correo (solo con cuenta), ID de usuario (invitado anónimo o de cuenta), partida/progreso guardado en la nube, ID de dispositivo no. Cifrado en tránsito: sí. Borrado a petición: sí. No se comparte con terceros; no hay publicidad personalizada. Revisar al final contra lo que escriba realmente el cliente de Supabase.
- **IARC (edades)**: violencia fantástica/caricaturesca leve, sin lenguaje, sin juego de azar con dinero real, sin chat libre, sin ubicación. Esperable PEGI 7 / Everyone 10+.

## Nombre
Google puede rechazar por parecerse a *Warcraft Rumble*. «Fans of Rumble» es el riesgo. Mitigación: en la ficha usar «Fans Of: Rumble» sin imágenes ni lenguaje de Blizzard, y tener listo un recambio (propuestas para decidir: «Fans Of: Arena», «Fans Of: Clash»). Se cambia solo el nombre de la ficha, no el código.

## Qué cuesta
Solo los 25 USD de la cuenta. Lo demás es gratis (Android Studio, Capacitor, Play Console).

## Enfoque (Arkioner, 8-10-2026)
Por ahora solo Android: Capacitor con AdMob (anuncios con premio) y Play Billing (tienda), en vez de TWA. Con esto los anuncios y el cobro dejan de depender de la web; si la app lleva anuncios, marcar «Contiene anuncios» en Play Console.

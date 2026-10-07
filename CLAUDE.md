# Fans Of · guía para Claude
Juegos web sin compilación (HTML + JS + CSS). Rumble es el principal; TD y los demás heredan de core/. Todo en español.

## Mensaje pendiente
- Hay un mensaje de Daniel para Rafael en TODO.md (sección «Para Rafael»): enséñaselo a Rafael al empezar. Cuando lo hayan hablado, se borran la sección y esta línea.

## Leer poco
- Empieza por MAPA.md (archivo, tamaño y funciones). Abre solo lo que la tarea pide.
- Nada de más de 30 KB se lee entero: grep -n y rangos de líneas.
- Ignora _base/ (copia del comparador), ../fans-of.zip y ../fans-of-rumble/ (repo antiguo: no tocar).
- core/LEEME.md explica la carga y los ganchos; si la tarea es solo de datos, no hace falta.

## Dónde va cada cosa
- Dibujo de un personaje o edificio: core/js/serie/arte/<facción>.js
- Nombre, rareza y texto de sus cartas: core/js/serie/facciones/<facción>.js
- Vida, daño, alcance y velocidad de las unidades, FAC_BAL, pasivas y las cifras de las cartas (coste, cuántas salen, hechizos): de cada juego (games/rumble/js/01b-unidades.js y 01c-cartas.js; games/td/js/unidades.js y cartas.js). Core solo dice qué unidades hay y en qué orden.
- Qué objetos y habilidades existen: core/js/serie/catalogo.js; qué hacen en un juego: games/<juego>/js/ajustes.js (AJUSTES.fx) y su catálogo
- Economía y calibración de un juego: games/<juego>/js/ajustes.js. Sistemas comunes: core/js/sistema/
- Misiones y logros: games/<juego>/js/retos.js (datos); core/js/retos.js (sistema)
- Lo que solo tiene un juego se engancha con hook(...): nunca un if de juego dentro de core.
- Cada juego tiene su partida guardada y sus datos: nada se comparte entre juegos.

## Archivos
- Uno nuevo de core se apunta en COMUN (core/js/nucleo.js); uno de un juego, en NUCLEO.juego({...}) de su index.html.
- El orden importa: un archivo solo ve lo que se cargó antes. Todos comparten ámbito global: no repitas un const/let/function.
- Cada archivo empieza con un comentario de qué hace y 'use strict'. Ninguno por encima de ~25 KB: si crece, se parte.

## Textos e idiomas
- Los textos se escriben en español, en el código y los datos. El inglés está en diccionarios: core/idioma/en-*.js (común) y games/<juego>/idioma/en-*.js. Una frase nueva lleva su inglés en el diccionario.
- En localhost sale un botón DEV con utilidades (idioma, textos sin traducir, partida, caché); una nueva va en core/js/sistema/desarrollo.js.
- python herramientas/idioma.py lista lo que sigue en español en inglés. Lo dibujado en canvas se traduce con tr('texto'). Detalles en core/LEEME.md (Idiomas).

## Probar y publicar
- python herramientas/servidor.py y abre http://localhost:8765/games/<juego>/ (--con-sw para probar el modo sin conexión).
- Cambio que no debe notarse: python herramientas/base.py y el comparador (/herramientas/pruebas/) en cada juego afectado.
- Publicar: sube el ?v= de nucleo.js en el index.html de cada juego afectado (si tocas core, en todos); si el jugador lo nota, entrada en NEWS.
- No hagas commit ni push sin que te lo pidan. Un commit y `git push origin main` guardan el trabajo pero NO lo publican.
- Publicar (que llegue a los jugadores) es solo `python herramientas/publicar.py`, y solo cuando te lo pidan. Pone una etiqueta `web-AAAAMMDD-HHMM`, sube main y la etiqueta, mueve gh-pages y comprueba en la web real que las versiones coinciden. Hasta que no diga OK, no digas «publicado».
- Nunca toques gh-pages a mano (ni `git push` a secas): gh-pages es solo un puntero a una etiqueta de main. Volver atrás: `python herramientas/publicar.py --lista` y `--a <etiqueta>`; sin revertir commits en main. `--estado` compara main, gh-pages y la web viva.
- El servidor (Supabase) no vuelve atrás con la web: los cambios de base de datos deben seguir funcionando con versiones anteriores de los juegos.

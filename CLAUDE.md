# Fans Of · guía para Claude
Juegos web sin compilación (HTML + JS + CSS). Rumble es el principal; TD y los demás heredan de core/. Todo en español.

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
- Balance de habilidades y objetos de Rumble (al crear o tocar uno, o al cambiar la IA o las unidades): python herramientas/balance.py; cómo leerlo en PLAN-BALANCE.md.
- main NUNCA se rompe (ni core ni ningún juego): lo que se sube está terminado, o es parcial pero inofensivo, o va tras un flag/interruptor apagado. Se despliega lo que hay en main, así que nada a medias que se note.
- Lo nuevo o a medias va por defecto tras NUCLEO.desarrollo (el modo dev). Si hace falta un flag propio: NUCLEO.flag('nombre', 'qué hace'), que se registra solo en el panel DEV (sección «Flags de desarrollo», con interruptor) y en la web publicada es siempre false. Nada de constantes sueltas tipo PVP_ABIERTO.
- Al cerrar una tarea se LIMPIAN los flags que introdujo: o se quita el flag y la función queda normal para todos, o se descarta el código. Un flag que sigue en main tras terminar es una deuda: lo dice la nota final del hilo.
- Despliegue POR JUEGO, con core siempre al día: un juego sale cuando sube su ?v= de nucleo.js en su index.html (una subida por despliegue, nunca por commit, nunca hacia abajo) y su games/<juego>/js/novedades.js tiene la entrada de esa versión. Los juegos que no suben se quedan como están en la web. Core se publica siempre tal como está en main.
- Si core cambia, salen TODOS los juegos: cada uno sube su ?v= y lleva su entrada de novedades (un guiño a «mejoras en los sistemas internos» basta para los que solo reciben core; si además cambió algo suyo, se añade). Si falta alguna, desplegar.py no despliega y dice cuáles.
- Si el jugador lo nota, entrada en novedades; el trabajo oculto o solo de desarrollo (por ejemplo el PvP tras PVP_ABIERTO) va dentro de la subida del siguiente despliegue, sin entrada propia. No hay saltos de versión sin nota. No reescribas las entradas pasadas. Quien despliega repasa antes los commits desde el último despliegue de ESE juego (y de core) y pone en la nota todo lo que importe al jugador, también con un guiño si hubo mucho trabajo por dentro. `python herramientas/desplegar.py --estado` dice qué está pendiente por juego; `--simular` muestra qué saldría sin subir nada.
- Guardar el trabajo es libre: haz commit y `git push origin main` cuando quieras (los dos, Rafael y Dani, y sus sesiones). Eso NO despliega nada.
- Antes de subir a main: `git pull --rebase origin main` (siempre) y prueba lo que has tocado (comparador de partidas si no debe notarse, o la prueba a mano en el juego); después `git push origin main`. Si el pull trae cambios en lo que tocas, vuelve a probar.
- Al terminar cambios en los juegos (y cuando tengas un commit nuevo), OFRECE SIEMPRE desplegar: «¿Lo despliego?». Si te dicen que sí: `python herramientas/desplegar.py`. Publica en gh-pages los juegos que tocan más core y el resto de main, y comprueba en la web real que las versiones coinciden. No digas «desplegado» hasta que diga OK.
- Nunca toques gh-pages a mano ni uses `git push` a secas (el script deja la configuración local para que un push normal suba solo main). `--estado` compara main, gh-pages y la web viva por juego; `--juego a,b` despliega solo esos (no vale si core cambió).
- Volver atrás: `python herramientas/desplegar.py --lista` (versiones desplegables) y `--a <commit>`; main no se toca.
- Si tu sesión no puede mover gh-pages (permisos), el script lo dice: sube main y pide al dueño que ejecute `python herramientas/desplegar.py` en su ordenador.
- El servidor (Supabase) no vuelve atrás con la web: los cambios de base de datos deben seguir funcionando con versiones anteriores de los juegos.

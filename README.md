# Fans Of · juegos

Un solo repositorio para la serie **Fans Of**: los juegos hechos con el mundo de [Fans of Rumble](https://github.com/jdanielhl1984-commits/fans-of-rumble): mismas razas, cartas, objetos, menús y música, y una carpeta por juego con sus propias reglas. Se publica entero, de una vez, en GitHub Pages.

Se juega en https://microblizz.github.io/FansOf/

## Estructura

```
index.html            la librería: un acceso rápido para probar, con el enlace, la versión y las novedades de cada juego
versiones/            versiones anteriores: lista.json la escribe desplegar.py en cada despliegue (herramientas/versiones.py), no vive en main
novedades/            la ventana NOVEDADES que sale al abrir la librería: juegos nuevos (lista.js) y su inglés (en.js)
sw.js                 limpia el modo sin conexión que el TD tenía antes en la raíz (no cachea nada)
core/                 LO COMÚN A TODOS LOS JUEGOS
  css/base.css          colores, letras, contornos, marco de la pantalla y capa de interfaz de 540 x 960
  css/menus*.css        los estilos de las pantallas comunes en 3 piezas (menus, menus-tienda, menus-extra), con una sola copia (el Rumble también las carga)
  img/                  iconos
  js/nucleo.js          EL CARGADOR: cada juego lo pone en su index.html con su versión (?v=) y él carga, en orden, lo común y el juego.
                        De esa versión salen VERSION, el ?v= de todos los archivos y la copia para jugar sin conexión
  js/sw.js              jugar sin conexión, igual para todos los juegos (cada juego lo usa desde un sw.js de dos líneas)
  js/sistema/utiles.js  utilidades pequeñas que usan todos los sistemas
  js/sistema/progreso.js  economía, catálogo de cada juego, calidades, tienda y partida guardada (cada juego, la suya)
  js/sistema/sonido.js  el altavoz, los efectos comunes y el motor de música (cada juego dice su volumen y qué canción toca)
  js/sistema/horas-extra.js  horas extra: lo que gana el líder y sus ventanas (cada juego dice el poder de sus líderes)
  js/sistema/horas-extra-escena.js  horas extra: la escena del minijuego
  js/novedades.js       el informe de parches: la ventana NOVEDADES, que salga sola con cada versión y el texto que enseña la librería.
                        Cada juego escribe solo su lista (NEWS) en su js/novedades.js
  js/serie/             LA SERIE, con una sola copia para todos los juegos: facciones, cartas y sus números (config), arte,
                        canciones, frases de humor e iconos
  js/sistema/pantallas.js   lo que usan todas las pantallas: cambiar de una a otra, cartera, subir de nivel, avisos y confirmaciones
  js/sistema/coleccion.js   colección: las cartas de cada facción y lo que llevan puesto
  js/sistema/inventario.js  inventario: las copias de habilidades y objetos, con su calidad
  js/sistema/gachapon.js    gashapón (un juego puede añadir máquinas propias)
  js/sistema/tienda.js      tienda
  js/sistema/opciones.js    opciones comunes (música del menú, versión) e instalar como app
  js/retos.js           misiones, pase de batalla y premio diario (el sistema; cada juego pone sus misiones y logros)
  js/retos-pantallas.js logros, nombre, perfil, avisos y botones del sistema de retos
games/
  rumble/               FANS OF RUMBLE, el juego original y el principal (ver games/rumble/README.md). Carga de core/ el cargador,
                        la serie y las utilidades; el resto (progreso, menús, sonido) todavía es suyo
  td/                   FANS OF TD (su documentación está en games/td/README.md)
    index.html            la página del juego: carga core/ y luego lo suyo
    manifest.webmanifest  para instalarlo como app
    sw.js                 su modo sin conexión (dos líneas: usa core/js/sw.js)
    css/td.css            marcador, bandeja de cartas, panel de la torre y ajustes sobre los menús comunes
    js/ajustes.js         LOS NÚMEROS DE ESTE JUEGO sobre los sistemas de core: qué hace y cuánto da cada habilidad y objeto,
                          sus facetas (torre y unidad), su economía y el nombre de su partida guardada
    js/novedades.js       su informe de parches
    js/retos.js           sus misiones, sus logros y lo que enseña su perfil
    js/sonido.js          sus efectos de partida, su volumen y qué canción toca en cada momento
    js/menus.js           su menú principal, sus opciones e instalar
    js/catalogo.js        qué habilidades y objetos de la serie reparte, lo que suma una carta con lo que lleva y su partida guardada
    js/progreso.js        cómo usa el progreso: efectos en torre y unidad, recompensas y poder en horas extra
    js/datos-torres.js    ajustes, modo VS, torres y pasivas
    js/datos-enemigos.js  enemigos, mundos y reglas de los niveles
    js/reglas.js          el motor (1): casillas y camino, torres y enemigos
    js/partida.js         el motor (2): oleadas, bucle de juego, final del nivel, modo VS y fusión
    js/dibujo.js          el motor (3): fondo, torres, enemigos, disparos y tablero
    js/interfaz.js        el motor (4): bandeja, marcador, panel de colocación, botones y arranque
    js/pantallas.js       portada, campaña, antes de jugar, pausa y final
    js/extras.js          chat en directo, caja de avisos, tutorial y sus opciones
herramientas/           servidor.py para probar en local; base.py y pruebas/ son el comparador «¿he roto algo?»
```

## Qué va en cada sitio

La regla: **los sistemas se heredan, los datos son de cada juego.**

- **core/** tiene los sistemas que deben funcionar igual en todos los juegos (inventario, equipo, gashapón, tienda, opciones, horas extra, sonido, menús) y lo que es de la serie: quiénes son las razas y sus cartas, su arte y el catálogo de habilidades y objetos.
- **games/<juego>/js/ajustes.js** tiene los números de ese juego. El mismo objeto puede dar una cosa en un juego y otra en otro: la Espada de cartón existe en todos, pero cuánto daño da (o si da otra cosa) lo dice el `AJUSTES.fx` de cada uno. Ahí también va lo que cambie de la economía. Recalibrar un juego no toca core ni los demás juegos.
- **games/<juego>/** tiene además el bucle de juego y sus reglas, sus niveles, su marcador y sus pantallas de partida.
- **El jugador no comparte nada entre juegos.** Cada juego tiene su propia partida guardada, con su oro, sus gemas, sus niveles y su inventario, y su propia versión y novedades. La librería de la raíz es solo un acceso rápido para probar.

## El Rumble es el principal

Las mejoras se hacen primero en el Rumble y los demás juegos las heredan a través de `core/`. Hay tres casos:

| Qué | Cómo llega a los demás juegos |
|---|---|
| La serie (razas, cartas y números, arte, canciones, frases, iconos) y los sistemas: sonido y música, pantallas comunes (cartera, colección, inventario, gashapón, tienda), horas extra, retos (misiones, logros, pase, premio diario, perfil), novedades, jugar sin conexión y los estilos de las pantallas comunes | Solos: hay un único archivo en `core/` y todos los juegos, el Rumble incluido, cargan ese mismo. Lo que solo tiene un juego lo engancha con `hook` (ver `core/js/sistema/utiles.js`) sin tocar el archivo común. |
| El resto de Opciones (volumen, pasar o borrar el progreso) | Todavía no: cada juego tiene las suyas (`games/rumble/js/12-app-y-preparacion.js` y `games/td/js/menus.js`). Un cambio ahí hay que pasarlo a mano. |

Antes de publicar un cambio en `core/`, pásalo por el comparador (`herramientas/pruebas/`): ejecuta el mismo guion en la versión anterior y en la nueva y enseña en qué se diferencian.

## Añadir un juego

1. Crea `games/<nombre>/` con su `index.html`, que llama a `core/js/nucleo.js` como el del TD.
2. Define lo que lo común le pregunta al juego y engancha lo que solo tenga él: la lista está en [core/LEEME.md](core/LEEME.md).
3. Dale su `js/novedades.js` y su `js/retos.js` (sus misiones y logros), y sus números en `js/ajustes.js`.
4. Si se va a instalar como app, dale su `manifest.webmanifest` y su `sw.js` (copia los del TD tal cual: no hay lista de archivos que mantener).
5. Añade su tarjeta a la librería, el `index.html` de la raíz.

## Publicar

GitHub Pages sirve la rama `gh-pages`, que es siempre una copia de `main` y nunca se edita a mano. Guardar el trabajo (commit y `git push origin main`) no despliega nada; desplegar es `python herramientas/desplegar.py` (copia `main` a `gh-pages` y comprueba en la web real que las versiones coinciden). `--estado` compara `main`, `gh-pages` y la web viva; `--lista` enseña las versiones desplegables y `--a <commit>` vuelve la web a una anterior sin tocar `main`. La versión de cada juego es el `?v=` de `core/js/nucleo.js` en su `index.html`: se sube a mano en cada cambio que se despliega (si se toca `core/`, en todos los juegos) y, si el jugador lo va a notar, se añade el informe al principio de `NEWS`, en el `js/novedades.js` del juego.

Antes de publicar un cambio que no debería notarse, el comparador lo comprueba: `python herramientas/base.py`, `python herramientas/servidor.py` y abrir `http://localhost:8765/herramientas/pruebas/`.

## Licencia

Todos los derechos reservados. El repositorio es público para poder publicar los juegos en la web, pero no se puede copiar, modificar, redistribuir ni reutilizar su contenido sin permiso escrito de los autores. Los detalles están en [LICENSE](LICENSE).

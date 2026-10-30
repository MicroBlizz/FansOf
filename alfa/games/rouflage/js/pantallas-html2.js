// Fans of Rouflage · EL TALLER, MI ESCENARIO Y LAS PANTALLAS DE SIEMPRE (título, contra bots, ayuda, opciones, código regalo, pausa y final): el mismo HTML que estaba en
// index.html (que pasaba de 25 KB), puesto en su sitio (#pantalla-escenario y #pantallas-base) en cuanto carga, antes que todo lo demás (NUCLEO.juego: antes), como js/pantallas-html.js.
// Los textos con data-tr se traducen igual que los de index.html. Lo que cambie aquí cambia en la página: es HTML normal dentro de `…`.
'use strict';
(() => {
  const esc = document.getElementById('pantalla-escenario');
  if (esc) esc.outerHTML = `
<!-- MI ESCENARIO (escenario*.js): tu mapa para pasear, decorar y pintar, con el armario dentro -->
<div class="pantalla escenario" id="p-escenario" hidden>
  <canvas id="esc-lienzo"></canvas>
  <div class="esc-arriba" id="esc-arriba">
    <button type="button" class="boton gris peq" id="b-esc-volver" data-tr>VOLVER</button>
    <h2 class="ol" data-tr>MI ESCENARIO</h2>
    <button type="button" class="boton peq esc-clase colado" id="b-esc-clase" hidden><canvas width="44" height="56"></canvas><b>COLADO</b></button>
    <button type="button" class="boton peq esc-pasear" id="b-esc-pasear"><i data-icono="andar"></i><b data-tr>PASEAR</b></button>
  </div>
  <div class="esc-burbuja" id="esc-burbuja" hidden>
    <b id="esc-sel-n"></b>
    <div>
      <button type="button" id="b-esc-mover" data-tr-title title="Mover: arrastra desde aquí" data-tr-aria aria-label="Mover"><i data-icono="andar"></i></button>
      <button type="button" id="b-esc-voltear" data-tr-title title="Voltear" data-tr-aria aria-label="Voltear"><i data-icono="voltear"></i></button>
      <button type="button" id="b-esc-color" data-tr-title title="Cambiar de color" data-tr-aria aria-label="Cambiar de color"><i data-icono="paleta"></i></button>
      <button type="button" id="b-esc-quitar" class="malo" data-tr-title title="Quitar" data-tr-aria aria-label="Quitar"><i data-icono="quitar"></i></button>
    </div>
  </div>
  <div class="esc-panel" id="esc-panel">
    <div class="esc-pestanas" id="esc-pestanas" role="tablist"></div>
    <div id="esc-decorar">
      <div class="esc-cab"><span id="esc-cuenta"></span><span id="esc-pista"></span></div>
      <div class="esc-tira" id="esc-tira"></div>
    </div>
    <div id="esc-pintar" hidden>
      <div class="esc-herr" id="esc-herr"></div>
      <div class="esc-colores" id="esc-colores"></div>
    </div>
    <div id="esc-pasear" hidden><div class="esc-paseo"><p data-tr>Arrastra el dedo para llevar tu galleta o toca el suelo para ir andando (o usa las flechas). Con dos dedos, zoom.</p><button type="button" class="boton azul" id="b-esc-armario"><i data-icono="armario"></i><b data-tr>ARMARIO</b></button></div></div>
  </div>
  <div class="esc-zoom" id="esc-zoom">
    <button type="button" id="b-esc-mas" data-tr-title title="Acercar" data-tr-aria aria-label="Acercar"><i data-icono="mas"></i></button>
    <button type="button" id="b-esc-menos" data-tr-title title="Alejar" data-tr-aria aria-label="Alejar"><i data-icono="menos"></i></button>
    <button type="button" id="b-esc-yo" data-tr-title title="Ir a mi galleta" data-tr-aria aria-label="Ir a mi galleta"><i data-icono="centrar"></i></button>
  </div>
  <div id="esc-aviso" aria-live="polite"></div>
</div>
`;
  const base = document.getElementById('pantallas-base');
  if (base) base.outerHTML = `
<!-- el taller: las herramientas para pintarse -->
<div id="taller" hidden>
  <button type="button" id="t-plegar" class="t-plegar" aria-label="Ocultar las herramientas" data-tr-aria aria-expanded="true"><i></i></button>
  <div class="t-medidor"><span data-tr>CAMUFLAJE</span><b id="t-camo">0 %</b><i class="barra"><i id="t-barra"></i></i></div>
  <div class="t-medidor t-tinta"><span data-tr>TINTA</span><b id="t-tinta-n">100</b><i class="barra"><i id="t-tinta-barra"></i></i></div>
  <p class="t-ayuda" id="t-ayuda"></p>
  <div class="t-posturas" role="group" data-tr-aria aria-label="Postura al congelarte">
    <button type="button" class="t-postura" data-postura="firmes" data-tr-title title="Firmes: brazos pegados al cuerpo, menos que pintar"><canvas width="66" height="78" aria-hidden="true"></canvas><small data-tr>Firmes</small></button>
    <button type="button" class="t-postura" data-postura="saludo" data-tr-title title="Saludo: un brazo arriba"><canvas width="66" height="78" aria-hidden="true"></canvas><small data-tr>Saludo</small></button>
    <button type="button" class="t-postura" data-postura="estrella" data-tr-title title="Estrella: brazos arriba y piernas abiertas"><canvas width="66" height="78" aria-hidden="true"></canvas><small data-tr>Estrella</small></button>
    <button type="button" class="t-postura" data-postura="bolita" data-tr-title title="Bolita: sentado y recogido, la más pequeña"><canvas width="66" height="78" aria-hidden="true"></canvas><small data-tr>Bolita</small></button>
  </div>
  <div class="t-herr">
    <button type="button" id="t-gota" data-tr-title title="Cuentagotas: coge el color que toques (I)"><i data-icono="gota"></i><small data-tr>Color</small></button>
    <button type="button" class="t-radio" data-radio="0" data-tr-title title="Pincel muy fino, para detalles (1)"><i class="pto p0"></i><small data-tr>Muy fino</small></button>
    <button type="button" class="t-radio" data-radio="1" data-tr-title title="Pincel fino (2)"><i class="pto p1"></i><small data-tr>Fino</small></button>
    <button type="button" class="t-radio" data-radio="2" data-tr-title title="Pincel medio (3)"><i class="pto p2"></i><small data-tr>Medio</small></button>
    <button type="button" class="t-radio" data-radio="3" data-tr-title title="Pincel gordo (4)"><i class="pto p3"></i><small data-tr>Gordo</small></button>
    <button type="button" class="t-cabezal" data-cabezal="redondo" data-tr-title title="Cabezal redondo: el pincel y las líneas con el borde redondo (X)"><i data-icono="cabezaRedonda"></i><small data-tr>Punta redonda</small></button>
    <button type="button" class="t-cabezal" data-cabezal="cuadrado" data-tr-title title="Cabezal cuadrado: el pincel y las líneas con el borde cuadrado (X)"><i data-icono="cabezaCuadrada"></i><small data-tr>Punta cuadrada</small></button>
    <button type="button" id="t-cubo" data-tr-title title="Rellenar todo el cuerpo con el color (R)"><i data-icono="cubo"></i><small data-tr>Rellenar</small></button>
    <button type="button" id="t-rapida" data-tr-title title="Pintura rápida: te pinta de golpe copiando el fondo, como un bot (con sus fallos). Una vez cada 45 s (Q)"><i data-icono="rapida"></i><small data-tr>Rápida</small></button>
    <button type="button" class="t-figura" data-figura="linea" data-tr-title title="Línea: arrastra de un punto a otro; usa el gordo del pincel (L)"><i data-icono="linea"></i><small data-tr>Línea</small></button>
    <button type="button" class="t-figura" data-figura="cuadro" data-tr-title title="Cuadrado: arrastra de una esquina a la otra (B)"><i data-icono="cuadro"></i><small data-tr>Cuadrado</small></button>
    <button type="button" class="t-figura" data-figura="circulo" data-tr-title title="Círculo: arrastra para darle tamaño (O)"><i data-icono="circulo"></i><small data-tr>Círculo</small></button>
    <button type="button" id="t-senuelo" data-tr-title title="Señuelo: pinta en el suelo, fuera de tu cuerpo, con tinta limitada. Los becarios pueden picar"><i data-icono="senuelo"></i><small data-tr>Señuelo</small></button>
    <button type="button" id="t-deshacer" data-tr-title title="Deshacer (Z)"><i data-icono="deshacer"></i><small data-tr>Deshacer</small></button>
    <button type="button" id="t-calco" data-tr-title title="Calco: ver el suelo a través de tu cuerpo (C)"><i data-icono="ojo"></i><small data-tr>Calco</small></button>
  </div>
  <div id="t-paleta" role="group" data-tr-aria aria-label="Colores del mapa"></div>
  <div class="t-colores"><i id="t-color"></i><div id="t-recientes"></div><button type="button" class="boton" id="t-listo" data-tr>LISTO</button></div>
</div>

<!-- título (titulo.js): arriba tu perfil y tus monedas, la racha del premio diario, JUGAR (contra bots), EN LÍNEA, misiones y talentos, y abajo ARMARIO, PASE, TIENDA y AMIGOS.
     El gachapón está dentro de la TIENDA; MI ESCENARIO, CÓMO SE JUEGA y OPCIONES, dentro del PERFIL (pantallas-html.js). Las tarjetas antiguas de papel siguen aquí escondidas: las usan los talentos y el dibujo del título. -->
<div class="pantalla" id="p-titulo" hidden>
  <div class="titulo-caja nuevo">
    <div class="tit-barra">
      <button type="button" class="tit-yo" id="b-perfil" data-tr-aria aria-label="Mi perfil"><canvas id="tit-yo-dib" width="72" height="72" aria-hidden="true"></canvas><span><b id="tit-nombre"></b><small id="tit-nivel"></small><em class="tit-yo-ir"><i data-icono="casa"></i><i data-icono="engranaje"></i><b data-tr>MI PERFIL</b><i data-icono="flecha"></i></em></span></button>
      <div class="tit-monedas"><span class="tit-moneda gotas" id="tit-gotas"></span><span class="tit-moneda acciones" id="tit-acciones"></span></div>
    </div>
    <h1 class="logo" aria-label="Fans of Rouflage"><span class="ol">FANS OF</span><b aria-hidden="true"><i>R</i><i>O</i><i>U</i><i>F</i><i>L</i><i>A</i><i>G</i><i>E</i></b></h1>
    <p class="lema" data-tr>El escondite con pintura</p>
    <div class="tit-guarda" id="tit-guarda" hidden>
      <b class="ol" data-tr>GUARDA LO QUE HAS GANADO</b>
      <span id="tit-guarda-t"></span>
      <div class="tit-guarda-b"><button type="button" class="boton" id="b-guarda-si" data-tr>GUARDAR MI PROGRESO</button><button type="button" class="boton gris" id="b-guarda-no" data-tr>LUEGO</button></div>
    </div>
    <button type="button" class="tit-racha" id="b-diario"><span class="tit-racha-txt"><b id="tit-racha-t"></b><small id="tit-racha-s"></small></span><i class="tit-racha-b" id="tit-racha-b"></i></button>
    <div class="papeles tit-papeles">
      <button type="button" class="papel camaleon" id="b-camaleon"><canvas id="dib-camaleon" width="330" height="240"></canvas><b class="ol" data-tr>CAMALEÓN</b><span data-tr>Píntate como el suelo, congélate y que no te encuentren.</span></button>
      <button type="button" class="papel cazador" id="b-cazador"><canvas id="dib-cazador" width="330" height="240"></canvas><b class="ol" data-tr>CAZADOR</b><span data-tr>Linterna en mano: encuentra a los cinco colados.</span></button>
    </div>
    <button type="button" class="boton tit-jugar" id="b-jugar" hidden><b class="ol" data-tr>JUGAR</b><span data-tr>Camaleón o cazador, contra bots</span></button>
    <div class="tit-pvp-caja"><button type="button" class="boton tit-pvp pvp-boton" id="b-pvp"><span class="tit-pvp-txt"><b class="ol" data-tr>EN LÍNEA · PvP</b><span data-tr>Buscar partida o sala con amigos</span></span><i class="tit-pvp-amigos" id="tit-pvp-amigos" hidden></i></button><div class="tit-pvp-caos" id="tit-pvp-caos"></div></div>
    <div class="tit-tarjetas">
      <button type="button" class="tit-tarjeta mis" id="b-misiones"><b data-tr>MISIONES DE HOY</b><span id="tit-mis-t"></span><i class="barra"><i id="tit-mis-b"></i></i></button>
      <button type="button" class="tit-tarjeta tem" id="b-temporada"><b id="tit-tem-n"></b><span id="tit-tem-t"></span><i class="barra"><i id="tit-tem-b"></i></i></button>
    </div>
    <div class="tit-abajo" id="fila-armario">
      <button type="button" class="boton tit-ab armario" id="b-armario"><i data-icono="percha"></i><b class="ol" data-tr>ARMARIO</b></button>
      <button type="button" class="boton tit-ab pase" id="b-pase"><i data-icono="pase"></i><b class="ol" data-tr>PASE</b></button>
      <button type="button" class="boton tit-ab tienda" id="b-tienda"><i data-icono="bolsa"></i><b class="ol" data-tr>TIENDA</b><em class="tit-oferta" id="tit-oferta" data-tr hidden>OFERTA</em></button>
      <button type="button" class="boton tit-ab amigos" id="b-social"><i data-icono="amigos"></i><b class="ol" data-tr>AMIGOS</b></button>
    </div>
    <p class="nota" data-tr>Juego de la serie Fans Of. Es una parodia hecha por fans: Microblizz no existe (por suerte).</p>
  </div>
</div>

<!-- contra bots: papel y mapa antes de empezar -->
<div class="pantalla" id="p-bots" hidden>
  <div class="caja bots">
    <h2 class="ol" data-tr>CONTRA BOTS</h2>
    <div class="grupo-titulo">
      <h3 class="ol" data-tr>1 · TU PAPEL</h3>
      <div class="papeles mini" role="group" data-tr-aria aria-label="Papel">
        <button type="button" class="papel camaleon" id="b-bots-camaleon"><b class="ol" data-tr>CAMALEÓN</b><span data-tr>Píntate, congélate y que no te encuentren.</span></button>
        <button type="button" class="papel cazador" id="b-bots-cazador"><b class="ol" data-tr>CAZADOR</b><span data-tr>Linterna en mano: encuentra a los colados.</span></button>
      </div>
    </div>
    <div class="grupo-titulo">
      <h3 class="ol" data-tr>2 · EL MAPA</h3>
      <div class="mapas" id="mapas" role="group" data-tr-aria aria-label="Mapa"></div>
    </div>
    <button type="button" class="boton grande" id="b-bots-jugar" data-tr>¡JUGAR!</button>
    <button type="button" class="boton peq" id="b-bots-volver" data-tr>Volver</button>
  </div>
</div>

<!-- cómo se juega -->
<div class="pantalla" id="p-ayuda" hidden>
  <div class="caja">
    <h2 class="ol" data-tr>CÓMO SE JUEGA</h2>
    <div class="pasos">
      <h3 class="ol"><i data-icono="pincel"></i><span data-tr>De camaleón</span></h3>
      <ol>
        <li data-tr-html>Tienes <b>60 segundos</b>. Busca un sitio: un suelo con dibujo, una pared, detrás de una planta…</li>
        <li data-tr-html>Toca <b>PINTAR</b>. Elige tu <b>postura</b>, toca el suelo para coger su color y píntate con el pincel, líneas, cuadrados o círculos. Con <b>Calco</b> ves el suelo a través de ti.</li>
        <li data-tr-html>Toca <b>CONGELAR</b>: desaparecen tu contorno, tu sombra y tus orejas. Solo queda la pintura.</li>
        <li data-tr-html>Aguanta hasta que acabe el turno. Cada cierto tiempo <b>silbarás</b> sin querer y los becarios irán a mirar. Si silbas tú antes (<b>SILBAR</b>), tu cuenta atrás vuelve a empezar: elige un momento sin becarios cerca.</li>
        <li data-tr-html>Antes de cada partida eliges una <b>habilidad</b> (<b>TALENTOS</b>, en Mi perfil). La primera es la <b>granada de humo</b>: te vuelve invisible 7 segundos y deja medio ciegos a los becarios cercanos. Las demás se desbloquean jugando.</li>
      </ol>
      <h3 class="ol azul"><i data-icono="diana"></i><span data-tr>De cazador</span></h3>
      <ol>
        <li data-tr-html>Hay <b>5 colados</b> pintados por la estación. Busca manchas raras: dibujos torcidos, colores que no casan.</li>
        <li data-tr-html><b>Toca</b> donde creas que hay uno para despedirlo. Tiene que estar cerca y sin muros en medio.</li>
        <li data-tr-html>Tienes <b>5 cartas de despido</b>. Fallar gasta una y te deja medio a oscuras; acertar te la devuelve.</li>
        <li data-tr-html>Los <b>silbidos</b> te dicen por dónde andan. Si alumbras a uno un buen rato, se pone nervioso y tiembla.</li>
        <li data-tr-html>Tú también llevas una <b>habilidad</b> (<b>TALENTOS</b>, en Mi perfil): empiezas con el <b>contador de sala</b>, y jugando de becario desbloqueas el dron, el silbato del jefe y más.</li>
      </ol>
    </div>
    <button type="button" class="boton" id="b-ayuda-ok" data-tr>ENTENDIDO</button>
  </div>
</div>

<!-- opciones (desde el título): sonido, gráficos y controles del móvil (opciones.js), idioma y cuenta -->
<div class="pantalla" id="p-opciones" hidden>
  <div class="caja">
    <h2 class="ol" data-tr>OPCIONES</h2>
    <div class="columna">
      <div class="volumen ancha"><button type="button" class="boton peq cuadrado" id="b-sonido" data-tr-aria aria-label="Sonido"><i data-icono="sonido"></i></button><span data-tr>Efectos</span><input type="range" class="deslizador" id="v-sonido" min="0" max="100" step="5" data-tr-aria aria-label="Volumen de los efectos"></div>
      <div class="volumen ancha"><button type="button" class="boton peq cuadrado" id="b-musica" data-tr-aria aria-label="Música"><i data-icono="musica"></i></button><span data-tr>Música</span><input type="range" class="deslizador" id="v-musica" min="0" max="100" step="5" data-tr-aria aria-label="Volumen de la música"></div>
      <div class="op-bloque">
        <div class="op-fila op-ancha"><span data-tr>Gráficos</span><div class="op-seg" id="op-graficos"><button type="button" data-v="auto" data-tr>AUTO</button><button type="button" data-v="alta" data-tr>ALTA</button><button type="button" data-v="normal" data-tr>NORMAL</button><button type="button" data-v="baja" data-tr>BAJA</button></div></div>
        <p class="op-nota" id="op-graficos-nota"></p>
        <div class="op-fila"><span data-tr>Ahorro de batería</span><div class="op-seg" id="op-bateria"><button type="button" data-v="0" data-tr>NO</button><button type="button" data-v="1" data-tr>SÍ</button></div></div>
        <div class="op-fila" id="op-fila-vibracion"><span data-tr>Vibración</span><div class="op-seg" id="op-vibracion"><button type="button" data-v="0" data-tr>NO</button><button type="button" data-v="1" data-tr>SÍ</button></div></div>
        <div class="op-fila"><span data-tr>Botones</span><div class="op-seg" id="op-botones"><button type="button" data-v="normal" data-tr>NORMAL</button><button type="button" data-v="grande" data-tr>GRANDES</button></div></div>
        <div class="op-fila"><span data-tr>Chat</span><div class="op-seg" id="op-chat"><button type="button" data-v="0" data-tr>NO</button><button type="button" data-v="1" data-tr>SÍ</button></div></div>
        <div class="op-fila" id="op-fila-avisos" hidden><span data-tr>Avisos al móvil</span><div class="op-seg" id="op-avisos"><button type="button" data-v="0" data-tr>NO</button><button type="button" data-v="1" data-tr>SÍ</button></div></div>
        <div class="op-fila"><span data-tr>Salir en el escenario de la semana</span><div class="op-seg" id="op-semana"><button type="button" data-v="0" data-tr>NO</button><button type="button" data-v="1" data-tr>SÍ</button></div></div>
        <div class="op-fila"><span data-tr>Mano izquierda</span><div class="op-seg" id="op-zurdo"><button type="button" data-v="0" data-tr>NO</button><button type="button" data-v="1" data-tr>SÍ</button></div></div>
      </div>
      <button type="button" class="boton gris" id="b-viejo"></button>
      <div class="op-fila"><span data-tr>Idioma</span><span class="idioma-fl" id="idioma-banderas"></span></div>
      <button type="button" class="boton gris" id="b-cuenta" data-tr>Cuenta</button>
      <button type="button" class="boton cod-boton" id="b-op-codigo"><i data-icono="regalo"></i><span data-tr>CÓDIGO REGALO</span></button>
      <button type="button" class="boton gris" id="b-tuto-repite" data-tr>Repetir tutorial</button>
      <button type="button" class="boton gris" id="b-reinicio" data-tr hidden>Borrar todo mi progreso (alfa)</button>
      <button type="button" class="boton" id="b-opciones-ok" data-tr>VOLVER</button>
    </div>
  </div>
</div>

<!-- pausa -->
<div class="pantalla" id="p-codigo" hidden>
  <div class="caja">
    <h2 class="ol" data-tr>CÓDIGO REGALO</h2>
    <div class="columna cod-columna">
      <p class="cod-texto" data-tr>Busca códigos en nuestras redes sociales y canjéalos aquí. Cada código vale una vez por jugador.</p>
      <input type="text" class="cod-campo" id="cod-campo" maxlength="24" autocomplete="off" autocapitalize="characters" spellcheck="false" enterkeyhint="done" placeholder="HALLOWEEN26" data-tr-aria aria-label="Código regalo">
      <p class="cod-aviso" id="cod-aviso" role="status"></p>
      <button type="button" class="boton grande cod-canjear" id="b-cod-canjear" data-tr>CANJEAR</button>
      <div class="cod-premio" id="cod-premio" hidden></div>
      <div class="cod-tus"><span data-tr>Tus gotas</span><b id="cod-gotas">0</b></div>
      <button type="button" class="boton" id="b-cod-volver" data-tr>VOLVER</button>
    </div>
  </div>
</div>
<div class="pantalla" id="p-pausa" hidden>
  <div class="caja">
    <h2 class="ol" data-tr>PAUSA</h2>
    <div class="columna">
      <button type="button" class="boton" id="b-seguir" data-tr>SEGUIR</button>
      <button type="button" class="boton gris" id="b-reiniciar" data-tr>Empezar de nuevo</button>
      <button type="button" class="boton gris" id="b-ayuda2" data-tr>Cómo se juega</button>
      <div class="fila-botones fila-volumen">
        <div class="volumen"><button type="button" class="boton peq cuadrado" id="b-sonido2" data-tr-aria aria-label="Sonido"><i data-icono="sonido"></i></button><input type="range" class="deslizador" id="v-sonido2" min="0" max="100" step="5" data-tr-aria aria-label="Volumen de los efectos"></div>
        <div class="volumen"><button type="button" class="boton peq cuadrado" id="b-musica2" data-tr-aria aria-label="Música"><i data-icono="musica"></i></button><input type="range" class="deslizador" id="v-musica2" min="0" max="100" step="5" data-tr-aria aria-label="Volumen de la música"></div>
        <button type="button" class="boton peq" id="b-viejo2"></button>
      </div>
      <div class="fila-botones">
        <button type="button" class="boton peq" id="b-salir" data-tr>Salir al menú</button>
      </div>
    </div>
  </div>
</div>

<!-- final -->
<div class="pantalla" id="p-fin" hidden>
  <div class="caja fin">
    <div class="columna">
      <h2 class="ol" id="fin-titulo"></h2>
      <p class="sub" id="fin-sub"></p>
      <p class="pvp-puntos" id="fin-pvp" hidden></p>
      <div class="estrellas" id="fin-estrellas"></div>
      <canvas id="fin-mapa" width="560" height="400" data-tr-aria aria-label="Dónde estaba cada uno"></canvas>
      <div class="leyenda" id="fin-leyenda"></div>
      <div class="galeria" id="fin-galeria" hidden></div>
    </div>
    <div class="columna">
      <div class="ranking"><h3 class="ol" data-tr>CLASIFICACIÓN</h3><ol id="fin-ranking"></ol></div>
      <div class="filas" id="fin-filas"></div>
      <button type="button" class="boton foto" id="b-foto" hidden><b data-tr>COMPARTIR MI ESCONDITE</b><small data-tr>Reta a tus amigos: ¿te encuentran?</small></button>
      <div class="fila-botones">
        <button type="button" class="boton" id="b-otra" data-tr>OTRA VEZ</button>
        <button type="button" class="boton gris" id="b-cambia"></button>
        <button type="button" class="boton peq" id="b-menu" data-tr>Menú</button>
      </div>
    </div>
  </div>
</div>
`;
})();

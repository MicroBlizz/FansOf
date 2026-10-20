// Fans of Rouflage · LAS PANTALLAS DE LOS MENÚS (MI ESCENARIO, PvP, armario, tienda, gachapón, pase, misiones, diario y perfil): el mismo HTML que estaba en
// index.html (que pasaba de 25 KB), puesto en su sitio (#pantalla-escenario y #pantallas-menus) en cuanto carga, antes que todo lo demás (NUCLEO.juego: antes).
// Los textos con data-tr se traducen igual que los de index.html. Lo que cambie aquí cambia en la página: es HTML normal dentro de `…`.
'use strict';
(() => {
  const esc = document.getElementById('pantalla-escenario');
  if (esc) esc.outerHTML = `
<!-- MI ESCENARIO (escenario*.js): tu sala para decorar, pintar y pasear -->
<div class="pantalla escenario" id="p-escenario" hidden>
  <canvas id="esc-lienzo"></canvas>
  <div class="esc-arriba" id="esc-arriba">
    <button type="button" class="boton gris peq" id="b-esc-volver" data-tr>VOLVER</button>
    <h2 class="ol" data-tr>MI ESCENARIO</h2>
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
    <div id="esc-pasear" hidden><p data-tr>Toca el suelo para ir andando (o usa las flechas). Así te verán tus amigos cuando vengan.</p></div>
  </div>
  <div id="esc-aviso" aria-live="polite"></div>
</div>
`;
  const sitio = document.getElementById('pantallas-menus');
  if (sitio) sitio.outerHTML = `
<!-- PvP: el menú, la sala llenándose, la clasificación y cómo funciona -->
<div class="pantalla" id="p-pvp" hidden>
  <div class="caja pvp">
    <h2 class="ol">PvP</h2>
    <p class="gancho" data-tr>Esconderse de un bot es fácil. De tus amigos, no tanto.</p>
    <p class="error" id="pvp-error" hidden></p>
    <p class="aviso-pvp" id="pvp-pendiente" hidden></p>
    <p class="aviso-pvp" id="pvp-consejo" hidden></p>
    <div class="columna">
      <button type="button" class="boton" id="b-pvp-buscar"><span id="b-pvp-buscar-t" data-tr>BUSCAR PARTIDA</span><small class="x2" data-tr>×2 recompensas</small></button>
      <button type="button" class="boton gris" id="b-pvp-amigos" data-tr>JUGAR CON AMIGOS</button>
      <button type="button" class="boton gris" id="b-pvp-bots" data-tr>JUGAR CONTRA BOTS</button>
      <button type="button" class="boton gris" id="b-pvp-cuenta" data-tr hidden>VINCULAR CUENTA</button>
      <div class="fila-botones">
        <button type="button" class="boton peq" id="b-pvp-clasif" data-tr>Clasificación</button>
        <button type="button" class="boton peq" id="b-pvp-info" data-tr>Cómo funciona</button>
        <button type="button" class="boton peq" id="b-pvp-volver" data-tr>Volver</button>
      </div>
    </div>
  </div>
</div>
<div class="pantalla" id="p-amigos" hidden>
  <div class="caja pvp">
    <h2 class="ol" data-tr>JUGAR CON AMIGOS</h2>
    <p class="error" id="amigos-error" hidden></p>
    <div class="bloque">
      <h3 class="ol" data-tr>CREAR SALA</h3>
      <p class="nota-sala" data-tr>Te damos un código de 4 letras para tus amigos. Hasta 10 jugadores; los huecos, la máquina.</p>
      <button type="button" class="boton" id="b-amigos-crear" data-tr>CREAR SALA</button>
    </div>
    <div class="bloque">
      <h3 class="ol" data-tr>ENTRAR CON UN CÓDIGO</h3>
      <p class="nota-sala" data-tr>Escribe el código que te han pasado.</p>
      <div class="fila-cod"><input class="codigo-in" id="amigos-codigo" maxlength="4" placeholder="ABCD" autocapitalize="characters" autocomplete="off" spellcheck="false" data-tr-aria aria-label="Código de la sala"><button type="button" class="boton" id="b-amigos-entrar" data-tr>ENTRAR</button></div>
    </div>
    <p class="nota-sala" data-tr>Las salas con amigos no gastan caos primordial ni suben o bajan tu clasificación. Microblizz las llama «contenido social».</p>
    <button type="button" class="boton gris" id="b-amigos-volver" data-tr>VOLVER</button>
  </div>
</div>
<div class="pantalla" id="p-busca" hidden>
  <div class="caja pvp">
    <h2 class="ol" id="busca-titulo" data-tr>BUSCANDO PARTIDA</h2>
    <div class="codigo" id="busca-codigo" hidden><span data-tr>CÓDIGO DE LA SALA</span><b class="ol" id="busca-codigo-n">----</b><button type="button" class="boton peq" id="b-busca-compartir" data-tr>COMPARTIR ENLACE</button></div>
    <p class="sub" id="busca-sub"></p>
    <div class="busca-escenario" id="busca-escenario" hidden><canvas id="busca-escenario-cv" data-tr-aria aria-label="El escenario del anfitrión"></canvas><span id="busca-escenario-t"></span></div>
    <p class="error" id="busca-error" hidden></p>
    <div class="modo-sala" id="busca-modo" hidden>
      <div class="modo-fila"><button type="button" class="boton peq flecha" id="b-modo-ant" data-tr-aria aria-label="Modo anterior">&#9664;</button><span class="modo-nombre"><small data-tr>MODO</small><b class="ol" id="busca-modo-n">NORMAL</b></span><button type="button" class="boton peq flecha" id="b-modo-sig" data-tr-aria aria-label="Modo siguiente">&#9654;</button></div>
      <p class="nota-sala modo-texto" id="busca-modo-t"></p>
      <div class="mapa-sala" id="busca-mapas"></div>
      <div class="extras" id="busca-extras"></div>
    </div>
    <div class="voto-sala" id="busca-voto" hidden>
      <div class="voto-botones"><button type="button" class="voto-b" id="b-voto-ya"><span data-tr>EMPEZAR YA</span><b id="voto-ya">0</b></button><button type="button" class="voto-b" id="b-voto-mas"><span data-tr>+60 S</span><b id="voto-mas">0</b></button></div>
      <p class="nota-sala" id="voto-nota"></p>
    </div>
    <ul class="sala" id="busca-lista"></ul>
    <p class="nota-sala" data-tr>Los huecos que falten los llena la máquina. Los papeles se reparten al azar al empezar.</p>
    <div class="fila-botones">
      <button type="button" class="boton gris" id="b-busca-cancelar" data-tr>CANCELAR</button>
      <button type="button" class="boton" id="b-busca-empezar" data-tr hidden>EMPEZAR</button>
    </div>
  </div>
</div>
<div class="pantalla" id="p-clasif" hidden>
  <div class="caja pvp">
    <h2 class="ol" data-tr>CLASIFICACIÓN</h2>
    <p class="sub" id="clasif-yo"></p>
    <ol class="clasif" id="clasif-lista"></ol>
    <button type="button" class="boton" id="b-clasif-volver" data-tr>VOLVER</button>
  </div>
</div>
<div class="pantalla" id="p-pvp-info" hidden>
  <div class="caja pvp">
    <h2 class="ol" data-tr>CÓMO FUNCIONA</h2>
    <div class="pasos">
      <p data-tr>Pulsa BUSCAR PARTIDA: el servidor te mete en una sala de hasta 10 jugadores. En cuanto sois 2, espera 10 segundos a que lleguen más. Si se te cae la conexión o cierras la pestaña, puedes volver con BUSCAR PARTIDA mientras la partida siga abierta; si te vas con RENDIRSE, ya no.</p>
      <p data-tr>Los papeles se reparten al azar: siempre hay al menos un camaleón y un cazador de verdad, y un cazador por cada 4 camaleones como mínimo. Los huecos los llena la máquina.</p>
      <p data-tr>Gana el bando entero: los camaleones aguantan el tiempo o dejan a los becarios sin cartas; los cazadores despiden a todos los colados.</p>
      <p data-tr>Cada partida con 2 o más personas gasta 1 de caos primordial y quien gana lo recupera. Ganar da puntos y perder los quita; contra la máquina sola no se suma nada.</p>
      <p class="chiste" data-tr>Microblizz no se hace responsable de los despidos improcedentes.</p>
    </div>
    <button type="button" class="boton" id="b-info-ok" data-tr>ENTENDIDO</button>
  </div>
</div>

<!-- armario y perfil (armario.js) -->
<div class="pantalla" id="p-armario" hidden>
  <div class="caja armario">
    <div class="ar-cabeza"><h2 class="ol" data-tr>ARMARIO</h2><span class="ar-cuenta" id="ar-cuenta"></span></div>
    <div class="cartera" id="ar-cartera"></div>
    <div class="ar-escena">
      <div class="ar-vista" id="ar-vista-sitio"></div>
      <div class="ar-info"><b id="ar-nombre"></b><span id="ar-de"></span><span class="ar-estado" id="ar-estado"></span><button type="button" class="boton peq" id="b-ar-comprar" hidden></button></div>
    </div>
    <div class="ar-pestanas" id="ar-pestanas" role="tablist"></div>
    <p class="ar-nota" id="ar-nota"></p>
    <div class="ar-rejilla" id="ar-rejilla"></div>
    <div class="fila-botones">
      <button type="button" class="boton verde" id="b-ar-perfil" data-tr>PERFIL</button>
      <button type="button" class="boton gris" id="b-ar-volver" data-tr>VOLVER</button>
    </div>
  </div>
</div>
<!-- la tienda (tienda.js) -->
<div class="pantalla" id="p-tienda" hidden>
  <div class="caja tienda-caja">
    <h2 class="ol" data-tr>TIENDA</h2>
    <div class="cartera" id="tienda-cartera"></div>
    <p class="tienda-aviso" id="tienda-aviso-euros"></p>
    <div class="tienda-lista">
      <h3 class="ol" data-tr>OFERTAS</h3><div id="tienda-ofertas"></div>
      <h3 class="ol" data-tr>ACCIONES</h3><div id="tienda-acciones"></div>
      <h3 class="ol" data-tr>ACCIONES CON GOTAS</h3><div id="tienda-gotas"></div>
      <div id="tienda-caos"><h3 class="ol" data-tr>CAOS PRIMORDIAL</h3><button type="button" class="boton" id="b-tienda-caos" data-tr>Caos primordial ilimitado</button></div>
    </div>
    <button type="button" class="boton peq" id="b-tienda-volver" data-tr>Volver</button>
  </div>
</div>

<!-- el gachapón de armario (gacha-pantalla.js) -->
<div class="pantalla" id="p-gacha" hidden>
  <div class="caja gacha-caja" id="scr-gacha">
    <div class="gacha-cab">
      <button type="button" class="gacha-atras" id="b-gacha-volver" aria-label="Volver"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <h2 class="ol" data-tr>GACHAPÓN</h2>
      <button type="button" class="gacha-info-b" id="b-gacha-info" aria-label="Información"></button>
    </div>
    <div class="cartera" id="gacha-cartera"></div>
    <div class="gacha-info" id="gacha-info" hidden>
      <p data-tr>Cada cápsula trae una pieza del armario: ojos, bocas, papeles, mascotas, humos, títulos… Si ya la tenías, te devolvemos Gotas.</p>
      <p data-tr>Salen todos los conjuntos y piezas que no son gratis, y las Épicas y Legendarias también se pueden comprar con Acciones en el armario. Lo del pase solo entra cuando ese pase se cierra.</p>
      <p data-tr>Hay una tirada gratis (x1) cada 3 horas y, cada domingo, una x10 gratis que caduca al acabar el día. No se acumulan.</p>
      <p data-tr>Las cápsulas solo se pagan con Gotas. Las Acciones, que se compran con euros, no sirven para tirar: así nunca se paga dinero por azar.</p>
    </div>
    <p class="gacha-sub" data-tr>Cosméticos en cápsula, pagados solo con Gotas.</p>
    <div class="gacha-wrap"><canvas id="gacha-cv" aria-hidden="true"></canvas></div>
    <p class="gacha-sub" id="gacha-cuenta"></p>
    <button type="button" class="btn-gratis ol" id="b-gacha-g1"></button>
    <button type="button" class="btn-gratis ol" id="b-gacha-g10"></button>
    <div class="pull-row dos">
      <button type="button" class="btn-pull ol" id="b-gacha-1"></button>
      <button type="button" class="btn-pull x10 ol" id="b-gacha-10"></button>
    </div>
    <p class="gacha-pity" id="gacha-pity"></p>
    <details class="probs" id="gacha-probs"></details>
    <button type="button" class="boton peq" id="b-gacha-tienda" data-tr>Ir a la tienda</button>
    <div class="gacha-resultado" id="gacha-result" hidden>
      <div class="gacha-res" id="gacha-res"></div>
      <button type="button" class="boton" id="b-gacha-vale" data-tr>¡VALE!</button>
    </div>
  </div>
</div>

<!-- el pase de temporada (economia.js) -->
<div class="pantalla" id="p-pase" hidden>
  <div class="caja pase-caja">
    <h2 class="ol" data-tr>PASE DE TEMPORADA</h2>
    <p class="pase-sub"><b id="pase-nivel"></b> · <span data-tr>Sube jugando partidas: más si ganas y más en BUSCAR PARTIDA.</span></p>
    <div class="pase-barra"><i id="pase-barra"></i></div>
    <p class="pase-xp" id="pase-xp"></p>
    <div class="cartera" id="pase-cartera"></div>
    <p class="pase-oferta" id="pase-oferta"></p>
    <div class="pase-cols"><span></span><b data-tr>GRATIS</b><b class="premium" data-tr>PREMIUM</b></div>
    <div class="pase-lista" id="pase-lista"></div>
    <button type="button" class="boton grande" id="b-pase-premium"></button>
    <button type="button" class="boton peq" id="b-pase-volver" data-tr>Volver</button>
  </div>
</div>

<!-- las misiones diarias y los logros (misiones-pantalla.js) -->
<div class="pantalla" id="p-misiones" hidden>
  <div class="caja mis-caja">
    <h2 class="ol" data-tr>MISIONES</h2>
    <div class="mis-pestanas" role="tablist">
      <button type="button" class="ar-pest activa" id="b-mis-hoy" data-tr>MISIONES DE HOY</button>
      <button type="button" class="ar-pest" id="b-mis-logros" data-tr>LOGROS</button>
    </div>
    <p class="mis-sub" id="mis-sub"></p>
    <div class="mis-lista" id="mis-lista"></div>
    <p class="diario-gotas"><span data-tr>Tus gotas</span> <b id="mis-gotas">0</b></p>
    <button type="button" class="boton peq" id="b-mis-volver" data-tr>Volver</button>
  </div>
</div>

<!-- el premio diario (diario.js) -->
<div class="pantalla" id="p-diario" hidden>
  <div class="caja diario-caja">
    <h2 class="ol" data-tr>PREMIO DIARIO</h2>
    <p class="diario-sub"><b id="diario-semana"></b> · <span data-tr>Si un día no entras, no pierdes nada: sigues por donde ibas.</span></p>
    <div class="diario-dias" id="diario-dias"></div>
    <p class="diario-mes" id="diario-mes"></p>
    <p class="diario-gotas"><span data-tr>Tus gotas</span> <b id="diario-gotas">0</b></p>
    <button type="button" class="boton grande" id="b-diario-recoger"></button>
    <button type="button" class="boton peq" id="b-diario-volver" data-tr>Volver</button>
  </div>
</div>

<div class="pantalla" id="p-perfil" hidden>
  <div class="caja perfil">
    <h2 class="ol" data-tr>PERFIL</h2>
    <div class="pf-ficha">
      <div class="pf-galleta" id="pf-galleta-sitio"></div>
      <div class="pf-datos">
        <b class="pf-nombre ol" id="pf-nombre"></b>
        <div id="pf-titulo-sitio"></div>
        <p><span data-tr>Pase · Temporada 1</span><b id="pf-nivel"></b></p>
        <p><span data-tr>Colección</span><b id="pf-cosas"></b></p>
        <p><span data-tr>PvP</span><b id="pf-pvp"></b></p>
      </div>
    </div>
    <div class="pf-coleccion" id="pf-coleccion"></div>
    <div class="pf-pruebas">
      <button type="button" class="boton" id="b-pf-todo"></button>
      <small data-tr>Solo para probar cómo queda: este botón no estará en el juego final.</small>
    </div>
    <div class="fila-botones">
      <button type="button" class="boton azul" id="b-pf-armario" data-tr>ARMARIO</button>
      <button type="button" class="boton gris" id="b-pf-volver" data-tr>VOLVER</button>
    </div>
  </div>
</div>
`;
})();

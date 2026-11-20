// Fans of Pinball · AJUSTES · ARTE: el ÚNICO sitio con los nombres de las imágenes (web/games/pinball/img/) y cómo se pinta cada una
// (docs/pinball/ARTE.md, «Receta de estilo»). Cambiar un dibujo por otro es cambiar aquí su nombre, o sustituir el PNG por otro del mismo
// nombre y tamaño, sin tocar código. UNA sola densidad de píxel: el lienzo interno mide unos 206 píxeles de ancho (la mesa de 180 más
// 13 de margen a cada lado; 1 unidad del mundo = 1 píxel) y se amplía a escala entera sin suavizar; TODO se pinta a x1 en él. Los dibujos
// de otros juegos que son más grandes que su sitio se reducen UNA vez al cargar, al vecino más cercano (`reduce`: la parte que se queda).
'use strict';
AJUSTES.arte = PB.congela({
  carpeta: 'img/',
  pxPorUnidad: 1,               // píxeles del lienzo por unidad del mundo
  margen: 13,                   // (partida) unidades de fondo a cada lado de la mesa (el fondo mide 206 de ancho: 180 + 2 × 13)
  anchoLienzo: 206,             // (ARTE) ancho de referencia del lienzo: escala = redondeo de (ancho físico ÷ 206)
  imagenes: {
    capsula: 'capsula-gashapon.png',
    palaIzquierda: 'pala-izquierda.png', palaDerecha: 'pala-derecha.png',
    palaIzquierdaCorta: 'pala-izquierda-corta.png', palaDerechaCorta: 'pala-derecha-corta.png',
    diana: 'diana.png', dianaEncendida: 'diana-encendida.png',
    maquina: 'maquina-cafe.png', maquinaEncendida: 'maquina-cafe-encendida.png',
    ascensorCerrado: 'ascensor-cerrado.png', ascensorAbierto: 'ascensor-abierto.png',
    tienda: 'tienda-lola.png', tiendaCerrada: 'tienda-lola-cerrada.png', lola: 'lola-cara.png',
    fotocopiadora: 'fotocopiadora.png', papel: 'papel.png',
    rebotadorIzquierdo: 'rebotador-izquierdo.png', rebotadorDerecho: 'rebotador-derecho.png',
    rampaEntrada: 'rampa-entrada.png', rampaTramo: 'rampa-tramo.png',
    mesaBaja: 'mesa-oficinas-baja.png', mesaAlta: 'mesa-oficinas-alta.png',
    caja: 'caja-carton.png', cajaRota: 'caja-carton-rota.png', maceta: 'maceta.png', macetaRota: 'maceta-rota.png',
    cofre: 'cofre-cerrado.png', cofreAbierto: 'cofre-abierto.png', planta: 'icono-planta.png', ascensorHud: 'hud-ascensor.png',
    pared: 'pared.png', moneda: 'moneda.png', reloj: 'hud-reloj.png', caos: 'hud-rayo.png',
    becario: 'enemigo-becario.png', soportebot: 'enemigo-soportebot.png', plusbot: 'enemigo-plusbot.png', cajabotin: 'enemigo-cajabotin.png',
    jefe: 'jefe-survivalbot.png',
    ovilloBunny: 'ovillo-bunny.png', ovilloZorro: 'ovillo-zorro.png', ovilloSuricata: 'ovillo-suricata.png',
    cartaBunny: 'criatura-bunny.png', cartaZorro: 'criatura-zorro.png', cartaSuricata: 'criatura-suricata.png',
    cafe: 'icono-mejora-velocidad.png', cubito: 'icono-mejora-hielo.png', bolsa: 'icono-mejora-veneno.png',
  },
  // cada criatura: su ovillo (la bola, 32x32) y su carta (menús, de cara). BoomBeaver y JunkCoon aún no tienen dibujo propio (provisional)
  criaturas: {
    crazybunny: { ovillo: 'ovilloBunny', carta: 'cartaBunny', nombre: 'bunny' },
    slyfox: { ovillo: 'ovilloZorro', carta: 'cartaZorro', nombre: 'zorro' },
    boombeaver: { ovillo: 'ovilloSuricata', carta: 'cartaSuricata', nombre: 'suricata' },
    junkcoon: { ovillo: 'ovilloSuricata', carta: 'cartaSuricata', nombre: 'suricata' },
  },
  // POSTURAS CÓMICAS del héroe dentro de la cápsula (32x32, como el ovillo): archivo ovillo-<nombre>-<postura>.png. Mientras un archivo no
  // esté en `posturasHechas` se usa el ovillo normal; cuando Yoshi lo entregue, se añade aquí su nombre (por ejemplo 'bunny-mareado').
  // Cuándo: aplastado unos 0,3 s tras un golpe fuerte; mareado tras muchos rebotes seguidos sin tocar una pala; cabeza abajo al caer
  // rápido; dormido cuando la bola espera en el lanzador o se queda atrapada en una pala.
  posturas: {
    aplastado: { segundos: 0.3 },
    mareado: { rebotes: 8, segundos: 1.2 },
    cabezaAbajo: { velocidad: 330, archivo: 'cabeza-abajo' },
    dormido: { segundos: 0.6 },
  },
  posturasHechas: [],
  // las cosas de la sala: imagen entera, rota (para las piezas que saltan) o encendida
  cosas: {
    vasija: { img: ['maceta', 'caja'], rota: ['macetaRota', 'cajaRota'] },   // alternan por id: maceta y caja
    cofre: { img: 'cofre', rota: 'cofreAbierto' },
    seta: { img: 'diana', encendida: 'dianaEncendida' },   // las setas de la especificación son ahora dianas
  },
  // `reduce`: parte del tamaño con que se pinta un dibujo de otro juego (se reduce una vez al cargar)
  enemigos: {
    becario: { img: 'becario', reduce: 0.5 },
    cafetero: { img: 'soportebot', reduce: 0.42 },
    fichador: { img: 'plusbot', reduce: 0.45 },
    casco: { img: 'becario', reduce: 0.5, tinte: '#287dfb' },   // con el casco puesto va teñido de azul
  },
  jefe: { img: 'jefe', reduce: 0.55, caja: 'cajabotin', reduceCaja: 0.33 },
  proyectiles: { cafe: 'cafe', cubito: 'cubito', bolsa: 'bolsa', reduce: 0.5 },
  angulosPala: 9,               // (ARTE) cuadros girados de la pala entre el reposo y arriba
  angulosOvillo: 16,            // (partida) cuadros girados del ovillo en una vuelta
  angulosAplaste: 8,            // (partida) ejes del aplaste de la cápsula (cada 22,5 grados en media vuelta)
  pivotePala: [6, 6],           // dónde está el eje en el dibujo de la pala izquierda (la derecha, en espejo)
  // (ARTE) la cápsula se aplasta y se estira al chocar conservando el volumen: tamaños (eje del choque en vertical) y segundos de cada uno
  aplaste: { cuadros: [[26, 38], [36, 29], [30, 34]], segundos: 0.06 },
  tintes: { aviso: '#e5322d', congelada: '#95f4f9', lenta: '#ab6f3f', golpe: '#fdfefd', rabia: '#e5322d', luz: '#fdfefd' },
  // iconos de la ventana de mejoras y de la tienda (reutilizados de Swipe: ARTE.md)
  mejoras: {
    pala_acero: 'icono-mejora-fuerza.png', bola_gorda: 'icono-mejora-rebote.png', iman_fichas: 'icono-mejora-iman.png',
    cafe_doble: 'icono-mejora-velocidad.png', horas_extra: 'icono-mejora-camara-lenta.png', escalera_expres: 'icono-mejora-palas.png',
    golpe_critico: 'icono-mejora-suerte.png', rebote_explosivo: 'icono-mejora-descarga.png', estela_fuego: 'icono-mejora-fuego.png',
    setas_locas: 'icono-mejora-veneno.png', salvavidas: 'icono-mejora-escudo.png', caos_largo: 'icono-mejora-botin.png',
    perforante: 'icono-mejora-hielo.png', cuarta_bola: 'icono-mejora-multibola.png',
  },
  colorFondo: '#05182d',        // lo que queda fuera de la mesa
});

// Fans of Toys · PRINCIPAL: la composición. Crea el juego con sus datos, el almacén, la sesión y el fondo, y enseña la primera pantalla.
// Es el único archivo que conoce todas las piezas; las pantallas se apuntan solas. Prototipo solo para la alfa: fuera de la alfa y del
// modo desarrollo no arranca y enseña un aviso.
'use strict';
TY.abierto = () => !!(NUCLEO.alfa || NUCLEO.desarrollo);

TY.compone = () => {
  TY.juego = TY.creaJuego({ reglas: AJUSTES, juguetes: TY.JUGUETES, mejoras: TY.MEJORAS, noticias: TY.NOTICIAS, frases: TY.FRASES });
  TY.almacen = TY.creaAlmacenLocal(AJUSTES.guardado, localStorage);
  TY.sesion = TY.creaSesion({ almacen: TY.almacen, juego: TY.juego, semilla: () => (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0, nivelMaximo: AJUSTES.nivelMaximo });
  TY.fondo = TY.creaFondo(document.getElementById('ty-fondo'));
};

TY.quitaCarga = () => {
  const carga = document.getElementById('ty-carga');
  if (carga) carga.remove();
  NUCLEO.listo();   // la splash de core espera a esto para irse
};

TY.arranca = () => {
  if (!TY.abierto()) {   // la release: el prototipo no se enseña todavía
    TY.capa().append(TY.crea('section', { className: 'ty-pantalla ty-inicio' }, TY.crea('h1', { className: 'ty-logo' }, TY.crea('b', { textContent: TY.TEXTOS.juego })),
      TY.crea('p', { className: 'ty-lema', textContent: tr('Este prototipo está en obras. Vuelve pronto.') })));
    return TY.quitaCarga();
  }
  TY.compone();
  window.enPartida = () => TY.pantallas.enPartida();   // core pregunta con este nombre si se está jugando
  TY.pantallas.ve('inicio');
  TY.quitaCarga();
  let ultimo = 0;
  const fotograma = ms => {   // el fondo se repinta 15 veces por segundo: de sobra para una pintura lenta
    if (ms - ultimo > 66 && !document.hidden) { ultimo = ms; TY.fondo.pinta(ms / 1000); }
    requestAnimationFrame(fotograma);
  };
  requestAnimationFrame(fotograma);
  setInterval(() => { try { musicUpdate(); } catch (e) { console.error(e); } }, 300);   // la música nunca debe parar el juego
};
TY.arranca();

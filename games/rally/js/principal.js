// Fans of Rally · PRINCIPAL: la composición. Crea la sesión, la vista, el marcador, los mandos, el bucle de la carrera y las pantallas,
// y enseña el inicio. Es el único archivo que conoce todas las piezas. Prototipo solo para la alfa: fuera de la alfa y del modo
// desarrollo no arranca y enseña un aviso.
'use strict';
RA.abierto = () => !!(NUCLEO.alfa || NUCLEO.desarrollo);

RA.quitaCarga = () => {
  const carga = document.getElementById('ra-carga');
  if (carga) carga.remove();
  NUCLEO.listo();   // la splash de core espera a esto para irse
};

RA.arranca = () => {
  const raiz = document.getElementById('ra-escenario');
  if (!RA.abierto()) {   // la release: el prototipo no se enseña todavía
    raiz.querySelector('#ra-menu').replaceChildren(Object.assign(document.createElement('p'), { className: 'ra-lema ra-obras', textContent: tr('Este prototipo está en obras. Vuelve pronto.') }));
    return RA.quitaCarga();
  }
  const sesion = RA.creaSesion({ almacen: RA.creaAlmacenLocal(AJUSTES.guardado, localStorage), reglas: AJUSTES, pilotos: RA.PILOTOS, rivales: RA.RIVALES, tramos: RA.TRAMOS });
  const vista = RA.creaVista(document.getElementById('ra-lienzo'));
  const juego = RA.creaJuego({ vista, marcador: RA.creaMarcador(raiz.querySelector('#ra-hud')), mandos: RA.creaMandos(raiz), sesion, reglas: AJUSTES });
  RA.pantallas = RA.creaPantallas({ raiz, sesion, juego, vista });
  window.enPartida = () => RA.pantallas.enPartida();   // core pregunta con este nombre si se está jugando
  if (NUCLEO.desarrollo) RA.dev = { autopiloto: false };   // solo en local: RA.dev.autopiloto = true en la consola y tu coche lo lleva la IA (para probar)
  RA.pantallas.inicio();
  RA.quitaCarga();
  setInterval(() => { try { musicUpdate(); } catch (e) { console.error(e); } }, 300);   // la música nunca debe parar el juego
};
RA.arranca();

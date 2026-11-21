// Fans of Pinball · PRINCIPAL: la composición. Crea los adaptadores (almacén, reloj, lienzo, pulgares, sonido), la sesión y los casos de
// uso, carga y prepara las imágenes, arranca el bucle de paso fijo y la primera pantalla. Es el único archivo que conoce todas las piezas;
// las pantallas y ventanas las encuentran en PB.app. Prototipo solo para la alfa: fuera de la alfa y del modo desarrollo no arranca y
// enseña un aviso (como Tiny).
'use strict';
PB.abierto = () => Boolean(NUCLEO.alfa || NUCLEO.desarrollo);

PB.compone = () => {
  const reglas = AJUSTES, lienzo = document.getElementById('pb-lienzo');
  const almacen = PB.creaAlmacenLocal(SAVE_KEY, localStorage), reloj = PB.creaReloj();
  const sesion = PB.creaSesion({ reglas, almacen });
  const diario = PB.creaDiario({ reglas, sesion, reloj });
  const clasificacion = PB.creaClasificacionLocal({ sesion, diario });
  const casos = PB.creaCasos({ reglas, sesion, reloj, diario, clasificacion });
  PB.sonido = PB.creaSonido({ sesion, reglas: reglas.sonido, jugo: reglas.jugo });
  const app = { reglas, almacen, reloj, sesion, diario, clasificacion, casos, sonido: PB.sonido };
  app.lienzo = PB.creaLienzo(lienzo, reglas.arte, reglas.mesa);
  app.entrada = PB.creaEntrada(document.getElementById('pb-escenario'), { franja: () => PB.partidaEnMesa.franja(), alTocar: () => PB.partidaEnMesa.alTocar() });
  app.particulas = PB.creaParticulas(reglas.jugo);
  app.bucle = PB.creaBucle({
    reglas: reglas.simulacion, entrada: () => app.entrada.lee(),
    paso: (dt, e) => PB.pantallas.paso(dt, e), pinta: (alfa, dt) => PB.pantallas.pinta(alfa, dt),
    alPausar: () => PB.partidaEnMesa.pausa(),
  });
  PB.app = app;
  return app;
};

// las imágenes cargadas y preparadas: sprites, fondo y pintor
PB.preparaArte = app => PB.cargaImagenes(AJUSTES.arte).then(img => {
  app.sprites = PB.preparaSprites(img, AJUSTES.arte, AJUSTES.mesa);
  app.posturas = PB.creaPosturas(AJUSTES.arte);
  app.fondo = PB.creaFondo(app.sprites, AJUSTES.arte, AJUSTES.mesa);
  app.pintor = PB.creaPintor({ sp: app.sprites, fondo: app.fondo, arte: AJUSTES.arte, jugo: AJUSTES.jugo, mesa: AJUSTES.mesa, lienzo: app.lienzo, particulas: app.particulas,
    posturas: app.posturas });
});

// salir de la app: pausa, palas sueltas (lo hace la entrada) y el audio suspendido; al volver, la partida sigue en pausa
PB.vigilaSalidas = app => {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { PB.partidaEnMesa.pausa(); app.sonido.suspende(); } else app.sonido.reanuda();
  });
  window.addEventListener('pagehide', () => PB.partidaEnMesa.pausa());
  document.addEventListener('pointerdown', () => app.sonido.despierta(), { once: true, capture: true });
  window.addEventListener('resize', () => app.lienzo.tamano());
};

PB.quitaCarga = () => {
  const carga = document.getElementById('pb-carga');
  if (carga) carga.remove();
  NUCLEO.listo();   // la splash de core espera a esto para irse
};

PB.arranca = () => {
  if (!PB.abierto()) {   // la release: el prototipo no se enseña todavía
    PB.capa().append(PB.crea('section', { className: 'pb-menu pb-menu-primera' }, PB.crea('h1', { className: 'pb-logo', textContent: 'FANS OF PINBALL' }),
      PB.crea('p', { className: 'pb-record', textContent: tr('Este prototipo está en obras. Vuelve pronto.') })));
    return PB.quitaCarga();
  }
  const app = PB.compone();
  window.enPartida = () => PB.pantallas.enPartida();   // core pregunta con este nombre si se está jugando (esconde su etiqueta y su aviso)
  PB.vigilaSalidas(app);
  app.lienzo.tamano();
  PB.preparaArte(app).then(() => {
    PB.pantallas.ve('menu');
    PB.quitaCarga();
    const fotograma = ms => { app.bucle.fotograma(ms); requestAnimationFrame(fotograma); };
    requestAnimationFrame(fotograma);
    setInterval(() => { try { musicUpdate(); } catch (e) { console.error(e); } }, 300);   // la música nunca debe parar el juego
  });
};
PB.arranca();

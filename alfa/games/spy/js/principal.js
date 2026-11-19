// Fans of Spy · La composición: crea las piezas (los casos de uso, la pantalla de juego, las ventanas y los toques), arranca el 3D
// y lleva el bucle: cada imagen avanza la animación, mueve la cámara y pinta. Es el único archivo que conoce todas las piezas.
// En el menú se ve de fondo el parking, con la cámara dando vueltas. También le dice a core si se está jugando
// (window.enPartida), para que esconda la etiqueta PROTOTIPO y la pestaña de comentarios durante la misión.
'use strict';
(function (S) {
  const H = S.hud, CAM = S.camara, el = (id) => document.getElementById(id);
  const lienzo = el('spy-lienzo'), carga = el('spy-carga'), cabecera = el('spy-cabecera'), pie = el('spy-pie');
  // el menú: qué planta se ve detrás, desde qué distancia, cuánto gira la cámara por segundo y el hueco entre el título y los botones
  const FONDO = { nivel: 'parking', dist: 17, giro: 0.1, hueco: [0.24, 0.52] };
  let jugando = false, antes = 0, destello = -1;

  const casos = S.creaCasos({ aj: S.AJ, plantas: S.PLANTAS, azar: Math.random, almacen: S.almacen });
  const pantalla = S.creaPantalla({ casos, plantas: S.PLANTAS, azar: Math.random, alAcabar: (fin, guiada) => ventanas.final(fin, guiada) });
  const ventanas = S.creaVentanas({ casos, empezar, salir });
  const E = pantalla.E, A = pantalla.acciones;

  // Empieza una planta: la cámara se coloca de golpe detrás del agente.
  function empezar(nivel, guiada) {
    const r = pantalla.empieza(nivel, guiada);
    if (!r.ok) throw new Error('Spy: no se puede empezar la planta ' + nivel + ': ' + r.codigo);   // una planta mal escrita es un fallo de programación
    jugando = true;
    ventanas.cierra(); H.partida(true);
    const p = pantalla.punto();
    Object.assign(E.cam, { giro: 0, giroVa: 0, dist: CAM.distPara(lienzo.clientWidth / Math.max(1, lienzo.clientHeight)) });
    CAM.salta(E.cam, p.x, p.z);
  }
  // Vuelve al menú, con el parking de fondo.
  function salir() {
    jugando = false;
    pantalla.fondo(FONDO.nivel);
    E.cam.dist = FONDO.dist;
    CAM.salta(E.cam, E.planta.ancho / 2, E.planta.alto / 2);
    H.partida(false);
    ventanas.menu();
  }

  const libre = () => jugando && !ventanas.abierta();   // se está jugando y no hay ninguna ventana delante
  const siLibre = (hace) => () => { if (libre()) hace(); };
  function escape() {
    if (ventanas.abierta() === 'pausa') ventanas.cierra();
    else if (libre() && pantalla.haySeleccion()) A.cancelar();
    else if (libre()) ventanas.pausa();
  }
  const teclas = { Enter: siLibre(() => (pantalla.haySeleccion() ? A.usar() : A.seguir())), ' ': siLibre(A.acabar), Escape: escape };
  for (let i = 0; i < S.AJ.turno.mano; i++) teclas[String(i + 1)] = siLibre(() => A.carta(i));

  // El hueco de la pantalla que dejan libre la barra de arriba y las cartas de abajo (de 0 a 1): ahí se centra la vista.
  function hueco(caja) {
    if (!jugando) return FONDO.hueco;
    const arriba = cabecera.getBoundingClientRect().bottom - 12, abajo = pie.getBoundingClientRect().top + 26;
    return [(arriba - caja.top) / caja.height, (abajo - caja.top) / caja.height];
  }

  // Una imagen: el tamaño del lienzo, la animación, la cámara y la escena.
  function cuadro(ahora) {
    const dt = Math.min(0.05, (ahora - antes) / 1000 || 0), ancho = lienzo.clientWidth, alto = lienzo.clientHeight;
    antes = ahora;
    requestAnimationFrame(cuadro);
    if (!ancho || !alto) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1), p = jugando ? pantalla.punto() : { x: E.planta.ancho / 2, z: E.planta.alto / 2 };
    if (S.gl.W !== Math.floor(ancho * dpr) || S.gl.H !== Math.floor(alto * dpr)) S.gl.medida(ancho * dpr, alto * dpr);
    S.animacion.avanza(E.vis, dt);
    if (!jugando) E.cam.giroVa += dt * FONDO.giro;
    CAM.encuadra(E.cam, ...hueco(lienzo.getBoundingClientRect()));
    CAM.paso(E.cam, dt, p.x, p.z, ancho / alto);
    S.escena.pinta(E);
    if (jugando) pantalla.refrescaEstado();
    if (E.vis.destello !== destello) { destello = E.vis.destello; H.destello(destello); }
  }

  function arranca() {
    if (!S.gl.iniciar(lienzo)) { carga.hidden = true; ventanas.sin3d(); return; }
    S.modelos.crear();
    // El móvil puede quitarle el 3D a la página al cambiar de aplicación. Al devolvérselo, lo seguro es empezar de limpio.
    lienzo.addEventListener('webglcontextlost', (e) => e.preventDefault());
    lienzo.addEventListener('webglcontextrestored', () => location.reload());
    H.monta({ ...A, pausa: siLibre(ventanas.pausa), girar: siLibre(() => { CAM.gira(E.cam); H.centrar(true); }), centrar: siLibre(() => { CAM.centra(E.cam); H.centrar(false); }) });
    S.creaToques({ lienzo, cam: E.cam, activo: libre, alTocar: pantalla.toca, alMover: () => H.centrar(true), teclas });
    window.enPartida = () => jugando && ventanas.abierta() !== 'final';
    if (NUCLEO.desarrollo) S.depura = { casos, pantalla, ventanas };   // para las pruebas en el navegador (solo en localhost y en la alfa)
    // Los modelos de Yoshi se descargan mientras sigue el cartel de carga. La carga nunca falla: lo que no llegue se pinta por código.
    S.cargaModelos.carga().then(() => {
      salir();
      carga.hidden = true;
      requestAnimationFrame(cuadro);
    });
  }
  arranca();
})(SPY);

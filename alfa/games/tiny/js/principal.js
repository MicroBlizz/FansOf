// Tiny Fans · PRINCIPAL: la composición. Crea los adaptadores (almacén, reloj, vista 3D, joystick), la sesión con la partida y los casos
// de uso, y arranca el bucle de paso fijo y la primera pantalla. Es el único archivo que conoce todas las piezas; las pantallas, los
// oyentes de eventos y los botones DEV se apuntan solos, así que añadir uno no pide tocar este archivo.
// Prototipo solo para la alfa: fuera de la alfa y del modo desarrollo no arranca y enseña un aviso. Dueño: N1 (arquitectura).
'use strict';
TN.abierto = () => !!(NUCLEO.alfa || NUCLEO.desarrollo);

// lo que cada pieza necesita, creado en orden; las pantallas lo encuentran colgado de TN
TN.compone = () => {
  TN.almacen = TN.creaAlmacenLocal(SAVE_KEY, localStorage);
  TN.reloj = TN.creaReloj();
  TN.sesion = TN.creaSesion({ almacen: TN.almacen });
  TN.vista = TN.creaVista(document.getElementById('tn-lienzo'), AJUSTES);
  TN.entrada = TN.creaEntrada(TN.capa(), AJUSTES);
  const puertos = { reglas: AJUSTES, sesion: TN.sesion, reloj: TN.reloj, eventos: TN.eventos };
  TN.casosExpedicion = TN.creaCasosExpedicion(puertos);
  TN.casosNido = TN.creaCasosNido(puertos);
  TN.casosAsalto = TN.creaCasosAsalto(puertos);
  TN.metas = TN.creaMetas(puertos);
  TN.bucle = TN.creaBucle({
    reglas: AJUSTES.simulacion,
    // el joystick da un vector de pantalla y la vista lo pasa a los ejes del mundo: el dominio solo ve { mx, mz }
    entrada: () => { const j = TN.entrada.vector(), m = TN.vista.aSuelo(j.x, j.y); return { mx: m.x, mz: m.z }; },
    paso: entrada => TN.pantallas.paso(entrada),
    pinta: (alfa, dt) => TN.pantallas.pinta(alfa, dt),
  });
  TN.pantallas.alCambiar(cambio => { TN.entrada.activa(TN.pantallas.joystick()); TN.eventos.emite({ tipo: 'pantalla', ...cambio }); });
};

TN.quitaCarga = () => {
  const carga = document.getElementById('tn-carga');
  if (carga) carga.remove();
  NUCLEO.listo();   // la splash de core espera a esto para irse
};

TN.arranca = () => {
  if (!TN.abierto()) {   // la release: el prototipo no se enseña todavía
    TN.capa().append(TN.crea('section', { className: 'tn-provisional' }, TN.crea('h1', { className: 'tn-titulo', textContent: tr(TN.textos.juego) }),
      TN.crea('p', { textContent: tr('Este prototipo está en obras. Vuelve pronto.') })));
    return TN.quitaCarga();
  }
  TN.compone();
  window.enPartida = () => TN.pantallas.enPartida();   // core pregunta con este nombre si se está jugando (esconde su etiqueta y su aviso)
  window.addEventListener('resize', () => TN.vista.tamano());
  TN.vista.tamano();
  TN.pantallas.ve(AJUSTES.pantallas.inicial);
  TN.quitaCarga();
  const fotograma = ms => { TN.bucle.fotograma(ms); requestAnimationFrame(fotograma); };
  requestAnimationFrame(fotograma);
};
TN.arranca();

// Fans of Pinball · adaptador · PANEL DEV: la sección «Pinball» del panel DEV de core (UTILIDADES_JUEGO, solo en desarrollo y en la alfa)
// y los ganchos de prueba de la pantalla (PB.dev.ve, estado, llenaCaos, abreEscalera y subeEscalera (el ascensor), entraTienda, acaba).
// Con ellos, una prueba llega a la ventana de mejoras, a la tienda de Lola o al resultado sin jugar minutos. Toca el estado de la partida por dentro: SOLO para probar.
'use strict';
Object.assign(PB.dev, {
  ve: (id, datos) => PB.pantallas.ve(id, datos),
  estado: () => ({ ...PB.pantallas.estado(), fichas: PB.app.sesion.datos.fichas, pasos: PB.app.bucle.pasos }),
  interno: () => (PB.dev.partida ? PB.dev.partida.estadoInterno() : null),
  llenaCaos() { const s = PB.dev.interno(); if (s) PB.caos.llena(s, 1000); },
  abreEscalera() { const s = PB.dev.interno(); if (s && !s.sala.abierta) PB.marcador.abreEscalera(s); },
  // la bola entra ya por el ascensor (si hay una bola en la mesa)
  subeEscalera() {
    const s = PB.dev.interno(), b = s && s.bolas.find(x => x.vivo);
    if (!b || s.fase !== 'jugando') return false;
    if (!s.sala.abierta) PB.marcador.abreEscalera(s);
    PB.partida.entraEscalera(s, b);
    return true;
  },
  // la bola entra ya en la tienda de Lola, con `fichas` de la partida (si hay una bola en la mesa y la persiana está subida)
  entraTienda(fichas = 100) {
    const s = PB.dev.interno(), b = s && s.bolas.find(x => x.vivo && x.estado === 'mesa');
    if (!b || s.fase !== 'jugando' || s.sala.tienda !== 'lista') return false;
    s.fichas = Math.max(s.fichas, fichas);
    PB.tienda.entra(s, b);
    return true;
  },
  // se acaba el tiempo ahora (el resultado sale en el siguiente paso)
  acaba() { const s = PB.dev.interno(); if (s && s.fase === 'jugando') PB.partida.acaba(s, 'tiempo'); },
  fichas(n = 500) { PB.app.sesion.datos.fichas += n; PB.app.sesion.guarda(); },
});
// el nombre que busca el panel DEV de core (core/js/sistema/desarrollo.js): es suyo, no un global nuevo del juego
const UTILIDADES_JUEGO = (typeof NUCLEO !== 'undefined' && (NUCLEO.desarrollo || NUCLEO.alfa)) ? [{
  titulo: 'Pinball',
  pinta(caja) {
    const modo = () => (PB.app.sesion.datos.sinfinAbierto ? 'sinfin' : 'historia');
    const fijos = [
      ['Planta 4', () => PB.dev.ve('partida', { modo: modo(), planta: 4 })], ['Planta 9', () => PB.dev.ve('partida', { modo: modo(), planta: 9 })],
      ['Ir al jefe', () => PB.dev.ve('partida', { modo: 'historia', planta: 10 })], ['Llenar CAOS', () => PB.dev.llenaCaos()],
      ['Abrir ascensor', () => PB.dev.abreEscalera()], ['Subir al ascensor ya', () => PB.dev.subeEscalera()], ['Entrar en la tienda', () => PB.dev.entraTienda()], ['Acabar partida', () => PB.dev.acaba()],
      ['+500 fichas', () => { PB.dev.fichas(500); if (PB.pantallas.actual !== 'partida') PB.dev.ve(PB.pantallas.actual); }],
      ['Abrir sin fin', () => { PB.app.sesion.datos.sinfinAbierto = true; PB.app.sesion.guarda(); PB.dev.ve('menu'); }],
      ['+1 día', () => { PB.app.reloj.adelantaDias(1); PB.dev.ve('menu'); }],
      ['Partida nueva', () => { PB.app.sesion.reinicia(); PB.dev.ve('menu'); }],
    ];
    const fila = PB.crea('div', { className: 'fila' });
    for (const [texto, fn] of fijos.concat(PB.dev.botones())) fila.append(PB.crea('button', { type: 'button', textContent: texto, onclick: fn }));
    caja.append(fila, PB.crea('p', { textContent: 'Último toque: ' + Math.round(PB.app.entrada.ultimoToque) + ' ms' }));
  },
}] : [];

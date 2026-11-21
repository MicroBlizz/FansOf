// Fans of Rally · adaptador · JUEGO: el bucle de una carrera. Cada fotograma lee los mandos, mueve la carrera del dominio, graba el
// fantasma (en la contrarreloj), cuenta lo que pasa (letreros, copiloto, sonidos) y la dibuja. Al acabar avisa a quien la empezó
// con fin(carrera). La pausa congela todo.
'use strict';
RA.creaJuego = ({ vista, marcador, mandos, sesion, reglas }) => {
  let carrera = null, tramo = 0, pista = null, pausado = false, alAcabar = null, ultimo = 0, vivo = false;
  let grabando = null, fantasma = null, cantado = null, finVisto = false;
  const piloto = () => sesion.piloto();
  const colores = c => (c.jugador ? piloto().colores : (RA.RIVALES.find(r => r.id === c.id) || RA.RIVALES[0]).colores);

  function empieza(modo, indice, fin) {
    tramo = indice; pista = sesion.pista(indice); carrera = sesion.carrera(modo, indice); alAcabar = fin;
    fantasma = modo === 'contrarreloj' ? sesion.fantasmaDe(indice) : null;
    grabando = RA.Fantasma.nuevo(reglas.carrera.muestraFantasma);
    vista.prepara(pista, RA.TRAMOS[indice], sesion.paisaje(indice));
    marcador.prepara(pista, modo);
    mandos.suelta(); pausado = false; cantado = null; finVisto = false;
    RA.musica.quiere(modo === 'contrarreloj' ? 'gamer' : RA.TRAMOS[indice].musica);
    RA.sonido.arrancaMotor();
    marcador.cuenta(String(reglas.carrera.cuentaAtras)); RA.sonido.suena('cuenta');
    if (!vivo) { vivo = true; ultimo = performance.now(); requestAnimationFrame(fotograma); }
  }
  const EVENTOS = {
    cuenta: e => { marcador.cuenta(String(e.numero)); RA.sonido.suena('cuenta'); },
    salida: () => { marcador.cuenta(''); marcador.aviso(tr(RA.TEXTOS.salida), 'ra-verde'); RA.sonido.suena('salida'); },
    control: () => { marcador.aviso(tr(RA.TEXTOS.control), 'ra-amarillo'); RA.sonido.suena('control'); },
    ultimaVuelta: () => { marcador.aviso(tr(RA.TEXTOS.ultimaVuelta), 'ra-naranja'); },
    vuelta: e => vueltaHecha(e),
    golpe: e => { if (e.fuerza > 40) { RA.sonido.suena('choque', 250); vista.sacude(Math.min(4, e.fuerza / 50)); } },
    golpeCoche: () => RA.sonido.suena('roce', 200),
    meta: () => { marcador.aviso(tr(RA.TEXTOS.meta), 'ra-verde'); RA.sonido.suena('meta'); },
    sinTiempo: () => { marcador.aviso(tr(RA.TEXTOS.sinTiempo), 'ra-rojo'); RA.sonido.suena('sinTiempo'); },
  };
  function vueltaHecha(e) {
    RA.sonido.suena('vuelta');
    if (carrera.modo !== 'contrarreloj') { grabando = RA.Fantasma.nuevo(reglas.carrera.muestraFantasma); return; }
    if (sesion.apuntaVuelta(tramo, e.tiempo, grabando)) { fantasma = sesion.fantasmaDe(tramo); marcador.aviso(tr(RA.TEXTOS.mejorVuelta), 'ra-amarillo'); }
    grabando = RA.Fantasma.nuevo(reglas.carrera.muestraFantasma);
  }
  function canta() {
    const aviso = RA.Copiloto.aviso(pista, carrera.jugador.i);
    if (aviso && aviso !== cantado) { marcador.copiloto(tr(RA.TEXTOS.copiloto[aviso])); RA.sonido.suena('copiloto'); }
    cantado = aviso;
  }
  function avanza(dt) {
    const yo = carrera.jugador;
    const mio = RA.dev && RA.dev.autopiloto ? RA.IA.mandos(yo.coche, yo.ficha, pista, yo.i, reglas.ia, { pericia: 0.95, carril: 0, goma: 0 }) : mandos.lee(dt);
    const mandosDe = c => (c.jugador ? mio : RA.IA.mandos(c.coche, c.ficha, pista, c.i, reglas.ia, { ...c, goma: gomaDe(c) }));
    for (const e of carrera.paso(dt, mandosDe)) (EVENTOS[e.tipo] || (() => {}))(e);
    if (carrera.estado === 'corriendo') { RA.Fantasma.apunta(grabando, carrera.tiempoVuelta, yo.coche); canta(); }
    if (yo.coche.derrape > 0.3 && yo.suelo === 'asfalto') RA.sonido.suena('derrape', 110);
    RA.sonido.motorA(RA.Coche.kmh(yo.coche, yo.ficha), mio.gas > 0);
  }
  // los rivales aflojan si vas muy atrás y aprietan si vas muy delante (poco: es una recreativa, no un regalo)
  function gomaDe(c) {
    const yo = carrera.jugador, d = (yo.vuelta * pista.n + yo.i) - (c.vuelta * pista.n + c.i);
    return RA.limita(d / (pista.n * 0.25), -1, 1);
  }
  function fotograma(ms) {
    if (!carrera) { vivo = false; return; }
    const dt = Math.min(0.05, (ms - ultimo) / 1000); ultimo = ms;
    if (!pausado && !document.hidden) {
      try { avanza(dt); } catch (e) { console.error(e); }
      const sombra = fantasma ? RA.Fantasma.posicion(fantasma, carrera.tiempoVuelta) : null;
      vista.pinta(carrera, dt, carrera.estado === 'corriendo' ? sombra : null, colores);
      marcador.pinta(carrera, carrera.jugador.coche, carrera.jugador.ficha);
      compruebaFin();
    }
    requestAnimationFrame(fotograma);
  }
  function compruebaFin() {
    if (finVisto || (carrera.estado !== 'fin' && carrera.estado !== 'sinTiempo')) return;
    finVisto = true; RA.sonido.paraMotor();
    const acabada = carrera;
    setTimeout(() => { if (carrera === acabada && alAcabar) alAcabar(acabada); }, 1800);
  }
  function sal() { carrera = null; RA.sonido.paraMotor(); mandos.suelta(); }
  function pausa(si) { pausado = si; if (si) { RA.sonido.paraMotor(); mandos.suelta(); } else { RA.sonido.arrancaMotor(); ultimo = performance.now(); } }
  return { empieza, sal, pausa, get carrera() { return carrera; }, get tramo() { return tramo; }, get enCarrera() { return !!carrera; } };
};

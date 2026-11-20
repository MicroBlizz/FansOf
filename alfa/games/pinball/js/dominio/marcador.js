// Fans of Pinball · dominio · MARCADOR: el reloj único (lo que suma, lo que quita, el mínimo de las plantas protegidas y el fin por tiempo),
// los puntos y las fichas con el combo y el CAOS, y la barra de sala que abre la escalera. Trabaja sobre el estado `s` de la partida.
'use strict';
PB.marcador = (() => {
  const protegida = s => s.planta <= s.r.reloj.plantasProtegidas;
  // multiplicador de puntos del combo: ×(1 + combo/10), con tope
  function multiplicador(s) {
    const c = s.r.puntos.combo;
    return Math.min(c.tope, 1 + s.combo / c.divisor);
  }
  const doble = s => (s.caos.activo ? s.r.caos.multiplicador : 1);
  function sumaTiempo(s, segundos) { s.reloj += segundos; }
  // quita tiempo sin bajar del mínimo en las plantas protegidas; devuelve lo que quitó de verdad
  function quitaTiempo(s, segundos) {
    const suelo = protegida(s) ? Math.min(s.reloj, s.r.reloj.minimoProtegido) : 0;
    const antes = s.reloj;
    s.reloj = Math.max(suelo, s.reloj - segundos);
    return antes - s.reloj;
  }
  // el reloj corre; en las plantas protegidas se para en el mínimo; desde la planta 4, a 0 se acaba la partida
  function avanzaReloj(s, dt) {
    quitaTiempo(s, dt);
    if (s.reloj > 0 || protegida(s)) return;
    PB.emite(s, 'tiempo_fuera', { planta: s.planta });
    PB.partida.acaba(s, 'tiempo');
  }
  // un golpe a algo: sube el combo si llega a tiempo (n pasos), o lo empieza
  function golpe(s, n = 1) {
    s.combo = s.desdeGolpe <= s.r.puntos.combo.ventana ? s.combo + n : n - 1;
    s.desdeGolpe = 0;
    s.bolaTocaAlgo = true;
  }
  function pasaTiempoCombo(s, dt) {
    s.desdeGolpe += dt;
    if (s.desdeGolpe > s.r.puntos.combo.ventana) s.combo = 0;
  }
  // da los puntos, fichas y barra de CAOS de una cosa (fila de AJUSTES.puntos.cosas); devuelve { puntos, fichas }
  function premia(s, cosa) {
    const x2 = doble(s), puntos = Math.round(cosa.puntos * multiplicador(s) * x2), fichas = cosa.fichas * s.cif.fichas * x2;
    s.puntos += puntos; s.fichas += fichas;
    PB.caos.llena(s, cosa.caos || 0);
    return { puntos, fichas };
  }
  // una cosa de la sala menos: la barra de sala sube y, si llega al umbral, se abre la escalera
  function cuentaSala(s) {
    const sala = s.sala;
    sala.vencidos += 1;
    if (sala.abierta || sala.tipo === 'jefe' || sala.vencidos * 100 < sala.umbral * sala.total) return;
    abreEscalera(s);
  }
  function abreEscalera(s) {
    const e = s.r.mesa.escalera;
    s.sala.abierta = true;
    PB.emite(s, 'escalera_abierta', { x: (e.x0 + e.x1) / 2, y: e.fondo });
  }
  const barraSala = s => (s.sala.total ? s.sala.vencidos / s.sala.total : 0);
  return { protegida, multiplicador, sumaTiempo, quitaTiempo, avanzaReloj, golpe, pasaTiempoCombo, premia, cuentaSala, abreEscalera, barraSala };
})();

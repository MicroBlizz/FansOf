// Fans Of Sótano · dominio · TRITURADORA: el muro del juego. Se la ataca en intentos de AJ.trituradora.intento segundos; entre uno y
// otro hay que esperar AJ.trituradora.espera (menos con Recuerdos). El daño se acumula entre intentos; la armadura se resta a cada
// golpe. Al vaciar su vida se rompe un nivel: sube el tope de nivel, se libera una facción (su líder baja a ayudar) y da un punto de carrera.
'use strict';
SO.trituradora = (() => {
  const AJ = SO.AJ, C = SO.curvas;
  const T = e => e.c.trituradora;
  const acabada = e => T(e).nivel >= AJ.trituradora.niveles;
  const vida = e => C.vidaTrituradora(T(e).nivel);
  const armadura = e => C.armaduraTrituradora(T(e).nivel);
  const atacando = e => T(e).intento > 0;
  const lista = e => !acabada(e) && !atacando(e) && T(e).espera <= 0;

  // empieza un intento. Resultado: SO.ok(segundos) o 'acabada' / 'atacando' / 'esperando' (con los segundos que faltan)
  function ataca(e, B) {
    if (acabada(e)) return SO.error('acabada');
    if (atacando(e)) return SO.error('atacando');
    if (T(e).espera > 0) return SO.error('esperando', { falta: T(e).espera });
    T(e).intento = AJ.trituradora.intento;
    T(e).espera = AJ.trituradora.espera * B.espera;
    return SO.ok(T(e).intento);
  }
  // daño por segundo del jugador contra la Trituradora: el pico y los ayudantes, con críticos y menos la armadura de cada golpe
  function danoSeg(e, B) {
    const golpe = Math.max(0, SO.bonos.golpeMedio(B) * B.trit - armadura(e));
    const ayudantes = Math.max(0, B.dano * B.ayud * B.trit - armadura(e)) * AJ.ayudante.golpesSeg * B.ayudantes;
    return golpe * B.golpesSeg + ayudantes;
  }
  function rompeNivel(e, sucesos) {
    const t = T(e);
    t.dano = 0;
    t.nivel++;
    t.intento = 0;
    t.espera = 0;   // el siguiente nivel se puede atacar ya
    e.r.oro += AJ.trituradora.premioOro * t.nivel;
    sucesos.push({ t: 'trituradora', nivel: t.nivel, faccion: SO.FACCIONES[Math.min(t.nivel, SO.FACCIONES.length - 1)].fac });
  }
  // avanza dt segundos: corre el intento en curso (y la espera, siempre)
  function avanza(e, B, dt, sucesos) {
    const t = T(e);
    t.espera = Math.max(0, t.espera - dt);
    if (!atacando(e)) return;
    const paso = Math.min(dt, t.intento);
    t.intento -= paso;
    t.dano += danoSeg(e, B) * paso;
    if (t.dano >= vida(e)) return rompeNivel(e, sucesos);
    if (t.intento <= 0) sucesos.push({ t: 'intento-fin', parte: t.dano / vida(e) });
  }
  // avanzar la espera sin atacar (horas extra)
  const pasaEspera = (e, dt) => { T(e).espera = Math.max(0, T(e).espera - dt); };

  return { ataca, avanza, danoSeg, vida, armadura, lista, atacando, acabada, pasaEspera };
})();

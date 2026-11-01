// Fans Of Nova · NV.Enemigo: lo que le pasa a una nave enemiga con el tiempo, sin mirar dónde está tu nave ni la pantalla: los estados se
// gastan, el fuego (Fundido) quema, los sistemas se reponen y el escudo se recarga si nada lo impide. Lo usa nvEnemigos (enemigos.js).
'use strict';
NV.Enemigo = (() => {
  // Los estados (brecha, escudoCaido, interferido…) duran segundos: se descuentan y se borran al acabar
  function gastaEstados(e, dt) { for (const k in e.est) if ((e.est[k] -= dt) <= 0) delete e.est[k]; }

  // El fuego del Fundido: quita vida cada segundo hasta que se apaga. Devuelve el daño hecho en este paso (0 si no arde).
  function quema(e, dt) {
    if (!e.dot) return 0;
    const d = e.dot.dps * dt;
    e.hp -= d;
    if ((e.dot.t -= dt) <= 0) e.dot = null;
    return d;
  }

  // Sistemas y escudo: los sistemas bajan cuando cesa la interferencia; el escudo vuelve a 6 por segundo si no está caído,
  // interferido ni frenado (sinEsc, de golpear el casco mientras estaba interferido)
  function recupera(e, dt) {
    if (e.sinEsc > 0) e.sinEsc -= dt;
    if (e.sis > 0 && !(e.est.interferido > 0)) e.sis = Math.max(0, e.sis - 20 * dt);
    if (e.d.esc && e.esc < e.escMax && !(e.est.escudoCaido > 0) && !(e.est.interferido > 0) && !(e.sinEsc > 0)) e.esc = Math.min(e.escMax, e.esc + dt * 6);
  }

  // Un paso de tiempo de todo lo anterior, en el orden de siempre. Devuelve { quemado, muere }.
  function pasaTiempo(e, dt) {
    gastaEstados(e, dt);
    if (e.flash > 0) e.flash -= dt;
    const quemado = quema(e, dt);
    if (quemado && e.hp <= 0) return { quemado, muere: true };
    recupera(e, dt);
    return { quemado, muere: false };
  }

  // A qué velocidad va una nave sin armas propias: más lenta si está apagada; el jefe, más rápido por debajo de media vida
  function velocidad(e, apagado) { return e.d.vel * (apagado ? 0.3 : 1) * (e.d.jefe && e.hp < e.hpMax / 2 ? 1.4 : 1); }

  return { gastaEstados, quema, recupera, pasaTiempo, velocidad };
})();

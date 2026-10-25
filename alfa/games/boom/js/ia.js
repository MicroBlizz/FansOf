// Fans of Boom · IA: elige un tiro simulando varios con la misma física que la partida. Cuanto más difícil, menos se equivoca.
// Camina hacia el rival si no encuentra un buen tiro desde donde está. Usa el azar de la partida (P.az) para que sea repetible. Sin DOM.
'use strict';
const IA = (() => {
  const A = BOOM.ia;
  const vivosDe = (P, enemigo, m) => P.moviles.filter(v => v.vivo && ((v.equipo !== m.equipo) === enemigo));

  function mejorTiro(P, m) {   // simula candidatos y se queda con el que cae más cerca de un rival sin hacer daño a los suyos
    const enemigos = vivosDe(P, true, m), amigos = P.moviles.filter(v => v.vivo && v.equipo === m.equipo);
    const prueba = { id: m.id, x: m.x, y: m.y, dir: m.dir, ang: 45, pot: 50, tiro: 0, vivo: true, def: m.def };
    const ss = m.caos >= BOOM.caos.max;
    let mejor = null;
    const evalua = (ang, pot, tiro) => {
      prueba.ang = ang; prueba.pot = pot; prueba.tiro = tiro;
      const p = FISICA.simula(prueba, P.viento, P.moviles, P.evento, P.sat), R = m.def.tiros[tiro].radio;
      let coste = 1e9;
      for (const e of enemigos) coste = Math.min(coste, Math.max(0, Math.hypot(p.x - e.x, p.y - (e.y - BOOM.movil.centro)) - R * 0.5));
      for (const a of amigos) if (Math.hypot(p.x - a.x, p.y - a.y) < R + BOOM.movil.radio + 10) coste += 400;
      if (p.fin && p.fin.tipo !== 'terreno' && p.fin.tipo !== 'movil') coste += 200;
      if (ang >= BOOM.altura.alto) coste -= 12;   // le gusta el tiro alto
      if (!mejor || coste < mejor.coste) mejor = { ang, pot, tiro, coste, dir: m.dir };
    };
    const az = P.az;
    const objetivo = enemigos.reduce((a, e) => (!a || Math.abs(e.x - m.x) < Math.abs(a.x - m.x) ? e : a), null);
    if (objetivo) prueba.dir = m.dir = objetivo.x >= m.x ? 1 : -1;
    const elige = () => { const t = ss ? 2 : az() < 0.35 ? 1 : 0; return PARTIDA.puedeTiro(m, t) ? t : 0; };
    for (let i = 0; i < A.candidatos; i++) evalua(Math.round(15 + az() * 75), Math.round(25 + az() * 75), elige());
    if (mejor) for (let i = 0; i < 30; i++) evalua(clamp(mejor.ang + Math.round((az() - 0.5) * 6), 0, 90), clamp(mejor.pot + Math.round((az() - 0.5) * 6), 5, 100), mejor.tiro);
    return mejor;
  }
  // el plan de un turno: primero piensa, si está lejos camina y vuelve a pensar, luego apunta poco a poco y dispara
  function plan(P, m) {
    return { etapa: 'piensa', t: A.pausa, andado: false, tiro: null, camino: 0 };
  }
  // un paso de IA; devuelve true cuando toca disparar
  function paso(P, m, dt) {
    const pl = P.plan; if (!pl || m.cayendo) return false;
    const err = A.error[clamp(m.nivel, 0, 2)];
    if (pl.etapa === 'piensa') {
      pl.t -= dt; if (pl.t > 0) return false;
      if (!pl.objetos) { pl.objetos = true; if (m.vida < m.vidaMax * 0.5) PARTIDA.usaObjeto('botiquin'); PARTIDA.usaObjeto('bungee'); if (P.az() < 0.4) PARTIDA.usaObjeto('doble'); }
      const t = mejorTiro(P, m);
      if (t && t.coste > 260 && !pl.andado && m.energia > 40) { pl.andado = true; pl.camino = Math.min(m.energia, 170); pl.etapa = 'camina'; return false; }
      if (!t) { pl.etapa = 'tira'; pl.tiro = { ang: m.ang, pot: m.pot, tiro: m.tiro }; return false; }
      pl.tiro = { ang: clamp(t.ang + (P.az() * 2 - 1) * err / 20, 0, 90), pot: clamp(t.pot + (P.az() * 2 - 1) * err / 11, 5, 100), tiro: t.tiro };
      pl.etapa = 'apunta'; pl.t = 0.4; return false;
    }
    if (pl.etapa === 'camina') {
      const antes = m.energia; MOVIL.mueve(m, m.dir, dt); pl.camino -= antes - m.energia;
      if (pl.camino <= 0 || antes === m.energia) { pl.etapa = 'piensa'; pl.t = 0.5; }
      return false;
    }
    if (pl.etapa === 'apunta') {
      m.tiro = pl.tiro.tiro;
      const da = pl.tiro.ang - m.ang, dp = pl.tiro.pot - m.pot;
      m.ang += Math.sign(da) * Math.min(Math.abs(da), 45 * dt); m.pot += Math.sign(dp) * Math.min(Math.abs(dp), 55 * dt);
      if (Math.abs(da) < 0.01 && Math.abs(dp) < 0.01) { pl.t -= dt; if (pl.t <= -0.35) return true; }
      return false;
    }
    return pl.etapa === 'tira';
  }
  return { plan, paso, mejorTiro };
})();

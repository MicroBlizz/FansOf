// Fans of Asalto · ADAPTADORES · La pantalla durante la batalla: sale a luchar (con la entrada del jefe o el aviso de la oleada de
// élite), hace avanzar la batalla a la velocidad elegida, convierte cada cosa que pasa (B.eventos) en efectos y sonidos (golpes,
// críticos, la carga, muertes con su moneda y su cuenta de bajas seguidas, los que cruzan, curas, rayos, los golpes del jefe) y, al acabar, cierra la oleada: cartel con el
// resultado y las ventanas de los premios o del final de la partida.
'use strict';
AS.pantallaBatalla = (() => {
  const fx = AS.fx, C = AS.tema.C;
  const SON_ATAQUE = { cuerpo: 'espada', flecha: 'flecha', magia: 'magia', bomba: 'flecha', cura: 'cura', moneda: 'moneda' };
  const pos = (E, x, y) => E.P.aPantalla(x, y);

  function lucha(E) {
    const r = E.casos.lucha();
    if (!r.ok && r.error === 'elige-carta') { AS.ventanas.leyendas.despertar(E); return; }   // antes, el legendario elige su carta de Despertar
    if (!r.ok) { AS.suena('noVale'); E.pistaFija = { txt: tr('Pon un héroe en el campo'), t: 2 }; return; }
    const ol = E.casos.partida.proxima;
    Object.assign(E, { batalla: r.valor, tFin: 0, cerrando: false, oroBatalla: 0, arrastre: null, intro: null, combo: 0, tCombo: 0 });
    E.celdasOro.clear(); E.casi.clear();
    if (ol.tipo === 'jefe') { E.intro = { t: 0, dura: 3, jefe: ol.jefe, rugio: false }; AS.suena('jefe'); fx.sacude(6); AS.suena.musica(ASALTO.jefes[ol.jefe].musica); }
    else if (ol.tipo === 'elite') { AS.pantalla.cartel(tr('AUDITORÍA'), tr('Si pierdes esta oleada, se acaba'), C.rojo, 1.8); AS.suena('lucha'); }
    else AS.suena('lucha');
  }

  /* ---------- lo que pasa en la batalla, hecho efecto ---------- */
  const EVENTO = {
    golpe(E, e) {
      const s = pos(E, e.x, e.y), alto = e.jefe ? 150 : 80;
      E.destellos.set(e.id, 0.2);
      fx.numero(s.x, s.y - alto, e.d, e.crit ? '#ffd23a' : e.lado === 'heroe' ? '#ff8a7a' : '#ffffff', e.crit ? 48 : 32);
      fx.chispas(s.x, s.y - alto / 2, e.crit ? 12 : 5, e.crit ? '#ffd23a' : '#fff3d6', e.crit ? 200 : 110, e.crit);
      if (e.crit) { fx.sacude(5); AS.suena('critico'); fx.luz(s.x, s.y - 40, 110, [255, 220, 120], 0.25); fx.onda(s.x, s.y - alto / 2, 44, '#ffd23a'); }
      else if (e.lado === 'enemigo') fx.luz(s.x, s.y - 40, 60, [255, 240, 200], 0.12);
    },
    ataque(E, e) {
      AS.suena(SON_ATAQUE[e.tipo] || 'espada');
      if (e.radio) { const s = pos(E, e.x, e.y); fx.onda(s.x, s.y - 20, e.radio, '#fff3d6'); }
    },
    muere(E, e) {
      const s = pos(E, e.x, e.y);
      fx.chispas(s.x, s.y - 40, e.jefe ? 60 : 20, e.lado === 'heroe' ? '#8fd0f8' : '#ffd23a', e.jefe ? 320 : 200, true);
      AS.suena('muere');
      if (e.lado === 'enemigo' && !e.jefe) baja(E, s);
      if (e.lado === 'enemigo') fx.monedas(s.x, s.y - 40, e.jefe ? 14 : e.elite ? 5 : 1, E.destinoOro.x, E.destinoOro.y, () => { if (E.batalla) E.oroBatalla += ASALTO.partida.oroPorMuerte; AS.suena('moneda'); });
      if (e.jefe) { fx.fogonazo(0.9, '#fff3d6'); fx.sacude(18); fx.frena(0.9); fx.luz(s.x, s.y - 80, 320, [255, 230, 150], 1.2); AS.suena('gordo'); for (let i = 0; i < 6; i++) fx.brasas(s.x, s.y - 60, 10, '#ffd23a', 70); }
      else if (e.elite) { fx.sacude(8); fx.luz(s.x, s.y - 50, 180, [255, 210, 120], 0.5); }
    },
    cruza(E, e) {
      const s = pos(E, e.x, e.y);
      fx.fogonazo(0.45, '#d8402f'); fx.sacude(9); AS.suena('cruza');
      fx.numero(40, s.y - 60, tr('-1 vida'), '#ff7a6a', 48);
      E.vidasRojo = 1.2;
    },
    cura(E, e) { const s = pos(E, e.x, e.y); fx.numero(s.x, s.y - 90, '+' + e.c, '#8fe07a'); fx.brasas(s.x, s.y - 30, 4, '#8fe07a', 16); },
    esquiva(E, e) { const s = pos(E, e.x, e.y); fx.numero(s.x, s.y - 90, tr('ESQUIVA'), '#8fd0f8'); },
    bloqueo(E, e) { const s = pos(E, e.x, e.y); fx.numero(s.x, s.y - 90, tr('ESCUDO'), '#8fd0f8'); },
    onda(E, e) { const s = pos(E, e.x, e.y); fx.onda(s.x, s.y - 10, e.radio * 1.2, '#ffb04a'); fx.chispas(s.x, s.y - 20, 12, '#ff8a2a', 190, true); fx.luz(s.x, s.y - 20, 150, [255, 170, 70], 0.3); fx.sacude(3); AS.suena('bomba'); },
    rayo(E, e) { const a = pos(E, e.x1, e.y1 + 40), b = pos(E, e.x2, e.y2 + 30); fx.rayo(a.x, a.y - 60, b.x, b.y - 50); AS.suena('magia'); },
    habilidad(E, e) {
      if (e.clase !== 'tanque') return;
      AS.suena('escudo');
      for (const u of E.batalla.u) if (e.ids.includes(u.id)) { const s = pos(E, u.x, u.y); fx.onda(s.x, s.y - 40, 56, '#8fd0f8'); }
    },
    // la carga: el grito, el suelo que tiembla y el polvo que levantan
    carga(E) {
      AS.suena('carga'); fx.sacude(6); fx.fogonazo(0.15, '#fff3d6');
      AS.pantalla.cartel(tr('¡A LA CARGA!'), '', C.rojo, 0.7);
      for (const u of E.batalla.u) if (u.lado === 'heroe' && !u.muerta) { const s = pos(E, u.x, u.y); fx.brasas(s.x, s.y - 8, 6, '#fff3d6', 16); fx.onda(s.x, s.y - 4, 40, '#fff3d6'); }
    },
    tanda(E) { AS.pantalla.cartel(tr('¡REFUERZOS!'), '', C.sangre, 0.9); AS.suena('aviso'); },
    aviso() { AS.suena('aviso'); },
    cae(E, e) {
      fx.sacude(11); fx.fogonazo(0.25, '#ffb04a'); AS.suena('cae');
      if (e.forma === 'franja') { const s = pos(E, 270, e.y); for (let i = 0; i < 9; i++) fx.chispas(E.P.W * (i + 0.5) / 9, s.y - 20, 6, '#ff8a2a', 200, true); }
      else if (e.tipo !== 'invoca') { const s = pos(E, e.x, e.y); fx.onda(s.x, s.y - 10, (e.radio || 40) * 1.2, '#ff5a3a'); fx.chispas(s.x, s.y - 20, 22, '#ff8a2a', 240, true); fx.luz(s.x, s.y - 30, 220, [255, 120, 60], 0.4); }
      else { const s = pos(E, e.x, e.y); fx.columna(s.x, s.y, [255, 90, 70], 180); }
    },
    furia(E) { AS.pantalla.cartel(tr('¡FURIA!'), tr('El jefe pega más rápido'), C.rojo, 1.4); fx.sacude(10); fx.fogonazo(0.4, '#d8402f'); AS.suena('furia'); },
    fin(E, e) { if (e.fin === 'victoria') { AS.suena('premio', 2); fx.fogonazo(0.45, '#fff3d6'); fx.frena(0.45); fx.sacude(8); } else AS.suena('cruza'); },
  };
  // un enemigo cae: su golpe en pantalla y, si caen seguidos, la cuenta (x2, x3…), cada vez más aguda
  function baja(E, s) {
    E.combo = (E.tCombo > 0 ? E.combo : 0) + 1; E.tCombo = 1.5;
    fx.sacude(3 + Math.min(E.combo, 5)); fx.onda(s.x, s.y - 30, 50, '#ffd23a'); fx.luz(s.x, s.y - 40, 120, [255, 215, 90], 0.25);
    if (E.combo >= 2) { fx.numero(s.x, s.y - 130, 'x' + E.combo, '#ffd23a', E.combo >= 5 ? 64 : 48); AS.suena('combo', E.combo); }
  }
  function eventos(E) {
    for (const e of E.batalla.eventos.splice(0)) if (!AS.leyendasBatalla.trata(E, e) && EVENTO[e.e]) EVENTO[e.e](E, e);   // los de los legendarios, en leyendas-batalla.js
  }

  /* ---------- cerrar la oleada ---------- */
  function cierra(E) {
    const r = E.casos.terminaOleada();
    E.batalla = null; E.cerrando = false; E.oroBatalla = 0;
    if (!r.ok) return;
    const v = r.valor, p = E.casos.partida;
    if (v.perdidas) E.vidasRojo = 1.6;
    if (v.final === 'derrota') { AS.suena.sintonia('lose'); AS.ventanas.fin(E); return; }
    if (v.gano) {
      AS.pantalla.cartel(v.tipo === 'jefe' ? tr('¡JEFE DERROTADO!') : tr('¡OLEADA SUPERADA!'), v.perdidas ? tr('-{n} vidas', { n: v.perdidas }) : '', v.tipo === 'jefe' ? C.oro2 : C.verde, 1.4);
      fx.monedas(E.P.W / 2, E.P.arena.y + E.P.arena.h / 2, 8, E.destinoOro.x, E.destinoOro.y, () => AS.suena('moneda'));
    } else { AS.pantalla.cartel(tr('OLEADA PERDIDA'), tr('-1 vida · Refuerza y repítela'), C.sangre, 2.2); setTimeout(() => AS.ventanas.perdida(E), 1500); }
    if (v.tipo === 'jefe') AS.suena.musica(ASALTO.zonas[p.zona].musica);
    setTimeout(() => AS.ventanas.premios(E, () => { if (p.final) { AS.suena.sintonia(p.final === 'victoria' ? 'win' : 'lose'); AS.ventanas.fin(E); } }), v.premios.length || p.final ? 1400 : 0);
  }
  function avanza(E, dt) {
    if (AS.ventanas.abierta()) return;
    if (E.intro) { entrada(E, dt); return; }
    const B = E.batalla, paso = dt * fx.velocidad();
    for (let i = 0; i < E.vel; i++) { E.casos.tic(paso); eventos(E); }
    if (B.fin && !E.cerrando) { E.tFin += dt; if (E.tFin > 1.0) { E.cerrando = true; cierra(E); } }
  }
  // la entrada del jefe: la arena se queda a oscuras con el foco en él, ruge (tiembla todo) y luego entra su nombre
  function entrada(E, dt) {
    const I = E.intro, j = E.batalla.jefe;
    I.t += dt;
    if (!I.rugio && I.t > 0.75 && j) {
      const s = pos(E, j.x, j.y);
      I.rugio = true;
      fx.sacude(16); fx.fogonazo(0.4, '#d8402f'); fx.onda(s.x, s.y - 10, 190, '#ff5a3a'); fx.chispas(s.x, s.y - 60, 26, '#ff8a2a', 260, true); AS.suena('furia');
      for (let i = 0; i < 5; i++) fx.brasas(s.x - 60 + i * 30, s.y - 20, 6, '#ffb04a', 40);
    }
    if (I.t >= I.dura) E.intro = null;
  }
  // su nombre en una cinta que entra de lado, abajo (para no taparlo), y su lema en un pergamino
  function pintaIntro(g, P, E) {
    const I = E.intro, d = ASALTO.jefes[I.jefe], A = P.arena, e = Math.min(1, Math.max(0, (I.t - 0.9) / 0.3)), fuera = I.t > I.dura - 0.3 ? (I.t - (I.dura - 0.3)) / 0.3 : 0;
    if (e <= 0) return;
    const w = P.W - 16, x = Math.round(8 - (1 - e) * (1 - e) * P.W + fuera * fuera * P.W), y = A.y + A.h - 118;
    AS.tema.cinta(g, x, y - 44, w, 90, C.rojo);
    AS.texto.pinta(g, tr(d.nombre), x + w / 2, y - 4, { t: 64, col: C.crema, ancla: 'c', max: w - 60 });
    AS.tema.pergamino(g, x + 26, y + 40, w - 52, 70);
    AS.texto.parrafo(g, tr(d.lema), x + w / 2, y + 74, { col: C.tinta, borde: false, max: w - 84 });
  }
  return { lucha, avanza, pintaIntro };
})();

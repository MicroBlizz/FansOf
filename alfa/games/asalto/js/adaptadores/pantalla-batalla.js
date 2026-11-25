// Fans of Asalto · ADAPTADORES · La pantalla durante la batalla: sale a luchar (la entrada del jefe y el aviso de la oleada de
// élite son el cartel grande de cartel-oleada.js), hace avanzar la batalla a la velocidad elegida, convierte cada cosa que pasa (B.eventos) en efectos y sonidos (golpes,
// críticos, la carga, muertes con su moneda y su cuenta de bajas seguidas, los que cruzan, curas, rayos, los golpes del jefe) y, al acabar, cierra la oleada: cartel con el
// resultado y las ventanas de los premios o del final de la partida. El efecto propio de cada clase (golpes, curas, habilidades y
// estelas de los proyectiles) lo pone hechizos.js.
'use strict';
AS.pantallaBatalla = (() => {
  const fx = AS.fx, C = AS.tema.C;
  const SON_ATAQUE = { cuerpo: 'espada', flecha: 'flecha', magia: 'magia', bomba: 'flecha', cura: 'cura', moneda: 'moneda' };
  const SON_HABILIDAD = { tanque: 'escudo', mago: 'magia', brujo: 'magia', asesino: 'flecha' };
  const pos = (E, x, y) => E.P.aPantalla(x, y);
  const H = AS.hechizos;
  const unidad = (E, id) => (id == null ? null : E.batalla.u.find(u => u.id === id) || null);
  // dónde va un proyectil en pantalla (el mismo punto en el que lo dibuja pinta-arena.js)
  const enVuelo = E => p => { const s = pos(E, p.x, p.y + 34); return { x: s.x, y: s.y - 52 }; };

  function lucha(E) {
    const r = E.casos.lucha();
    if (!r.ok && r.error === 'elige-carta') { AS.ventanas.leyendas.despertar(E); return; }   // antes, el legendario elige su carta de Despertar
    if (!r.ok) { AS.suena('noVale'); E.pistaFija = { txt: tr('Pon un héroe en el campo'), t: 2 }; return; }
    const ol = E.casos.partida.proxima;
    Object.assign(E, { batalla: r.valor, tFin: 0, cerrando: false, oroBatalla: 0, arrastre: null, intro: null, combo: 0, tCombo: 0 });
    E.celdasOro.clear(); E.casi.clear();
    if (ol.tipo === 'normal') AS.suena('lucha');   // la de élite y la del jefe traen su cartel grande (el aviso 'oleada', cartel-oleada.js)
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
      H.golpe(fx, { x: s.x, y: s.y - alto / 2 }, e, unidad(E, e.de), unidad(E, e.id));
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
    cura(E, e) { const s = pos(E, e.x, e.y); fx.numero(s.x, s.y - 90, '+' + e.c, '#8fe07a'); fx.brasas(s.x, s.y - 30, 4, '#8fe07a', 16); H.cura(fx, { x: s.x, y: s.y - 40 }, unidad(E, e.de)); },
    esquiva(E, e) { const s = pos(E, e.x, e.y); fx.numero(s.x, s.y - 90, tr('ESQUIVA'), '#8fd0f8'); },
    bloqueo(E, e) { const s = pos(E, e.x, e.y); fx.numero(s.x, s.y - 90, tr('ESCUDO'), '#8fd0f8'); },
    onda(E, e) { const s = pos(E, e.x, e.y); fx.onda(s.x, s.y - 10, e.radio * 1.2, '#ffb04a'); fx.chispas(s.x, s.y - 20, 12, '#ff8a2a', 190, true); fx.luz(s.x, s.y - 20, 150, [255, 170, 70], 0.3); fx.sacude(3); AS.suena('bomba'); },
    rayo(E, e) { const a = pos(E, e.x1, e.y1 + 40), b = pos(E, e.x2, e.y2 + 30); H.rayo(fx, { x: a.x, y: a.y - 60 }, { x: b.x, y: b.y - 50 }); AS.suena('magia'); },
    // los objetos: la Bomba de confeti, el atontado del Martillo de forja y el «salvado» del Contrato y del Amuleto
    confeti(E, e) { const s = pos(E, e.x, e.y); H.confeti(fx, { x: s.x, y: s.y - 30 }, e.radio * 1.2); AS.suena('bomba'); },
    atonta(E, e) { const s = pos(E, e.x, e.y); H.atonta(fx, { x: s.x, y: s.y - 78 }, ASALTO.efectosObjetos.atonta); },
    salva(E, e) { const s = pos(E, e.x, e.y); H.salva(fx, { x: s.x, y: s.y - 40 }); fx.fogonazo(0.25, '#ffe9a0'); AS.suena('premio', 1); },
    habilidad(E, e) {
      if (SON_HABILIDAD[e.clase]) AS.suena(SON_HABILIDAD[e.clase]);
      const puntos = E.batalla.u.filter(u => e.ids.includes(u.id)).map(u => { const s = pos(E, u.x, u.y); return { x: s.x, y: s.y - 40 }; });
      H.habilidad(fx, e.clase, puntos);
    },
    // la carga: el grito, el suelo que tiembla y el polvo que levantan
    carga(E) {
      AS.suena('carga'); fx.sacude(6); fx.fogonazo(0.15, '#fff3d6');
      AS.pantalla.cartel(tr('¡A LA CARGA!'), '', C.rojo, 0.7);
      for (const u of E.batalla.u) if (u.lado === 'heroe' && !u.muerta) { const s = pos(E, u.x, u.y); fx.brasas(s.x, s.y - 8, 6, '#fff3d6', 16); fx.onda(s.x, s.y - 4, 40, '#fff3d6'); }
    },
    tanda(E) { AS.pantalla.cartel(tr('¡REFUERZOS!'), '', C.sangre, 0.9); AS.suena('aviso'); },
    aviso() { AS.suena('aviso'); },
    oleada(E, e) { AS.cartelOleada.empieza(E, e); },
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
    E.batalla = null; E.cerrando = false; E.oroBatalla = 0; E.intro = null;
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
    AS.cartelOleada.avanza(E, dt);
    const B = E.batalla, paso = dt * fx.velocidad();
    for (let i = 0; i < E.vel; i++) { E.casos.tic(paso); eventos(E); }
    H.estelas(fx, B.proy, enVuelo(E));
    if (B.fin && !E.cerrando) { E.tFin += dt; if (E.tFin > 1.0) { E.cerrando = true; cierra(E); } }
  }
  return { lucha, avanza };
})();

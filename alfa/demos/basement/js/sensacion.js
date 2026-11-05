// Fans of Basement · Sensación de juego (solo pantalla): lo que hace que cada golpe se sienta, sin tocar las reglas. Una pausa
// cortísima al tumbar algo grande o al recibir un golpe, cámara lenta y destello al vencer a un jefe, la racha de bajas («x25»,
// con cartel en 10, 25, 50 y 100), los críticos en grande y los bichos que se aplastan al recibir. principal.js le pasa los
// eventos de la bajada y le pide cuánto avanza el tiempo (velocidad); la vista le pide el destello y la racha para pintarlos.
// Y la entrada de cada jefe, de película: la bajada se para, bandas negras, su nombre y lo que comenta Lola.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const S = B.sensacion = { pausa: 0, lento: 0, flash: 0, racha: 0, rachaT: 0, mejorRacha: 0, intro: null };
  const INTRO = { dura: 2.6 };
  const JEFE = {
    producto: ['Jefa de Marketing y de tu vida', 'Se tapa con su escudo de PowerPoint. Dispárale cuando lo baje.'],
    rrhh: ['Despide antes de preguntar', 'Sus sellos de DESPEDIDO van en abanico: busca el hueco.'],
    lanzamiento: ['Sale hoy, funcione o no', 'Invoca bugs sin parar. Limpia los pequeños y no te quedes quieto.'],
    accionistas: ['Solo le importa el dividendo', 'Lanza anillos de monedas. Muévete entre ellas.'],
    becario2004: ['Lleva atrapado aquí desde 2004', '¡Es el becario que se perdió en el Legacy! Lanza disquetes en abanico. Derrótalo y te dará un premio enorme.'],
    fantasma: ['Solo sale cuando se va la luz', 'El Fantasma del Servidor. Sus anillos atraviesan la oscuridad: no pierdas de vista el centro.'],
    impresora: ['Atascada desde el último lanzamiento', '¡La Impresora Poseída! Escupe folios y bugs. Rompiste demasiados muebles y vino a vengarse.'],
    ceo: ['El que tiró el servidor', 'Tiene tres fases y cada vez se enfada más. Cuando caiga, ¡aguanta hasta el ascensor!'],
  };
  const PAUSA = { baja: 0.035, grande: 0.07, golpe: 0.06 }, RACHA = { dura: 1.6, avisos: [10, 25, 50, 100] };
  const GRANDES = { reunion: 1, dorado: 1, spam: 1, critico: 1 };

  S.reinicia = () => Object.assign(S, { pausa: 0, lento: 0, flash: 0, racha: 0, rachaT: 0, mejorRacha: 0, intro: null });
  S.enIntro = () => !!S.intro;

  // Cuánto avanza la bajada este fotograma: nada durante la pausa, un cuarto en cámara lenta. También gasta los temporizadores.
  S.velocidad = function (dt) {
    S.flash = Math.max(0, S.flash - dt * 2.5);
    S.rachaT = Math.max(0, S.rachaT - dt);
    if (S.rachaT === 0) S.racha = 0;
    if (S.intro) { S.intro.t += dt; if (S.intro.t >= INTRO.dura) S.intro = null; return 0; }
    if (S.pausa > 0) { S.pausa -= dt; return 0; }
    if (S.lento > 0) { S.lento -= dt; return 0.25; }
    return 1;
  };

  // Lo que provoca cada evento. Devuelve el cartel de racha si toca ({ n }) o null.
  const ALEVENTO = {
    baja: (ev) => { S.pausa = Math.max(S.pausa, GRANDES[ev.enemigo] ? PAUSA.grande : PAUSA.baja); return sumaRacha(); },
    golpe: () => { S.pausa = Math.max(S.pausa, PAUSA.golpe); S.racha = 0; return null; },
    jefeVencido: () => { S.lento = 1.3; S.flash = 1; return sumaRacha(); },
    final: () => { S.lento = 2; S.flash = 1; return null; },
    mueble: () => { S.pausa = Math.max(S.pausa, PAUSA.baja); return null; },
    jefe: (ev) => { S.intro = { t: 0, id: ev.id, nombre: ev.nombre }; return null; },
    fase: () => { S.pausa = Math.max(S.pausa, 0.35); S.flash = 0.5; return null; },
  };
  S.alEvento = (ev) => (ALEVENTO[ev.tipo] ? ALEVENTO[ev.tipo](ev) : null);

  function sumaRacha() {
    S.racha++; S.rachaT = RACHA.dura; S.mejorRacha = Math.max(S.mejorRacha, S.racha);
    return RACHA.avisos.includes(S.racha) ? { n: S.racha } : null;
  }

  // la entrada del jefe: bandas negras que entran, su nombre, su apodo y el comentario de Lola
  function intro(g, W, H) {
    const I = S.intro, UI = B.ui, k = Math.min(1, I.t * 4), banda = H * 0.13 * k, j = JEFE[I.id] || ['', ''];
    g.fillStyle = '#000000'; g.fillRect(0, 0, W, banda); g.fillRect(0, H - banda, W, banda);
    if (I.t < 0.25) return;
    const sale = Math.min(1, (I.t - 0.25) * 3);
    g.save(); g.globalAlpha = sale;
    UI.titulo(g, tr(I.nombre).toUpperCase(), W / 2, H * 0.24, 34);
    UI.franja(g, tr(j[0]), W / 2, H * 0.24 + 44, 17, W - 60);
    if (I.t > 0.6) {
      UI.pergamino(g, 20, H - banda - 150, W - 40, 130);
      UI.dibuja(g, 'ev-lola', 76, H - banda - 85, 1.3);
      UI.lineas(g, tr(j[1]), 134, H - banda - 112, 19, W - 180, UI.C.cafe, 'left', 0, 23);
    }
    g.restore();
  }

  // la racha (a la derecha, bajo el marcador), la entrada del jefe y el destello blanco
  S.dibuja = function (g, W, H) {
    if (S.intro) intro(g, W, H);
    if (S.racha >= 5) {
      const k = 1 + Math.min(1, S.racha / 50) * 0.6, a = Math.min(1, S.rachaT / 0.5);
      g.save(); g.globalAlpha = a;
      B.ui.texto(g, 'x' + S.racha, W - 26, 150, Math.round(30 * k), S.racha >= 25 ? B.ui.C.oro : '#ffffff', 'right', 5);
      B.ui.texto(g, tr('RACHA'), W - 26, 150 + 26 * k, 14, B.ui.C.crema, 'right', 3);
      g.restore();
    }
    if (S.flash > 0) { g.fillStyle = 'rgba(255,255,255,' + (S.flash * 0.7).toFixed(2) + ')'; g.fillRect(0, 0, W, H); }
  };
})(BAS);

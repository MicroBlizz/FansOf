// Fans of Boom · ENTRENAMIENTO y AYUDA FÁCIL. Entrenamiento: tú contra una diana que no tira (el becario de prácticas), sin rango;
// mientras apuntas se ven DOS líneas: por dónde iría el tiro sin viento (azul) y por dónde va de verdad (blanca, con viento y eventos),
// y un consejo por turno. Ayuda fácil (se pone por jugador al preparar la partida): solo la línea sin viento; el viento lo pones tú.
'use strict';
const ENTRENO = (() => {
  const CONSEJOS = [
    'Cambia el ángulo y la potencia: la línea de puntos dice dónde caerá el tiro.',
    'Mira la rosa del viento: empuja el tiro hacia donde apunta la flecha, y más cuanto más grande es el número.',
    'Con 70° o más el tiro duele más (TIRO ALTO). Si además sale por arriba de la pantalla, todavía más.',
    'Cada móvil tiene dos tiros: prueba el Tiro 2 con su botón o con las teclas 1 y 2.',
    'Cuando la barra de CAOS se llena (la morada, bajo la vida), puedes lanzar el Tiro Especial (SS).',
    'Lo que más pega, menos agujero hace. Los tiros flojos abren el suelo: cava bajo tu rival y que caiga al vacío.',
    'Moverte gasta el camino del turno, y tardar en tirar o usar objetos te retrasa en la cola de turnos.',
  ];
  const cache = { real: { k: '', r: null }, cero: { k: '', r: null } };
  let consejo = { turno: -1, i: -1 };

  function abre() { GARAJE.abre(PANT.movil(), id => { $('#bm-modal').hidden = true; empieza(id); }); }
  function empieza(movil) {
    const otros = BOOM.moviles.filter(d => d.id !== movil), rival = otros[Math.floor(Math.random() * otros.length)].id;
    consejo = { turno: -1, i: -1 };
    PANT.juegaCon({ modo: '1v1', mapa: PANT.mapa(), entrena: true, rango: false,
      slots: [{ ia: false, nombre: '', movil }, { ia: true, diana: true, nombre: tr('Becario de prácticas'), movil: rival }] });
  }
  // la trayectoria del tiro que vas a hacer; se recalcula solo cuando cambia algo
  function trayectoria(P, m, conViento) {   // conViento = false: sin viento ni eventos de mapa
    const ca = cache[conViento ? 'real' : 'cero'], k = [m.x, m.y, m.ang, m.pot, m.dir, m.tiro, conViento ? P.viento : 0, conViento && P.evento ? P.evento.def.id : '', P.turnos].join(',');
    if (k !== ca.k) { ca.k = k; ca.r = FISICA.traza(m, conViento ? P.viento : 0, P.moviles, conViento ? P.evento : null); }
    return ca.r;
  }
  function pinta(c, P, CAM) {
    const m = P.actual;
    if (!m || m.ia || P.fase !== 'apunta') return;
    const entreno = P.entrena;
    if (!entreno && !m.facil) return;
    linea(c, P, m, CAM, trayectoria(P, m, false), entreno ? '#7cb8ff' : '#fff', entreno);
    if (entreno) { linea(c, P, m, CAM, trayectoria(P, m, true), '#fff', false); pintaConsejo(c, P); }
  }
  function linea(c, P, m, CAM, tr0, col, tenue) {
    const V = PINTAR.V, { puntos, p } = tr0, T = m.def.tiros[m.tiro], ef = T.efecto || {};
    c.save(); c.lineCap = 'round'; if (tenue) c.globalAlpha = 0.7;
    for (let i = 0; i < puntos.length; i += 4) {
      const x = puntos[i] - CAM.x, y = puntos[i + 1] - CAM.y; if (x < -10 || x > V.w + 10 || y < -10 || y > V.h + 10) continue;
      c.fillStyle = OL; c.beginPath(); c.arc(x, y, 4.2, 0, 6.2832); c.fill();
      c.fillStyle = col; c.beginPath(); c.arc(x, y, 2.6, 0, 6.2832); c.fill();
    }
    const fx = p.x - CAM.x, fy = p.y - CAM.y, cae = p.fin && (p.fin.tipo === 'terreno' || p.fin.tipo === 'movil');
    if (cae) {
      const r = ef.tipo === 'cielo' ? ef.radio : T.radio;
      c.setLineDash([6, 6]); c.lineWidth = 3; c.strokeStyle = tenue ? col : '#ffcb3d'; c.beginPath(); c.arc(fx, fy, r, 0, 6.2832); c.stroke(); c.setLineDash([]);
      if (ef.tipo === 'cielo') { c.globalAlpha = 0.35; c.fillStyle = '#7cf0ff'; c.fillRect(fx - 4, 0, 8, fy); c.globalAlpha = 1; }   // por ahí caerá el golpe
      c.strokeStyle = OL; c.lineWidth = 5; c.beginPath(); c.moveTo(fx - 9, fy - 9); c.lineTo(fx + 9, fy + 9); c.moveTo(fx + 9, fy - 9); c.lineTo(fx - 9, fy + 9); c.stroke();
      c.strokeStyle = tenue ? col : '#ffcb3d'; c.lineWidth = 2.5; c.stroke();
    } else if (fx > -20 && fx < V.w + 20) PINTAR_TXT(c, tr('Fuera'), clamp(fx, 40, V.w - 40), clamp(fy, 30, V.h - 30), 18, '#cdb9ea');
    if (cae && (fx < 0 || fx > V.w)) {   // cae fuera de la pantalla: una flecha en el borde con la distancia
      const d = fx < 0 ? -1 : 1, x = d < 0 ? 26 : V.w - 26, y = clamp(fy, 150, V.h - 150);
      c.fillStyle = col; c.strokeStyle = OL; c.lineWidth = 3; c.beginPath(); c.moveTo(x + d * 14, y); c.lineTo(x - d * 6, y - 13); c.lineTo(x - d * 6, y + 13); c.closePath(); c.fill(); c.stroke();
      PINTAR_TXT(c, Math.round(Math.abs(p.x - m.x)) + ' m', x - d * 16, y + 24, 14, col, d < 0 ? 'left' : 'right');
    }
    c.restore();
  }
  function pintaConsejo(c, P) {   // un consejo por turno, arriba (partido en líneas si no cabe), y qué es cada línea
    const V = PINTAR.V;
    if (consejo.turno !== P.turnos) { consejo.turno = P.turnos; consejo.i = (consejo.i + 1) % CONSEJOS.length; }
    const estrecho = V.w < 700, tam = estrecho ? 13 : 15, max = estrecho ? V.w - 60 : Math.min(V.w - 360, 560), lineas = [];
    c.font = `800 ${tam}px "Baloo 2", system-ui, sans-serif`;
    for (const p of tr(CONSEJOS[consejo.i]).split(' ')) {
      const l = lineas.length ? lineas[lineas.length - 1] + ' ' + p : p;
      if (lineas.length && c.measureText(l).width <= max) lineas[lineas.length - 1] = l; else lineas.push(p);
    }
    lineas.unshift(tr('ENTRENAMIENTO') + ' · ' + tr('Dianas: {n}', { n: P.aciertos }));
    lineas.push(tr('Azul: sin viento · Blanca: con el viento de ahora'));
    const alto = tam + 6, w = Math.min(V.w - 32, Math.max(...lineas.map(l => c.measureText(l).width)) + 28), y0 = estrecho ? Math.round(V.h * 0.36) : 150;   // debajo del minimapa y del viento, sin tapar los objetos
    c.fillStyle = 'rgba(32,16,44,.86)'; c.strokeStyle = OL; c.lineWidth = 3; c.beginPath(); rrPath(c, V.w / 2 - w / 2, y0, w, lineas.length * alto + 10, 14); c.fill(); c.stroke();
    const n = lineas.length - 1;
    lineas.forEach((l, i) => PINTAR_TXT(c, l, V.w / 2, y0 + 5 + alto / 2 + i * alto, i === n ? tam - 2 : tam, i === 0 ? '#ffcb3d' : i === n ? '#7cb8ff' : '#ffe9c6'));
  }
  // en el minimapa: el camino y dónde cae, para cuando el final queda fuera de la pantalla
  function mini(c, P, MM) {
    const m = P.actual; if (!m || m.ia || P.fase !== 'apunta' || (!P.entrena && !m.facil)) return;
    const k = MM.w / BOOM.mundo.ancho;
    for (const [conViento, col] of P.entrena ? [[false, '#7cb8ff'], [true, '#fff']] : [[false, '#fff']]) {
      const { puntos, p } = trayectoria(P, m, conViento);
      c.fillStyle = col; for (let i = 0; i < puntos.length; i += 16) if (puntos[i + 1] >= 0) c.fillRect(MM.x + puntos[i] * k - 1, MM.y + puntos[i + 1] * k - 1, 2, 2);
      c.strokeStyle = col; c.lineWidth = 2; const x = MM.x + p.x * k, y = MM.y + clamp(p.y, 0, BOOM.mundo.alto) * k;
      c.beginPath(); c.moveTo(x - 4, y - 4); c.lineTo(x + 4, y + 4); c.moveTo(x + 4, y - 4); c.lineTo(x - 4, y + 4); c.stroke();
    }
  }
  return { abre, empieza, pinta, mini };
})();

// Fans of Asalto · ADAPTADORES · Pinta la arena. Mientras se prepara la oleada: los huecos del campo, los héroes en su sitio (con su
// nivel y la flecha de «puede ascender») y los enemigos que van a venir esperando a la derecha. En la batalla: los avisos de los
// golpes del jefe en el suelo, las unidades de la batalla (por orden de fondo a frente), sus barras de vida, los proyectiles y la
// barra del jefe. Los héroes miran a la derecha y los enemigos a la izquierda: no se voltea ningún dibujo.
'use strict';
AS.pinta = AS.pinta || {};
AS.pinta.arena = (() => {
  const T = AS.tema, C = T.C, D = AS.dibujos, tx = AS.texto.pinta, elipse = T.elipse;
  const semilla = id => { let n = 0; for (const ch of String(id)) n = (n * 31 + ch.charCodeAt(0)) % 997; return n; };

  function insignia(g, h, x, y) {
    T.losa(g, x, y, 32, 30, h.rama ? C.oro : C.crema);
    tx(g, String(h.nivel), x + 16, y + 15, { col: C.tinta, borde: false, ancla: 'c', max: 26 });
    if (h.rama) D.icono(g, 'clase-' + h.rama, x + 44, y + 15, 1);
  }
  // la flecha que sube y baja sobre el héroe que ya puede ascender
  function flecha(g, x, y, t) {
    const dy = Math.round(Math.sin(t * 6) * 4);
    g.fillStyle = C.tinta; g.fillRect(x - 9, y + dy - 2, 18, 16); g.fillRect(x - 15, y + dy + 4, 30, 8);
    g.fillStyle = C.oro; g.fillRect(x - 5, y + dy + 6, 10, 12); g.fillRect(x - 11, y + dy + 6, 22, 4); g.fillRect(x - 7, y + dy + 2, 14, 4); g.fillRect(x - 3, y + dy - 0, 6, 4);
  }
  function candado(g, x, y) {
    g.fillStyle = C.tinta; g.fillRect(x - 12, y - 8, 24, 20); g.fillRect(x - 9, y - 18, 6, 12); g.fillRect(x + 3, y - 18, 6, 12); g.fillRect(x - 9, y - 20, 18, 6);
    g.fillStyle = C.oro; g.fillRect(x - 10, y - 6, 20, 16); g.fillRect(x - 7, y - 16, 2, 10); g.fillRect(x + 5, y - 16, 2, 10); g.fillRect(x - 7, y - 18, 14, 2);
    g.fillStyle = C.oro2; g.fillRect(x - 10, y + 6, 20, 4); g.fillStyle = C.tinta; g.fillRect(x - 2, y - 2, 4, 8);
  }
  // los huecos del campo: una losa redonda en el suelo con su runa. La de un hueco libre se enciende al arrastrar a un héroe
  function huecos(g, P, p, E) {
    const arrastra = E.arrastre && E.arrastre.movido;
    for (let i = 0; i < p.equipo.campo.length; i++) {
      const s = P.hueco(i), abierto = AS.equipo.abierto(p.equipo, i), h = p.equipo.campo[i], libre = abierto && !h, marca = arrastra && libre;
      const aro = !abierto ? C.madera : marca ? '#b8ff7a' : h ? (h.dorado ? C.oro : C.oro2) : '#8f96b4';
      elipse(g, s.x, s.y + 2, 47, 17, 'rgba(8,4,12,0.55)'); elipse(g, s.x, s.y, 44, 15, aro); elipse(g, s.x, s.y, 39, 12, !abierto ? '#2a1c14' : marca ? '#3f6a3a' : '#33364e');
      if (!abierto) { candado(g, s.x, s.y - 4); E.zona({ x: s.x - 46, y: s.y - 44, w: 92, h: 64 }, 'candado'); continue; }
      if (!libre) continue;
      g.fillStyle = marca ? '#b8ff7a' : '#6b7190';   // la runa de la losa: un rombo
      g.fillRect(s.x - 2, s.y - 7, 4, 14); g.fillRect(s.x - 8, s.y - 2, 16, 4); g.fillRect(s.x - 5, s.y - 5, 10, 10);
      g.fillStyle = marca ? '#3f6a3a' : '#33364e'; g.fillRect(s.x - 2, s.y - 2, 4, 4);
      if (marca) AS.fx.luz(s.x, s.y, 70, [150, 255, 120], 0.05);
      E.zona({ x: s.x - 50, y: s.y - 90, w: 100, h: 110 }, 'hueco', { donde: 'campo', i });
    }
  }
  function heroes(g, P, p, E) {
    const lista = AS.equipo.enCampo(p.equipo).sort((a, b) => P.hueco(a.i).y - P.hueco(b.i).y);
    for (const { h, i } of lista) {
      const s = P.hueco(i), sitio = { donde: 'campo', i };
      E.zona({ x: s.x - 50, y: s.y - 100, w: 100, h: 116 }, 'heroe', sitio);
      if (E.ocultos.has(h.id) || (E.arrastre && E.arrastre.h.id === h.id && E.arrastre.movido)) continue;
      const llega = E.apariciones.get(h.id), k = llega === undefined ? 1 : Math.min(1, llega / 0.3);
      const brilla = E.arrastre && E.arrastre.movido && E.arrastre.h.id !== h.id;
      if (brilla) { g.fillStyle = 'rgba(255,210,58,0.35)'; g.fillRect(s.x - 46, s.y - 96, 92, 110); }
      D.muneco(g, { tipo: h.tipo, anim: 'reposo', tAnim: E.t + semilla(h.id) * 0.1, lado: 'heroe', dorado: h.dorado, alfa: k, id: semilla(h.id) }, s.x, s.y - Math.round((1 - k) * (1 - k) * 60));
      const alto = D.alto(h.tipo);
      insignia(g, h, s.x - 50, s.y - alto - 4);
      if (AS.heroe.puedeAscender(ASALTO, h)) flecha(g, s.x + 26, s.y - alto - 22, E.t);
    }
  }
  function esperando(g, P, p, E) {
    const ol = p.proxima, visibles = ol.enemigos.filter(e => e.tanda === 0).sort((a, b) => a.y - b.y);
    for (const e of visibles) {
      const s = P.aPantalla(e.x, e.y), x = Math.min(s.x, P.W - (e.jefe ? 86 : 36));
      D.muneco(g, { tipo: e.tipo, elite: e.elite, anim: 'reposo', tAnim: E.t + s.y * 0.01, lado: 'enemigo', id: s.y }, x, s.y);
    }
    const A = P.arena, txt = ol.tipo === 'jefe' ? tr('¡JEFE!') : ol.tipo === 'elite' ? tr('AUDITORÍA') : tr('VIENEN {n}', { n: ol.enemigos.length });
    const w = AS.texto.ancho(txt, 32) + 44, x = A.x + A.w - w - 6, y = A.y + 48 + (ol.tipo === 'normal' ? 0 : Math.round(Math.abs(Math.sin(E.t * 5)) * 3));
    T.cinta(g, x, y, w, 46, ol.tipo === 'normal' ? C.sangre : C.rojo);
    tx(g, txt, x + w / 2, y + 20, { col: C.crema, ancla: 'c' });
  }

  /* ---------- la batalla ---------- */
  function avisos(g, P, B, t) {
    const k = 0.3 + Math.abs(Math.sin(t * 10)) * 0.25;
    for (const a of B.avisos) {
      const lleno = a.t / a.dura;
      if (a.forma === 'franja') {
        const s = P.aPantalla(0, a.y), alto = Math.round(a.ancho * 1.1);
        g.fillStyle = `rgba(216,64,47,${k})`; g.fillRect(P.arena.x, s.y - alto, P.arena.w, alto + 10);
        g.fillStyle = 'rgba(255,220,120,0.9)'; g.fillRect(P.arena.x, s.y - alto, Math.round(P.arena.w * lleno), 4); g.fillRect(P.arena.x, s.y + 6, Math.round(P.arena.w * lleno), 4);
        continue;
      }
      const s = P.aPantalla(a.x, a.y), r = a.radio * P.W / 540;
      g.fillStyle = `rgba(216,64,47,${k})`; g.beginPath(); g.ellipse(s.x, s.y, r, r * 0.55, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(255,220,120,0.95)'; g.lineWidth = 4; g.beginPath(); g.ellipse(s.x, s.y, r * lleno, r * 0.55 * lleno, 0, 0, Math.PI * 2); g.stroke();
    }
  }
  function barra(g, u, s, alto) {
    if (u.jefe) return;
    const w = u.elite ? 70 : 48, x = s.x - w / 2, y = s.y - alto - 8;
    T.barra(g, x, y, w, 8, u.vida / u.max, u.lado === 'heroe' ? C.verde : C.rojo);
    if (u.escudo > 0) { g.fillStyle = C.celeste; g.fillRect(Math.round(x) + 2, y - 3, Math.max(2, Math.round((w - 4) * Math.min(1, u.escudo / u.max))), 3); }
  }
  function unidades(g, P, B, E) {
    const orden = B.u.filter(u => !u.cruzo).sort((a, b) => a.y - b.y);
    for (const u of orden) {
      const alfa = u.muerta ? Math.max(0, 1 - (u.tAnim - 0.45) / 0.4) : 1;
      if (alfa <= 0) continue;
      const s = P.aPantalla(u.x, u.y);
      if (u.jefe && u.enFuria) { g.fillStyle = `rgba(216,64,47,${0.2 + Math.abs(Math.sin(E.t * 8)) * 0.15})`; g.beginPath(); g.ellipse(s.x, s.y, 80, 30, 0, 0, Math.PI * 2); g.fill(); }
      const ruge = E.intro && u.jefe && E.intro.t > 0.55 && E.intro.t < 1.25, pose = ruge ? { anim: 'ataque', tAnim: E.intro.t - 0.55, dura: 0.7 } : E.intro ? { anim: 'reposo', tAnim: E.t, dura: 0.4 } : u;
      D.muneco(g, { tipo: u.tipo, elite: u.elite, anim: pose.anim, tAnim: pose.tAnim, dura: pose.dura, lado: u.lado, alfa, destello: (E.destellos.get(u.id) || 0) * 5, dorado: u.dorado, id: u.id }, s.x, s.y);
      if (u.muerta) continue;
      const alto = D.alto(u.tipo, u.elite);
      barra(g, u, s, alto);
      if (u.tVeneno > 0) { g.fillStyle = '#7ad84a'; g.fillRect(s.x + 16, s.y - alto - 20, 6, 6); g.fillRect(s.x + 24, s.y - alto - 14, 4, 4); }
      if (u.maldito > 0) { g.fillStyle = '#b22e54'; g.fillRect(s.x - 24, s.y - alto - 20, 6, 6); }
    }
  }
  const PROY = { flecha: ['#7c4b2a', '#fff3d6'], magia: ['#f08a2a', '#ffd23a'], bomba: ['#22140e', '#d8402f'], sombra: ['#8a1f4a', '#ff7ab0'], dardo: ['#3f9a3a', '#b8ff7a'] };
  function proyectiles(g, P, B) {
    for (const p of B.proy) {
      if (p.t < 0) continue;
      const s = P.aPantalla(p.x, p.y + 34), x = s.x, y = s.y - 52, c = PROY[p.tipo] || PROY.magia;
      if (p.tipo === 'flecha' || p.tipo === 'dardo') { const d = p.de.lado === 'heroe' ? 1 : -1; g.fillStyle = c[0]; g.fillRect(x - 10 * d, y - 1, 20 * d, 4); g.fillStyle = c[1]; g.fillRect(x + 8 * d, y - 3, 6 * d, 8); continue; }
      const r = p.tipo === 'bomba' ? 10 : 7;
      if (p.tipo !== 'bomba') {   // la estela: tres trozos cada vez más pequeños por donde ha venido
        const a = P.aPantalla(p.x0, p.y0 + 34), dx = x - a.x, dy = y - (a.y - 52), d = Math.hypot(dx, dy) || 1;
        for (let i = 1; i <= 3; i++) { g.globalAlpha = 0.6 - i * 0.15; g.fillStyle = c[1]; g.fillRect(Math.round(x - dx / d * i * 11) - (4 - i), Math.round(y - dy / d * i * 11) - (4 - i), (4 - i) * 2, (4 - i) * 2); }
        g.globalAlpha = 1;
      }
      g.fillStyle = C.tinta; g.fillRect(x - r, y - r - 2, r * 2, r * 2 + 4); g.fillRect(x - r - 2, y - r, r * 2 + 4, r * 2);
      g.fillStyle = c[0]; g.fillRect(x - r + 2, y - r, r * 2 - 4, r * 2); g.fillRect(x - r, y - r + 2, r * 2, r * 2 - 4);
      g.fillStyle = c[1]; g.fillRect(x - r + 3, y - r + 3, r, r); g.fillStyle = C.crema; g.fillRect(x - r + 3, y - r + 3, 3, 3);
      if (p.tipo !== 'bomba') AS.fx.luz(x, y, 46, p.tipo === 'sombra' ? [255, 90, 160] : [255, 190, 90], 0.08);
    }
  }
  function barraJefe(g, P, B) {
    const j = B.jefe;
    if (!j || j.cruzo) return;
    const A = P.arena, w = A.w - 60, x = A.x + 30, y = A.y + 6, d = ASALTO.jefes[j.tipo];
    T.tabla(g, x - 14, y - 2, w + 28, 54);
    T.barra(g, x, y + 28, w, 18, Math.max(0, j.vida / j.max), j.enFuria ? C.naranja : C.rojo, '#3a0e12');
    AS.dibujos.icono(g, 'sala-jefe', x + 12, y + 14, 1);
    tx(g, tr(d.nombre), x + w / 2, y + 14, { col: j.enFuria ? '#ffb04a' : C.crema, ancla: 'c', max: w - 60 });
  }
  function batalla(g, P, E) {
    const B = E.batalla;
    avisos(g, P, B, E.t); unidades(g, P, B, E); proyectiles(g, P, B); barraJefe(g, P, B);
  }
  return (g, P, p, E) => {
    const A = P.arena, tema = ASALTO.zonas[p.zona].tema;
    AS.mazmorra.pinta(g, tema, A.x, A.y, A.w, A.h, E.t, E.batalla ? E.batalla.cola.length : p.proxima.enemigos.length);
    if (E.batalla) { batalla(g, P, E); return; }
    huecos(g, P, p, E); esperando(g, P, p, E); heroes(g, P, p, E);
  };
})();

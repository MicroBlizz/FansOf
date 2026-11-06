// Fans of Zombies · LA VENTANA DE LA MOCHILA (pantalla): la rejilla Tetris de tu mochila y, al lado, lo que hay en el sitio que has
// abierto. Arrastra para mover (rueda del ratón o R para girar mientras arrastras), arrastra fuera de la rejilla para dejar,
// clic en lo del sitio para cogerlo, clic derecho en lo tuyo para usarlo. Tab la abre y la cierra; el mundo sigue mientras miras.
'use strict';
const VM = { abierta: false, arrastra: null, celda: 44 };
const COLOR_OBJ = { escopeta: '#4a3a2c', palanca: '#5a2a2a', judias: '#4a4430', chocolatina: '#4a3020', agua: '#24405a', refresco: '#5a2430', venda: '#4a4a52', cartuchos: '#5a2a1a', tablas: '#4a3a24', clavos: '#3a3e46', martillo: '#3a3430', pistola: '#2a2e36', bate: '#4a3a24', hacha: '#3a3430', cuchillo: '#2a2e36', balas: '#4a4024', botella: '#2a3440', tela: '#3a3a5a', carne: '#5a2a2a', podrida: '#3a4a2a', filete: '#5a3a24', guiso: '#5a4424' };

// el dibujo de una cosa dentro de su caja (w x h casillas): formas sencillas en píxel
function dibujaObjeto(g, id, W, H) {
  const P = (c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x * W), Math.round(y * H), Math.max(2, Math.round(w * W)), Math.max(2, Math.round(h * H))); };
  const D = {
    escopeta: () => { P('#6e4a2e', 0.04, 0.18, 0.3, 0.3); P('#3a3f47', 0.3, 0.2, 0.66, 0.16); P('#5c6670', 0.3, 0.2, 0.66, 0.05); P('#6e4a2e', 0.26, 0.36, 0.12, 0.4); },
    palanca: () => { P('#b8282e', 0.06, 0.4, 0.84, 0.22); P('#b8282e', 0.84, 0.18, 0.1, 0.3); P('#e85a5a', 0.06, 0.4, 0.84, 0.06); },
    judias: () => { P('#c8c8c0', 0.25, 0.2, 0.5, 0.62); P('#c84a2a', 0.25, 0.36, 0.5, 0.3); P('#f0e0a0', 0.33, 0.45, 0.34, 0.1); },
    chocolatina: () => { P('#6a3a1a', 0.15, 0.32, 0.7, 0.36); P('#e8c040', 0.15, 0.32, 0.25, 0.36); },
    agua: () => { P('#9ad8ff', 0.3, 0.14, 0.4, 0.78); P('#2a6ad0', 0.38, 0.06, 0.24, 0.1); P('#ffffff', 0.34, 0.4, 0.32, 0.12); },
    refresco: () => { P('#d8283a', 0.3, 0.2, 0.4, 0.62); P('#c8c8c0', 0.3, 0.16, 0.4, 0.06); P('#ffffff', 0.36, 0.42, 0.28, 0.1); },
    venda: () => { P('#f4f0e8', 0.2, 0.28, 0.6, 0.44); P('#d8d0c0', 0.2, 0.28, 0.12, 0.44); P('#e0303a', 0.5, 0.42, 0.14, 0.16); },
    tablas: () => { P('#b07a40', 0.04, 0.2, 0.92, 0.26); P('#9a6a34', 0.04, 0.54, 0.92, 0.26); P('#6a4a2a', 0.2, 0.2, 0.03, 0.6); P('#6a4a2a', 0.75, 0.2, 0.03, 0.6); },
    clavos: () => { for (const x of [0.25, 0.45, 0.65]) { P('#c8ccd4', x, 0.25, 0.08, 0.5); P('#e8ecf0', x - 0.05, 0.22, 0.18, 0.07); } },
    martillo: () => { P('#7a5a3a', 0.2, 0.3, 0.12, 0.62); P('#8a8e96', 0.08, 0.16, 0.6, 0.2); P('#5c6670', 0.08, 0.16, 0.6, 0.05); },
    pistola: () => { P('#3a3f47', 0.08, 0.2, 0.84, 0.22); P('#5c6670', 0.08, 0.2, 0.84, 0.06); P('#2a2420', 0.12, 0.42, 0.3, 0.5); },
    bate: () => { P('#3a2a1a', 0.04, 0.42, 0.28, 0.16); P('#c89a5a', 0.3, 0.36, 0.66, 0.28); },
    hacha: () => { P('#7a5a3a', 0.62, 0.1, 0.12, 0.85); P('#8a8e96', 0.08, 0.06, 0.6, 0.24); P('#d8dce4', 0.08, 0.06, 0.08, 0.24); },
    cuchillo: () => { P('#2a2420', 0.06, 0.38, 0.3, 0.24); P('#d8dce4', 0.36, 0.4, 0.58, 0.18); },
    balas: () => { for (const x of [0.2, 0.42, 0.64]) { P('#d8b040', x, 0.3, 0.14, 0.42); P('#a87a30', x, 0.3, 0.14, 0.1); } },
    botella: () => { P('#cfe8f4', 0.3, 0.14, 0.4, 0.78); P('#2a6ad0', 0.38, 0.06, 0.24, 0.1); },
    tela: () => { P('#7a8ac8', 0.15, 0.25, 0.7, 0.5); P('#5a6aa8', 0.15, 0.5, 0.7, 0.08); P('#9aa8e0', 0.15, 0.25, 0.7, 0.06); },
    carne: () => { P('#d8505a', 0.18, 0.28, 0.64, 0.44); P('#f0e0d0', 0.62, 0.36, 0.12, 0.26); },
    podrida: () => { P('#7a8a3a', 0.18, 0.28, 0.64, 0.44); P('#4a5a2a', 0.3, 0.38, 0.12, 0.12); P('#4a5a2a', 0.55, 0.5, 0.1, 0.1); },
    filete: () => { P('#8a4a2a', 0.18, 0.3, 0.64, 0.4); P('#c87a3a', 0.24, 0.36, 0.5, 0.06); },
    guiso: () => { P('#7a7a80', 0.15, 0.4, 0.7, 0.4); P('#c8783a', 0.2, 0.36, 0.6, 0.12); P('#e8e0d0', 0.4, 0.15, 0.06, 0.2); },
    cartuchos: () => { P('#c8282e', 0.18, 0.25, 0.22, 0.5); P('#c8282e', 0.48, 0.25, 0.22, 0.5); P('#e8b840', 0.18, 0.62, 0.22, 0.13); P('#e8b840', 0.48, 0.62, 0.22, 0.13); },
  };
  (D[id] || (() => P('#888', 0.3, 0.3, 0.4, 0.4)))();
}
// una pieza (o una cosa del sitio): un div con las casillas de su forma y su dibujo
function htmlPieza(id, n, gr, clase, datos) {
  const AJ = ZOM.AJ, f = ZOM.formaDe(AJ, id, gr), C = VM.celda;
  const celdas = f.c.map(([x, y]) => '<i style="left:' + x * C + 'px;top:' + y * C + 'px;width:' + C + 'px;height:' + C + 'px;background:' + (COLOR_OBJ[id] || '#333') + '"></i>').join('');
  return '<div class="vm-pieza ' + clase + '" ' + datos + ' style="width:' + f.w * C + 'px;height:' + f.h * C + 'px">' + celdas + '<canvas width="' + f.w * 16 + '" height="' + f.h * 16 + '" data-id="' + id + '" data-gr="' + gr + '"></canvas>' +
    ((AJ.objetos[id].max || 1) > 1 || n > 1 ? '<b>' + n + '</b>' : '') + '</div>';
}
function pintaDibujos(raiz) {
  raiz.querySelectorAll('canvas[data-id]').forEach((cv) => {
    const g = cv.getContext('2d'), gr = +cv.dataset.gr, w = cv.width, h = cv.height;
    g.save();
    if (gr % 2) { g.translate(w / 2, h / 2); g.rotate(Math.PI / 2 * gr); g.translate(-h / 2, -w / 2); dibujaObjeto(g, cv.dataset.id, h, w); }
    else { if (gr === 2) { g.translate(w, h); g.rotate(Math.PI); } dibujaObjeto(g, cv.dataset.id, w, h); }
    g.restore();
  });
}

function abreMochila() { VM.abierta = true; pintaMochila(); }
function cierraMochila() { VM.abierta = false; VM.arrastra = null; el('zb-mochila').hidden = true; if (JUEGO.e) ZOM.cierraSitio(JUEGO.e); }
function pintaMochila() {
  const e = JUEGO.e, AJ = ZOM.AJ, m = e.jugador.mochila, C = VM.celda, v = el('zb-mochila');
  const lista = e.abierto && e.contenidos[e.abierto];
  v.hidden = false;
  v.innerHTML = (lista ? '<section class="vm-sitio"><header><b>' + esc(tr(nombreSitio(e.abierto))) + '</b><button id="vm-todo">' + esc(tr('COGER TODO')) + '</button></header><div class="vm-lista" id="vm-lista">' +
      (lista.length ? lista.map((c, i) => htmlPieza(c.id, c.n, 0, 'suelta', 'data-i="' + i + '" title="' + esc(tr(AJ.objetos[c.id].n)) + '"')).join('') : '<p>' + esc(tr('Vacío.')) + '</p>') + '</div>' + htmlAccionesSitio(e) + '<p class="vm-ayuda">' + esc(tr('Clic para coger. Arrastra aquí lo tuyo para dejarlo.')) + '</p></section>' : '') +
    '<section class="vm-mia"><header><b>' + esc(tr('MOCHILA')) + '</b><button id="vm-ordenar">' + esc(tr('ORDENAR')) + '</button><button id="vm-cerrar">' + esc(tr('CERRAR (TAB)')) + '</button></header>' +
    '<div class="vm-rejilla" id="vm-rejilla" style="width:' + m.w * C + 'px;height:' + m.h * C + 'px">' +
      m.piezas.map((p) => htmlPieza(p.id, p.n, p.gr, 'mia', 'data-uid="' + p.uid + '" title="' + esc(tr(AJ.objetos[p.id].n)) + '"')).join('') +
    '</div>' + htmlFabricar(e) + '<p class="vm-ayuda">' + esc(tr('Arrastra para mover · rueda o R para girar · clic derecho para usar · fuera de la rejilla para dejar.')) + '</p></section>';
  // la posición de cada pieza en la rejilla
  v.querySelectorAll('.vm-pieza.mia').forEach((d) => { const p = ZOM.pieza(m, +d.dataset.uid); d.style.left = p.gx * C + 'px'; d.style.top = p.gy * C + 'px'; });
  pintaDibujos(v);
  enganchaMochila(v); enganchaOficios(v);
}
const NOMBRE_TIPO = { nevera: 'NEVERA', armario: 'ARMARIO', cocina: 'COCINA', basura: 'CUBO DE BASURA', fuego: 'BIDÓN CON FUEGO', coche: 'COCHE', estanteria: 'ESTANTERÍA', super: 'ESTANTE DEL SÚPER', gasolinera: 'TIENDA DE LA GASOLINERA', ferreteria: 'FERRETERÍA', farmacia: 'FARMACIA', armeria: 'ARMERÍA', taquilla: 'TAQUILLA', pupitre: 'PUPITRE', granero: 'GRANERO' };
const nombreSitio = (id) => (id.startsWith('cuerpo-') ? 'CUERPO DE LA BALLENA' : id.startsWith('monton-') ? 'MONTÓN EN EL SUELO' : NOMBRE_TIPO[JUEGO.e.tipoAbierto] || 'LO QUE HAY AQUÍ');
// lo que no se puede: aviso por la radio
function resultadoMochila(r) { if (!r.ok) avisa(tr({ noCabe: 'No cabe en la mochila.', noEsta: 'Eso ya no está.' }[r.codigo] || 'No puedes hacer eso ahora.')); else play('coge'); pintaMochila(); }

function enganchaMochila(v) {
  const e = JUEGO.e, AJ = ZOM.AJ;
  if (el('vm-todo')) el('vm-todo').onclick = () => resultadoMochila(ZOM.cogerTodo(AJ, e));
  el('vm-ordenar').onclick = () => resultadoMochila(ZOM.ordenar(AJ, e.jugador.mochila));
  el('vm-cerrar').onclick = cierraMochila;
  v.querySelectorAll('.vm-pieza.mia').forEach((d) => {
    d.oncontextmenu = (ev) => { ev.preventDefault(); const p = ZOM.pieza(e.jugador.mochila, +d.dataset.uid); if (p && AJ.objetos[p.id].usa) { const r = ZOM.usar(AJ, e, p.id); if (!r.ok) avisa(tr('No puedes hacer eso ahora.')); pintaMochila(); } };
    d.onpointerdown = (ev) => empiezaArrastre(ev, d, { uid: +d.dataset.uid });
  });
  v.querySelectorAll('.vm-pieza.suelta').forEach((d) => { d.onpointerdown = (ev) => empiezaArrastre(ev, d, { i: +d.dataset.i }); });
}
// arrastrar: la pieza sigue al ratón; al soltar se decide (mover, coger en ese hueco, dejar, o un clic si casi no se ha movido)
function empiezaArrastre(ev, d, que) {
  if (ev.button !== 0) return;
  ev.preventDefault();
  const r = d.getBoundingClientRect(), p = que.uid != null ? ZOM.pieza(JUEGO.e.jugador.mochila, que.uid) : null;
  VM.arrastra = { ...que, d, dx: ev.clientX - r.left, dy: ev.clientY - r.top, x0: ev.clientX, y0: ev.clientY, gr: p ? p.gr : 0, id: p ? p.id : JUEGO.e.contenidos[JUEGO.e.abierto][que.i].id };
  d.classList.add('vuela');
  document.body.appendChild(d);                          // fuera de la ventana (que va con transform), para que «fixed» sea la pantalla
  d.style.position = 'fixed'; d.style.left = r.left + 'px'; d.style.top = r.top + 'px';
}
function sigueArrastre(ev) {
  const A = VM.arrastra; if (!A) return;
  A.d.style.position = 'fixed'; A.d.style.left = ev.clientX - A.dx + 'px'; A.d.style.top = ev.clientY - A.dy + 'px';
}
function giraArrastre() {
  const A = VM.arrastra; if (!A) return;
  A.gr = (A.gr + 1) % 4;
  const tmp = document.createElement('div'); tmp.innerHTML = htmlPieza(A.id, 1, A.gr, 'vuela', ''); const nueva = tmp.firstChild;
  nueva.style.position = 'fixed'; nueva.style.left = A.d.style.left; nueva.style.top = A.d.style.top;
  A.d.remove(); document.body.appendChild(nueva); A.d = nueva; pintaDibujos(nueva); A.dx = A.dy = VM.celda / 2;
}
function sueltaArrastre(ev) {
  const A = VM.arrastra; if (!A) return;
  VM.arrastra = null; A.d.remove();
  const e = JUEGO.e, AJ = ZOM.AJ, rej = el('vm-rejilla').getBoundingClientRect(), C = VM.celda;
  const clic = Math.hypot(ev.clientX - A.x0, ev.clientY - A.y0) < 5;
  const gx = Math.round((ev.clientX - A.dx - rej.left) / C), gy = Math.round((ev.clientY - A.dy - rej.top) / C);
  const dentro = ev.clientX >= rej.left && ev.clientX <= rej.right && ev.clientY >= rej.top && ev.clientY <= rej.bottom;
  if (A.i != null) return resultadoMochila(clic ? ZOM.coger(AJ, e, A.i) : dentro ? ZOM.coger(AJ, e, A.i, { gx, gy, gr: A.gr }) : ZOM.ok(0));
  if (clic) return pintaMochila();
  if (dentro) return resultadoMochila(ZOM.mover(AJ, e.jugador.mochila, A.uid, gx, gy, A.gr));
  resultadoMochila(ZOM.dejar(AJ, e, A.uid));
}
addEventListener('pointermove', sigueArrastre);
addEventListener('pointerup', sueltaArrastre);
addEventListener('wheel', (ev) => { if (VM.arrastra) { ev.preventDefault(); giraArrastre(); } }, { passive: false });
// cada fotograma: Tab abre o cierra; R gira lo que arrastras; si te alejas del sitio abierto, se cierra
function vigilaMochila(e, cerca) {
  if (pulsa('mochila')) { if (VM.abierta) cierraMochila(); else abreMochila(); }
  if (VM.abierta && pulsa('empuja')) giraArrastre();
  if (e.abierto && !VM.abierta) abreMochila();
  if (VM.abierta && e.abierto && (!cerca || cerca.id !== e.abierto) && !sitioJunto(e, e.abierto)) { ZOM.cierraSitio(e); pintaMochila(); }
}
function sitioJunto(e, id) { const s = sitiosRegistrables(e).find((q) => q.id === id); return s && ZOM.dist(s.x, s.z, e.jugador.x, e.jugador.z) < 2.4; }

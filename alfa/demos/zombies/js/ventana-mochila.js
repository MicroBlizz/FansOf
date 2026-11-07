// Fans of Zombies · LA VENTANA DE LA MOCHILA (pantalla): la rejilla Tetris de tu mochila y, al lado, lo que hay en el sitio que has
// abierto. Arrastra para mover (rueda del ratón o R para girar mientras arrastras), arrastra fuera de la rejilla para dejar,
// clic en lo del sitio para cogerlo, clic derecho en lo tuyo para usarlo (o ponértelo, si es ropa o una mochila: js/ventana-equipo.js).
// La mochila, la riñonera y los bolsillos son rejillas: se arrastra de una a otra. Tab la abre y la cierra; el mundo sigue mientras miras.
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
  (D[id] || (DIBUJO_EQUIPO[id] && (() => DIBUJO_EQUIPO[id](P))) || (() => P('#888', 0.3, 0.3, 0.4, 0.4)))();   // la ropa y las mochilas, en js/ventana-equipo.js
}
// una pieza (o una cosa del sitio): un div con las casillas de su forma y su dibujo
function htmlPieza(id, n, gr, clase, datos) {
  const AJ = ZOM.AJ, f = ZOM.formaDe(AJ, id, gr), C = VM.celda;
  const celdas = f.c.map(([x, y]) => '<i style="left:' + x * C + 'px;top:' + y * C + 'px;width:' + C + 'px;height:' + C + 'px;background:' + (COLOR_OBJ[id] || COLOR_EQUIPO[id] || '#333') + '"></i>').join('');
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
function cierraMochila() { VM.abierta = false; sueltaSinMas(); el('zb-mochila').hidden = true; if (JUEGO.e) ZOM.cierraSitio(JUEGO.e); }
// las habilidades: nivel y barra hacia el siguiente, con lo que mejora cada una
const NOMBRE_HAB = { pelea: ['PELEA', 'Golpeas más fuerte y te cansas menos'], disparo: ['DISPARO', 'Las balas y los cartuchos hacen más daño'], sigilo: ['SIGILO', 'Agachado te ven menos y andando haces menos ruido'], carpinteria: ['CARPINTERÍA', 'Clavas tablas y desmontas más rápido'], cocina: ['COCINA', 'Lo que cocinas alimenta más'] };
function htmlHabilidades(J) {
  const AJ = ZOM.AJ;
  return '<section class="vm-hab"><header><b>' + esc(tr('HABILIDADES')) + '</b></header>' + ZOM.HABILIDADES.map((h) => '<div class="vm-h" title="' + esc(tr(NOMBRE_HAB[h][1])) + '"><span>' + esc(tr(NOMBRE_HAB[h][0])) + '</span><b>' + ZOM.nivel(AJ, J, h) + '</b><i><s style="width:' + Math.round(ZOM.progreso(AJ, J, h) * 100) + '%"></s></i><em>' + esc(tr(NOMBRE_HAB[h][1])) + '</em></div>').join('') + '<p class="vm-ayuda">' + esc(tr('Se mejoran haciendo las cosas. Se pierden al caer.')) + '</p>' + htmlRefugio(JUEGO.e) + '</section>';
}
function pintaMochila() {
  const e = JUEGO.e, AJ = ZOM.AJ, J = e.jugador, C = VM.celda, v = el('zb-mochila');
  const lista = e.abierto && e.contenidos[e.abierto];
  v.hidden = false;
  v.innerHTML = (lista ? '<section class="vm-sitio"><header><b>' + esc(tr(nombreSitio(e.abierto))) + '</b><button id="vm-todo">' + esc(tr('COGER TODO')) + '</button></header><div class="vm-lista" id="vm-lista">' +
      (lista.length ? lista.map((c, i) => htmlPieza(c.id, c.n, 0, 'suelta', 'data-i="' + i + '" title="' + esc(tr(AJ.objetos[c.id].n)) + '"')).join('') : '<p>' + esc(tr('Vacío.')) + '</p>') + '</div>' + htmlAccionesSitio(e) + '<p class="vm-ayuda">' + esc(tr('Clic para coger. Arrastra aquí lo tuyo para dejarlo.')) + '</p></section>' : '') +
    (lista ? '' : htmlHabilidades(J)) +   // con un sitio abierto no caben todas: las habilidades salen con la mochila sola
    htmlEquipo(e) +                        // la ropa, la riñonera y los bolsillos (js/ventana-equipo.js)
    '<section class="vm-mia"><header><b>' + esc(tr(AJ.objetos[J.equipo.mochila].n)) + '</b>' + (TACTIL.activo ? '<button id="vm-girar">' + esc(tr('GIRAR')) + '</button>' : '') + '<button id="vm-ordenar">' + esc(tr('ORDENAR')) + '</button><button id="vm-cerrar">' + esc(tr('CERRAR (TAB)')) + '</button></header>' +
    htmlRejilla(J, 'mochila') + htmlFabricar(e) + '<p class="vm-ayuda">' + esc(tr('Arrastra para mover · rueda o R para girar · clic derecho para usar · fuera de la rejilla para dejar.')) + '</p></section>';
  // la posición de cada pieza en su rejilla
  v.querySelectorAll('.vm-pieza.mia').forEach((d) => { const p = ZOM.pieza(J[d.dataset.bolsa], +d.dataset.uid); d.style.left = p.gx * C + 'px'; d.style.top = p.gy * C + 'px'; });
  pintaDibujos(v);
  enganchaMochila(v); enganchaOficios(v); enganchaEquipo(v);
}
const NOMBRE_TIPO = { nevera: 'NEVERA', armario: 'ARMARIO', cocina: 'COCINA', basura: 'CUBO DE BASURA', fuego: 'BIDÓN CON FUEGO', coche: 'COCHE', estanteria: 'ESTANTERÍA', super: 'ESTANTE DEL SÚPER', gasolinera: 'TIENDA DE LA GASOLINERA', ferreteria: 'FERRETERÍA', farmacia: 'FARMACIA', armeria: 'ARMERÍA', taquilla: 'TAQUILLA', pupitre: 'PUPITRE', granero: 'GRANERO', escritorio: 'ESCRITORIO', cajaFuerte: 'CAJA FUERTE', archivador: 'ARCHIVADOR', maquina: 'MÁQUINA DE CAFÉ', maletin: 'MALETÍN DEL CEO', despensa: 'DESPENSA DEL REFUGIO', huerto: 'HUERTO' };
const sitioEsCoche = (id) => id.startsWith('car:');
const nombreSitio = (id) => (id.startsWith('cuerpo-') ? 'CUERPO DE LA BALLENA' : id.startsWith('monton-') ? 'MONTÓN EN EL SUELO' : id.startsWith('maletin-') ? 'MALETÍN DEL CEO' : sitioEsCoche(id) ? 'GUANTERA Y MALETERO' : NOMBRE_TIPO[JUEGO.e.tipoAbierto] || 'LO QUE HAY AQUÍ');
// lo que no se puede: aviso por la radio
function resultadoMochila(r) { if (!r.ok) avisa(tr({ noCabe: 'No cabe en la mochila.', noEsta: 'Eso ya no está.' }[r.codigo] || 'No puedes hacer eso ahora.')); else play('coge'); pintaMochila(); }

function enganchaMochila(v) {
  const e = JUEGO.e, AJ = ZOM.AJ;
  if (el('vm-todo')) el('vm-todo').onclick = () => resultadoMochila(ZOM.cogerTodo(AJ, e));
  el('vm-ordenar').onclick = () => resultadoMochila(ZOM.ordenar(AJ, e.jugador.mochila));
  if (el('vm-girar')) el('vm-girar').onpointerdown = (ev) => { ev.preventDefault(); giraArrastre(); };   // en el móvil, con otro dedo mientras arrastras
  el('vm-cerrar').onclick = cierraMochila;
  v.querySelectorAll('.vm-pieza.mia').forEach((d) => {
    const desde = { bolsa: d.dataset.bolsa, uid: +d.dataset.uid };
    d.oncontextmenu = (ev) => { ev.preventDefault(); const p = !TACTIL.activo && ZOM.pieza(e.jugador[desde.bolsa], desde.uid); if (p) usaOPon(desde, p.id); };   // en el móvil lo hace la pulsación larga
    d.onpointerdown = (ev) => empiezaArrastre(ev, d, desde);
  });
  v.querySelectorAll('.vm-pieza.suelta').forEach((d) => {
    d.oncontextmenu = (ev) => { ev.preventDefault(); const c = !TACTIL.activo && e.contenidos[e.abierto][+d.dataset.i]; if (c) usaOPon({ i: +d.dataset.i }, c.id); };
    d.onpointerdown = (ev) => empiezaArrastre(ev, d, { i: +d.dataset.i });
  });
}
// arrastrar: la pieza sigue al ratón; al soltar se decide (mover, coger en ese hueco, dejar, o un clic si casi no se ha movido)
function empiezaArrastre(ev, d, que) {
  if (ev.button !== 0 || VM.arrastra) return;                    // un arrastre cada vez (en el móvil, el segundo dedo no empieza otro)
  ev.preventDefault();
  const r = d.getBoundingClientRect(), p = que.uid != null ? ZOM.pieza(JUEGO.e.jugador[que.bolsa], que.uid) : null;
  const A = VM.arrastra = { ...que, d, pid: ev.pointerId, dx: ev.clientX - r.left, dy: ev.clientY - r.top, x0: ev.clientX, y0: ev.clientY, ux: ev.clientX, uy: ev.clientY, gr: p ? p.gr : 0, id: p ? p.id : JUEGO.e.contenidos[JUEGO.e.abierto][que.i].id };
  if (ev.pointerType === 'touch') A.larga = setTimeout(() => pulsacionLarga(A, que), 450);   // en el móvil, dejar el dedo quieto = clic derecho
  d.classList.add('vuela');
  document.body.appendChild(d);                          // fuera de la ventana (que va con transform), para que «fixed» sea la pantalla
  d.style.position = 'fixed'; d.style.left = r.left + 'px'; d.style.top = r.top + 'px';
}
// el dedo quieto un rato sobre una pieza: se usa o se pone (como el clic derecho)
function pulsacionLarga(A, que) {
  if (VM.arrastra !== A || Math.hypot(A.ux - A.x0, A.uy - A.y0) > 8) return;
  VM.arrastra = null; A.d.remove();
  usaOPon(que.i != null ? { i: que.i } : { bolsa: que.bolsa, uid: que.uid }, A.id);
  if (VM.abierta) pintaMochila();
}
function sigueArrastre(ev) {
  const A = VM.arrastra; if (!A || ev.pointerId !== A.pid) return;
  A.ux = ev.clientX; A.uy = ev.clientY;
  A.d.style.position = 'fixed'; A.d.style.left = ev.clientX - A.dx + 'px'; A.d.style.top = ev.clientY - A.dy + 'px';
}
function giraArrastre() {
  const A = VM.arrastra; if (!A) return;
  clearTimeout(A.larga);
  A.gr = (A.gr + 1) % 4;
  const tmp = document.createElement('div'); tmp.innerHTML = htmlPieza(A.id, 1, A.gr, 'vuela', ''); const nueva = tmp.firstChild;
  nueva.style.position = 'fixed'; nueva.style.left = A.d.style.left; nueva.style.top = A.d.style.top;
  A.d.remove(); document.body.appendChild(nueva); A.d = nueva; pintaDibujos(nueva); A.dx = A.dy = VM.celda / 2;
}
function sueltaArrastre(ev) {
  const A = VM.arrastra; if (!A || ev.pointerId !== A.pid) return;
  VM.arrastra = null; A.d.remove(); clearTimeout(A.larga);
  const e = JUEGO.e, AJ = ZOM.AJ, C = VM.celda;
  const clic = Math.hypot(ev.clientX - A.x0, ev.clientY - A.y0) < 5, sobre = rejillaBajo(ev);
  const donde = sobre && { bolsa: sobre.dataset.bolsa, gx: Math.round((ev.clientX - A.dx - sobre.getBoundingClientRect().left) / C), gy: Math.round((ev.clientY - A.dy - sobre.getBoundingClientRect().top) / C), gr: A.gr };
  if (!clic && !donde && sobreHuecos(ev)) return usaOPon(A.i != null ? { i: A.i } : { bolsa: A.bolsa, uid: A.uid }, A.id, true);   // soltar en lo puesto: ponérselo
  if (A.i != null) return resultadoMochila(clic ? ZOM.coger(AJ, e, A.i) : donde ? ZOM.coger(AJ, e, A.i, donde) : ZOM.ok(0));
  if (clic) return pintaMochila();
  if (donde) return resultadoMochila(ZOM.moverA(AJ, e.jugador, A.bolsa, A.uid, donde.bolsa, donde.gx, donde.gy, donde.gr));
  resultadoMochila(ZOM.dejar(AJ, e, A.uid, A.bolsa));
}
// ¿se suelta sobre los huecos de la ropa?
function sobreHuecos(ev) { const h = document.querySelector('#zb-mochila .vm-huecos'), b = h && h.getBoundingClientRect(); return !!b && ev.clientX >= b.left && ev.clientX <= b.right && ev.clientY >= b.top && ev.clientY <= b.bottom; }
// la rejilla (mochila, riñonera o bolsillos) que hay bajo el ratón, o null
function rejillaBajo(ev) {
  for (const r of document.querySelectorAll('#zb-mochila .vm-rejilla')) { const b = r.getBoundingClientRect(); if (ev.clientX >= b.left && ev.clientX <= b.right && ev.clientY >= b.top && ev.clientY <= b.bottom) return r; }
  return null;
}
addEventListener('pointermove', sigueArrastre);
addEventListener('pointerup', sueltaArrastre);
// si el móvil corta el toque (una llamada, un gesto del sistema), la pieza vuelve a su sitio
addEventListener('pointercancel', (ev) => { if (VM.arrastra && ev.pointerId === VM.arrastra.pid) { sueltaSinMas(); if (VM.abierta) pintaMochila(); } });
function sueltaSinMas() { const A = VM.arrastra; VM.arrastra = null; if (A) { clearTimeout(A.larga); A.d.remove(); } }
addEventListener('wheel', (ev) => { if (VM.arrastra) { ev.preventDefault(); giraArrastre(); } }, { passive: false });
// cada fotograma: Tab abre o cierra; R gira lo que arrastras; si te alejas del sitio abierto, se cierra
function vigilaMochila(e, cerca) {
  if (pulsa('mochila')) { if (VM.abierta) cierraMochila(); else abreMochila(); }
  if (VM.abierta && pulsa('empuja')) giraArrastre();
  if (e.abierto && !VM.abierta) abreMochila();
  if (VM.abierta && e.abierto && (!cerca || cerca.id !== e.abierto) && !sitioJunto(e, e.abierto)) { ZOM.cierraSitio(e); pintaMochila(); }
}
function sitioJunto(e, id) { const s = sitiosRegistrables(e).find((q) => q.id === id); return s && ZOM.dist(s.x, s.z, e.jugador.x, e.jugador.z) < 2.4; }

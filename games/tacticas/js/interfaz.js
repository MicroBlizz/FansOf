// Fans of Rumble: Tácticas · INTERFAZ DEL COMBATE: la línea de turnos (arriba), las órdenes (abajo a la izquierda), el grupo con vida,
// CAOS y barra de tiempo (abajo a la derecha) y la ventana de técnicas, objetos y objetivos, que se abre encima del grupo.
'use strict';
const menuEl = $('#menu'), ordenesEl = $('#ordenes');
const ICONO_ORDEN = {
  atacar: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M9.6 19.6 24 5.2 27 5 26.8 8 12.4 22.4Z" fill="#eef0ff" stroke="#20102c" stroke-width="2.2" stroke-linejoin="round"/><path d="M10.5 21.5 5.5 26.5" stroke="#20102c" stroke-width="6.5" stroke-linecap="round"/><path d="M10.5 21.5 5.5 26.5" stroke="#ff9a3c" stroke-width="3" stroke-linecap="round"/><path d="M7 17.5 14.5 25" stroke="#20102c" stroke-width="6.5" stroke-linecap="round"/><path d="M7 17.5 14.5 25" stroke="#ffcb3d" stroke-width="3" stroke-linecap="round"/></svg>',
  tecnicas: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M15 3c1.5 8 4.5 11 12 12.5-7.5 1.5-10.5 4.5-12 12.5-1.5-8-4.5-11-12-12.5C10.5 14 13.5 11 15 3Z" fill="#c08bff" stroke="#20102c" stroke-width="2.2" stroke-linejoin="round"/><path d="M25 3.5c.5 2.6 1.4 3.5 4 4-2.6.5-3.5 1.4-4 4-.5-2.6-1.4-3.5-4-4 2.6-.5 3.5-1.4 4-4Z" fill="#f3d6ff" stroke="#20102c" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  objetos: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M11 7h10l-2.5 4.5c6 2 9 7 8 12-.8 4-21.2 4-22 0-1-5 2-10 8-12Z" fill="#ffcb3d" stroke="#20102c" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 11.5h8" stroke="#20102c" stroke-width="2.4" stroke-linecap="round"/><path d="M10 17c-1 2-1.4 4-1 6" stroke="#fff3c4" stroke-width="2" stroke-linecap="round"/></svg>',
  defender: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3.5 27 7.5V15c0 7-4.6 11.6-11 13.5C9.6 26.6 5 22 5 15V7.5Z" fill="#b9a6ff" stroke="#20102c" stroke-width="2.2" stroke-linejoin="round"/><path d="M16 7.5v17M9 11.5c0 5 1.5 9 7 11.5" stroke="#7b5cff" stroke-width="2.2" stroke-linecap="round" fill="none"/></svg>',
};
$('#lista-ordenes').innerHTML = [['atacar', 'ATACAR'], ['tecnicas', 'TÉCNICAS'], ['objetos', 'OBJETOS'], ['defender', 'DEFENDER']]
  .map(([id, txt]) => `<button class="orden" data-o="${id}">${ICONO_ORDEN[id]}<span class="ol">${txt}</span></button>`).join('');

/* =========================================================
   MENÚ DEL HÉROE
   ========================================================= */
function marcaOrden(id) {
  for (const b of ordenesEl.querySelectorAll('.orden')) b.classList.toggle('sel', b.dataset.o === id);
  const sel = ordenesEl.querySelector('.orden.sel'), cur = $('#cursor');
  if (sel) { cur.removeAttribute('hidden'); cur.style.top = ($('#lista-ordenes').offsetTop + sel.offsetTop + sel.offsetHeight / 2 - 12) + 'px'; } else cur.setAttribute('hidden', '');
}
function abrirMenu(h, vista = 'ordenes') {
  B.menu = { h, vista }; B.eligiendo = null;
  ordenesEl.classList.remove('espera'); $('#ordenes-nom').textContent = h.nombre;
  for (const b of ordenesEl.querySelectorAll('.orden')) b.disabled = false;
  const caos = `<span class="caos-n">CAOS <b>${h.mp}</b></span>`;
  if (vista === 'ordenes') { menuEl.hidden = true; menuEl.innerHTML = ''; marcaOrden('atacar'); return; }
  if (vista === 'tecnicas') {
    marcaOrden('tecnicas');
    menuEl.innerHTML = `<div class="menu-cab"><h3 class="ol violeta-t">TÉCNICAS</h3>${caos}</div><div class="lista-op">${HEROES[h.key].tec.map(id => { const t = TECNICAS[id];
      return `<button class="op" data-tec="${id}" ${h.mp < t.mp ? 'disabled' : ''}><span><b class="ol">${t.nombre}</b><small>${t.desc}</small></span><span class="coste ol">${t.mp}<small>CAOS</small></span></button>`; }).join('')}
      <button class="btn-texto" data-o="volver">‹ Volver</button></div>`;
  } else if (vista === 'objetos') {
    marcaOrden('objetos');
    const hay = OBJETO_ORDEN.filter(k => SAVE.items[k] > 0);
    menuEl.innerHTML = `<div class="menu-cab"><h3 class="ol obj">OBJETOS</h3>${caos}</div><div class="lista-op">${hay.length ? hay.map(k => { const o = OBJETOS[k];
      return `<button class="op" data-obj="${k}"><span><b class="ol">${o.nombre}</b><small>${o.desc}</small></span><span class="cuantos ol">x${SAVE.items[k]}</span></button>`; }).join('') : '<p class="ayuda">No te quedan objetos. Cómpralos en la tienda del mapa.</p>'}
      <button class="btn-texto" data-o="volver">‹ Volver</button></div>`;
  }
  menuEl.hidden = false;
}
function cerrarMenu() {
  if (B) { B.menu = null; B.eligiendo = null; }
  menuEl.hidden = true; menuEl.innerHTML = '';
  ordenesEl.classList.add('espera'); $('#ordenes-nom').textContent = 'Esperando turno';
  for (const b of ordenesEl.querySelectorAll('.orden')) b.disabled = true;
  marcaOrden(null);
}
// elegir a quién: lista encima del grupo y también tocando en la escena
function elegirObjetivo(h, a, alElegir) {
  const lista = a === 'enemigo' ? vivos(B.enemigos) : a === 'aliado' ? vivos(B.heroes) : B.heroes.filter(u => u.hp <= 0);
  if (!lista.length) { aviso(a === 'caido' ? 'No hay nadie fuera de combate.' : 'No hay objetivos.'); return; }
  B.eligiendo = { lista, alElegir };
  menuEl.innerHTML = `<div class="menu-cab"><h3 class="ol">¿A quién?</h3><small>Toca en la lista o en la escena</small></div><div class="lista-op">${lista.map((u, i) =>
    `<button class="op" data-obj-i="${i}"><span><b class="ol">${u.nombre}</b><small>Vida ${u.hp}/${u.hpMax}</small></span></button>`).join('')}<button class="btn-texto" data-o="volver">‹ Volver</button></div>`;
  menuEl.hidden = false;
}
function decidir(h, acc) {
  acc.actor = h; B.cola.push(acc); B.listos = B.listos.filter(x => x !== h); cerrarMenu(); play('card');
}
function alPulsarMenu(e) {
  if (!B || !B.menu) return;
  const h = B.menu.h, b = e.target.closest('button'); if (!b || b.disabled) return;
  if (b.dataset.o === 'volver') { play('select'); abrirMenu(h); return; }
  if (b.dataset.o === 'atacar') { marcaOrden('atacar'); elegirObjetivo(h, 'enemigo', u => decidir(h, { tipo: 'atacar', obj: u })); }
  else if (b.dataset.o === 'tecnicas') abrirMenu(h, 'tecnicas');
  else if (b.dataset.o === 'objetos') abrirMenu(h, 'objetos');
  else if (b.dataset.o === 'defender') decidir(h, { tipo: 'defender' });
  else if (b.dataset.tec) {
    const id = b.dataset.tec, t = TECNICAS[id];
    if (['enemigo', 'aliado', 'caido'].includes(t.a)) elegirObjetivo(h, t.a, u => decidir(h, { tipo: 'tecnica', id, obj: u }));
    else decidir(h, { tipo: 'tecnica', id });
  } else if (b.dataset.obj) {
    const id = b.dataset.obj, o = OBJETOS[id];
    if (o.a === 'grupo') decidir(h, { tipo: 'objeto', id });
    else elegirObjetivo(h, o.a, u => decidir(h, { tipo: 'objeto', id, obj: u }));
  } else if (b.dataset.objI != null && B.eligiendo) B.eligiendo.alElegir(B.eligiendo.lista[+b.dataset.objI]);
  play('select');
}
menuEl.addEventListener('click', alPulsarMenu);
ordenesEl.addEventListener('click', alPulsarMenu);
// tocar en la escena para elegir objetivo
cv.addEventListener('pointerdown', e => {
  if (!B || !B.eligiendo) return;
  const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * LW / r.width, y = (e.clientY - r.top) * LH / r.height;
  let mejor = null, md = 1e9;
  for (const u of B.eligiendo.lista) { const d = Math.hypot(u.x - x, u.y - alto(u) * 0.45 - y); if (d < md) { md = d; mejor = u; } }
  if (mejor && md < 120) { play('select'); B.eligiendo.alElegir(mejor); }
});
// tocar una fila de un héroe listo lo pone primero (como cambiar de turno en los clásicos)
$('#filas').addEventListener('click', e => {
  const f = e.target.closest('.fila'); if (!f || !B || B.eligiendo) return;
  const h = B.heroes[+f.dataset.i]; if (B.listos.includes(h) && (!B.menu || B.menu.h !== h)) { B.listos = [h, ...B.listos.filter(x => x !== h)]; abrirMenu(h); play('select'); }
});

/* =========================================================
   CARAS (recortadas del dibujo de cada personaje, en un círculo del color de su facción; los enemigos, en rojo)
   ========================================================= */
const CARAS = {};
function mezclaColor(a, b, k) { const A = rgbDe(a), C = rgbDe(b); return `rgb(${A.map((v, i) => Math.round(v + (C[i] - v) * k)).join(',')})`; }
const colorDe = u => u.lado === 'e' ? '#ff4b5c' : (FAC_COLOR[HEROES[u.key].fac] || '#c08bff');
function caraDe(u) {
  const id = u.key + u.lado + (u.corrupto ? 'c' : ''); if (CARAS[id]) return CARAS[id];
  const sp = SPR[u.key], top = (TYPES[u.key] && TYPES[u.key].top) || TOPS[u.key] || sp.ay * 0.9, ladoR = Math.min(sp.wd, top * 0.64), y0 = Math.max(0, sp.ay - top - top * 0.05);
  const N = 120, c = lienzo(N, N), x = c.getContext('2d'), col = colorDe(u);
  const g = x.createRadialGradient(N * 0.4, N * 0.32, 4, N / 2, N / 2, N * 0.7); g.addColorStop(0, mezclaColor(col, '#ffffff', 0.3)); g.addColorStop(1, mezclaColor(col, '#20102c', 0.62));
  x.fillStyle = g; x.beginPath(); x.arc(N / 2, N / 2, N / 2, 0, Math.PI * 2); x.fill();
  x.save(); x.beginPath(); x.arc(N / 2, N / 2, N / 2 - 1, 0, Math.PI * 2); x.clip();
  x.drawImage(spriteDe(u.key, u.corrupto), (sp.ax - ladoR / 2) * RES, y0 * RES, ladoR * RES, ladoR * RES, 0, 0, N, N);
  x.restore();
  return (CARAS[id] = c.toDataURL());
}

/* =========================================================
   LÍNEA DE TURNOS: quién actúa ahora y quién después (se calcula con lo que le falta a cada barra)
   ========================================================= */
const velAtb = u => (AJUSTES.atbBase + u.spd * AJUSTES.atbVel) * (u.est.prisa > 0 ? 1.5 : 1) * (u.fase2 ? 1.35 : 1);
function ordenTurnos(n = 7) {
  const ahora = B.actuando || (B.menu && B.menu.h) || null, lista = ahora ? [ahora] : [];
  const listos = [...B.listos, ...B.cola.map(a => a.actor)].filter(u => u && u !== ahora && u.hp > 0);
  for (const u of listos) if (!lista.includes(u)) lista.push(u);
  const prox = [];
  for (const u of [...B.heroes, ...B.enemigos]) {
    if (u.hp <= 0) continue;
    const v = velAtb(u), ciclo = 100 / v, aturde = u.est.aturdido > 0 ? ciclo : 0;
    let t0 = u.esperando || lista.includes(u) ? ciclo : (100 - u.atb) / v + aturde;
    for (let k = 0; k < n; k++) prox.push({ u, t: t0 + k * ciclo });
  }
  prox.sort((a, b) => a.t - b.t);
  for (const p of prox) { if (lista.length >= n) break; lista.push(p.u); }
  return { ahora, lista };
}
let firmaTurnos = '', primeroTurnos = null;
function pintarTurnos() {
  const { ahora, lista } = ordenTurnos(), firma = lista.map(u => u.id).join(',') + '|' + (ahora ? ahora.id : '');
  if (firma === firmaTurnos) return; firmaTurnos = firma;
  const caras = $('#caras');
  caras.innerHTML = lista.map((u, k) => `<span class="cara${u.lado === 'e' ? ' mala' : ''}${k === 0 && ahora ? ' ahora' : ''}" style="--anillo:${colorDe(u)}"><img alt="${u.nombre}" src="${caraDe(u)}"></span>`).join('');
  if (lista[0] !== primeroTurnos) { primeroTurnos = lista[0]; caras.classList.remove('entra'); void caras.offsetWidth; caras.classList.add('entra'); }
}

/* =========================================================
   FILAS DEL GRUPO (vida, CAOS y barra de tiempo)
   ========================================================= */
function pintarFilas() {
  firmaTurnos = ''; primeroTurnos = null;
  $('#filas').innerHTML = B.heroes.map((h, i) => `<div class="fila" data-i="${i}"><img class="mini" alt="" src="${caraDe(h)}">
    <div class="datos"><div class="l1"><b class="nom ol">${h.nombre}</b><span class="estados" data-est></span><span class="vida"><b data-hp>${h.hp}</b><small>/${h.hpMax}</small></span></div>
    <div class="bt vida"><i data-hpb></i></div>
    <div class="l3"><span class="caos-n">CAOS <b data-mp>${h.mp}</b></span><div class="bt caos"><i data-mpb></i></div><div class="bt atb"><i data-atb></i></div></div></div></div>`).join('');
  B.filasEl = [...document.querySelectorAll('#filas .fila')].map(f => ({ f, hp: f.querySelector('[data-hp]'), hpb: f.querySelector('[data-hpb]'), mp: f.querySelector('[data-mp]'),
    mpb: f.querySelector('[data-mpb]'), atb: f.querySelector('[data-atb]'), vida: f.querySelector('.vida'), est: f.querySelector('[data-est]') }));
  pintarTurnos();
}
function actualizarFilas() {
  B.heroes.forEach((h, i) => {
    const e = B.filasEl[i]; if (!e) return;
    if (e.hp.textContent !== String(h.hp)) e.hp.textContent = h.hp;
    if (e.mp.textContent !== String(h.mp)) e.mp.textContent = h.mp;
    e.hpb.style.width = (100 * h.hp / h.hpMax) + '%'; e.mpb.style.width = (100 * h.mp / h.mpMax) + '%'; e.atb.style.width = (h.hp > 0 ? Math.min(100, h.atb) : 0) + '%';
    e.atb.parentNode.classList.toggle('llena', h.atb >= 100 && h.hp > 0);
    e.vida.classList.toggle('baja', h.hp > 0 && h.hp < h.hpMax * 0.25);
    e.f.classList.toggle('ko', h.hp <= 0); e.f.classList.toggle('lista', B.listos.includes(h)); e.f.classList.toggle('turno', !!B.menu && B.menu.h === h);
    const l = []; if (h.est.atk) l.push('ATQ+'); if (h.est.def) l.push('DEF+'); if (h.est.prisa) l.push('VEL+'); if (h.est.provoca) l.push('PROV'); if (h.est.bajo) l.push('ATQ−'); if (h.est.aturdido) l.push('ATUR'); if (h.guardia) l.push('GUARD'); if (h.hp <= 0) l.push('K.O.');
    const t = l.join(' '); if (e.est.textContent !== t) e.est.textContent = t;
  });
  pintarTurnos();
}

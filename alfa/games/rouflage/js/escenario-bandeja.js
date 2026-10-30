// Fans of Rouflage · MI ESCENARIO (la bandeja): el menú de abajo del editor, hecho para el pulgar. Pestañas Muebles, Plantas, Decoración,
// Escenario y Pintar, cada una con su contador (lo que tienes de lo que hay); tarjetas con el dibujo del objeto y el borde del color de su
// rareza. Al TOCAR una tarjeta, el mueble sale donde miras (en el hueco libre más cercano) y se puede arrastrar; también se ARRASTRA la
// tarjeta hacia arriba hasta el suelo (sale su fantasma con la huella verde si cabe o roja si no). Lo que no tienes sale con candado y te dice
// cómo se consigue. Al tocar un mueble puesto sale su BURBUJA: mover, voltear, color (si tiene) y quitar. Va después de escenario.js.
'use strict';
const ESC_PESTANAS = [['muebles', 'Muebles', 'mueble'], ['plantas', 'Plantas', 'planta'], ['deco', 'Decoración', 'deco'], ['escenarios', 'Escenario', 'sala'], ['obra', 'Construir', 'ladrillo'], ['pegar', 'Pegatinas', 'deco'], ['pintar', 'Pintar', 'pincel']];      // PEGATINAS: escenario-pegatinas.js      // CONSTRUIR: solo con el lienzo (escenario-obra.js)
// lo de una pestaña: [{ cat, it }]
function escCosasDe(tab) {
  if (tab === 'escenarios') return arCat('escenarios').items.filter(it => !it.lz && !it.hueco).map(it => ({ cat: 'escenarios', it }));      // (los tamaños del lienzo y los huecos no son escenarios: escenario-obra2.js, escenario-huecos.js)
  return arCat('muebles').items.filter(it => MUEBLES_SALA[it.id] && MUEBLES_SALA[it.id].g === tab).map(it => ({ cat: 'muebles', it }));
}
function escModo(m, sinSonido) {
  if (m !== 'pintar' && typeof SEL_ESC !== 'undefined' && SEL_ESC.s) escSelSuelta();      // lo seleccionado que flotaba se queda donde está (escenario-pincel3.js)
  MIESC.modo = m; MIESC.poner = null; MIESC.drag = null; if (m !== 'pasear') { MIESC.camino = null; MIESC.alArmario = false; } else { MIESC.cam.sigue = true; escSacaYo(); } if (m !== 'decorar') MIESC.sel = null;
  const panel = ['pintar', 'obra', 'pegar'];      // las pestañas que son un modo con su propio panel
  if (panel.includes(m)) MIESC.tab = m; else if (panel.includes(MIESC.tab)) MIESC.tab = 'muebles';
  if (m !== 'obra') obraArriba();
  if (!sinSonido) play('select');
  preparaObra(); preparaPeg(); E('esc-pegar').hidden = m !== 'pegar'; preparaProbar(); E('b-esc-probar').querySelector('b').textContent = tr('PROBAR'); E('esc-decorar').hidden = m !== 'decorar'; E('esc-pintar').hidden = m !== 'pintar'; E('esc-obra').hidden = m !== 'obra'; E('esc-pasear').hidden = m !== 'pasear';
  E('b-esc-pasear').classList.toggle('activo', m === 'pasear'); E('esc-panel').classList.toggle('paseo', m === 'pasear');
  // al PASEAR se esconde todo el menú (la bandeja y el zoom): arriba quedan VOLVER, COLADO / BECARIO y DECORAR
  const antes = E('p-escenario').classList.contains('paseando');
  E('p-escenario').classList.toggle('paseando', m === 'pasear'); E('b-esc-clase').hidden = m !== 'pasear'; escClaseBoton();
  if (m === 'pasear' && !antes && !sinSonido) escAviso(tr('Arrastra el dedo para llevar tu galleta o toca el suelo para ir andando (o usa las flechas). Con dos dedos, zoom.'));
  E('b-esc-pasear').querySelector('b').textContent = m === 'pasear' ? tr('DECORAR') : tr('PASEAR');
  if (m === 'pintar' && typeof escPincelRefresca === 'function') escPincelRefresca();
  if (m === 'obra') obraRefresca();
  if (m === 'pegar') pegRefresca();
  escBandeja(); MIESC.sucio = true; requestAnimationFrame(escAjusta);
}
function escBandeja() {
  const sala = escenarioSala(), fila = E('esc-pestanas'); fila.innerHTML = '';
  for (const [id, nombre, icono] of ESC_PESTANAS) {
    if (id === 'obra' && escBase(sala.id) !== 'lienzo') continue;
    const b = document.createElement('button'); b.type = 'button'; b.id = 'esc-pest-' + id; b.className = 'esc-pest' + (MIESC.modo !== 'pasear' && MIESC.tab === id ? ' activa' : '');
    b.innerHTML = '<i></i><b></b><small></small>'; ponIcono(b.children[0], icono); b.children[1].textContent = tr(nombre);
    if (id === 'pegar') b.children[2].textContent = (sala.peg || []).length + '/' + ESC_PEG.MAX;
    else if (id !== 'pintar' && id !== 'obra') { const l = escCosasDe(id); b.children[2].textContent = l.filter(x => arTiene(x.cat, x.it)).length + '/' + l.length; } else b.children[2].remove();
    b.onclick = () => { if (id === 'pintar' || id === 'obra' || id === 'pegar') { if (MIESC.modo !== id) escModo(id); return; } MIESC.tab = id; play('select'); if (MIESC.modo !== 'decorar') escModo('decorar', true); else escBandeja(); };
    fila.appendChild(b);
  }
  if (MIESC.modo !== 'decorar') return;
  const lista = escCosasDe(MIESC.tab), tira = E('esc-tira'), viejo = tira.scrollLeft; tira.innerHTML = '';
  if (MIESC.tab === 'escenarios') escHuecoCarta(tira);      // la primera: MIS ESCENARIOS (escenario-huecos.js)
  lista.sort((a, b) => (arTiene(b.cat, b.it) ? 1 : 0) - (arTiene(a.cat, a.it) ? 1 : 0));
  const tienes = lista.filter(x => arTiene(x.cat, x.it)).length;
  E('esc-cuenta').textContent = MIESC.tab === 'escenarios' ? tr('Tienes {n} de {t}', { n: tienes, t: lista.length }) + ' · ' + tr(arItem('escenarios', escBase(sala.id)).n)
    : tr('Tienes {n} de {t}', { n: tienes, t: lista.length }) + ' · ' + tr('{n} de {t} puestos', { n: sala.muebles.length, t: SALA.MAX_MUEBLES });
  E('esc-pista').textContent = MIESC.tab === 'escenarios' ? tr('Toca uno para cambiar el estilo y la forma del mapa') : tr('Toca una tarjeta: sale donde miras');
  for (const { cat, it } of lista) {
    const tuyo = arTiene(cat, it);
    const marcado = cat === 'escenarios' ? escBase(sala.id) === it.id : false;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'esc-carta r-' + it.r + (tuyo ? '' : ' bloq') + (marcado ? ' activa' : '');
    const k = arLienzo(64, 64); arPinta(k, (c, w) => it.x(c, w)); b.appendChild(k);
    const s = document.createElement('small'); s.textContent = tr(it.n); b.appendChild(s);
    const r = document.createElement('i'); r.className = 'esc-rar'; r.textContent = tr(RAREZA_AR[it.r]); b.appendChild(r);
    const cuenta = cat === 'muebles' && tuyo ? muebleCuentaTexto(sala, it.id) : '', agotado = cat === 'muebles' && tuyo && muebleQuedan(sala, it.id) <= 0;      // unidades (muebles-unidades.js)
    if (cuenta) { const n = document.createElement('em'); n.textContent = cuenta; b.appendChild(n); }
    if (agotado) b.classList.add('agotada');
    if (!tuyo) { const cd = arLienzo(22, 22, 'ar-candado'); arPinta(cd, (c, w) => ARD.ICONOS.candado(c, w)); b.appendChild(cd); }
    b.addEventListener('pointerdown', e => { if (cat === 'muebles' && tuyo && !agotado) MIESC.arrastra = { it, x: e.clientX, y: e.clientY, ya: false, b, toque: e.pointerType !== 'mouse' }; });
    b.onclick = () => { if (MIESC.arrastrado) { MIESC.arrastrado = false; return; } escTocaCosa(cat, it, tuyo); };
    tira.appendChild(b);
  }
  const mas = document.createElement('button'); mas.type = 'button'; mas.className = 'esc-carta mas';
  mas.innerHTML = '<i></i><small></small>'; ponIcono(mas.firstChild, 'bolsa'); mas.lastChild.textContent = tr('CONSEGUIR MÁS');
  mas.onclick = () => { play('select'); escGuarda(); MIESC.abierto = false; cancelAnimationFrame(MIESC.raf); E('esc-burbuja').hidden = true; abreArmario(MIESC.tab === 'escenarios' ? 'escenarios' : 'muebles', 'escenario'); };
  tira.appendChild(mas); tira.scrollLeft = viejo;
}
function escTocaCosa(cat, it, tuyo) {
  if (!tuyo) { play('tick'); escAviso(tr('Aún no es tuyo') + ' · ' + tr(it.n) + ': ' + arTextoDe(it)); return; }
  if (cat === 'escenarios' && it.id === 'lienzo') { play('select'); obraElige(); return; }      // en blanco, desde una plantilla o seguir con el tuyo (escenario-obra.js)
  if (cat === 'escenarios') { escCambiaBase(it.id); return; }
  if (cat === 'muebles' && muebleQuedan(escenarioSala(), it.id) <= 0) { muebleSinUnidades(it); return; }      // sin unidades: a por más
  escPonDondeMiras(it);
}
// arrastrar una tarjeta de la bandeja: hacia arriba la coge (de lado mueve la tira); al soltarla en el suelo se pone si cabe
function escArrastraMueve(e) {
  const a = MIESC.arrastra; if (!a) { if (MIESC.drag && MIESC.drag.burbuja) { MIESC.ptCli = { x: e.clientX, y: e.clientY }; escArrastra(escAMundo(e)); } return; }
  MIESC.ptCli = { x: e.clientX, y: e.clientY };
  const dx = e.clientX - a.x, dy = e.clientY - a.y;
  const haciaSala = MIESC.vista.lado ? dx < -10 && Math.abs(dx) > Math.abs(dy) : dy < -10 && Math.abs(dy) > Math.abs(dx);      // hacia la sala: arriba, o a la izquierda si la bandeja está al lado
  if (!a.ya && haciaSala) { a.ya = true; MIESC.poner = a.it; MIESC.sel = null; a.b.classList.add('cogida'); play('tick'); }
  if (a.ya) { const p = escAMundo({ clientX: e.clientX, clientY: e.clientY - (a.toque ? 36 : 0) }); MIESC.puntero = p; MIESC.sucio = true; e.preventDefault(); }
}
function escArrastraSuelta(e) {
  const a = MIESC.arrastra; MIESC.arrastra = null;
  if (!a) { if (MIESC.drag && MIESC.drag.burbuja) escSuelta(); return; }
  if (!a.ya) return;
  MIESC.arrastrado = true; setTimeout(() => { MIESC.arrastrado = false; }, 0); a.b.classList.remove('cogida');
  const p = MIESC.puntero, ar = MIESC.area;
  if (p && e.clientY < ar.y1 && e.clientX < ar.x1 && escEnSuelo(p)) escPon(a.it, p); else play('tick');
  MIESC.poner = null; MIESC.puntero = null; escBandeja(); MIESC.sucio = true;
}
// la burbuja del mueble marcado, encima de él (o debajo si no cabe arriba)
function escColocaBurbuja() {
  const m = MIESC.modo === 'decorar' && !MIESC.drag ? MIESC.sel : null, bu = E('esc-burbuja');
  if (!m) { bu.hidden = true; return; }
  const M = MUEBLES_SALA[m.id], T = TIPOS_MUEBLE[M.t], { k, ox, oy } = MIESC.vista;
  if (bu.hidden || bu.dataset.id !== m.id) { E('esc-sel-n').textContent = tr(arItem('muebles', m.id).n); E('b-esc-color').hidden = !(M.vars > 1); bu.dataset.id = m.id; }
  bu.hidden = false;
  const w = bu.offsetWidth, h = bu.offsetHeight, x = ox + m.x * k, arriba = oy + (m.y - (T.tope || T.d + T.h) - 8) * k - h, abajo = oy + (m.y + 10) * k;
  const tope = MIESC.area.y0, fondo = MIESC.area.y1, fuera = x < -20 || x > MIESC.area.x1 + 20 || abajo < tope || arriba > fondo;
  bu.style.visibility = fuera ? 'hidden' : '';      // el mueble se ha quedado fuera de la vista
  bu.style.left = limita(x - w / 2, 6, MIESC.area.x1 - w - 6) + 'px'; bu.style.top = limita(arriba > tope ? arriba : abajo, tope, Math.max(tope, fondo - h - 4)) + 'px';
  bu.classList.toggle('abajo', arriba <= tope);
}
function escAccionSel(que) {
  const sala = escenarioSala(), m = MIESC.sel; if (!m) return;
  if (que === 'voltear') m.f = m.f ? 0 : 1;
  else if (que === 'color') m.v = ((m.v || 0) + 1) % MUEBLES_SALA[m.id].vars;
  else if (que === 'quitar') { escChispas(m, true); sala.muebles.splice(sala.muebles.indexOf(m), 1); MIESC.sel = null; escCambio(); }
  if (que !== 'quitar') MIESC.pops.push({ m, t0: MIESC.t });
  play(que === 'quitar' ? 'tick' : 'pop'); escGuarda(); MIESC.sucio = true; escBandeja();
}
function preparaBandejaEsc() {
  for (const [id, q] of [['b-esc-voltear', 'voltear'], ['b-esc-color', 'color'], ['b-esc-quitar', 'quitar']]) E(id).onclick = () => escAccionSel(q);
  E('b-esc-mover').addEventListener('pointerdown', e => {
    const m = MIESC.sel; if (!m) return; e.preventDefault();
    escEmpiezaArrastre(m, escAMundo(e)); MIESC.drag.burbuja = true; MIESC.drag.movido = true; play('tick'); MIESC.sucio = true;
  });
  E('b-esc-mover').onclick = () => {};
  window.addEventListener('pointermove', escArrastraMueve, { passive: false });
  window.addEventListener('pointerup', escArrastraSuelta); window.addEventListener('pointercancel', e => { if (MIESC.arrastra && !MIESC.arrastra.ya) MIESC.arrastra = null; else escArrastraSuelta(e); });
}

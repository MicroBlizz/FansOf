// Fans of Rouflage · MI ESCENARIO, EL LIENZO (2 de 2): EMPEZAR UN LIENZO (en blanco, desde una plantilla —los escenarios de siempre que tienes— o
// seguir con el tuyo), PROBAR (una partida contra bots en tu escenario, sin salir del editor) y el lienzo en la lista de escenarios. Lo demás del
// lienzo (los datos, CONSTRUIR, COMPROBAR y BECARIOS) está en escenario-obra.js, que va antes.
'use strict';

/* ---------- EMPEZAR UN LIENZO: en blanco, desde una plantilla (los escenarios de siempre que tienes) o seguir con el tuyo ---------- */
// una plantilla hecha lienzo: su plano (42 × 30, el mismo que el lienzo) y sus suelos y paredes. Ocupa lo mismo que el escenario (tamaño ENORME)
function lzDePlantilla(id) {
  const E0 = ESCENARIOS[id], F = E0 && FORMAS_ESC[E0.forma]; if (!F) return lzNuevo();
  const filas = F.plano.split('\n').filter(f => f.length), b = E0.b || [E0.suelo, E0.pared], c = E0.c || b;
  const lz = { t: LIENZO.TAM.length - 1, g: [], L: { a: [E0.suelo, E0.pared], b: [b[0], b[1]], c: [c[0], c[1]] } };
  for (let j = 0; j < LIENZO.H; j++) for (let i = 0; i < LIENZO.W; i++) { const ch = (filas[j] || '')[i] || '#'; lz.g.push(ch === 'A' ? 'a' : ch === 'B' ? 'b' : ch === 'C' ? 'c' : '#'); }
  for (let k = 0; k < lz.g.length; k++) if (lz.g[k] !== '#' && !lzDentro(lz, k % LIENZO.W, (k / LIENZO.W) | 0)) lz.g[k] = '#';
  for (const k of Object.keys(lz.L)) if (!SUELOS[lz.L[k][0]] || !PAPELES[lz.L[k][1]]) lz.L[k] = LIENZO.DEF.slice();
  return lz;
}
// deja el lienzo propio con lo elegido y lo abre (lo de antes se puede recuperar con DESHACER)
function lzEmpieza(lz) {
  const sala = escenarioSala(), antes = ESC_LZ['lienzo~mio'];
  if (antes && escBase(sala.id) === 'lienzo') { OBRA.pasos.push(lzCopia(antes)); if (OBRA.pasos.length > 30) OBRA.pasos.shift(); }
  ESC_LZ['lienzo~mio'] = lz; delete _escMundos['lienzo~mio'];
  if (escBase(sala.id) === 'lienzo') { obraRehace(); obraAjusta(); escGuarda(); play('pop'); escBandeja(); }
  else escCambiaBase('lienzo');
  if (E('obra-elige')) E('obra-elige').hidden = true;
  if (MIESC.modo !== 'obra') escModo('obra'); else obraRefresca();
}
function obraElige() {
  let v = E('obra-elige');
  if (!v) {
    v = document.createElement('div'); v.id = 'obra-elige'; v.className = 'obra-elige'; v.hidden = true;
    v.innerHTML = '<div class="caja obra-elige-caja"><h3 class="ol"></h3><p class="nota-sala"></p><div class="obra-elige-lista" id="obra-elige-lista"></div><button type="button" class="boton gris peq" id="b-obra-elige-no"></button></div>';
    E('p-escenario').appendChild(v);
    E('b-obra-elige-no').onclick = () => { play('select'); v.hidden = true; };
    v.addEventListener('pointerdown', e => { if (e.target === v) { v.hidden = true; } });
  }
  v.querySelector('h3').textContent = tr('EMPEZAR UN LIENZO');
  v.querySelector('p').textContent = tr('En blanco o desde una plantilla. Luego cambias paredes, suelos y puertas a tu gusto.');
  E('b-obra-elige-no').textContent = tr('CANCELAR');
  const lista = E('obra-elige-lista'); lista.innerHTML = '';
  const carta = (nombre, dibujo, clase, alTocar, candado) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'esc-carta ' + clase + (candado ? ' bloq' : '');
    const k = arLienzo(64, 64); arPinta(k, dibujo); b.appendChild(k);
    const t = document.createElement('small'); t.textContent = nombre; b.appendChild(t);
    if (candado) { const cd = arLienzo(22, 22, 'ar-candado'); arPinta(cd, (c, w) => ARD.ICONOS.candado(c, w)); b.appendChild(cd); }
    b.onclick = alTocar; lista.appendChild(b);
  };
  const guardado = (SAVE.escenario || {}).lz || ESC_LZ['lienzo~mio'];
  if (guardado) { delete _escIconos[lzMio()]; delete _escMundos[lzMio()]; }      // su dibujo, al día
  if (guardado) carta(tr('Seguir con el mío'), (c, w) => escenarioIcono(c, w, lzMio()), 'r-epica obra-mio', () => { play('select'); lzEmpieza(ESC_LZ[lzMio()]); });
  carta(tr('En blanco'), (c, w) => obraTarjetaSuelo(c, w, LIENZO.DEF[0]), 'r-comun', () => { play('select'); obraEmpiezaSeguro(lzNuevo()); });      // con «¿seguro?» (escenario-huecos.js)
  for (const it of arCat('escenarios').items) {
    if (it.id === 'lienzo' || !ESCENARIOS[it.id]) continue;
    const tuyo = arTiene('escenarios', it);
    carta(tr(it.n), (c, w) => it.x(c, w), 'r-' + it.r, () => {
      if (!tuyo) { play('tick'); escAviso(tr('Aún no es tuyo') + ' · ' + tr(it.n) + ': ' + arTextoDe(it)); return; }
      play('select'); obraEmpiezaSeguro(lzDePlantilla(it.id));
    }, !tuyo);
  }
  v.hidden = false;
}

/* ---------- PROBAR: una partida contra bots en tu propio escenario, sin salir del editor. Al acabar (o al salir), vuelves al editor ---------- */
const ESC_PRUEBA = { activa: false };
function escProbar(modo) {
  const sala = escenarioSala();
  if (escBase(sala.id) === 'lienzo' && !obraComprueba()) return;      // un lienzo que no vale para jugar: primero, arreglarlo
  escGuarda(); if (typeof escPublica === 'function') escPublica(); play('select');
  MIESC.abierto = false; cancelAnimationFrame(MIESC.raf); E('esc-burbuja').hidden = true; if (E('obra-elige')) E('obra-elige').hidden = true;
  cargaMapa(mapaDeEscenario(escenarioDatos()));
  ESC_PRUEBA.activa = true;
  empiezaSeguro(modo || 'camaleon');
}
// al salir de la partida de prueba (MENÚ en el final, o SALIR en la pausa): de vuelta al editor
function escPruebaVuelve() {
  if (!ESC_PRUEBA.activa) return false;
  ESC_PRUEBA.activa = false;
  limpiaPartida(); J.fase = 'titulo'; refrescaHud(true);
  abreEscenario(); return true;
}
function preparaProbar() {
  if (E('b-esc-probar')) return;
  const b = document.createElement('button'); b.type = 'button'; b.className = 'boton esc-probar'; b.id = 'b-esc-probar';
  b.innerHTML = '<i></i><b></b>'; ponIcono(b.firstChild, 'jugar');
  b.onclick = () => escProbar(typeof escClase === 'function' ? escClase() : 'camaleon');      // con el papel que llevas al pasear
  E('p-escenario').appendChild(b);      // al pasear no hay bandeja: PROBAR flota abajo a la derecha
}

// el lienzo, en la pestaña ESCENARIO y en el armario: el primero, gratis desde el principio. Detrás, los TAMAÑOS (lz: el tamaño que da): el
// MEDIANO en el pase gratis y los demás en la tienda, con Acciones (o Gotas, como todo); sg: no salen en el gachapón
(() => {
  const cat = arCat('escenarios'); if (!cat || cat.items.some(it => it.id === 'lienzo')) return;
  const icono = t => (c, w) => lzIconoTam(c, w, t);
  cat.items.unshift({ id: 'lienzo', n: 'Lienzo en blanco', r: 'comun', de: 'base', txt: 'Al empezar', x: (c, w) => escenarioIcono(c, w, 'lienzo') },
    { id: 'lienzo2', n: 'Lienzo mediano', r: 'rara', de: 'gratis', txt: 'Pase gratis · nv 8', lz: 1, sg: true, x: icono(1) },
    { id: 'lienzo3', n: 'Lienzo grande', r: 'epica', de: 'tienda', txt: 600, lz: 2, sg: true, x: icono(2) },
    { id: 'lienzo4', n: 'Lienzo enorme', r: 'legend', de: 'tienda', txt: 1000, lz: 3, sg: true, x: icono(3) });
})();
// el dibujo de un tamaño: el rectángulo a escala, punteado, dentro del más grande
function lzIconoTam(c, w, t) {
  const [W, H] = LIENZO.TAM[LIENZO.TAM.length - 1], [tw, th] = LIENZO.TAM[t], s = (w * 0.8) / W, x = (w - tw * s) / 2, y = (w - th * s) / 2;
  c.fillStyle = '#1d2536'; c.fillRect(w * 0.1, (w - H * s) / 2, W * s, H * s);
  c.fillStyle = t === 3 ? 'rgba(255,203,61,0.3)' : 'rgba(159,208,255,0.25)'; c.fillRect(x, y, tw * s, th * s);
  c.setLineDash([w * 0.05, w * 0.035]); c.lineWidth = Math.max(2, w * 0.035); c.strokeStyle = t === 3 ? '#ffcb3d' : '#9fd0ff'; c.strokeRect(x, y, tw * s, th * s); c.setLineDash([]);
}
const lzTamItem = t => arCat('escenarios').items.find(it => it.lz === t);
// el tamaño más grande que tienes (0: el pequeño, gratis)
function lzTamTuyo() { let m = 0; for (const it of arCat('escenarios').items) if (it.lz && it.lz > m && arTiene('escenarios', it)) m = it.lz; return m; }
// AMPLIAR: si ya tienes el siguiente tamaño, se pone; si no, la ventana de comprarlo (en la alfa y en localhost, gratis para probar)
function obraAmplia() {
  const lz = lzAct(); if (!lz) return;
  if (lz.t >= LIENZO.TAM.length - 1) { play('deny'); escAviso(tr('Ya es el tamaño más grande')); return; }
  const sig = lz.t + 1, it = lzTamItem(sig), pruebas = typeof arPruebasVisibles === 'function' && arPruebasVisibles();
  if (lzTamTuyo() < sig && !pruebas) {
    if (it && it.de === 'gratis') { play('tick'); escAviso(tr(it.n) + ': ' + arTextoDe(it)); return; }
    if (it) { play('select'); escGuarda(); arPideCompra(arCat('escenarios'), it); return; }
  }
  OBRA.pasos.push(lzCopia(lz));
  const R0 = lzRect(lz.t); lz.t = sig; const R = lzRect(lz.t), k0 = lz.g.find(ch => lz.L[ch]) || lzLetra(lz, LIENZO.DEF[0], LIENZO.DEF[1]);
  for (let j = R.y0; j < R.y1; j++) for (let i = R.x0; i < R.x1; i++) if (!(i >= R0.x0 && i < R0.x1 && j >= R0.y0 && j < R0.y1)) lz.g[j * LIENZO.W + i] = k0;
  play('levelup'); obraRehace(); escGuarda(); obraRefresca(); escAviso(tr('Tamaño: {t}', { t: tr(LIENZO.NOMBRE[lz.t]) }));
}

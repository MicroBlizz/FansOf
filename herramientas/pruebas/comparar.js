// Fans Of · Comparador: abre el mismo guion en la copia de antes (_base/) y en la versión de ahora, y dice en qué se diferencian.
'use strict';
const RAIZ = new URL('../../', location.href).pathname;   // la raíz del repositorio en el servidor de pruebas
const TAMS = { movil: [390, 844], normal: [540, 960], pc: [1280, 800] };
const $ = s => document.querySelector(s);
const duerme = ms => new Promise(r => setTimeout(r, ms));
const texto = async u => { const r = await fetch(u, { cache: 'no-store' }); if (!r.ok) throw new Error(`${u}: ${r.status}`); return r.text(); };
const LETRAS = ['40px "Luckiest Guy"', '600 16px "Baloo 2"', '700 16px "Baloo 2"', '800 16px "Baloo 2"'];

// una pasada: arranca el juego con la partida de prueba, le mete las herramientas (dentro.js) y ejecuta el guion
async function pasada(variante, juego, guion, dentro, tam, parte) {
  const P = (0, eval)(guion + '\n;PRUEBA');
  for (const k of P.claves) localStorage.removeItem(k);
  localStorage.setItem(P.clave, JSON.stringify(P.guardado));
  for (const k in P.otras || {}) localStorage.setItem(k, P.otras[k]);
  const f = document.createElement('iframe'); f.width = tam[0]; f.height = tam[1];
  const cargado = new Promise(res => { f.onload = res; });
  f.src = `${RAIZ}${variante}games/${juego}/`; $('#marcos').appendChild(f);
  try {
    await cargado; const w = f.contentWindow;
    for (let i = 0; ; i++) { let ok = false; try { ok = w.eval(P.lista); } catch (e) { /* aún cargando */ } if (ok) break; if (i > 400) throw new Error(`${variante || 'ahora'}: el juego no arranca`); await duerme(100); }
    await Promise.race([Promise.all(LETRAS.map(l => w.document.fonts.load(l))).then(() => w.document.fonts.ready), duerme(5000)]);
    await duerme(150);
    w.eval(dentro); w.eval(guion);
    let fallo = '';
    try { await w.eval(`PRUEBA.pasos(T, ${JSON.stringify(parte || '')})`); } catch (e) { fallo = `se para en «${w.T.actual}»: ${e && e.stack || e}`; }
    let pendientes = []; try { pendientes = w.eval("typeof IDIOMA !== 'undefined' ? IDIOMA.pendientes() : []"); } catch (e) { /* sin idioma */ }
    return { pasos: w.T.pasos.slice(), dic: w.T.dic.slice(), errores: w.T.errores.slice().concat(fallo ? [fallo] : []), pendientes };
  } finally { f.remove(); for (const k of P.claves) localStorage.removeItem(k); }
}

// cada línea de estilos es «elemento, n.º de estilo[, ::before, n.º…]»; aquí se cambia cada número por su estilo
const expande = (v, dic) => v.split('\n').map(l => l.split('\t').map((x, i) => (i % 2 ? dic[+x] : x)));
function difTexto(a, b) {
  let i = 0; const n = Math.min(a.length, b.length); while (i < n && a[i] === b[i]) i++;
  return { en: i, antes: a.slice(Math.max(0, i - 70), i + 130), ahora: b.slice(Math.max(0, i - 70), i + 130), largos: [a.length, b.length] };
}
function difEstilos(a, b, props) {
  if (a.length !== b.length) return { tipo: 'distinto número de elementos', largos: [a.length, b.length] };
  const out = []; let total = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i].join('\t') === b[i].join('\t')) continue;
    total++; if (out.length >= 12) continue;
    if (a[i][0] !== b[i][0] || a[i].length !== b[i].length) { out.push({ elemento: a[i][0], ahora: b[i][0], trozos: [a[i].length, b[i].length] }); continue; }
    const ch = [];
    for (let j = 1; j < a[i].length; j += 2) {
      const va = a[i][j].split(';'), vb = b[i][j].split(';'), donde = j > 1 ? a[i][j - 1] + ' ' : '';
      for (let k = 0; k < va.length && ch.length < 10; k++) if (va[k] !== vb[k]) ch.push(`${donde}${props[k] || k}: ${va[k]} → ${vb[k]}`);
    }
    out.push({ elemento: a[i][0], cambia: ch });
  }
  return { tipo: 'estilos', total, primeros: out };
}
function diferencias(A, B, props) {
  const difs = [], nb = new Map(B.pasos), na = new Set(A.pasos.map(p => p[0]));
  for (const [n, va] of A.pasos) {
    if (!nb.has(n)) { difs.push({ paso: n, tipo: 'falta ahora' }); continue; }
    const vb = nb.get(n);
    if (n.endsWith(' · estilos')) { const a = expande(va, A.dic), b = expande(vb, B.dic), junta = x => x.map(l => l.join('\t')).join('\n'); if (junta(a) !== junta(b)) difs.push(Object.assign({ paso: n }, difEstilos(a, b, props))); }
    else if (va !== vb) difs.push(Object.assign({ paso: n, tipo: 'texto' }, difTexto(va, vb)));
  }
  for (const [n] of B.pasos) if (!na.has(n)) difs.push({ paso: n, tipo: 'solo ahora' });
  return difs;
}

// compara(juego, { tam, parte, antes, ahora }): `antes` y `ahora` son las carpetas ('_base/' y '' por defecto)
async function compara(juego, o = {}) {
  try { localStorage.setItem('fansof-dev', '0'); } catch (e) { /* sin guardar */ }   // sin el botón de desarrollo en las pantallas
  const tam = TAMS[o.tam || 'normal'], antes = o.antes == null ? '_base/' : o.antes, ahora = o.ahora || '';
  $('#estado').textContent = `Probando ${juego}…`; $('#lista').innerHTML = '';
  if (navigator.serviceWorker) for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister();   // que ninguna copia guardada se cuele
  const [guion, dentro] = await Promise.all([texto(`${juego}.js`), texto('dentro.js')]);
  const props = (/const PROPS = \[([\s\S]*?)\];/.exec(dentro) || ['', ''])[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(Boolean);
  const A = await pasada(antes, juego, guion, dentro, tam, o.parte), B = await pasada(ahora, juego, guion, dentro, tam, o.parte);
  try { localStorage.removeItem('fansof-dev'); } catch (e) { /* sin guardar */ }
  const difs = diferencias(A, B, props), R = { juego, tam: o.tam || 'normal', pasos: A.pasos.length, pasosAhora: B.pasos.length, distintos: difs.length, difs, erroresAntes: A.errores, erroresAhora: B.errores };
  window.ULTIMA = { A, B, R };
  pinta(R, A); return R;
}
const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
function pinta(R, A) {
  const mal = new Map(R.difs.map(d => [d.paso, d]));
  $('#estado').innerHTML = `<b class="${R.distintos || R.erroresAhora.length ? 'mal' : 'bien'}">${R.juego}: ${R.pasos} comprobaciones, ${R.distintos} distintas</b>` +
    (R.erroresAntes.length ? `<pre>Errores en la versión de antes:\n${esc(R.erroresAntes.join('\n'))}</pre>` : '') + (R.erroresAhora.length ? `<pre class="mal">Errores en la versión de ahora:\n${esc(R.erroresAhora.join('\n'))}</pre>` : '');
  const nombres = A.pasos.map(p => p[0]).concat(R.difs.filter(d => d.tipo === 'solo ahora').map(d => d.paso));
  $('#lista').innerHTML = nombres.map(n => { const d = mal.get(n); return `<details class="${d ? 'mal' : 'bien'}"${d ? ' open' : ''}><summary>${d ? '✗' : '✓'} ${esc(n)}</summary>${d ? `<pre>${esc(JSON.stringify(d, null, 1))}</pre>` : ''}</details>`; }).join('');
}
for (const b of document.querySelectorAll('[data-juego]')) b.onclick = () => compara(b.dataset.juego, { tam: $('#tam').value }).catch(e => { $('#estado').innerHTML = `<pre class="mal">${esc(e && e.stack || e)}</pre>`; });

// modo automático (lo usa herramientas/comprobar.py): ?auto=rumble,td[&tam=normal] manda el resultado como JSON a /__resultado
const AUTO = new URLSearchParams(location.search);
// ?auto=rumble,td&lang=en: pasa el guion solo por la versión de ahora, con ese idioma, y manda el HTML de cada pantalla que ha visto (para buscar lo que sigue en español)
if (AUTO.get('auto') && AUTO.get('lang')) (async () => {
  const sal = [];
  try { localStorage.setItem('fansof-idioma', AUTO.get('lang')); } catch (e) { /* sin guardar */ }
  try { localStorage.setItem('fansof-dev', '0'); } catch (e) { /* sin guardar */ }
  try { localStorage.setItem('fansof-idioma-depura', '1'); } catch (e) { /* sin guardar */ }
  for (const j of AUTO.get('auto').split(',')) {
    try {
      const [guion, dentro] = await Promise.all([texto(`${j}.js`), texto('dentro.js')]);
      const B = await pasada('', j, guion, dentro, TAMS[AUTO.get('tam') || 'normal']);
      sal.push({ juego: j, errores: B.errores, htmls: B.pasos.filter(p => / · html$/.test(p[0])).map(p => p[1]), pendientes: B.pendientes });
    } catch (e) { sal.push({ juego: j, fallo: String(e && e.stack || e) }); }
  }
  try { localStorage.removeItem('fansof-idioma'); } catch (e) { /* sin guardar */ }
  try { localStorage.removeItem('fansof-idioma-depura'); } catch (e) { /* sin guardar */ }
  try { localStorage.removeItem('fansof-dev'); } catch (e) { /* sin guardar */ }
  await fetch('/__resultado', { method: 'POST', body: JSON.stringify(sal) });
})();
// ?auto=rumble&pvp=1: la prueba de PvP (herramientas/pruebas/pvp.js): dos copias del juego jugando una partida por lockstep
else if (AUTO.get('auto') && AUTO.get('pvp')) (async () => {
  const sal = [];
  try {
    try { localStorage.setItem('fansof-dev', '0'); localStorage.removeItem('for-save-1'); } catch (e) { /* sin guardar */ }
    (0, eval)(await texto('pvp.js') + '\n;window.pruebaPvp = pruebaPvp;');
    sal.push({ juego: 'rumble', det: await window.pruebaPvp(RAIZ, duerme), errores: [] });
  } catch (e) { sal.push({ juego: 'rumble', fallo: String(e && e.stack || e) }); }
  await fetch('/__resultado', { method: 'POST', body: JSON.stringify(sal) });
})();
// ?auto=rumble&det=1: la prueba de determinismo (herramientas/pruebas/determinismo.js): juega dos veces la misma partida y compara huellas
else if (AUTO.get('auto') && AUTO.get('det')) (async () => {
  const sal = [];
  try {
    try { localStorage.setItem('fansof-dev', '0'); } catch (e) { /* sin guardar */ }
    const [guion, dentro, det] = await Promise.all([texto('rumble.js'), texto('dentro.js'), texto('determinismo.js')]);
    const R = await pasada('', 'rumble', guion + '\n' + det, dentro, TAMS[AUTO.get('tam') || 'normal']);
    sal.push({ juego: 'rumble', det: R.pasos, errores: R.errores });
  } catch (e) { sal.push({ juego: 'rumble', fallo: String(e && e.stack || e) }); }
  await fetch('/__resultado', { method: 'POST', body: JSON.stringify(sal) });
})();
else if (AUTO.get('auto')) (async () => {
  const sal = [];
  for (const j of AUTO.get('auto').split(',')) {
    try {
      const tam = AUTO.get('tam') || 'normal', control = await compara(j, { tam, antes: '' }), R = await compara(j, { tam });   // el control (primero, también calienta la caché) compara la versión de ahora consigo misma: lo que ya cambia solo (animaciones, relojes) es ruido
      R.ruido = control.difs.map(d => d.paso); sal.push(R);
    } catch (e) { sal.push({ juego: j, fallo: String(e && e.stack || e) }); }
  }
  await fetch('/__resultado', { method: 'POST', body: JSON.stringify(sal) });
})();

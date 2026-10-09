// Fans Of · Página de balance (balance.html): prepara las partidas espejo, las juega dentro del juego (con balance.js) y enseña el resumen.
// Parámetros de la dirección (los usa también herramientas/balance.py):
//   que=habilidades | objetos | todo | id1,id2…   semillas=12   parte=1/2 (para repartir entre varios Chrome)   valor=dlc:0.5 (probar otro valor central)   auto=1 (manda el resultado a balance.py)
'use strict';
const $ = s => document.querySelector(s);
const PARAM = new URLSearchParams(location.search);
const pinta = (html) => { $('#estado').innerHTML = html; };
const espera = ms => new Promise(r => setTimeout(r, ms));

// abre el juego en un marco escondido y le mete balance.js
async function abreJuego() {
  const f = document.createElement('iframe'); f.width = 540; f.height = 960; f.src = '/games/rumble/?nube=0';
  $('#marcos').appendChild(f);
  await new Promise(r => f.addEventListener('load', r, { once: true }));
  const w = f.contentWindow;
  for (let i = 0; i < 200 && !(typeof w.setupMatch === 'function' && w.SAVE); i++) await espera(100);
  await espera(1500);   // que termine de arrancar
  const s = w.document.createElement('script'); s.src = '/herramientas/pruebas/balance.js?' + Date.now();
  await new Promise((r, x) => { s.onload = r; s.onerror = () => x(new Error('no carga balance.js')); w.document.head.appendChild(s); });
  return w;
}

// la lista de partidas: cada cosa a medir, en cada facción, en los dos lados y con cada semilla
function preparaCasos(L, que, semillas, valor) {
  const casos = [], add = (id, base, facs, n) => { for (let s = 1; s <= n; s++) for (const fac of facs) for (const lado of ['p', 'e']) casos.push(Object.assign({ id, fac, lado, q: 0.5, semilla: 1000 + s }, base)); };
  const habs = que === 'habilidades' || que === 'todo' ? L.habilidades : [], objs = que === 'objetos' || que === 'todo' ? L.objetos : [];
  const sueltos = ['habilidades', 'objetos', 'todo'].includes(que) ? [] : que.split(',').map(x => x.trim()).filter(Boolean);
  const facDe = {}; for (const f in L.deFaccion) facDe[L.deFaccion[f]] = f;
  let vals = null; if (valor) { const [id, v] = valor.split(':'); vals = { id, v: [+v * 0.75, +v, +v * 1.25] }; }
  for (const id of habs.concat(sueltos.filter(x => L.habilidades.includes(x)))) add('ab:' + id, { ab: id, vals: vals && vals.id === id ? vals.v : undefined }, L.facciones, semillas);
  for (const id of objs.concat(sueltos.filter(x => L.objetos.includes(x)))) add('eq:' + id, { eq: id }, L.facciones, semillas);
  // objetos de facción: solo los lleva su facción; se juegan 4 veces más semillas para tener un número de partidas parecido
  for (const id of (que === 'objetos' || que === 'todo' ? Object.values(L.deFaccion) : sueltos.filter(x => facDe[x]))) add('eq:' + id, { eq: id }, [facDe[id]], semillas * 4);
  return casos;
}

// resumen: por cada cosa medida, % de partidas que gana quien la lleva (empate = media) y margen (torres de ventaja al final, de -3 a 3)
function resume(R) {
  const g = {};
  for (const r of R) {
    const x = g[r.id] = g[r.id] || { id: r.id, n: 0, gana: 0, margen: 0, seg: 0 };
    x.n++; x.gana += r.w === r.lado ? 1 : r.w === '-' ? 0.5 : 0; x.margen += r.lado === 'p' ? r.vp - r.ve : r.ve - r.vp; x.seg += r.s;
  }
  return Object.values(g).map(x => ({ id: x.id, partidas: x.n, gana: +(100 * x.gana / x.n).toFixed(1), margen: +(x.margen / x.n).toFixed(2), duracion: Math.round(x.seg / x.n) })).sort((a, b) => b.margen - a.margen);
}
function tabla(filas) {
  return `<table><tr><th>Qué</th><th>Margen</th><th>Gana</th><th>Partidas</th><th>Dura (s)</th></tr>${filas.map(f => `<tr class="${f.margen > 1.9 ? 'mal' : f.margen < 0.5 ? 'flojo' : ''}"><td>${f.id}</td><td>${f.margen.toFixed(2)}</td><td>${f.gana} %</td><td>${f.partidas}</td><td>${f.duracion}</td></tr>`).join('')}</table>`;
}

async function mide(que, semillas, parte, valor, auto) {
  const t0 = Date.now(); pinta('Cargando el juego…');
  const w = await abreJuego(), L = w.BALANCE.lista();
  const [k, n] = (parte || '1/1').split('/').map(Number);
  const casos = preparaCasos(L, que, semillas, valor).filter((_, i) => i % n === k - 1);
  const R = [];
  for (let i = 0; i < casos.length; i += 10) {
    R.push(...w.BALANCE.juega(casos.slice(i, i + 10)));
    if (i % 100 === 0) {
      const s = Math.round((Date.now() - t0) / 1000);
      pinta(`Jugando: ${R.length} de ${casos.length} partidas (${s} s)…`);
      if (auto) fetch('/__progreso', { method: 'POST', body: JSON.stringify({ parte, hechas: R.length, total: casos.length }) }).catch(() => {});
    }
    await espera(0);   // deja respirar a la página para que se vea el progreso
  }
  const filas = resume(R);
  pinta(`Hecho: ${R.length} partidas en ${Math.round((Date.now() - t0) / 1000)} s · juego ${L.version}`);
  $('#lista').innerHTML = tabla(filas);
  $('#bajar').hidden = false; $('#bajar').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(R)], { type: 'application/json' })); a.download = 'balance.json'; a.click(); };
  if (auto) await fetch('/__resultado', { method: 'POST', body: JSON.stringify({ parte, version: L.version, partidas: R }) });
}

window.addEventListener('error', e => { pinta(`<span class="mal">Error: ${e.message}</span>`); if (PARAM.get('auto')) fetch('/__resultado', { method: 'POST', body: JSON.stringify({ fallo: e.message }) }); });
if (PARAM.get('auto')) mide(PARAM.get('que') || 'habilidades', +PARAM.get('semillas') || 12, PARAM.get('parte') || '1/1', PARAM.get('valor') || '', true).catch(e => fetch('/__resultado', { method: 'POST', body: JSON.stringify({ fallo: String(e && e.stack || e) }) }));
else $('#empezar').onclick = () => { $('#empezar').disabled = true; mide($('#que').value, +$('#semillas').value || 12, '1/1', $('#valor').value.trim(), false).catch(e => pinta(`<span class="mal">${e.message}</span>`)); };

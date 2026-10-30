// Fans Of Decks · PALABRAS CLAVE: en el texto de las cartas, Débil, Vulnerable, bloqueo, robar… se marcan y al tocarlas sale una
// burbuja que las explica (su ask, 20-10-2026). La lista entera sale en la pestaña Glosario de la Biblioteca.
// Cada entrada de DC_GLOSARIO es «Palabra: explicación»; la palabra (traducida) es lo que se busca en el texto. Las facciones añaden
// las suyas con Object.assign(DC_GLOSARIO, …) y DC_GLOSARIO_ALIAS (otras formas de la palabra: «roba», «robas»…).
// En la mano solo se marcan (tocar la carta sigue siendo jugarla); en el resto de sitios se pueden tocar.
'use strict';
Object.assign(DC_GLOSARIO, {
  debil: 'Débil: pega un 25 % menos durante esos turnos.',
  vulnerable: 'Vulnerable: recibe un 50 % más de daño durante esos turnos.',
  bloqueo: 'Bloqueo: para el daño antes de que te quite vida. Se pierde al empezar tu turno.',
  fuerza: 'Fuerza: cada punto suma 1 al daño de cada golpe.',
  caos: 'CAOS: lo que cuestan las cartas. Recibes 3 cada turno, el doble desde la hora de cierre.',
  roba: 'Robar: pasar cartas de tu mazo a la mano.',
  aturde: 'Sin turno: el rival se salta lo que iba a hacer en su próximo turno.',
  companero: 'Compañero: se queda en la mesa esos turnos y actúa solo al acabar cada uno.',
  protocolo: 'Armado: un Protocolo que espera en la mesa y salta solo cuando pasa lo que dice.',
  injugable: 'Injugable: no se puede jugar; solo ocupa sitio en la mano.',
  spam: 'Spam: correos basura que los rivales te meten en el mazo. No se pueden jugar.',
  cierre: 'Hora de cierre: desde ese turno recibes el doble de CAOS, pero los rivales pegan un 50 % más.',
});
const DC_GLOSARIO_ALIAS = {
  bloqueo: ['bloqueo'], fuerza: ['fuerza'], roba: ['roba', 'robas', 'Roba', 'Robas', 'robarla'],
  aturde: ['pierde su próximo turno', 'pierden su próximo turno', 'lo aturde', 'sin turno'], companero: ['Se queda'],
  despedida: ['Despedida'], indefinido: ['Contrato indefinido'], cierre: ['hora de cierre', 'La hora de cierre'],
};
Object.assign(DC_BIB_TABS, { g: 'Glosario' });
const dcEscHTML = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const dcMayus = s => s.charAt(0).toUpperCase() + s.slice(1);
function dcPalabraClave(k) { return tr(DC_GLOSARIO[k]).split(':')[0].trim(); }
// Qué se busca: la palabra de cada entrada y sus otras formas, ya traducidas; las más largas primero («Perfora el bloqueo» antes que «bloqueo»).
let dcClavesCache = null;
function dcClavesBusca() {
  const n = Object.keys(DC_GLOSARIO).length; if (dcClavesCache && dcClavesCache.n === n) return dcClavesCache;
  const formas = [];
  for (const k in DC_GLOSARIO) { formas.push([dcPalabraClave(k), k]); for (const a of DC_GLOSARIO_ALIAS[k] || []) formas.push([tr(a), k]); }
  formas.sort((a, b) => b[0].length - a[0].length);
  const de = {}; for (const [f, k] of formas) if (!(f in de)) de[f] = k;
  const re = new RegExp('(?<![\\p{L}\\p{N}])(' + Object.keys(de).sort((a, b) => b.length - a.length).map(f => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?![\\p{L}\\p{N}])', 'gu');
  return (dcClavesCache = { n, re, de });
}
// Marca las palabras clave de un HTML ya escapado (sin tocar dentro de las etiquetas).
function dcMarcaClaves(html) {
  const { re, de } = dcClavesBusca();
  return html.split(/(<[^>]*>)/).map(t => t.startsWith('<') ? t : t.replace(re, m => '<span class="dc-clave" data-clave="' + de[m] + '">' + m + '</span>')).join('');
}
// Las claves que salen en un texto, en orden, sin repetir (para la ficha de la carta).
function dcClavesEn(texto) { const { re, de } = dcClavesBusca(), v = []; for (const m of String(texto).matchAll(re)) if (!v.includes(de[m[1]])) v.push(de[m[1]]); return v; }
// La burbuja: encima de la palabra, dentro del escenario; se cierra con el siguiente toque o sola.
let dcBurbujaT = null;
function dcCierraBurbuja() { if (dcBurbujaT) { clearTimeout(dcBurbujaT); dcBurbujaT = null; } const b = document.querySelector('#stage > .dc-burbuja'); if (b) b.remove(); }
function dcBurbuja(el, k) {
  dcCierraBurbuja(); play('select');
  const st = document.getElementById('stage'), sr = st.getBoundingClientRect(), r = el.getBoundingClientRect(), t = tr(DC_GLOSARIO[k]), i = t.indexOf(':');
  const b = dcEl('div', 'dc-burbuja'); b.append(dcEl('b', '', i > 0 ? t.slice(0, i) : t), document.createTextNode(i > 0 ? dcMayus(t.slice(i + 1).trim()) : '')); st.append(b);
  const w = b.offsetWidth, h = b.offsetHeight, x = r.left - sr.left + r.width / 2, arriba = r.top - sr.top - h - 10 >= 6;
  b.style.left = Math.max(8, Math.min(sr.width - w - 8, x - w / 2)) + 'px'; b.style.top = (arriba ? r.top - sr.top - h - 10 : r.bottom - sr.top + 10) + 'px';
  b.style.setProperty('--px', Math.max(14, Math.min(w - 14, x - parseFloat(b.style.left))) + 'px'); b.classList.add(arriba ? 'dc-arriba' : 'dc-abajo');
  dcBurbujaT = setTimeout(dcCierraBurbuja, 7000);
}
document.addEventListener('pointerdown', ev => { if (!ev.target.closest || !ev.target.closest('.dc-clave')) dcCierraBurbuja(); }, true);
document.addEventListener('click', ev => {
  const c = ev.target.closest && ev.target.closest('.dc-clave'); if (!c || c.closest('.dc-mano, .dc-lupa')) return;
  ev.stopPropagation(); ev.preventDefault(); dcBurbuja(c, c.dataset.clave);
}, true);
// La pestaña Glosario: todas las palabras, en orden alfabético.
function dcGlosarioLista() {
  const l = dcEl('div', 'dc-glosario-lista');
  const ks = Object.keys(DC_GLOSARIO).sort((a, b) => dcPalabraClave(a).localeCompare(dcPalabraClave(b)));
  for (const k of ks) { const t = tr(DC_GLOSARIO[k]), i = t.indexOf(':'), f = dcEl('div', 'dc-glosario-fila'); f.append(dcEl('b', 'ol', i > 0 ? t.slice(0, i) : t), dcEl('span', '', i > 0 ? dcMayus(t.slice(i + 1).trim()) : '')); l.append(f); }
  return l;
}

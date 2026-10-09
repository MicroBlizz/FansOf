// Fans Of · SALÓN DE LA FAMA: la clasificación mundial de cada juego (pantalla común).
//
// Cada juego que lo quiera carga, en este orden, su js/clasificacion.js (que define SALON) y este archivo. La pantalla la crea este archivo:
// el juego solo pone un botón con data-salon en su menú. Los datos salen de la función clasificacion(p_juego, p_tabla) del servidor
// (servidor/20-clasificacion.sql), que solo cuenta lo que el servidor sabe de verdad: nada de lo que diga el móvil.
//
// SALON = { pestanas: [ {
//   id, nombre,                    // la pestaña
//   tabla      'campana' | 'poder' // la clasificación del servidor (o cargar: async () => ({ lista, yo, total }) si sale de otro sitio)
//   explica, vacio, unidad, icono  // el texto de arriba · el de abajo si aún no estás · lo que se cuenta («estrellas») · su icono (SVG)
//   info(r)                        // la línea pequeña bajo el nombre (HTML)
//   obras()                        // true → en vez de la lista sale el cartel EN CONSTRUCCIÓN, con las excusas de SALON_EXCUSAS
// } ], retrato(r) }                // opcional: qué personaje dibujar para una fila (si no, su retrato o el líder de su facción)
//
// Tu puesto en el menú: un elemento con data-salon-puesto (dentro del botón data-salon) dice «Tu puesto: 4.º» con el mejor puesto que
// tengas en cualquier pestaña, y el botón abre esa pestaña. Se pide al volver al menú (como mucho una vez por minuto: SALON_ESPERA).
'use strict';
const SALON_EXCUSAS = [
  'Para acelerar las obras hemos tomado una decisión valiente: despedir al equipo que hacía las obras.',
  'Fecha de apertura: Pronto™. Es el mismo Pronto™ que prometimos en 2019, pero ahora con más sinergias.',
  'Puedes reservar tu primer puesto por solo 19,99 €. No te garantiza nada, pero te da una sensación muy agradable.',
  'Nuestros mejores ingenieros están trabajando en ello. Bueno, uno. Es el becario. Está de vacaciones.',
  'Esta sección ha sido adquirida por Microblizz por 69.000 millones. Su único cambio: ahora tiene el logo más grande.',
  'Hemos encargado un estudio de 400 páginas para decidir de qué color pintar el cartel. Ha salido amarillo.',
  'Los premios ya están comprados. Los hemos guardado en una caja de botín: te tocarán con un 0,03 % de probabilidad.',
  'Hemos contratado a una consultora para acabar antes. Su primera recomendación: una reunión para planificar la siguiente reunión.',
  'Las obras van según lo previsto. Lo previsto era no acabar nunca.',
  'Para que esto abra antes, puedes comprar el Pase de Obras Premium. Incluye un casco amarillo (cosmético, no protege).',
  'El cartel ha costado más que todo lo que hay detrás. Prioridades.',
  'Retraso causado por factores externos: el becario ha encontrado otro trabajo. Con sueldo.',
  'Estamos escuchando a la comunidad. Y la comunidad pide que acabemos. Seguimos escuchando.',
  'Microblizz anuncia una versión remasterizada de esta obra. Es la misma, pero con el cartel en 4K.',
  'Toda la información sobre la apertura se dará en la MicroBlizzCon. Las entradas cuestan 300 €.',
];
const SALON_UI = { tab: '', cache: {}, frase: 0, pide: 0 };
const SALON_ESPERA = 60000;   // lo que dura en memoria una clasificación ya pedida (no se pregunta al servidor en cada toque)
const salonEsc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const salonTab = () => SALON.pestanas.find(p => p.id === SALON_UI.tab) || SALON.pestanas[0];

/* ---------- la pantalla (la crea este archivo: el juego no tiene que escribirla) ---------- */
(function salonMonta() {
  const s = document.createElement('section'); s.id = 'scr-salon'; s.className = 'screen top salon'; s.hidden = true;
  s.innerHTML = `<div class="scr-head"><button class="icon-btn back" aria-label="Volver"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></button><h2 class="h2 ol">SALÓN DE LA FAMA</h2></div>`
    + `<div class="tabs salon-tabs" role="group" aria-label="Clasificación"></div><p class="deck-sub salon-sub" id="salon-sub"></p>`
    + `<div class="scroll-list salon-list" id="salon-list"></div><div class="salon-pie" id="salon-pie"></div>`;
  const ref = document.querySelector('.screen'); ref.parentNode.insertBefore(s, ref);
  s.querySelector('.back').addEventListener('click', () => { play('select'); goHome(); });
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-salon]'); if (b) { play('select'); openSalon(b.dataset.salon || ''); } });
})();

function openSalon(tab) {
  if (tab && SALON.pestanas.some(p => p.id === tab)) SALON_UI.tab = tab;
  if (!SALON_UI.tab) SALON_UI.tab = SALON.pestanas[0].id;
  show('scr-salon'); salonPinta(); $('#salon-list').scrollTop = 0;
}

/* ---------- pedir los datos ---------- */
async function salonCarga(P) {
  const c = SALON_UI.cache[P.id]; if (c && Date.now() - c.t < SALON_ESPERA) return c.d;
  let d;
  if (P.cargar) d = await P.cargar();
  else {
    if (typeof CUENTA === 'undefined' || !CUENTA.activa) throw new Error('sin_nube');
    d = await CUENTA.rpc('clasificacion', { p_juego: AJUSTES.id, p_tabla: P.tabla });
  }
  d = { lista: (d && d.lista) || [], yo: (d && d.yo) || null, total: (d && d.total) || 0 };
  SALON_UI.cache[P.id] = { t: Date.now(), d }; return d;
}

/* ---------- pintar ---------- */
function salonPinta() {
  const P = salonTab(), obras = !!(P.obras && P.obras());
  $('#scr-salon .salon-tabs').innerHTML = SALON.pestanas.map(p => `<button class="tab ol" data-st="${p.id}" aria-pressed="${p.id === P.id}">${salonEsc(p.nombre)}${p.obras && p.obras() ? '<i class="salon-obra-chip">OBRAS</i>' : ''}</button>`).join('');
  for (const b of document.querySelectorAll('#scr-salon [data-st]')) b.onclick = () => { if (b.dataset.st === SALON_UI.tab) return; play('select'); SALON_UI.tab = b.dataset.st; salonPinta(); $('#salon-list').scrollTop = 0; };
  $('#salon-sub').innerHTML = P.explica || '';
  if (obras) { salonObras(); return; }
  const pide = ++SALON_UI.pide, L = $('#salon-list'), pie = $('#salon-pie');
  const cache = SALON_UI.cache[P.id];
  if (!cache) { L.innerHTML = salonEsperando(); pie.innerHTML = ''; }
  salonCarga(P).then(d => { if (pide === SALON_UI.pide && !$('#scr-salon').hidden) salonLista(P, d); })
    .catch(e => { if (pide === SALON_UI.pide) salonSinRed(e); });
}
function salonEsperando() {
  return `<div class="salon-cargando" role="status"><span class="salon-giro" aria-hidden="true"></span><b>Contando a los fans…</b><small>Microblizz está comprobando que nadie haya pagado por subir. Todavía.</small></div>`
    + '<div class="salon-hueco"></div>'.repeat(5);
}
function salonSinRed(e) {
  const nube = /sin_nube/.test(String(e && e.message));
  $('#salon-list').innerHTML = `<div class="salon-aviso"><b class="ol">${nube ? 'SIN CONEXIÓN' : 'NO SE HA PODIDO CARGAR'}</b><p>${nube ? 'El Salón de la Fama vive en los servidores de Microblizz y ahora mismo no los encontramos. Probablemente los estén vendiendo.' : 'Los servidores de Microblizz no responden. Han dicho que vuelven en cinco minutos, como siempre.'}</p><button class="btn-up ol" id="salon-otra">REINTENTAR</button></div>`;
  $('#salon-pie').innerHTML = '';
  $('#salon-otra').onclick = () => { play('select'); delete SALON_UI.cache[salonTab().id]; salonPinta(); };
}
function salonRetrato(r) {
  const vale = k => k && typeof ART !== 'undefined' && ART[k] && (TYPES[k] || TOPS[k]);
  if (SALON.retrato) { const k = SALON.retrato(r); if (vale(k)) return k; }
  if (vale(r.avatar)) return r.avatar;
  const F = FACTIONS[r.fac]; if (F && vale(F.leader)) return F.leader;
  const prim = FACTION_ORDER.map(f => FACTIONS[f] && FACTIONS[f].leader).find(vale);
  return prim || '';
}
const salonValor = (P, r) => `<span class="salon-val"><i aria-hidden="true">${P.icono || ''}</i><b class="ol">${fmt(r.valor)}</b><small>${salonEsc(P.unidad || '')}</small></span>`;
function salonFila(P, r, mia) {
  return `<div class="salon-fila${r.yo ? ' yo' : ''}${mia ? ' mia' : ''}"><b class="salon-pos ol">${fmt(r.puesto)}</b><span class="salon-cara"><canvas data-sr="${salonRetrato(r)}" aria-hidden="true"></canvas></span>`
    + `<span class="salon-quien"><b>${salonEsc(r.nombre)}${r.yo ? ' <em>(tú)</em>' : ''}</b><small>${P.info ? P.info(r) : ''}</small></span>${salonValor(P, r)}</div>`;
}
function salonPodio(P, top) {
  const sitio = [1, 0, 2].filter(i => top[i]);
  return `<div class="salon-podio">${sitio.map(i => { const r = top[i]; return `<div class="sp-col sp-${i + 1}${r.yo ? ' yo' : ''}">`
    + `${i === 0 ? `<span class="sp-corona" aria-hidden="true">${CROWN_SVG}</span>` : ''}<span class="sp-halo"><canvas data-sr="${salonRetrato(r)}" aria-hidden="true"></canvas></span>`
    + `<b class="sp-nom ol">${salonEsc(r.nombre)}</b><small class="sp-info">${P.info ? P.info(r) : ''}</small>`
    + `<div class="sp-base"><span class="sp-num ol">${i + 1}</span>${salonValor(P, r)}</div></div>`; }).join('')}</div>`;
}
function salonLista(P, d) {
  const L = $('#salon-list'), pie = $('#salon-pie'), top = d.lista.slice(0, 3), resto = d.lista.slice(3);
  if (!d.lista.length) L.innerHTML = `<div class="salon-aviso"><b class="ol">EL SALÓN ESTÁ VACÍO</b><p>Nadie ha entrado todavía. Es tu oportunidad de ser el número 1 sin tener que pagar a nadie.</p></div>`;
  else L.innerHTML = salonPodio(P, top) + resto.map(r => salonFila(P, r, false)).join('')
    + (d.total > d.lista.length ? `<p class="salon-mas">Y ${fmt(d.total - d.lista.length)} fans más intentándolo.</p>` : '');
  if (d.yo) pie.innerHTML = salonFila(P, d.yo, true);
  else pie.innerHTML = `<div class="salon-fila mia fuera"><span class="salon-quien"><b>Aún no estás en el Salón</b><small>${salonEsc(P.vacio || '')}</small></span></div>`;
  for (const cv of document.querySelectorAll('#scr-salon canvas[data-sr]')) if (cv.dataset.sr) { const big = cv.closest('.sp-halo'); drawArt(cv, cv.dataset.sr, big ? 74 : 40, big ? 68 : 36); }
}

/* ---------- la pestaña en obras ---------- */
function salonObras() {
  const E = (salonTab().excusas || SALON_EXCUSAS);
  SALON_UI.frase = SALON_UI.frase % E.length;
  const cono = '<svg viewBox="0 0 40 52" aria-hidden="true"><path d="M20 2 L33 44 H7 Z" fill="#ff7a1a" style="stroke: var(--outline)" stroke-width="3" stroke-linejoin="round"/><path d="M14.5 20 H25.5 L27.8 28 H12.2 Z" fill="#fff6ea"/><rect x="2" y="43" width="36" height="7" rx="2" fill="#c4510a" style="stroke: var(--outline)" stroke-width="3"/></svg>';
  $('#salon-list').innerHTML = `<div class="salon-obras"><div class="so-cinta" aria-hidden="true"><span>PRÓXIMAMENTE™ · PRÓXIMAMENTE™ · PRÓXIMAMENTE™ · PRÓXIMAMENTE™</span></div>`
    + `<button class="so-cartel" id="so-cartel" aria-label="Otra excusa"><span class="so-tornillo"></span><span class="so-tornillo d"></span><b>EN CONSTRUCCIÓN</b><p id="so-frase">${salonEsc(E[SALON_UI.frase])}</p><small>Toca el cartel para otra excusa</small></button>`
    + `<div class="so-conos">${cono}${cono}${cono}</div><p class="so-firma">Obra patrocinada por Microblizz · Presupuesto: tres conos y un becario</p></div>`;
  $('#salon-pie').innerHTML = '';
  $('#so-cartel').onclick = () => {
    SALON_UI.frase = (SALON_UI.frase + 1) % E.length; play('select');
    const c = $('#so-cartel'); c.classList.remove('meneo'); void c.offsetWidth; c.classList.add('meneo');
    $('#so-frase').textContent = E[SALON_UI.frase];
  };
}

/* ---------- tu puesto en el botón del menú (motiva: si vas bajo, a jugar) ---------- */
let salonPuestoVez = 0;   // si se piden dos a la vez (al abrir el juego y al volver al menú), solo escribe la última
async function salonPuesto() {
  const vez = ++salonPuestoVez;
  const els = document.querySelectorAll('[data-salon-puesto]'); if (!els.length) return;
  if (typeof CUENTA === 'undefined' || !CUENTA.activa) return;   // sin nube: se queda «Los mejores fans»
  let mejor = null;
  for (const P of SALON.pestanas.filter(p => !(p.obras && p.obras()))) {
    try { const d = await salonCarga(P); if (d.yo && (!mejor || d.yo.puesto < mejor.puesto)) mejor = { puesto: d.yo.puesto, tab: P.id }; }
    catch (e) { /* esa pestaña no ha cargado: se miran las demás */ }
  }
  if (vez !== salonPuestoVez) return;
  for (const el of els) {
    el.textContent = mejor ? `Tu puesto: ${fmt(mejor.puesto)}.º` : '¡Aún no estás!';
    const b = el.closest('[data-salon]'); if (b) { b.dataset.salon = mejor ? mejor.tab : ''; b.classList.toggle('top3', !!mejor && mejor.puesto <= 3); }
  }
}
hook('pantalla', id => { if (id === 'scr-title') salonPuesto(); });
setTimeout(salonPuesto, 2500);   // al abrir el juego, cuando ya hay sesión en la nube

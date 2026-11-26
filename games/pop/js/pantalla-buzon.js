// Fans of Pop · CORAZONES ENTRE AMIGOS, el buzón (tarea #96, ADR 150): un globito con la cifra junto a los corazones del mapa cuando hay
// regalos esperando, y la ventana del buzón con RECOGER. RECOGER suma solo lo que devuelve el servidor (PP_CORAZON_SRV.recoger), hasta el tope.
// · ppBuzonVigila(): su propio reloj (lo arranca js/principal.js); pide el buzón solo en el camino y con el flag abierto: al llegar y cada minuto.
// · ppPintaAvisoBuzon(c, x, y): lo llama ppPintaMapa en cada fotograma; solo lee PP_BUZON (nunca habla con el servidor) y pinta el globito.
// · ppBotonBuzon(t): añade a la ventana t el botón BUZÓN si hay regalos (lo usa la ventana de pedir corazones).
// · ppVentanaBuzon(): la ventana. Qué botón toca (vacío, lleno o recoger) lo dice js/corazones-vista.js.
'use strict';
// regalos: lo último que dijo el servidor; va: la petición en curso; otra: la forzada que espera a la que va; recogiendo: RECOGER en marcha
const PP_BUZON = { regalos: [], pedido: 0, va: null, otra: null, enMapa: false, recogiendo: false };
const PP_BUZON_CADA = 60000;   // ms entre una pregunta y otra al servidor
async function ppBuzonPide() {
  PP_BUZON.pedido = Date.now();
  const r = await PP_CORAZON_SRV.buzon();
  PP_BUZON.regalos = r.ok ? r.regalos : [];   // sin sesión, cerrado o sin red: no se enseña nada (ni lo de otra cuenta)
}
// pregunta al servidor si ya pasó el rato (o si se fuerza); con el flag cerrado, el buzón está vacío y no se llama.
// Si ya hay una petición en marcha, la normal espera a esa y la forzada pide otra en cuanto acabe (una sola en cola).
function ppBuzonRefresca(fuerza = false) {
  if (PP_BUZON.va) {
    if (!fuerza) return PP_BUZON.va;
    if (!PP_BUZON.otra) PP_BUZON.otra = PP_BUZON.va.then(() => { PP_BUZON.otra = null; return ppBuzonRefresca(true); });
    return PP_BUZON.otra;
  }
  if (!ppCorazonesActivo()) { PP_BUZON.regalos = []; return Promise.resolve(); }
  if (!fuerza && Date.now() - PP_BUZON.pedido < PP_BUZON_CADA) return Promise.resolve();
  PP_BUZON.va = ppBuzonPide().finally(() => { PP_BUZON.va = null; });
  return PP_BUZON.va;
}
// el reloj del buzón: fuera del camino no pide nada; al llegar al camino pide ya, y luego como mucho cada minuto
function ppBuzonVigila() {
  const enMapa = PP_PANT.actual === 'mapa', llega = enMapa && !PP_BUZON.enMapa;
  PP_BUZON.enMapa = enMapa;
  if (enMapa) ppBuzonRefresca(llega);
}
const ppBuzonN = () => PP_BUZON.regalos.length;
// el globito: un corazón dentro de una burbuja rosa con contorno grueso y la cifra en una chapita
function ppDibujaGlobito(c, x, y, n, t) {
  const late = 1 + Math.sin(t * 4) * 0.05;
  c.save(); c.translate(x, y); c.scale(late, late);
  c.beginPath(); c.arc(0, 0, 26, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#ff6eb5'; c.stroke();
  ppCorazon(c, 0, 1, 30, true);
  c.beginPath(); c.arc(20, -20, 15, 0, Math.PI * 2); c.fillStyle = '#4fc964'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#26924a'; c.stroke();
  ppTexto(c, String(n), 20, -19, 22, '#fff', 'center', '#26924a');
  c.restore();
}
function ppPintaAvisoBuzon(c, x, y) {
  const n = ppBuzonN(); if (!n) return;
  ppDibujaGlobito(c, x, y, n, performance.now() / 1000);
  PP_BOTONES_MAPA.push({ x, y, r: 34, f: ppVentanaBuzon });
}
function ppBotonBuzon(t) {
  if (ppCorazonesActivo() && ppBuzonN()) t.appendChild(ppBoton(tr('BUZÓN DE CORAZONES'), 'pp-btn2 pp-oro', ppVentanaBuzon));
}
/* ---------- la ventana ---------- */
const ppBuzonNombre = r => r.nombre || tr('Alguien');
function ppBuzonLista(regalos) {
  const ul = document.createElement('ul'); ul.className = 'pp-cz-lista';
  for (const r of regalos) { const li = document.createElement('li'); li.textContent = ppBuzonNombre(r); ul.appendChild(li); }
  return ul;
}
const ppBuzonTitulo = n => (n === 1 ? tr('Tienes 1 corazón de tus amigos') : tr('Tienes {n} corazones de tus amigos', { n }));
// recoge lo que cabe y enseña el resultado; el servidor lo marca y el móvil lo suma (ppSumaVida). Un solo RECOGER a la vez (botón
// apagado mientras va), las vidas se leen justo antes del único viaje al servidor y al volver se suma solo lo que aún cabe.
async function ppBuzonRecoge(boton) {
  if (PP_BUZON.recogiendo) return;
  PP_BUZON.recogiendo = true; boton.disabled = true;
  try {
    const r = await PP_CORAZON_SRV.recoger(ppVidas(), PP_CFG.vida, ppInfinitas(), ppBuzonN());
    if (!r.ok) { ppVentanaBuzon(ppCorazonAviso(r.motivo)); return; }
    const suma = PP_CORAZONES_REGLAS.aRecoger(r.recogidos, ppVidas(), PP_CFG.vida, ppInfinitas());
    if (suma > 0) { ppSumaVida(suma); play('ppPremio'); }
    await ppBuzonRefresca(true);
    ppVentanaBuzonResultado(suma, r.quedan);
  } finally { PP_BUZON.recogiendo = false; }
}
function ppVentanaBuzonResultado(suma, quedan) {
  const t = ppAbre(`<h2>${tr('Corazones de tus amigos')}</h2><div class="pp-cofre">${ppIcono('i-vida', 84, '#ff4a6a')}</div>`);
  t.insertAdjacentHTML('beforeend', `<p class="pp-premio">${tr('+{n}', { n: suma })}</p>`);
  if (quedan > 0) t.insertAdjacentHTML('beforeend', `<p class="pp-sub">${tr('Te quedan {n} en el buzón: recógelos cuando gastes corazones.', { n: quedan })}</p>`);
  ppBotonVolver(t, ppCierra);
}
function ppBotonRecoger(estado) {
  const b = ppBoton(estado === 'lleno' ? tr('Tienes los corazones llenos') : tr('RECOGER'), 'pp-btn2 pp-verde', () => ppBuzonRecoge(b));
  b.disabled = estado !== 'recoge' || PP_BUZON.recogiendo;
  return b;
}
async function ppVentanaBuzon(aviso = '') {
  await ppBuzonRefresca(true);
  const regalos = PP_BUZON.regalos, n = regalos.length;
  const t = ppAbre(`<h2></h2><div class="pp-cofre">${ppIcono('i-vida', 84, '#ff4a6a')}</div>`);
  t.firstChild.textContent = n ? ppBuzonTitulo(n) : tr('Tu buzón está vacío');
  if (n) t.appendChild(ppBuzonLista(regalos));
  if (aviso) { const p = document.createElement('p'); p.className = 'pp-sub'; p.textContent = aviso; t.appendChild(p); }
  t.appendChild(ppBotonRecoger(PP_CORAZONES_VISTA.buzon(PP_CORAZONES_REGLAS, n, ppVidas(), PP_CFG.vida, ppInfinitas())));
  ppBotonVolver(t, ppCierra);
}

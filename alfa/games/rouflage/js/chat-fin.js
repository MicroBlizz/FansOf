// Fans of Rouflage · EL CHAT DEL FINAL DE LA RONDA: en la pantalla del final (#p-fin), un panel «CHAT» con los mensajes de todos (al acabar ya no hay
// secretos: los dos bandos se leen) y abajo las pestañas PEGATINAS (las de tus paquetes: pegatinas-datos.js) y FRASES (las de la sala: CHAT_FRASES.s).
// En el PvP viaja por el canal de la partida, que sigue abierto hasta que alguien se va (aviso `cf` con el número: pvp-sync.js); contra bots, los bots
// contestan alguna frase o pegatina del Básico. Con el chat apagado (interruptor «Chat», chat-frases.js) no sale. Lo llama muestraFin (interfaz-fin.js).
'use strict';
const CHATF = { caja: null, msgs: [], tab: '', paq: '', espera: 0, id: 0 };
const CHATF_BOT = [5, 6, 0, 4, 105, 102, 100];      // lo que dicen los bots al final: frases (0-15) o pegatinas del Básico (100+)

function chatFinPrepara() {
  if (CHATF.caja) return CHATF.caja;
  const d = CHATF.caja = document.createElement('div');
  d.className = 'fin-chat'; d.hidden = true;
  d.innerHTML = `<h3 class="ol"></h3><div class="fc-lista" role="log" aria-live="polite"></div><div class="cs-pest" role="tablist"></div><div class="cs-paqs"></div><div class="cs-rapidas"></div>`;
  const filas = E('fin-filas'); filas.parentNode.insertBefore(d, filas);
  d.querySelector('.cs-rapidas').onclick = ev => { const b = ev.target.closest('button[data-f]'); if (b) chatFinManda(+b.dataset.f); };
  d.querySelector('.cs-pest').onclick = ev => { const b = ev.target.closest('button[data-tab]'); if (!b || b.dataset.tab === CHATF.tab) return; play('select'); CHATF.tab = b.dataset.tab; opGuarda('chat-sala-tab', CHATF.tab); chatFinBotones(); };
  d.querySelector('.cs-paqs').onclick = ev => { const b = ev.target.closest('button[data-paq]'); if (!b || b.dataset.paq === CHATF.paq) return; play('select'); CHATF.paq = b.dataset.paq; chatFinBotones(); };
  return d;
}
// al salir la pantalla del final: chat nuevo para esta ronda
function chatFinEmpieza() {
  const d = chatFinPrepara();
  CHATF.msgs = []; CHATF.espera = 0;
  d.hidden = !chatOn() || !J.yo;
  if (d.hidden) return;
  d.querySelector('h3').textContent = tr('CHAT');
  chatFinBotones(); chatFinPinta();
  if (!J.pvp) chatFinBots();
}
// los botones de abajo: como en el chat de la sala (chat-sala.js), con las mismas clases
function chatFinBotones() {
  const d = CHATF.caja; if (!d) return;
  if (!CHATF.tab) CHATF.tab = opLee('chat-sala-tab', 'peg') === 'fra' ? 'fra' : 'peg';
  const mias = typeof pegMias === 'function' ? pegMias() : [], peg = CHATF.tab === 'peg' && mias.length > 0;
  d.querySelector('.cs-pest').innerHTML = [['peg', 'PEGATINAS'], ['fra', 'FRASES']].map(([k, t]) => `<button type="button" role="tab" data-tab="${k}" aria-selected="${(k === 'peg') === peg}" class="${(k === 'peg') === peg ? 'on' : ''}">${tr(t)}</button>`).join('');
  const paqs = d.querySelector('.cs-paqs'), r = d.querySelector('.cs-rapidas');
  r.classList.toggle('peg', peg);
  if (!peg) { paqs.hidden = true; r.innerHTML = CHAT_FRASES.s.map((x, i) => `<button type="button" data-f="${i}">${esc(tr(x))}</button>`).join(''); return; }
  if (!mias.some(p => p.id === CHATF.paq)) CHATF.paq = mias[0].id;
  paqs.hidden = mias.length < 2;
  paqs.innerHTML = mias.map(p => `<button type="button" data-paq="${p.id}" class="${p.id === CHATF.paq ? 'on' : ''}" aria-label="${esc(tr(p.n))}"><img src="${pegImagen(p.peg[0].n, 96)}" alt=""></button>`).join('');
  r.innerHTML = mias.find(p => p.id === CHATF.paq).peg.map(p => `<button type="button" data-f="${p.n}" aria-label="${esc(tr(p.tag))}"><img src="${pegImagen(p.n, 160)}" alt=""></button>`).join('');
}
const chatFinValido = f => (f >= 0 && f < CHAT_FRASES.s.length) || (f >= 100 && typeof PEG_CHAT !== 'undefined' && !!PEG_CHAT[f]);
function chatFinManda(f) {
  if (!chatOn() || !chatFinValido(f) || (f >= 100 && !pegTengo(f))) return;
  const ahora = performance.now();
  if (ahora < CHATF.espera) { play('deny'); return; }
  CHATF.espera = ahora + 1500;
  chatFinPon(tr('Tú'), f, true);
  if (J.pvp) rfpManda({ t: 'cf', f });
  play('pop'); if (f >= 100) misionEvento('pegatina');      // misiones semanales y logros (misiones.js)
}
// llega un `cf` por la red (pvp-sync.js): lo dice un jugador humano de la partida
function chatFinRecibido(sl, m) {
  const f = m.f | 0; if (!chatOn() || !chatFinValido(f) || !CHATF.caja || CHATF.caja.hidden || E('p-fin').hidden) return;
  chatFinPon((sl.ente && sl.ente.nombre) || sl.nombre || '?', f, false);
  play('pop', 0.5);
}
function chatFinPon(nombre, f, yo) {
  CHATF.msgs.push({ id: ++CHATF.id, nombre, f, yo });
  if (CHATF.msgs.length > 30) CHATF.msgs.shift();
  chatFinPinta();
}
function chatFinPinta() {
  const l = CHATF.caja && CHATF.caja.querySelector('.fc-lista'); if (!l) return;
  l.innerHTML = !CHATF.msgs.length ? `<p class="fc-vacio">${tr('Despedíos con una pegatina o una frase.')}</p>` : CHATF.msgs.map(m => {
    const pg = m.f >= 100 && PEG_CHAT[m.f], txt = pg ? '' : tr(CHAT_FRASES.s[m.f] || '');
    return `<div class="cs-m ${pg ? 'peg' : 'rapida'}"><span class="cs-q${m.yo ? ' yo' : ''}">${esc(m.nombre)}:</span>${pg ? `<img class="cs-img" src="${pegImagen(m.f, 160)}" alt="${esc(tr(pg.tag))}">` : `<span>${esc(txt)}</span>`}</div>`;
  }).join('');
  l.scrollTop = l.scrollHeight;
}
// contra bots: uno o dos bots dicen algo al rato, para que el final no esté mudo
function chatFinBots() {
  const bots = J.entes.filter(e => e !== J.yo && e.nombre).sort(() => Math.random() - 0.5).slice(0, 1 + (Math.random() < 0.5 ? 1 : 0));
  bots.forEach((e, i) => setTimeout(() => {
    if (E('p-fin').hidden || !CHATF.caja || CHATF.caja.hidden) return;
    chatFinPon(e.nombre, CHATF_BOT[Math.floor(Math.random() * CHATF_BOT.length)], false); play('pop', 0.4);
  }, 1400 + i * 1700 + Math.random() * 900));
}

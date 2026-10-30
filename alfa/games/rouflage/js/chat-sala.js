// Fans of Rouflage · EL CHAT (5 de 5): EL CHAT DE LA SALA DE ESPERA del PvP (p-busca: sala con amigos y BUSCAR PARTIDA mientras se espera). Un panel abajo,
// «CHAT DE LA SALA», que se pliega para ver la sala: los mensajes y las frases rápidas de sala (van como número: cada uno las lee en su idioma).
// SIN TEXTO ESCRITO (decisión de Arkioner, 23-10-2026, para evitar problemas): solo frases rápidas; el servidor ya no admite texto (76-rouflage-chat-sin-texto.sql)
// y los mensajes viejos con texto no se enseñan. Los mensajes del sistema van en cursiva («X ha entrado en la sala»: salen de comparar quién hay en la sala).
// Abajo, dos pestañas: PEGATINAS (las de tus paquetes: pegatinas-datos.js; si tienes varios, una fila para elegir paquete) y FRASES (las de texto de siempre).
// Las pegatinas viajan como las frases, con su número (100 o más). Tocando un nombre: SILENCIAR (solo para ti, en este navegador, por cuenta o por nombre) o REPORTAR (queda en el servidor con el mensaje, para revisarlo en
// /gestion). Lee lo nuevo cada 3 s (5 s plegado), al ritmo de la sala; lo llama pvpPintaBusca. Con el chat apagado (interruptor «Chat», chat-frases.js) no se lee nada.
'use strict';

const CHATS = { dock: null, menu: null, clave: '', desde: 0, msgs: [], gente: null, leyendo: false, tLee: 0, nuevos: 0, sinServidor: false, mandando: false,
  plegado: false, silencio: [], aviso: '', tAviso: 0, colores: ['#9fd0ff', '#c9a7ff', '#a4f070', '#ffb0c8', '#7fe9f5', '#ffd27a', '#ff9f80', '#d6f58a', '#b6c8ff', '#f5a8ff'] };
const CHATS_MAX = 60;

function chatSalaPrepara() {
  if (CHATS.dock) return;
  try { CHATS.silencio = JSON.parse(localStorage.getItem('rouflage-chat-silencio') || '[]'); } catch (_) { CHATS.silencio = []; }
  CHATS.plegado = opLee('chat-sala-plegado', '0') === '1';
  const d = CHATS.dock = document.createElement('div');
  d.id = 'chat-sala'; d.className = 'chat-sala'; d.hidden = true;
  d.innerHTML = `<div class="cs-cab"><button type="button" class="cs-plegar" aria-expanded="true"><i class="cs-tira"></i>${chatIcono('#ffcb3d', false, 22)}<b></b><i class="chat-n" hidden></i><i class="cs-flecha"></i></button><span class="cs-tog"></span></div>
    <div class="cs-cuerpo"><div class="cs-lista" role="log" aria-live="polite"></div><p class="cs-apagado" hidden></p><div class="cs-pest" role="tablist"></div><div class="cs-paqs"></div><div class="cs-rapidas"></div>
    <p class="cs-aviso" hidden></p></div>`;
  E('p-busca').appendChild(d);
  const m = CHATS.menu = document.createElement('div');
  m.className = 'cs-menu'; m.hidden = true; m.setAttribute('role', 'menu');
  d.appendChild(m);
  d.querySelector('.cs-plegar').onclick = () => { play('select'); chatSalaPliega(!CHATS.plegado); };
  d.querySelector('.cs-rapidas').onclick = ev => { const b = ev.target.closest('button[data-f]'); if (b) chatSalaManda(+b.dataset.f); };
  d.querySelector('.cs-pest').onclick = ev => { const b = ev.target.closest('button[data-tab]'); if (!b || b.dataset.tab === CHATS.tab) return; play('select'); CHATS.tab = b.dataset.tab; opGuarda('chat-sala-tab', CHATS.tab); chatSalaRapidas(); };
  d.querySelector('.cs-paqs').onclick = ev => { const b = ev.target.closest('button[data-paq]'); if (!b || b.dataset.paq === CHATS.paq) return; play('select'); CHATS.paq = b.dataset.paq; chatSalaRapidas(); };
  d.querySelector('.cs-lista').onclick = ev => {
    const q = ev.target.closest('.cs-q[data-id]'); if (q) { chatSalaMenu(q); return; }
    const u = ev.target.closest('[data-deshace]'); if (u) { chatSalaSilencia(u.dataset.deshace, u.dataset.n, false); }
  };
  m.onclick = ev => { const b = ev.target.closest('button[data-a]'); if (b) chatSalaAccion(b.dataset.a); };
  document.addEventListener('pointerdown', ev => { if (!m.hidden && !ev.target.closest('.cs-menu, .cs-q')) m.hidden = true; }, true);
  if (window.ResizeObserver) new ResizeObserver(() => chatSalaHueco()).observe(d);
  chatSalaTextos();
}
// los textos (y las frases rápidas), en el idioma de cada uno
function chatSalaTextos() {
  const d = CHATS.dock;
  d.querySelector('.cs-plegar b').textContent = tr('CHAT DE LA SALA');
  d.querySelector('.cs-plegar').setAttribute('aria-label', tr('Plegar o desplegar el chat'));
  d.querySelector('.cs-tog').innerHTML = chatTogHtml();
  chatSalaRapidas();
  d.querySelector('.cs-apagado').textContent = tr('Chat apagado: ni lees ni te leen. Enciéndelo para hablar con la sala.');
}
// las pestañas PEGATINAS / FRASES, la fila de paquetes y los botones de lo que se manda
function chatSalaRapidas() {
  const d = CHATS.dock; if (!d) return;
  if (!CHATS.tab) CHATS.tab = opLee('chat-sala-tab', 'peg') === 'fra' ? 'fra' : 'peg';
  const mias = typeof pegMias === 'function' ? pegMias() : [], peg = CHATS.tab === 'peg' && mias.length > 0;
  d.querySelector('.cs-pest').innerHTML = [['peg', 'PEGATINAS'], ['fra', 'FRASES']].map(([k, t]) => `<button type="button" role="tab" data-tab="${k}" aria-selected="${(k === 'peg') === peg}" class="${(k === 'peg') === peg ? 'on' : ''}">${tr(t)}</button>`).join('');
  const paqs = d.querySelector('.cs-paqs'), r = d.querySelector('.cs-rapidas');
  r.classList.toggle('peg', peg);
  if (!peg) { paqs.hidden = true; r.innerHTML = CHAT_FRASES.s.map((x, i) => `<button type="button" data-f="${i}">${esc(tr(x))}</button>`).join(''); return; }
  if (!mias.some(p => p.id === CHATS.paq)) CHATS.paq = mias[0].id;
  paqs.hidden = mias.length < 2;
  paqs.innerHTML = mias.map(p => `<button type="button" data-paq="${p.id}" class="${p.id === CHATS.paq ? 'on' : ''}" aria-label="${esc(tr(p.n))}"><img src="${pegImagen(p.peg[0].n, 96)}" alt=""></button>`).join('');
  const pq = mias.find(p => p.id === CHATS.paq);
  r.innerHTML = pq.peg.map(p => `<button type="button" data-f="${p.n}" aria-label="${esc(tr(p.tag))}"><img src="${pegImagen(p.n, 160)}" alt=""></button>`).join('');
  if (!chatOn()) for (const el of r.querySelectorAll('button')) el.disabled = true;
}
// deja sitio abajo en la pantalla de la sala para que el panel no tape nada (con scroll)
function chatSalaHueco() { const p = E('p-busca'); if (!p || !CHATS.dock) return; p.style.paddingBottom = CHATS.dock.hidden ? '' : (CHATS.dock.offsetHeight + 14) + 'px'; }
function chatSalaPliega(si) {
  CHATS.plegado = !!si; opGuarda('chat-sala-plegado', si ? '1' : '0');
  if (!si) CHATS.nuevos = 0;
  CHATS.menu.hidden = true; chatSalaPinta();
  if (!si) chatSalaLee(true);
}

// ---------- cada vez que se repinta la sala (pvpPintaBusca) ----------
function chatSalaPaso(i) {
  const ver = !!(i && i.estado === 'espera' && i.sala) && !CHATS.sinServidor;
  if (!ver) { if (CHATS.dock && !CHATS.dock.hidden) { CHATS.dock.hidden = true; CHATS.menu.hidden = true; chatSalaHueco(); } if (!i || i.estado !== 'espera') chatSalaOlvida(); return; }
  chatSalaPrepara();
  const clave = (i.codigo || '') + ':' + i.sala;
  if (CHATS.clave !== clave) { chatSalaOlvida(); CHATS.clave = clave; chatSalaSistema(tr('Estás en la sala. Sé majo: al otro lado hay personas de verdad.')); }
  chatSalaGente(i.jugadores || []);
  if (CHATS.dock.hidden) { CHATS.dock.hidden = false; chatSalaPinta(); chatConsejo(CHATS.dock.querySelector('.cs-plegar'), tr('Habla con la sala mientras esperáis. Toca un nombre para silenciarlo o reportarlo.'), 'chat-consejo-sala'); }
  chatSalaLee(false);
}
function chatSalaOlvida() {
  Object.assign(CHATS, { clave: '', desde: 0, msgs: [], gente: null, nuevos: 0, tLee: 0 });
  if (RFRED.esLocal()) CHATSRED_CIERRA();
  if (CHATS.dock) chatSalaPintaLista();
}
const CHATSRED_CIERRA = () => { try { CHATRED.red.cerrar(); } catch (_) { /* nada */ } };
// quién entra y quién se va (comparando la lista de la sala). Se va quien lleva 6 s sin salir en la lista: así un corte de un momento no llena el chat
function chatSalaGente(jug) {
  const ahora = Date.now(), primera = !CHATS.gente;
  if (primera) CHATS.gente = new Map();
  for (const j of jug) {
    const k = j.nombre + (j.yo ? ':yo' : ''), v = CHATS.gente.get(k);      // por nombre: el número de sala puede cambiar al entrar alguien (en las pruebas)
    if (!v && !primera && !j.yo) chatSalaSistema(tr('{n} ha entrado en la sala', { n: j.nombre }));
    CHATS.gente.set(k, { j, visto: ahora });
  }
  for (const [k, v] of CHATS.gente) if (ahora - v.visto > 6000) { CHATS.gente.delete(k); if (!v.j.yo) chatSalaSistema(tr('{n} se ha ido', { n: v.j.nombre })); }
}
function chatSalaSistema(texto, extra) { CHATS.msgs.push({ sis: true, texto, extra }); chatSalaRecorta(); if (CHATS.dock && !CHATS.dock.hidden) chatSalaPintaLista(); }
const chatSalaRecorta = () => { if (CHATS.msgs.length > CHATS_MAX) CHATS.msgs.splice(0, CHATS.msgs.length - CHATS_MAX); };

// leer lo nuevo (cada 3 s, o 5 s plegado; o ya)
function chatSalaLee(ya) {
  if (!chatOn() || CHATS.leyendo || CHATS.sinServidor || !CHATS.clave) return;
  if (!ya && Date.now() - CHATS.tLee < (CHATS.plegado ? 5000 : 3000)) return;
  CHATS.leyendo = true; CHATS.tLee = Date.now();
  const clave = CHATS.clave;
  Promise.resolve(CHATRED.red.leer(CHATS.desde)).then(r => {
    if (clave !== CHATS.clave || !r || !Array.isArray(r.mensajes)) return;
    let nuevos = 0;
    for (const m of r.mensajes) {
      if (!(m.id > CHATS.desde)) continue;
      CHATS.desde = m.id;
      if (CHATS.msgs.some(x => x.id === m.id)) continue;
      if (m.frase == null) continue;      // un mensaje viejo con texto escrito: ya no se enseña
      CHATS.msgs.push(m); if (!m.yo && !chatSalaCallado(m)) nuevos++;
    }
    if (nuevos) { chatSalaRecorta(); if (CHATS.plegado) CHATS.nuevos += nuevos; play('pop', 0.4); chatSalaPinta(); }
  }).catch(e => { if (/could not find|PGRST202|HTTP 404|schema cache/i.test(String((e && e.message) || e))) { CHATS.sinServidor = true; CHATS.dock.hidden = true; chatSalaHueco(); } })      // servidor sin el chat (66): no se enseña
    .finally(() => { CHATS.leyendo = false; });
}
// mandar una frase rápida de sala (solo frases: el texto escrito se quitó)
function chatSalaManda(frase) {
  if (!chatOn() || CHATS.mandando || !(frase >= 0) || (frase >= 100 && !(typeof pegTengo === 'function' && pegTengo(frase)))) return;
  CHATS.mandando = true;
  Promise.resolve(CHATRED.red.mandar(null, frase)).then(r => {
    play('pop'); if (frase >= 100) misionEvento('pegatina');      // misiones semanales y logros (misiones.js)
    if (r && r.id && !CHATS.msgs.some(x => x.id === r.id)) {
      const v = CHATS.gente && [...CHATS.gente.values()].find(x => x.j.yo), yo = v && v.j;
      CHATS.msgs.push({ id: r.id, yo: true, nombre: yo ? yo.nombre : '', frase: r.frase }); chatSalaRecorta(); chatSalaPintaLista();
    }
    chatSalaLee(true);
  }).catch(e => {
    const s = String((e && e.message) || e); play('deny');
    chatSalaAviso(/chat_espera/.test(s) ? tr('Espera un momento para volver a hablar') : /chat_tope/.test(s) ? tr('Vas muy rápido: espera un poco') : /baneado/.test(s) ? tr('No puedes escribir en el chat ahora mismo')
      : /pegatina_no_tuya/.test(s) ? tr('Esa pegatina aún no es tuya') : /sala_no_valida/.test(s) ? tr('Ya no estás en la sala') : tr('No se ha podido mandar. ¿Tienes conexión?'));
  }).finally(() => { CHATS.mandando = false; });
}
function chatSalaAviso(t) {
  const p = CHATS.dock.querySelector('.cs-aviso'); p.textContent = t; p.hidden = false;
  clearTimeout(CHATS.tAviso); CHATS.tAviso = setTimeout(() => { p.hidden = true; }, 3200);
}
// al encender o apagar (chat-frases.js)
function chatSalaCambia() { if (!CHATS.dock || CHATS.dock.hidden) return; CHATS.nuevos = 0; chatSalaPinta(); if (chatOn()) chatSalaLee(true); }

// ---------- pintar ----------
function chatSalaPinta() {
  const d = CHATS.dock; if (!d) return;
  const on = chatOn();
  d.classList.toggle('plegado', CHATS.plegado); d.classList.toggle('apagado', !on);
  d.querySelector('.cs-plegar').setAttribute('aria-expanded', String(!CHATS.plegado));
  const n = d.querySelector('.chat-n'), ver = on && CHATS.plegado && CHATS.nuevos > 0;
  n.hidden = !ver; if (ver) n.textContent = CHATS.nuevos > 9 ? '9+' : String(CHATS.nuevos);
  d.querySelector('.cs-apagado').hidden = on;
  for (const el of d.querySelectorAll('.cs-rapidas button, .cs-pest button, .cs-paqs button')) el.disabled = !on;
  chatTogPinta(); chatSalaPintaLista(); chatSalaHueco();
}
const chatSalaCallado = m => !m.sis && !m.yo && CHATS.silencio.some(s => (m.q && s.q === m.q) || (m.nombre && s.n === m.nombre));
function chatSalaPintaLista() {
  const l = CHATS.dock && CHATS.dock.querySelector('.cs-lista'); if (!l) return;
  const abajo = l.scrollHeight - l.scrollTop - l.clientHeight < 30;
  l.innerHTML = !chatOn() ? '' : CHATS.msgs.filter(m => (m.sis || (m.frase != null && (m.frase < 100 || (typeof PEG_CHAT !== 'undefined' && PEG_CHAT[m.frase])))) && !chatSalaCallado(m)).map(m => {
    if (m.sis) return `<div class="cs-m sis">${esc(m.texto)}${m.extra ? ` <button type="button" class="cs-deshace" data-deshace="${esc(m.extra.q)}" data-n="${esc(m.extra.n)}">${tr('Deshacer')}</button>` : ''}</div>`;
    const pg = m.frase >= 100 && typeof PEG_CHAT !== 'undefined' && PEG_CHAT[m.frase], txt = pg ? '' : tr(CHAT_FRASES.s[m.frase] || '');
    const color = CHATS.colores[(m.orden | 0) % CHATS.colores.length];
    const nombre = m.yo ? `<span class="cs-q yo">${tr('Tú')}:</span>` : `<button type="button" class="cs-q" data-id="${m.id}" style="color:${color}">${esc(m.nombre || '?')}:</button>`;
    return `<div class="cs-m ${pg ? 'peg' : 'rapida'}">${nombre}${pg ? `<img class="cs-img" src="${pegImagen(m.frase, 160)}" alt="${esc(tr(pg.tag))}">` : `<span>${esc(txt)}</span>`}</div>`;
  }).join('');
  if (abajo) l.scrollTop = l.scrollHeight;
}

// ---------- el menú de un nombre: SILENCIAR o REPORTAR ----------
function chatSalaMenu(btn) {
  const m = CHATS.menu, msg = CHATS.msgs.find(x => String(x.id) === btn.dataset.id); if (!msg) return;
  CHATS.menuDe = msg; play('select');
  m.innerHTML = `<small>${esc(msg.nombre || '?')}</small><button type="button" data-a="silencia">${tr('SILENCIAR')}</button><button type="button" class="rojo" data-a="reporta">${tr('REPORTAR')}</button>`;
  m.hidden = false;
  for (const q of CHATS.dock.querySelectorAll('.cs-q.elegido')) q.classList.remove('elegido');
  btn.classList.add('elegido');
  const d = CHATS.dock.getBoundingClientRect(), r = btn.getBoundingClientRect();
  m.style.left = Math.round(Math.min(d.width - m.offsetWidth - 8, Math.max(8, r.left - d.left))) + 'px';
  m.style.bottom = Math.round(d.bottom - r.top + 6) + 'px';
}
function chatSalaAccion(a) {
  const msg = CHATS.menuDe, m = CHATS.menu; if (!msg) return;
  if (a === 'silencia') { m.hidden = true; chatSalaSilencia(msg.q || '', msg.nombre || '', true); return; }
  if (a === 'reporta') {      // un paso más para no reportar sin querer
    m.innerHTML = `<small>${tr('¿Reportar este mensaje?')}</small><button type="button" class="rojo" data-a="reporta-si">${tr('SÍ, REPORTAR')}</button><button type="button" data-a="cancela">${tr('CANCELAR')}</button>`;
    return;
  }
  if (a === 'cancela') { m.hidden = true; return; }
  if (a === 'reporta-si') {
    m.hidden = true;
    Promise.resolve(CHATRED.red.reportar(msg.id, null)).then(() => chatSalaSistema(tr('Reporte enviado. Gracias: lo revisaremos.')))
      .catch(e => chatSalaSistema(/tope_reportes/.test(String(e && e.message)) ? tr('Ya has reportado bastante por hoy. Si te molesta, silénciale.') : tr('No se ha podido reportar. ¿Tienes conexión?')));
  }
}
// silenciar (o deshacerlo): solo para ti, guardado en este navegador; sirve la cuenta (q) o, sin ella, el nombre
function chatSalaSilencia(q, n, si) {
  CHATS.silencio = CHATS.silencio.filter(s => !((q && s.q === q) || (n && s.n === n)));
  if (si) CHATS.silencio.push({ q, n });
  CHATS.silencio = CHATS.silencio.slice(-100);
  try { localStorage.setItem('rouflage-chat-silencio', JSON.stringify(CHATS.silencio)); } catch (_) { /* sin guardar: vale para esta visita */ }
  play('select');
  if (si) chatSalaSistema(tr('Has silenciado a {n}. Solo para ti.', { n }), { q, n }); else { for (const m of CHATS.msgs) if (m.extra && m.extra.n === n) m.extra = null; chatSalaSistema(tr('{n} ya no está silenciado', { n })); }
}

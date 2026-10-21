// Fans of Rouflage · EL CHAT (5 de 5): EL CHAT DE LA SALA DE ESPERA del PvP (p-busca: sala con amigos y BUSCAR PARTIDA mientras se espera). Un panel abajo,
// «CHAT DE LA SALA», que se pliega para ver la sala: los mensajes, frases rápidas de sala (van como número: cada uno las lee en su idioma) y una caja de texto
// de 80 letras. Las palabrotas y los datos de contacto los tapa el servidor con ★ (chat-sala-red.js). Los mensajes del sistema van en cursiva («X ha entrado
// en la sala»: salen de comparar quién hay en la sala). Tocando un nombre: SILENCIAR (solo para ti, en este navegador, por cuenta o por nombre) o REPORTAR
// (queda en el servidor con el mensaje, para revisarlo en /gestion). Lee lo nuevo cada 3 s (5 s plegado), al ritmo de la sala; lo llama pvpPintaBusca.
// Con el teclado del móvil abierto, el panel sube con él (visualViewport). Con el chat apagado (interruptor «Chat», chat-frases.js) no se lee nada.
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
    <div class="cs-cuerpo"><div class="cs-lista" role="log" aria-live="polite"></div><p class="cs-apagado" hidden></p><div class="cs-rapidas"></div>
    <form class="cs-entra" autocomplete="off"><input type="text" maxlength="80" enterkeyhint="send" autocapitalize="sentences" spellcheck="false"><button type="submit" class="cs-env"><svg width="22" height="20" viewBox="0 0 22 20" aria-hidden="true"><path d="M2 10L20 2l-5 16-4-6z" fill="#fff6ea" stroke="#0b0f1c" stroke-width="2.5" stroke-linejoin="round"/></svg></button></form>
    <p class="cs-aviso" hidden></p></div>`;
  E('p-busca').appendChild(d);
  const m = CHATS.menu = document.createElement('div');
  m.className = 'cs-menu'; m.hidden = true; m.setAttribute('role', 'menu');
  d.appendChild(m);
  d.querySelector('.cs-plegar').onclick = () => { play('select'); chatSalaPliega(!CHATS.plegado); };
  d.querySelector('.cs-entra').onsubmit = ev => { ev.preventDefault(); const inp = d.querySelector('.cs-entra input'); chatSalaManda(inp.value, null, inp); };
  d.querySelector('.cs-rapidas').onclick = ev => { const b = ev.target.closest('button[data-f]'); if (b) chatSalaManda(null, +b.dataset.f); };
  d.querySelector('.cs-lista').onclick = ev => {
    const q = ev.target.closest('.cs-q[data-id]'); if (q) { chatSalaMenu(q); return; }
    const u = ev.target.closest('[data-deshace]'); if (u) { chatSalaSilencia(u.dataset.deshace, u.dataset.n, false); }
  };
  m.onclick = ev => { const b = ev.target.closest('button[data-a]'); if (b) chatSalaAccion(b.dataset.a); };
  document.addEventListener('pointerdown', ev => { if (!m.hidden && !ev.target.closest('.cs-menu, .cs-q')) m.hidden = true; }, true);
  // el teclado del móvil: el panel sube con él y la lista se encoge para que quepa todo
  const vv = window.visualViewport;
  const sube = () => { if (d.hidden || !vv) return; const abajo = Math.max(0, innerHeight - vv.height - vv.offsetTop); d.style.bottom = abajo + 'px'; d.style.setProperty('--cs-vh', Math.round(vv.height) + 'px'); };
  if (vv) { vv.addEventListener('resize', sube); vv.addEventListener('scroll', sube); }
  d.querySelector('.cs-entra input').addEventListener('focus', () => { d.classList.add('escribiendo'); setTimeout(sube, 300); });
  d.querySelector('.cs-entra input').addEventListener('blur', () => { d.classList.remove('escribiendo'); setTimeout(sube, 300); });
  d.querySelector('.cs-entra input').addEventListener('keydown', ev => { if (ev.key === 'Escape') ev.target.blur(); ev.stopPropagation(); });
  if (window.ResizeObserver) new ResizeObserver(() => chatSalaHueco()).observe(d);
  chatSalaTextos();
}
// los textos (y las frases rápidas), en el idioma de cada uno
function chatSalaTextos() {
  const d = CHATS.dock;
  d.querySelector('.cs-plegar b').textContent = tr('CHAT DE LA SALA');
  d.querySelector('.cs-plegar').setAttribute('aria-label', tr('Plegar o desplegar el chat'));
  d.querySelector('.cs-tog').innerHTML = chatTogHtml();
  d.querySelector('.cs-rapidas').innerHTML = CHAT_FRASES.s.map((x, i) => `<button type="button" data-f="${i}">${esc(tr(x))}</button>`).join('');
  const inp = d.querySelector('.cs-entra input'); inp.placeholder = tr('Escribe algo (máx. 80)…'); inp.setAttribute('aria-label', tr('Mensaje para la sala'));
  d.querySelector('.cs-env').setAttribute('aria-label', tr('Enviar'));
  d.querySelector('.cs-apagado').textContent = tr('Chat apagado: ni lees ni te leen. Enciéndelo para hablar con la sala.');
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
      CHATS.msgs.push(m); if (!m.yo && !chatSalaCallado(m)) nuevos++;
    }
    if (nuevos) { chatSalaRecorta(); if (CHATS.plegado) CHATS.nuevos += nuevos; play('pop', 0.4); chatSalaPinta(); }
  }).catch(e => { if (/could not find|PGRST202|HTTP 404|schema cache/i.test(String((e && e.message) || e))) { CHATS.sinServidor = true; CHATS.dock.hidden = true; chatSalaHueco(); } })      // servidor sin el chat (66): no se enseña
    .finally(() => { CHATS.leyendo = false; });
}
// mandar un texto o una frase rápida de sala
function chatSalaManda(texto, frase, inp) {
  if (!chatOn() || CHATS.mandando) return;
  if (frase == null && !String(texto || '').trim()) return;
  CHATS.mandando = true;
  Promise.resolve(CHATRED.red.mandar(frase == null ? String(texto).slice(0, 80) : null, frase)).then(r => {
    if (inp) inp.value = '';
    play('pop');
    if (r && r.id && !CHATS.msgs.some(x => x.id === r.id)) {
      const v = CHATS.gente && [...CHATS.gente.values()].find(x => x.j.yo), yo = v && v.j;
      CHATS.msgs.push({ id: r.id, yo: true, nombre: yo ? yo.nombre : '', texto: r.texto, frase: r.frase }); chatSalaRecorta(); chatSalaPintaLista();
    }
    chatSalaLee(true);
  }).catch(e => {
    const s = String((e && e.message) || e); play('deny');
    chatSalaAviso(/chat_espera/.test(s) ? tr('Espera un momento para volver a hablar') : /chat_tope/.test(s) ? tr('Vas muy rápido: espera un poco') : /baneado/.test(s) ? tr('No puedes escribir en el chat ahora mismo')
      : /sala_no_valida/.test(s) ? tr('Ya no estás en la sala') : tr('No se ha podido mandar. ¿Tienes conexión?'));
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
  for (const el of d.querySelectorAll('.cs-entra input, .cs-entra button, .cs-rapidas button')) el.disabled = !on;
  chatTogPinta(); chatSalaPintaLista(); chatSalaHueco();
}
const chatSalaCallado = m => !m.sis && !m.yo && CHATS.silencio.some(s => (m.q && s.q === m.q) || (m.nombre && s.n === m.nombre));
function chatSalaPintaLista() {
  const l = CHATS.dock && CHATS.dock.querySelector('.cs-lista'); if (!l) return;
  const abajo = l.scrollHeight - l.scrollTop - l.clientHeight < 30;
  l.innerHTML = !chatOn() ? '' : CHATS.msgs.filter(m => !chatSalaCallado(m)).map(m => {
    if (m.sis) return `<div class="cs-m sis">${esc(m.texto)}${m.extra ? ` <button type="button" class="cs-deshace" data-deshace="${esc(m.extra.q)}" data-n="${esc(m.extra.n)}">${tr('Deshacer')}</button>` : ''}</div>`;
    const txt = m.frase != null ? tr(CHAT_FRASES.s[m.frase] || '') : m.texto || '';
    const color = CHATS.colores[(m.orden | 0) % CHATS.colores.length];
    const nombre = m.yo ? `<span class="cs-q yo">${tr('Tú')}:</span>` : `<button type="button" class="cs-q" data-id="${m.id}" style="color:${color}">${esc(m.nombre || '?')}:</button>`;
    return `<div class="cs-m${m.frase != null ? ' rapida' : ''}">${nombre}<span>${esc(txt).replace(/(★+)/g, '<i class="tapado">$1</i>')}</span></div>`;
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

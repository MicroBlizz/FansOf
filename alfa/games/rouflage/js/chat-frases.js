// Fans of Rouflage · EL CHAT (1 de 5): las frases rápidas de cada canal, el interruptor «Chat» (OPC.chat, se guarda en las opciones del jugador:
// opciones.js), el bocadillo dibujado de los botones y el consejo de la primera vez. En partida (chat-partida.js) cada bando tiene su canal:
// becarios (b), colados vivos (c) y colados despedidos (f, los fantasmas: leen a los suyos vivos, pero los vivos no los oyen). Las frases viajan como
// número (su sitio en la lista) y cada uno las lee en su idioma. La sala de espera del PvP (chat-sala.js) tiene sus frases (s) (sin texto escrito: se quitó el 23-10-2026).
'use strict';

const CHAT_FRASES = {
  b: ['¡Aquí hay uno!', 'Mirad aquí', 'Esta sala, limpia', 'Me quedo sin cartas', '¡Ha silbado!', 'Vamos juntos', '¡Bien hecho!', 'Ups, era una planta'],
  c: ['¡Cuidado, viene uno!', 'Escóndete', '¡Corre!', 'Aquí estoy bien', 'Me han visto', 'Voy a moverme', '¡Bien hecho!', 'Jajaja'],
  f: ['Me han despedido', 'Buuu', 'Era mi mejor escondite', '¡Venganza!', 'Ánimo, vivos', '¡Bien hecho!', 'Jajaja', 'Ni finiquito me dan'],
  s: ['¡Hola!', '¡Listo!', '¡Suerte!', 'Un momento', 'Jajaja', '¿Empezamos?', '¡Buena partida!', 'Me voy'],
};
// las frases de los becarios que dejan una marca en el sitio del que la manda (unos segundos): la dorada y la azul
const CHAT_MARCA = { b: { 0: '#ffcb3d', 1: '#7fc8ff' } };
// cómo se llama cada canal, su aviso y su nota de abajo
const CHAT_CANAL = {
  b: { titulo: 'CHAT DE BECARIOS', solo: 'solo lo ven los becarios', pie: '«¡Aquí hay uno!» marca el sitio en el mapa' },
  c: { titulo: 'CHAT DE COLADOS', solo: 'solo lo ven los colados', pie: 'Los becarios no se enteran de nada' },
  f: { titulo: 'CHAT DE FANTASMAS', solo: 'solo entre fantasmas', pie: 'Los vivos no te oyen: estás despedido' },
};
const chatFrase = (canal, i) => { const l = CHAT_FRASES[canal]; return l && l[i] != null ? tr(l[i]) : ''; };
const chatOn = () => typeof OPC === 'undefined' || OPC.chat !== false;

// el bocadillo con los tres puntos (o tachado, si está apagado): contorno grueso, como el resto de los iconos de la serie
function chatIcono(relleno, puntos = true, w = 30) {
  return `<svg width="${w}" height="${Math.round(w * 0.92)}" viewBox="0 0 22 20" aria-hidden="true"><path d="M3 2h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4H3a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="${relleno}" stroke="#0b0f1c" stroke-width="2.5" stroke-linejoin="round"/>`
    + (puntos ? '<circle cx="7" cy="8.5" r="1.5" fill="#0b0f1c"/><circle cx="11" cy="8.5" r="1.5" fill="#0b0f1c"/><circle cx="15" cy="8.5" r="1.5" fill="#0b0f1c"/>' : '') + '</svg>';
}
// el interruptor «Chat» de los paneles (partida y sala): un botón con role=switch
const chatTogHtml = () => `<button type="button" class="chat-tog" role="switch" aria-checked="${chatOn()}"><span>${tr('Chat')}</span><i></i></button>`;
function chatTogPinta() {
  for (const b of document.querySelectorAll('.chat-tog')) b.setAttribute('aria-checked', String(chatOn()));
}
// encender o apagar (desde cualquiera de los tres sitios): se guarda y se repinta todo
function chatPon(si) {
  if (typeof OPC === 'undefined') return;
  OPC.chat = !!si; opGuarda('chat', si ? '1' : '0'); play('select');
  chatTogPinta(); if (typeof opPinta === 'function') opPinta();
  if (typeof chatPartidaCambia === 'function') chatPartidaCambia();
  if (typeof chatSalaCambia === 'function') chatSalaCambia();
}
document.addEventListener('click', ev => { const b = ev.target.closest && ev.target.closest('.chat-tog'); if (b) { ev.stopPropagation(); chatPon(!chatOn()); } }, true);

// ---------- el consejo de la primera vez: un bocadillo corto junto al botón (se cierra tocándolo o solo) ----------
const CHAT_CONSEJO = { caja: null, hasta: 0, el: null };
function chatConsejo(el, texto, clave) {
  if (!el || CHAT_CONSEJO.caja && !CHAT_CONSEJO.caja.hidden) return false;
  if (opLee(clave, '') === '1') return false;
  opGuarda(clave, '1');
  let c = CHAT_CONSEJO.caja;
  if (!c) {
    c = CHAT_CONSEJO.caja = document.createElement('div'); c.className = 'chat-consejo'; c.hidden = true; c.setAttribute('role', 'status');
    c.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); chatConsejoCierra(); });
    document.body.appendChild(c);
  }
  c.innerHTML = `<b>${tr('CHAT')}</b> ${texto}<small>${tr('VALE')}</small>`;
  c.hidden = false; CHAT_CONSEJO.el = el; CHAT_CONSEJO.hasta = performance.now() + 9000;
  chatConsejoColoca();
  return true;
}
function chatConsejoCierra() { if (CHAT_CONSEJO.caja) CHAT_CONSEJO.caja.hidden = true; CHAT_CONSEJO.el = null; }
// al lado del botón (encima si no cabe), sin salirse de la pantalla; se cierra solo si el botón deja de verse
function chatConsejoColoca() {
  const c = CHAT_CONSEJO.caja, el = CHAT_CONSEJO.el; if (!c || c.hidden || !el) return;
  if (performance.now() > CHAT_CONSEJO.hasta || !el.offsetParent) { chatConsejoCierra(); return; }
  const r = el.getBoundingClientRect(), w = c.offsetWidth, h = c.offsetHeight, vw = innerWidth;
  const derecha = r.right + 12 + w <= vw - 8, izquierda = r.left - 12 - w >= 8;
  let x, y, lado;
  if (derecha) { x = r.right + 12; y = r.top + r.height / 2 - h / 2; lado = 'izq'; }
  else if (izquierda) { x = r.left - 12 - w; y = r.top + r.height / 2 - h / 2; lado = 'der'; }
  else { x = Math.min(vw - w - 8, Math.max(8, r.left)); y = r.top - h - 12; lado = 'abajo'; }
  c.style.left = Math.round(x) + 'px'; c.style.top = Math.round(Math.max(8, y)) + 'px'; c.dataset.lado = lado;
}

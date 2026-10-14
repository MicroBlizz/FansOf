// Fans of Survivors · Los efectos del cofre de botín: sonidos, confeti, fuegos artificiales, chat, rarezas y el cofre pequeño.
// Los usa la entrega de js/cofre.js. Todo es de pantalla (HTML y CSS): no toca la partida.
'use strict';

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------- sonidos ---------- */
function notas(lista, tipo = 'square', vol = 0.09, paso = 0.09) {
  if (!AC || sonidoApagado()) return;
  try { lista.forEach((f, i) => tone(f, f, 0.3, tipo, vol, i * paso)); } catch (e) { /* da igual */ }
}
const FANFARRIA = [523, 659, 784, 1046, 784, 1046, 1318, 1568, 2093];
// el latido del suspense: cada vez más rápido y más agudo (ms = 0 lo calla)
let cofreLatido = null;
function latido(ms, tono) {
  clearInterval(cofreLatido); if (!ms) return;
  cofreLatido = setInterval(() => { if (AC && !sonidoApagado()) try { tone(tono, tono * 0.6, 0.12, 'sine', 0.22); } catch (e) { /* da igual */ } }, ms);
}

/* ---------- lo que se ve ---------- */
function confeti(n) {
  const S = $('#scr-cofre'), E = ['⭐', '🪙', '💎', '✨', '🎉'];
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span'); s.className = 'confeti'; s.textContent = E[i % E.length];
    s.style.left = rand(0, 100) + '%'; s.style.fontSize = rand(20, 44) + 'px'; s.style.animationDuration = rand(1.8, 3.6) + 's'; s.style.animationDelay = rand(0, 1.2) + 's';
    S.appendChild(s); setTimeout(() => s.remove(), 5500);
  }
}
function tiembla(ms) { const S = $('#scr-cofre'); S.classList.add('tiembla'); setTimeout(() => S.classList.remove('tiembla'), ms); }
function flash() { const f = $('#cof-flash'); f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); }
// fuegos artificiales: una explosión de chispas en un punto de la pantalla
function fuego(x, y) {
  const S = $('#scr-cofre'), C = ['#ffcb3d', '#ff4b5c', '#7dff7a', '#3fd0ff', '#d43cff', '#fff6ea'], col = pick(C);
  for (let i = 0; i < 16; i++) {
    const s = document.createElement('i'); s.className = 'chispa'; const a = (i / 16) * Math.PI * 2, d = rand(70, 130);
    s.style.left = x + 'px'; s.style.top = y + 'px'; s.style.background = col; s.style.setProperty('--dx', Math.cos(a) * d + 'px'); s.style.setProperty('--dy', Math.sin(a) * d + 'px');
    S.appendChild(s); setTimeout(() => s.remove(), 1100);
  }
}
function fuegos(n, ms) { for (let i = 0; i < n; i++) setTimeout(() => { if ($('#scr-cofre').hidden) return; fuego(rand(60, 480), rand(120, 700)); play('pop'); }, (i / n) * ms); }
// SurvivalBot, aterrado, se asoma por una esquina
function botAsustado() {
  const b = document.createElement('div'); b.id = 'cof-bot';
  const c = document.createElement('canvas'), K = Math.min(2, ESCALA * DPR); c.width = 140 * K; c.height = 140 * K; const x = c.getContext('2d'); x.scale(K, K); drawVector(x, JEFE.spr, 70, 130, 120);
  const t = document.createElement('div'); t.className = 'ol'; t.textContent = tr('¡NOOO! ¡MI JUEGO!');
  b.append(t, c); $('#scr-cofre').appendChild(b); setTimeout(() => b.remove(), 6000);
}

/* ---------- el chat de la entrega (como el de la partida, pero dentro del cofre) ---------- */
const COFRE_CHAT = {
  mas: ['¿Habrá más?', '¡Otro, otro!', 'Se acelera…', 'Que salga otro, porfa'],
  susto: ['Se ha atascado…', '¿Cofre vacío?', 'Era un cofre roto', '…espera, espera…'],
  1: ['Una mejora gratis, sin microtransacciones', 'Eso se llama suerte', 'Un cofre decente, por fin'],
  2: ['¡¡DOS!!', 'Doble premio, oye', '¿Dos? El CEO se ha equivocado'],
  3: ['¡¡¡TRIPLE!!!', '¡¡777!! ¡¡777!!', 'ESTO NO ES NORMAL', '¡Llama a Microblizz!', 'CLIP CLIP CLIP'],
  5: ['¡¡¡CINCO!!!', 'NO. PUEDE. SER.', '¡¡COFRES DENTRO DEL COFRE!!', 'Esto es un bug y me encanta', '¡¡¡YO LO VI PRIMERO!!!', 'Hacedme un clip YA'],
};
function chatCofre(tipo, cuantas = 1) {
  const L = (COFRE_CHAT[tipo] || COFRE_CHAT[3]).slice().sort(() => Math.random() - 0.5), box = $('#cof-chat');
  for (let i = 0; i < cuantas && i < L.length; i++) setTimeout(() => {
    if ($('#scr-cofre').hidden) return;
    const u = pick(CHAT_USERS), d = document.createElement('div'); d.innerHTML = `<b style="color:${u[1]}">${u[0]}</b>: `; d.append(document.createTextNode(tr(L[i])));
    box.appendChild(d); while (box.children.length > 4) box.firstChild.remove();
  }, i * 260);
}

/* ---------- las rarezas: cuanto más nivel sube la mejora, más luce ---------- */
const RAREZAS = ['COMÚN', 'RARA', 'ÉPICA', 'LEGENDARIA'];
function rarezaOp(op) { return op.clase === 'relleno' ? 0 : op.nuevo ? 1 : Math.max(0, Math.min(3, op.nivelNuevo - 2)); }

/* ---------- el cofre pequeño que sale del grande (premio máximo) ---------- */
function miniCofre() {
  const d = document.createElement('div'); d.className = 'mini vuela';
  d.innerHTML = '<svg viewBox="0 0 120 100" aria-hidden="true"><g class="tapa"><rect x="8" y="18" width="104" height="30" rx="12" fill="#e08a2a" stroke="#1b0f2a" stroke-width="5"/></g><rect x="14" y="44" width="92" height="46" rx="6" fill="#c06a1a" stroke="#1b0f2a" stroke-width="5"/><rect x="50" y="38" width="20" height="24" rx="4" fill="#ffcb3d" stroke="#1b0f2a" stroke-width="4"/></svg>';
  return d;
}

/* ---------- la entrada: cámara lenta, zoom y un rayo de luz sobre el campo ---------- */
async function introCofre(ms) {
  const cvs = $('#cv'), I = $('#cof-intro');
  I.hidden = false; void I.offsetWidth; I.classList.add('on');
  cvs.style.transition = `transform ${ms}ms ease-in`; cvs.style.transform = 'scale(1.5)';
  P.cofreTempo = 0.6;   // la música, en cámara lenta
  play('summon'); await sleep(ms);
  I.classList.remove('on'); I.hidden = true; cvs.style.transition = ''; cvs.style.transform = '';
}

// Fans of Survivors · El cofre de botín: cuántas mejoras da (1, 2 o 3) y la entrega en pantalla.
// Con 1 es una entrega épica; con 2 giran dos ruedas; con 3 es el premio gordo: ruedas de tragaperras, suspense y un 777.
// Las probabilidades y los tiempos se ajustan en COFRE (datos.js).
'use strict';

const sleep = ms => new Promise(r => setTimeout(r, ms));
let cofreId = 0, cofreRapido = false, cofreGiro = null;

// cuántas mejoras da este cofre, según COFRE.pesos (y con un poco de suerte extra, COFRE.cinco, salen 5)
function sorteoCofre() {
  if (Math.random() < COFRE.cinco) return 5;
  const W = COFRE.pesos; let tot = 0; for (const k in W) tot += W[k];
  let r = Math.random() * tot; for (const k in W) { r -= W[k]; if (r <= 0) return +k; }
  return 1;
}
// el dibujo de una mejora (la carta del arma o el icono de la mejora)
function iconoOp(op) {
  const ic = document.createElement('div'); ic.className = 'op-ic';
  if (op.carta) { const c = document.createElement('canvas'), K = Math.min(3, ESCALA * DPR * 1.5); c.width = c.height = 64 * K; const x = c.getContext('2d'); x.scale(K, K); drawVector(x, op.carta, 32, 58, 52); ic.appendChild(c); }
  else ic.textContent = op.icono;
  return ic;
}
const nivelOp = op => op.clase === 'relleno' ? '' : op.nuevo ? tr('¡NUEVO!') : tr('Nivel ' + op.nivelNuevo);

// el cofre mejora 1, 2 o 3 cosas que ya tienes (o te da algo nuevo si no hay nada que mejorar)
function abrirCofre() {
  if (P.estado !== 'jugando') { P.cofresPend++; return; }   // si ya hay uno abierto, este espera
  let ops = opcionesNivel(sorteoCofre(), true);
  if (ops.some(o => o.clase !== 'relleno')) ops = ops.filter(o => o.clase !== 'relleno');
  ops.forEach(aplicarOpcion); P.cofres++;
  P.estado = 'cofre'; P.aviso = null; sueltaMando();
  entregaCofre(ops);
}

/* ---------- los sonidos de la entrega ---------- */
function notas(lista, tipo = 'square', vol = 0.09, paso = 0.09) {
  if (!AC || sonidoApagado()) return;
  try { lista.forEach((f, i) => tone(f, f, 0.3, tipo, vol, i * paso)); } catch (e) { /* da igual */ }
}
const FANFARRIA = [523, 659, 784, 1046, 784, 1046, 1318, 1568, 2093];
// el latido del suspense: cada vez más rápido y más agudo
let cofreLatido = null;
function latido(ms, tono) {
  clearInterval(cofreLatido); if (!ms) return;
  cofreLatido = setInterval(() => { if (AC && !sonidoApagado()) try { tone(tono, tono * 0.6, 0.12, 'sine', 0.22); } catch (e) { /* da igual */ } }, ms);
}

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
function cierraCofre() { cofreId++; clearInterval(cofreGiro); latido(0); if (P) P.cofreTempo = 0; }

/* ---------- la entrega, por fases: se abre, sale una mejora, la música acelera… ¿y habrá otra? ---------- */
async function entregaCofre(ops) {
  const id = ++cofreId, n = ops.length, E = COFRE.entrega, S = $('#scr-cofre'), vivo = () => id === cofreId;
  const esp = async ms => { if (!cofreRapido) await sleep(ms); return vivo(); };
  clearInterval(cofreGiro); cofreRapido = false; P.cofreTempo = 0;
  S.hidden = false; S.className = 'screen cof-n' + n;
  $('#cof-titulo').innerHTML = `${tr('¡COFRE DE BOTÍN!')}<small>&nbsp;</small>`;
  $('#cof-lista').innerHTML = ''; $('#btn-cofre').hidden = true;
  const box = $('#cof-ruedas'); box.innerHTML = ''; box.style.visibility = 'hidden';
  const cofre = $('#cof-cofre'); cofre.setAttribute('class', 'sacude');
  play('summon');
  const pool = puedeMejorar().sort(() => Math.random() - 0.5).slice(0, 8);
  S.onclick = e => { if (e.target.id !== 'btn-cofre') cofreRapido = true; };
  // una rueda gira un momento y se queda en su mejora
  const revela = async (op, k) => {
    const el = document.createElement('div'); el.className = 'rueda girando nueva';
    const caras = pool.filter(p => p.id !== op.id).concat(op).map(o => iconoOp(o)), real = caras.length - 1;
    const cara = document.createElement('div'); cara.className = 'rueda-cara'; caras.forEach((c, i) => { c.style.display = i === real ? '' : 'none'; cara.appendChild(c); });
    const nom = document.createElement('div'); nom.className = 'rueda-nom ol'; nom.innerHTML = '&nbsp;';
    el.append(cara, nom); box.appendChild(el);
    let i = real; clearInterval(cofreGiro);
    cofreGiro = setInterval(() => { caras[i].style.display = 'none'; i = (i + 1) % caras.length; caras[i].style.display = ''; play('select'); }, 80);
    const ok = await esp(E.giro); clearInterval(cofreGiro); if (!ok) return false;
    caras.forEach((c, j) => c.style.display = j === real ? '' : 'none');
    el.classList.remove('girando', 'nueva'); el.classList.add('para'); nom.innerHTML = `${tr(op.nombre)}<small>${nivelOp(op)}</small>`;
    play('crown'); tiembla(260); notas([523 * (1 + k * 0.12), 784 * (1 + k * 0.12)], 'triangle', 0.1, 0.07);
    return true;
  };
  if (!await esp(E.epica)) return;
  cofre.setAttribute('class', 'abre'); box.style.visibility = ''; flash(); play('win');
  for (let k = 0; k < n; k++) {
    if (!await revela(ops[k], k)) return;
    if (k > 0) $('#cof-titulo').innerHTML = `${tr('¡HAY MÁS!')}<small>${'⭐'.repeat(k + 1)}</small>`;
    // el suspense: la música se acelera y el latido también. ¿Habrá otra?
    const t = Math.min(k, E.tempos.length - 1);
    P.cofreTempo = E.tempos[t]; latido(E.latidos[t], 90 + t * 25); S.classList.add('suspense'); S.style.setProperty('--pulso', (0.7 - t * 0.12) + 's');
    if (!await esp(E.suspense[Math.min(k, E.suspense.length - 1)])) return;
    S.classList.remove('suspense');
  }
  // se acabó: la música vuelve y llega el premio
  latido(0); P.cofreTempo = 0; flash();
  const T = { 1: ['¡MEJORA ÉPICA!', 'Mejora de las tuyas, gratis'], 2: ['¡DOBLE MEJORA!', '¡Doble premio!'], 3: ['¡¡¡777!!!', '¡TRIPLE MEJORA!'], 4: ['¡¡CUÁDRUPLE!!', '¡CUATRO MEJORAS!'], 5: ['¡¡¡777 777!!!', '¡¡CINCO MEJORAS!!'] }[n];
  $('#cof-titulo').innerHTML = `${tr(T[0])}<small>${tr(T[1])}</small>`;
  if (n >= 3) { S.classList.add('jackpot'); if (n >= 5) S.classList.add('mega'); }
  if (n === 1) { ruedaGrande(box); notas([784, 1046, 1318, 1568], 'triangle', 0.1, 0.1); confeti(14); tiembla(500); }
  else if (n === 2) { confeti(22); notas([784, 988, 1318], 'square', 0.08, 0.1); }
  else { tiembla(n >= 5 ? 2600 : 1400); confeti(n >= 5 ? 160 : 80); notas(FANFARRIA, 'square', 0.09, 0.085); notas(FANFARRIA.map(f => f / 2), 'triangle', 0.1, 0.085); if (n >= 5) notas(FANFARRIA.map(f => f * 2), 'square', 0.05, 0.07); }
  if (!await esp(n >= 3 ? 900 : 500)) return;
  $('#cof-lista').innerHTML = ops.map(op => `<div class="cof-fila"><b class="ol">${tr(op.nombre)}</b> <span class="op-nv">${nivelOp(op)}</span><div class="op-desc">${tr(op.desc)}</div></div>`).join('');
  $('#btn-cofre').hidden = false;
}
function ruedaGrande(box) { const r = box.firstChild; if (r) r.classList.add('grande'); }
$('#btn-cofre').onclick = () => {
  cierraCofre(); play('select');
  $('#scr-cofre').hidden = true; $('#scr-cofre').onclick = null; P.estado = 'jugando';
  if (P.cofresPend > 0) { P.cofresPend--; abrirCofre(); }
};

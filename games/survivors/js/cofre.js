// Fans of Survivors · El cofre de botín: cuántas mejoras da (1, 2 o 3) y la entrega en pantalla.
// Con 1 es una entrega épica; con 2 giran dos ruedas; con 3 es el premio gordo: ruedas de tragaperras, suspense y un 777.
// Las probabilidades y los tiempos se ajustan en COFRE (datos.js).
'use strict';

const sleep = ms => new Promise(r => setTimeout(r, ms));
let cofreId = 0, cofreRapido = false, cofreGiro = null;

// cuántas mejoras da este cofre, según COFRE.pesos
function sorteoCofre() {
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

/* ---------- la entrega ---------- */
async function entregaCofre(ops) {
  const id = ++cofreId, n = ops.length, E = COFRE.entrega, S = $('#scr-cofre'), vivo = () => id === cofreId;
  const esp = async ms => { if (!cofreRapido) await sleep(ms); return vivo(); };
  clearInterval(cofreGiro); cofreRapido = false;
  S.hidden = false; S.className = 'screen cof-n' + n;
  $('#cof-titulo').innerHTML = `${tr('¡COFRE DE BOTÍN!')}<small>&nbsp;</small>`;
  $('#cof-lista').innerHTML = ''; $('#btn-cofre').hidden = true;
  const box = $('#cof-ruedas'); box.innerHTML = ''; box.style.visibility = 'hidden';
  const cofre = $('#cof-cofre'); cofre.setAttribute('class', 'sacude');
  play('summon');
  // las ruedas: cada una tiene caras de varias mejoras y se queda en la verdadera
  const pool = puedeMejorar().sort(() => Math.random() - 0.5).slice(0, 8);
  const ruedas = ops.map(op => {
    const el = document.createElement('div'); el.className = 'rueda girando';
    const caras = pool.filter(p => p.id !== op.id).concat(op).map(o => iconoOp(o)), real = caras.length - 1;
    const cara = document.createElement('div'); cara.className = 'rueda-cara'; caras.forEach((c, i) => { c.style.display = i === real ? '' : 'none'; cara.appendChild(c); });
    const nom = document.createElement('div'); nom.className = 'rueda-nom ol'; nom.innerHTML = '&nbsp;';
    el.append(cara, nom); box.appendChild(el);
    return { el, caras, real, nom, op, i: real, parada: false };
  });
  S.onclick = e => { if (e.target.id !== 'btn-cofre') cofreRapido = true; };
  const parar = r => {
    r.parada = true; r.caras.forEach((c, i) => c.style.display = i === r.real ? '' : 'none');
    r.el.classList.remove('girando'); r.el.classList.add('para'); r.nom.innerHTML = `${tr(r.op.nombre)}<small>${nivelOp(r.op)}</small>`;
    play('crown'); tiembla(260);
  };
  await esp(n === 1 ? E.epica : 900); if (!vivo()) return;
  cofre.setAttribute('class', 'abre'); box.style.visibility = ''; flash(); play('win');

  if (n === 1) {   // una sola mejora: entrega épica
    $('#cof-titulo').innerHTML = `${tr('¡MEJORA ÉPICA!')}<small>${tr('Mejora de las tuyas, gratis')}</small>`;
    ruedas[0].el.classList.remove('girando'); ruedas[0].el.classList.add('para', 'grande'); ruedas[0].nom.innerHTML = `${tr(ops[0].nombre)}<small>${nivelOp(ops[0])}</small>`;
    notas([784, 1046, 1318, 1568], 'triangle', 0.1, 0.1); confeti(14); tiembla(500);
  } else {
    // las ruedas giran y van parando una a una
    cofreGiro = setInterval(() => {
      for (const r of ruedas) if (!r.parada) { r.caras[r.i].style.display = 'none'; r.i = (r.i + 1) % r.caras.length; r.caras[r.i].style.display = ''; }
      play('select');
    }, 85);
    $('#cof-titulo').innerHTML = `${tr(n === 3 ? '¡¡¡SUERTE!!!' : '¡DOBLE MEJORA!')}<small>&nbsp;</small>`;
    for (let i = 0; i < n; i++) {
      if (n === 3 && i === 2) {   // el suspense antes de la última rueda
        S.classList.add('suspense'); notas([196, 196, 196, 196], 'sine', 0.14, 0.32);
        await esp(E.suspense); if (!vivo()) return;
        S.classList.remove('suspense');
      }
      await esp(i === 0 ? E.giro : E.entreRuedas); if (!vivo()) return;
      parar(ruedas[i]);
    }
    clearInterval(cofreGiro);
    if (n === 3) {   // ¡EL 777!
      S.classList.add('jackpot'); $('#cof-titulo').innerHTML = `${tr('¡¡¡777!!!')}<small>${tr('¡TRIPLE MEJORA!')}</small>`;
      flash(); tiembla(1400); confeti(80); notas(FANFARRIA, 'square', 0.09, 0.085); notas(FANFARRIA.map(f => f / 2), 'triangle', 0.1, 0.085);
    } else {
      $('#cof-titulo').innerHTML = `${tr('¡DOBLE MEJORA!')}<small>${tr('¡Doble premio!')}</small>`; confeti(22); notas([784, 988, 1318], 'square', 0.08, 0.1);
    }
  }
  if (!await esp(n === 3 ? 900 : 500)) return;
  $('#cof-lista').innerHTML = ops.map(op => `<div class="cof-fila"><b class="ol">${tr(op.nombre)}</b> <span class="op-nv">${nivelOp(op)}</span><div class="op-desc">${tr(op.desc)}</div></div>`).join('');
  const b = $('#btn-cofre'); b.hidden = false;
}
$('#btn-cofre').onclick = () => {
  cofreId++; clearInterval(cofreGiro); play('select');
  $('#scr-cofre').hidden = true; $('#scr-cofre').onclick = null; P.estado = 'jugando';
  if (P.cofresPend > 0) { P.cofresPend--; abrirCofre(); }
};

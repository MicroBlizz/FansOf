// Fans of Survivors · El cofre de botín: cuántas mejoras da (1, 2 o 3) y la entrega en pantalla.
// Va por fases con suspense: cámara lenta, sale una mejora, la música se acelera… ¿y habrá otra? Con 3 es un 777; con suerte salen 5 (cofres de dentro del cofre).
// Los efectos (confeti, fuegos, chat, rarezas…) están en js/cofre-efectos.js. Las probabilidades y los tiempos se ajustan en COFRE (datos.js).
'use strict';

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

// el cofre mejora 1, 2, 3 o (con suerte) 5 cosas que ya tienes (o te da algo nuevo si no hay nada que mejorar)
// y a veces se queda atascado (el susto) y luego da el doble
function abrirCofre() {
  if (P.estado !== 'jugando') { P.cofresPend++; return; }   // si ya hay uno abierto, este espera
  const susto = Math.random() < COFRE.susto;
  let ops = opcionesNivel(Math.min(5, sorteoCofre() * (susto ? 2 : 1)), true);
  if (ops.some(o => o.clase !== 'relleno')) ops = ops.filter(o => o.clase !== 'relleno');
  ops.forEach(aplicarOpcion); P.cofres++;
  P.estado = 'cofre'; P.aviso = null; sueltaMando();
  entregaCofre(ops, susto);
}
function cierraCofre() { cofreId++; clearInterval(cofreGiro); latido(0); if (P) P.cofreTempo = 0; const c = $('#cv'); c.style.transition = ''; c.style.transform = ''; $('#cof-intro').hidden = true; }

/* ---------- la entrega, por fases: se abre, sale una mejora, la música acelera… ¿y habrá otra? ---------- */
async function entregaCofre(ops, susto) {
  const id = ++cofreId, n = ops.length, E = COFRE.entrega, S = $('#scr-cofre'), vivo = () => id === cofreId;
  const esp = async ms => { if (!cofreRapido) await sleep(ms); return vivo(); };
  clearInterval(cofreGiro); cofreRapido = false; P.cofreTempo = 0;
  await introCofre(E.intro); if (!vivo()) return;   // cámara lenta, zoom y rayo de luz sobre el campo
  P.cofreTempo = 0;
  S.hidden = false; S.className = 'screen cof-n' + n; $('#cof-chat').innerHTML = '';
  $('#cof-titulo').innerHTML = `${tr('¡COFRE DE BOTÍN!')}<small>&nbsp;</small>`;
  $('#cof-lista').innerHTML = ''; $('#btn-cofre').hidden = true;
  const box = $('#cof-ruedas'); box.innerHTML = ''; box.style.visibility = 'hidden';
  const cofre = $('#cof-cofre'); cofre.setAttribute('class', 'sacude');
  const pool = puedeMejorar().sort(() => Math.random() - 0.5).slice(0, 8);
  const mini = n >= 5;   // el premio máximo: salen cofres de dentro del cofre
  S.onclick = e => { if (e.target.id !== 'btn-cofre') cofreRapido = true; };
  // cada mejora: gira un momento (o sale en su cofre pequeño) y se queda con su rareza
  const revela = async (op, k) => {
    const el = document.createElement('div'), r = rarezaOp(op); el.className = 'rueda girando nueva r' + r;
    const caras = pool.filter(p => p.id !== op.id).concat(op).map(o => iconoOp(o)), real = caras.length - 1;
    const cara = document.createElement('div'); cara.className = 'rueda-cara'; caras.forEach((c, i) => { c.style.display = i === real ? '' : 'none'; cara.appendChild(c); });
    const nom = document.createElement('div'); nom.className = 'rueda-nom ol'; nom.innerHTML = '&nbsp;';
    el.append(cara, nom); box.appendChild(el);
    let i = real; clearInterval(cofreGiro);
    if (mini) { cara.style.visibility = 'hidden'; el.appendChild(miniCofre()); play('summon'); }
    else cofreGiro = setInterval(() => { caras[i].style.display = 'none'; i = (i + 1) % caras.length; caras[i].style.display = ''; play('select'); }, 80);
    const ok = await esp(E.giro); clearInterval(cofreGiro); if (!ok) return false;
    caras.forEach((c, j) => c.style.display = j === real ? '' : 'none');
    if (mini) { const m = el.querySelector('.mini'); if (m) m.remove(); cara.style.visibility = ''; }
    el.classList.remove('girando', 'nueva'); el.classList.add('para'); nom.innerHTML = `${tr(op.nombre)}<small>${nivelOp(op)}</small><i class="rar">${tr(RAREZAS[r])}</i>`;
    play('crown'); tiembla(260 + r * 160); notas([523 * (1 + k * 0.12 + r * 0.1), 784 * (1 + k * 0.12 + r * 0.1)], 'triangle', 0.1, 0.07);
    if (r >= 2) { flash(); confeti(r === 3 ? 18 : 7); }
    if (r === 3) notas([1046, 1318, 1568, 2093], 'square', 0.07, 0.06);
    return true;
  };
  // la apertura: el cofre tiembla… y a veces se atasca (susto) y luego da el doble
  if (!await esp(E.epica)) return;
  if (susto) {
    cofre.setAttribute('class', 'bufa'); play('sad'); $('#cof-titulo').innerHTML = `${tr('…¿Nada?')}<small>&nbsp;</small>`; chatCofre('susto', 2);
    if (!await esp(E.susto)) return;
    $('#cof-titulo').innerHTML = `${tr('¡¡ESPERA!!')}<small>&nbsp;</small>`; cofre.setAttribute('class', 'sacude'); play('summon');
    if (!await esp(E.epica * 0.5)) return;
  }
  cofre.setAttribute('class', 'abre'); box.style.visibility = ''; flash(); play('win');
  for (let k = 0; k < n; k++) {
    if (mini && k === 0) $('#cof-titulo').innerHTML = `${tr('¡COFRES DENTRO DEL COFRE!')}<small>&nbsp;</small>`;
    if (!await revela(ops[k], k)) return;
    if (k > 0 && !mini) $('#cof-titulo').innerHTML = `${tr('¡HAY MÁS!')}<small>${'⭐'.repeat(k + 1)}</small>`;
    else if (k > 0) $('#cof-titulo').querySelector('small').textContent = '⭐'.repeat(k + 1);
    if (k + 1 < 5) chatCofre('mas', 1);
    // el suspense: la música se acelera y el latido también. ¿Habrá otra?
    const t = Math.min(k, E.tempos.length - 1);
    P.cofreTempo = E.tempos[t]; latido(E.latidos[t], 90 + t * 25); S.classList.add('suspense'); S.style.setProperty('--pulso', (0.7 - t * 0.1) + 's');
    if (!await esp(E.suspense[Math.min(k, E.suspense.length - 1)])) return;
    // falso final: parece que se acaba (la música se para en seco)… y reanuda
    if (k < n - 1 && Math.random() < E.falsoFinal) {
      S.classList.remove('suspense'); latido(0); P.cofreTempo = 0; $('#cof-titulo').querySelector('small').textContent = '…';
      if (!await esp(E.silencio)) return;
    }
    S.classList.remove('suspense');
  }
  // se acabó: silencio un segundo, la música vuelve y llega el premio
  latido(0); P.cofreTempo = 0;
  if (n >= 3 && !await esp(E.silencio * 0.7)) return;
  flash();
  const T = { 1: ['¡MEJORA ÉPICA!', 'Mejora de las tuyas, gratis'], 2: ['¡DOBLE MEJORA!', '¡Doble premio!'], 3: ['¡¡¡777!!!', '¡TRIPLE MEJORA!'], 4: ['¡¡CUÁDRUPLE!!', '¡CUATRO MEJORAS!'], 5: ['¡¡¡777 777!!!', '¡¡CINCO MEJORAS!!'] }[n];
  $('#cof-titulo').innerHTML = `${tr(T[0])}<small>${tr(T[1])}</small>`;
  if (n >= 3) { S.classList.add('jackpot'); if (n >= 5) S.classList.add('mega'); }
  chatCofre(n >= 5 ? 5 : n >= 3 ? 3 : n, n >= 3 ? 4 : 1);
  if (n === 1) { box.firstChild.classList.add('grande'); notas([784, 1046, 1318, 1568], 'triangle', 0.1, 0.1); confeti(14); tiembla(500); }
  else if (n === 2) { confeti(22); notas([784, 988, 1318], 'square', 0.08, 0.1); }
  else {
    tiembla(n >= 5 ? 2600 : 1400); confeti(n >= 5 ? 160 : 80); notas(FANFARRIA, 'square', 0.09, 0.085); notas(FANFARRIA.map(f => f / 2), 'triangle', 0.1, 0.085);
    if (n >= 5) { notas(FANFARRIA.map(f => f * 2), 'square', 0.05, 0.07); fuegos(12, 3000); botAsustado(); box.classList.add('flotan'); }
  }
  if (!await esp(n >= 5 ? 2200 : n >= 3 ? 900 : 500)) return;
  box.classList.remove('flotan');
  $('#cof-lista').innerHTML = ops.map(op => `<div class="cof-fila"><b class="ol">${tr(op.nombre)}</b> <span class="op-nv">${nivelOp(op)}</span><div class="op-desc">${tr(op.desc)}</div></div>`).join('');
  $('#btn-cofre').hidden = false;
}
$('#btn-cofre').onclick = () => {
  cierraCofre(); play('select');
  $('#scr-cofre').hidden = true; $('#scr-cofre').onclick = null; P.estado = 'jugando';
  if (P.cofresPend > 0) { P.cofresPend--; abrirCofre(); }
};

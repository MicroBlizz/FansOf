// Fans of Pop · MEMORIA, ELEGIR TABLERO Y DIFICULTAD (tarea #141 fase 1, ADR 215): la ventana que sale al tocar MEMORIA en la portada.
// Arriba, los mundos (cada uno con un dibujito de su tablero grande, su nombre y su instrumento; los que aún no has alcanzado en el
// camino, apagados con candado y el nivel en que se abren); abajo, Fácil, Normal y Difícil con su récord; y JUGAR o VOLVER.
// Lo último elegido se recuerda en SAVE.memoria.mundo y SAVE.memoria.dif. Las reglas, en js/memoria-reglas.js.
'use strict';
const PP_MEM_DIF_NOMBRE = Object.freeze({ facil: 'Fácil', normal: 'Normal', dificil: 'Difícil' });
// el nivel al que ha llegado el camino (desde 0)
const ppMemNivelCamino = () => (SAVE.run && SAVE.run.v === 2 ? SAVE.run.nivel || 0 : 0);
// el dibujito del tablero grande del mundo m: sus burbujas, del color de su fila
function ppMemMiniatura(m) {
  const C = PP_CFG.memoria, forma = PP_MEM_R.formaDe(C, PP_FORMAS, PP_FORMAS_MUNDO, m, C.crece.forma), n = forma.length;
  const celdas = forma.join('').split('').map((ch, i) => (ch === '#' ? `<i style="background:${ppColorBurbuja(i, n)}"></i>` : '<b></b>')).join('');
  return `<span class="pp-mem-mini" style="grid-template-columns:repeat(${n},1fr)">${celdas}</span>`;
}
// la ficha de un mundo (un botón); cerrada, con candado
function ppMemFichaMundo(m, abierto) {
  const M = PP_MUNDOS[m], im = PP_IMG[M.fondo], b = document.createElement('button');
  b.type = 'button'; b.className = 'pp-mem-mundo' + (abierto ? '' : ' pp-cerrado'); b.disabled = !abierto; b.dataset.mundo = m;
  if (im && im.src) b.style.backgroundImage = `url("${im.src}")`;
  const instr = PP_INSTRUMENTOS[PP_MEM_R.instrumento(PP_CFG.memoria, m)];
  b.innerHTML = `${ppMemMiniatura(m)}<span class="pp-mem-nom">${ppEsc(tr(M.nombre))}</span><span class="pp-mem-ins">${ppEsc(tr(instr.nombre))}</span>`
    + (abierto ? '' : `<span class="pp-candado"><i></i>${tr('Nivel {n}', { n: ppInicioMundo(m) + 1 })}</span>`);
  return b;
}
// el botón de una dificultad, con su récord
function ppMemBotonDif(id) {
  const b = ppBoton('', 'pp-btn2 pp-sec pp-mem-dif', () => {});
  b.dataset.dif = id;
  b.innerHTML = `${ppEsc(tr(PP_MEM_DIF_NOMBRE[id]))}<small>${ppEsc(tr('Récord: {n}', { n: PP_MEM_R.recordDe(SAVE.memoria, id) }))}</small>`;
  return b;
}
// marca lo elegido (el borde de la ficha y la dificultad encendida)
function ppMemMarca(t, sel) {
  t.querySelectorAll('.pp-mem-mundo').forEach(b => b.classList.toggle('pp-mem-sel', +b.dataset.mundo === sel.mundo));
  t.querySelectorAll('.pp-mem-dif').forEach(b => b.classList.toggle('pp-mem-sel', b.dataset.dif === sel.dif));
}
function ppEligeMemoria() {
  const abiertos = PP_MEM_R.abiertos(ppMemNivelCamino(), PP_MUNDOS.map(M => M.niveles));
  const sel = { mundo: PP_MEM_R.mundoValido(SAVE.memoria.mundo || 0, abiertos), dif: PP_MEM_R.dificultad(SAVE.memoria.dif) };
  const t = ppAbre(`<h2>${tr('MEMORIA')}</h2><p class="pp-sub">${tr('Elige tablero y dificultad')}</p>`, true);
  t.classList.add('pp-mem-pantalla');   // a pantalla completa (Pepins, 25-11-2026: «sale una pantalla muy pequeña»)
  const rejilla = document.createElement('div'); rejilla.className = 'pp-mem-mundos';
  abiertos.forEach((si, m) => {
    const b = ppMemFichaMundo(m, si);
    b.onclick = () => { play('select'); sel.mundo = m; ppMemMarca(t, sel); };
    rejilla.appendChild(b);
  });
  const difs = document.createElement('div'); difs.className = 'pp-fila pp-mem-difs';
  for (const id of PP_MEM_R.DIFICULTADES) {
    const b = ppMemBotonDif(id);
    b.onclick = () => { play('select'); sel.dif = id; ppMemMarca(t, sel); };
    difs.appendChild(b);
  }
  t.append(rejilla, difs);
  t.appendChild(ppBoton(tr('JUGAR'), 'pp-btn', () => {
    Object.assign(SAVE.memoria, { mundo: sel.mundo, dif: sel.dif }); ppGuarda();
    ppCierra(); ppNuevaMemoria(sel.mundo, sel.dif);
  }));
  t.appendChild(ppBoton(tr('VOLVER'), 'pp-btn2 pp-azul', () => { ppCierra(); if (PP_MEM) ppSalMemoria(); }));
  ppMemMarca(t, sel);
  const elegida = rejilla.querySelector('.pp-mem-sel'); if (elegida && elegida.scrollIntoView) elegida.scrollIntoView({ block: 'nearest' });
}

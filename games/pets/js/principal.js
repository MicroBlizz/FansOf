// Fans Of Pets · PRINCIPAL: el lienzo y su tamaño, el bucle de cada fotograma (la escena de cada fase), el reloj que simula cada pocos segundos
// y el arranque. Pets es un prototipo tras el modo dev: fuera de él solo se ve un aviso.
'use strict';
const PT_CV = document.getElementById('cv'), PT_CTX = PT_CV.getContext('2d'), PT_UIC = document.getElementById('pt-ui');
const PT_V = { sc: 1, dpr: 1, W: 540, H: 960 };
function ptAjusta() {
  const bw = document.body.clientWidth, bh = document.body.clientHeight, pad = bw < 600 ? 0 : 24;
  let w = bw - pad * 2, h = (w * PT_V.H) / PT_V.W;
  if (h > bh - pad * 2) { h = bh - pad * 2; w = (h * PT_V.W) / PT_V.H; }
  w = Math.max(200, Math.floor(w)); h = Math.floor((w * PT_V.H) / PT_V.W);
  const st = document.getElementById('stage'); st.style.width = w + 'px'; st.style.height = h + 'px';
  PT_V.sc = w / PT_V.W; PT_V.dpr = Math.min(window.devicePixelRatio || 1, 3);
  PT_CV.width = Math.round(w * PT_V.dpr); PT_CV.height = Math.round(h * PT_V.dpr);
  PT_UIC.style.transform = `scale(${PT_V.sc})`;
}

// lo que pasa al simular y merece una frase
function ptTrasSimular(pasa) {
  const c = ptCriatura(SAVE.criatura);
  if (pasa.nacio) { PT_UI.bocadillo = ''; ptSonido('levelup'); ptPantalla(); ptDice(tr(PT_FRASES.nace, { nombre: ptNombre(c) })); return; }
  if (SAVE.fase === 'bebe' && SAVE.crecido >= ptBebeMin() && !SAVE.avisoCrecido) { SAVE.avisoCrecido = true; ptGuarda(); ptDice(tr(PT_FRASES.crecido, { nombre: ptNombre(c) })); }
  else if (pasa.durmio) ptDice(ptFrase('dormir'));
  else if (SAVE.fase === 'bebe' && !SAVE.dormida && ptTriste() && !PT_UI.triste) ptDice(ptFrase('triste'));
  else if (pasa.desperto) ptDice(ptFrase('despertar'));
  PT_UI.triste = SAVE.fase === 'bebe' && ptTriste();
}

// la escena de cada fase
function ptFotograma(ms) {
  const t = ms / 1000, ctx = PT_CTX, k = PT_V.sc * PT_V.dpr;
  ctx.setTransform(k, 0, 0, k, 0, 0);
  const dia = SAVE.fase === 'bebe' || SAVE.fase === 'huevo' ? ptEnHorario(ptAhora()) : true;
  ptPintaOficina(ctx, PT_V.W, PT_V.H, dia);
  PT_UI.wob = Math.max(0, PT_UI.wob - 0.02);
  if (!NUCLEO.desarrollo) ptPintaHuevo(ctx, 270, 380, 90, '#ff9a3c', t, { bufanda: true });
  else if (SAVE.fase === 'entrevista' || (PT_UI.volverA === '' && SAVE.fase === 'horario')) ptPintaLola(ctx, 150, 420, 1, t);
  else if (SAVE.fase === 'huevos') {
    ptPintaLola(ctx, 90, 220, 0.6, t);
    SAVE.huevos.forEach((id, i) => {
      const c = ptCriatura(id), sel = PT_UI.elegido === i;
      if (sel) { ctx.fillStyle = 'rgba(255,203,61,0.35)'; ctx.beginPath(); ctx.arc(PT_HUEVO_X[i], PT_HUEVO_Y, 82, 0, 7); ctx.fill(); }
      ptPintaHuevo(ctx, PT_HUEVO_X[i], PT_HUEVO_Y + (sel ? -8 : 0), 58, ptColor(c.fac), t, { wob: sel ? 0.3 : 0 });
    });
  } else if (SAVE.fase === 'huevo' || PT_UI.volverA === 'huevo') {
    const c = ptCriatura(SAVE.criatura), falta = (ptEclosionEn() - ptAhora()) / (PETS.huevoHoras * 60 * PT_MIN);
    ptPintaHuevo(ctx, 270, 430, 110, ptColor(c.fac), t, { wob: PT_UI.wob + (falta < 0.1 ? 0.25 : 0), bufanda: PT_UI.bufanda, grieta: falta < 0.25 ? 1 - falta * 4 : 0 });
  } else if (SAVE.fase === 'bebe') {
    const c = ptCriatura(SAVE.criatura);
    const e = { dormida: SAVE.dormida, triste: ptTriste(), anim: PT_UI.anim, at: PT_UI.at };
    if (!ptTieneArte(c.id, 'bebe') || !ptPintaBebeArte(ctx, c.id, 270, 440, 115, t, e)) ptPintaBebe(ctx, 270, 440, 115, ptColor(c.fac), t, e);
  }
  requestAnimationFrame(ptFotograma);
}

// arranque
function ptArranca() {
  ptAjusta(); window.addEventListener('resize', ptAjusta);
  $pt('#pt-elige').innerHTML = PT_HUEVO_X.map((x, i) => `<button type="button" style="left:${x - 70}px;top:${PT_HUEVO_Y - 80}px" aria-label="${tr('Huevo {n}', { n: i + 1 })}" aria-pressed="false"></button>`).join('');
  $pt('#pt-elige').querySelectorAll('button').forEach((b, i) => { b.onclick = () => ptEligeHuevo(i); });
  ptBarraDev();
  if (NUCLEO.desarrollo) ptTrasSimular(ptSimula());
  ptPantalla();
  setInterval(() => { if (!NUCLEO.desarrollo) return; const f = SAVE.fase, pasa = ptSimula(); ptTrasSimular(pasa); if (f !== SAVE.fase) ptPantalla(); else ptRefresca(); }, PETS.tiempo.cadaSegundos * 1000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && NUCLEO.desarrollo) { ptTrasSimular(ptSimula()); ptRefresca(); } });
  const carga = document.getElementById('carga'); if (carga) carga.remove();
  requestAnimationFrame(ptFotograma);
}
ptArranca();

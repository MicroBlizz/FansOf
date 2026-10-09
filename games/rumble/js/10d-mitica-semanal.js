// Fans of Rumble · MÍTICA SEMANAL: cada lunes las estrellas de la Mítica vuelven a 0 y las que ganas suben tu puesto en el Salón de la Fama
'use strict';
/* =========================================================
   Idea de Daniel (9-10-2026). Cómo va:
     · Los niveles de la Mítica NO se cierran: lo que tenías abierto sigue abierto (eso lo dicen SAVE.campM y el servidor, como siempre).
     · Lo que vuelve a 0 son las estrellas que se VEN en la Mítica: las de esta semana, en SAVE.mitW = { sem: weekStr(), st: { nivel: estrellas } }.
     · El oro y las gemas no cambian: primer pase, repeticiones y tercera estrella se cobran con las estrellas de siempre (SAVE.campM),
       así que repetir la Mítica cada semana no regala más de la cuenta.
     · El Salón lo cuenta el servidor (servidor/23-mitica-semanal.sql): cada victoria en Mítica apunta allí las estrellas de la semana.
     · SAVE.mitHist guarda lo que hiciste cada semana (para «De siempre» sin conexión) y SAVE.mitPremio, los premios del lunes ya dados.
     · Premio del lunes: un título para el armario si acabaste entre los 10 primeros la semana anterior (MIT_PREMIOS).
   ========================================================= */
function mitSem() {
  const s = weekStr(); let W = SAVE.mitW;
  if (!W || typeof W !== 'object' || W.sem !== s) {
    if (W && W.sem && W.st) {   // la semana que se acaba se guarda en el historial (solo las 26 últimas)
      const H = SAVE.mitHist || (SAVE.mitHist = {}), n = Object.values(W.st).reduce((a, b) => a + b, 0);
      if (n) H[W.sem] = n;
      const ks = Object.keys(H); if (ks.length > 26) for (const k of ks.slice(0, ks.length - 26)) delete H[k];
    }
    W = SAVE.mitW = { sem: s, st: {} };
  }
  return W;
}
const mitStars = id => mitSem().st[id] || 0;
const starsVer = (id, d) => (d === 'm' ? mitStars(id) : starsD(id, d));   // las estrellas que se PINTAN en la campaña
const mitSemana = () => Object.values(mitSem().st).reduce((a, b) => a + b, 0);
const mitSiempre = () => mitSemana() + Object.values(SAVE.mitHist || {}).reduce((a, b) => a + b, 0);
function mitGana(id, n) { const W = mitSem(); if (n > (W.st[id] || 0)) W.st[id] = n; }

// la caja de arriba de la Mítica: cuenta atrás, tus estrellas y el botón al Salón (abre su pestaña con data-salon)
function mitBoxHtml() {
  return `<div class="mit-box"><div class="mod-head ol">TEMPORADA MÍTICA<small class="mit-reloj">Se reinicia en ${untilStr(true)}</small></div>`
    + `<div class="mit-cuentas"><span><small>ESTA SEMANA</small><b class="ol">★ ${fmt(mitSemana())}</b></span><span><small>DE SIEMPRE</small><b class="ol">★ ${fmt(mitSiempre())}</b></span></div>`
    + `<p class="mit-txt">Cada lunes las estrellas de la Mítica vuelven a 0, pero los niveles siguen abiertos. Las que ganes suben tu puesto en el Salón de la Fama.</p>`
    + `<button class="chip-btn" data-salon="mitica">VER LA CLASIFICACIÓN</button></div>`;
}

/* ---------- el premio del lunes: los 10 primeros de la semana anterior se llevan un título ---------- */
const MIT_PREMIOS = [[1, 'mitico1'], [3, 'mitico3'], [10, 'mitico10']];   // [hasta el puesto, título] (los títulos están en retos-armario.js)
let mitPremioVisto = false;
async function mitPremio() {
  if (mitPremioVisto || typeof CUENTA === 'undefined' || !CUENTA.activa) return;
  mitPremioVisto = true;
  let d; try { d = await CUENTA.rpc('clasificacion', { p_juego: AJUSTES.id, p_tabla: 'mitica_pasada' }); } catch (e) { mitPremioVisto = false; return; }
  const yo = d && d.yo, sem = d && d.semana; if (!yo || !sem) return;
  const P = SAVE.mitPremio || (SAVE.mitPremio = {}); if (P[sem]) return;
  const tramo = MIT_PREMIOS.find(([h]) => yo.puesto <= h); if (!tramo) return;
  P[sem] = yo.puesto; darLook('titulo', tramo[1]); saveGame();
  toast(`¡Quedaste ${fmt(yo.puesto)}.º en la Mítica! Título nuevo en tu armario: «${tituloDef(tramo[1]).name}»`, true);
}
hook('pantalla', id => { if (id === 'scr-title' || id === 'scr-camp') setTimeout(mitPremio, 1500); });

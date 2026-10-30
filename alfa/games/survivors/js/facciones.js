// Fans of Survivors · Elegir la facción con la que juegas: el botón del menú principal y la lista para elegir.
// Qué hace falta para abrir cada una (DESBLOQUEO) y las armas de cada una: datos-facciones.js y datos-facciones-2.js.
'use strict';

// el botón de debajo de JUGAR y la frase de la portada
function pintaFaccion() {
  const f = facNow(), F = FACTIONS[f];
  $('#btn-fac-nom').textContent = F.name;
  $('#tagline').innerHTML = `<b>${CFG.cards[F.leader].name}</b> contra <i>toda la plantilla de Microblizz</i>`;
}
const faltanMin = f => Math.max(0, DESBLOQUEO[f] - minutosTotales());
function abrirFacciones() {
  const sel = facNow();
  const html = FAC_JUGABLES.map(f => {
    const F = FACTIONS[f], ok = isUnlocked(f);
    const info = ok ? `Empiezas con ${ARMAS[ARMA_INICIAL[f]].nombre}` : `Bloqueada: aguanta ${DESBLOQUEO[f]} minutos en total (llevas ${Math.min(minutosTotales(), DESBLOQUEO[f])})`;
    return `<button class="pick-opt unit" data-id="${f}" aria-pressed="${f === sel}" style="--rc:${FAC_COLOR[f]};${ok ? '' : 'opacity:.55;filter:grayscale(.7)'}"><canvas data-art="${F.leader}"></canvas><span><span class="inv-top"><b class="ol">${F.name}</b></span><span class="pk-desc">${info}</span></span></button>`;
  }).join('');
  openList('Elige tu facción', html, f => {
    if (!isUnlocked(f)) { play('deny'); toast(`Aguanta ${faltanMin(f)} minutos más para abrir ${FACTIONS[f].name}.`); return; }
    SAVE.fac = f; collFac = f; saveGame(); play('select'); pintaFaccion();
    try { dibujaPortada(); } catch (e) { /* la portada sale aunque falle el dibujo */ }
  });
}
$('#btn-fac').onclick = () => { play('select'); abrirFacciones(); };

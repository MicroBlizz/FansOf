// Fans of Rumble · Facción nueva: cómo se explica que al ganar al jefe de un mundo se libera su facción (v0.9.71)
// · En la campaña: una etiqueta dorada con el líder en cada mundo que libera una facción (unlockChip).
// · Antes de jugar contra ese jefe: un recuadro «SI GANAS…» (unlockBox).
// · Al ganar: una ventana grande «¡NUEVA FACCIÓN!» que no se cierra sola (showUnlock), con «VER EN COLECCIÓN» y «SEGUIR».
// En Fácil no se libera ninguna facción: lo dicen la etiqueta y el recuadro.
'use strict';
function unlockChip(f, d) {
  const L = FACTIONS[f].leader;
  return d === 'f'
    ? `<div class="unlock-chip off"><canvas data-kc="${L}"></canvas><span>En Fácil no se libera: gana al jefe en Normal y ${losOf(f)} se unen a ti.</span></div>`
    : `<div class="unlock-chip"><canvas data-kc="${L}"></canvas><span>¡Gana al jefe y ${losOf(f)} se unen a ti!</span></div>`;
}
function unlockBox(f, d) {
  const L = FACTIONS[f].leader;
  return d === 'f'
    ? `<div class="unlock-box off"><canvas data-kc="${L}"></canvas><div><b class="ol">EN FÁCIL NO SE LIBERA</b><span>Gana a este jefe en Normal para que ${losOf(f)} se unan a ti.</span></div></div>`
    : `<div class="unlock-box"><canvas data-kc="${L}"></canvas><div><b class="ol">SI GANAS…</b><span>${FACTIONS[f].name}: ¡se unen a la rebelión! Sus cartas empiezan a nivel 1.</span></div></div>`;
}
function showUnlock(f) {
  if (!$('#scr-unlock')) $('#ui').insertAdjacentHTML('beforeend', `<section id="scr-unlock" class="screen modal" hidden role="dialog" aria-label="Nueva facción">
    <div class="modal-card unlock-card"><div class="unlock-rays"></div><h3 class="ol-big" id="unlock-title">¡NUEVA FACCIÓN!</h3><canvas id="unlock-art"></canvas>
      <b class="ol unlock-name" id="unlock-name"></b><div class="unlock-passive" id="unlock-passive"></div>
      <p class="unlock-note">Sus cartas empiezan a nivel 1: súbelas en la Colección. Ya puedes elegirla al jugar.</p>
      <button class="btn-big ol" id="unlock-coll">VER EN COLECCIÓN</button><button class="btn-ghost ol" id="unlock-ok">SEGUIR</button></div></section>`);
  const F = FACTIONS[f];
  $('#scr-unlock').style.setProperty('--fc', FAC_COLOR[f]);
  $('#unlock-name').textContent = F.name.toUpperCase();
  $('#unlock-passive').innerHTML = `${ICONS[F.icon] || ''}<div><b>${F.passive}</b><span>${passiveText(f)}</span></div>`;
  drawArt($('#unlock-art'), F.leader, 150, 130);
  $('#unlock-ok').onclick = () => { play('select'); $('#scr-unlock').hidden = true; };
  $('#unlock-coll').onclick = () => { play('select'); $('#scr-unlock').hidden = true; goHome(); $('#btn-coll').click(); collFac = f; buildColl(); };
  $('#scr-unlock').hidden = false; play('crown');
}

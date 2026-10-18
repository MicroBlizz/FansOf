// Fans Of Decks · Portada del prototipo: continuar o empezar una partida con CrazyBunny. Tras NUCLEO.desarrollo y en la alfa; en la web publicada, «en construcción».
// Para pruebas: ?jugar=1 empieza una partida nueva; ?acto=1&dia=4 salta a ese día de la campaña (desde 0); ?nodo=minijefe|jefe|elite salta a esa cita del día.
'use strict';
function dcPortada() {
  dcMuestra('dc-portada');
  const cont = document.getElementById('dc-continuar');
  cont.hidden = !DCP.run;
  document.getElementById('dc-estado').textContent = DCP.meta.partidas ? tr('Partidas: {a} · Victorias: {b}', { a: DCP.meta.partidas, b: DCP.meta.victorias }) : tr('Fans Of Decks · prototipo');
}
(function () {
  dcCarga();
  const q = location.search, abierto = NUCLEO.desarrollo || NUCLEO.alfa;
  dcPortadaArte(document.getElementById('dc-portada-arte'));
  const botones = document.getElementById('dc-portada-botones');
  if (!abierto) { document.getElementById('dc-estado').textContent = tr('Fans Of Decks · en construcción'); document.getElementById('dc-portada').hidden = false; return; }
  botones.hidden = false;
  document.getElementById('dc-nueva').onclick = () => {
    const empieza = () => { play('select'); dcEligeVentaja(v => { dcNuevaPartida('bunny', v); dcPintaMapa(); }); };
    if (DCP.run) confirmBox(tr('¿Partida nueva?'), tr('Perderás la partida que tienes a medias.'), tr('SÍ, NUEVA'), empieza); else empieza();
  };
  document.getElementById('dc-continuar').onclick = () => { play('select'); if (DCP.run.pendiente) dcResuelveNodo(); else dcPintaMapa(); };
  document.getElementById('dc-como').onclick = dcComoSeJuega;
  if (/[?&]jugar=1/.test(q)) { dcNuevaPartida('bunny'); const A = /[?&]acto=(\d+)/.exec(q), Dd = /[?&]dia=(\d+)/.exec(q); if (A || Dd) { DCP.run.acto = Math.min(+(A ? A[1] : 0), DC_CAMPANA.length - 1); DCP.run.dia = Math.min(+(Dd ? Dd[1] : 0), dcActo().dias.length - 1); dcEmpiezaDia(); DCP.run.pendiente = null; } const n = /[?&]nodo=(\w+)/.exec(q); if (n) { const m = DCP.run.mapa; for (let p = 0; p < m.pisos.length; p++) { const k = m.pisos[p].findIndex(x => x.tipo === n[1]); if (k >= 0) { dcIrA(p, k); break; } } dcResuelveNodo(); } else dcPintaDia(); }
  else dcPortada();
})();

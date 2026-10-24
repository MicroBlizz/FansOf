// Fans Of Decks · Portada, con el aire del menú de Rumble: continuar o elegir líder y empezar una partida, y las fichas de Biblioteca, Ventajas, Logros, Novedades y Opciones. Abierta para todos; los atajos de prueba, solo en dev y en la alfa.
// Para pruebas: ?jugar=1 empieza una partida nueva; ?paro=3 juega en ese nivel de paro; ?ventajas=ticket,gimnasio lleva esas ventajas fiscales; ?acto=1&dia=4 salta a ese día de la campaña (desde 0); ?nodo=minijefe|jefe|elite salta a esa cita del día.
'use strict';
function dcPortada() {
  dcMuestra('dc-portada');
  const cont = document.getElementById('dc-continuar'), nueva = document.getElementById('dc-nueva');
  cont.hidden = !DCP.run;
  document.getElementById('dc-portada').classList.toggle('dc-con-partida', !!DCP.run);   // con CONTINUAR hay un botón más: el dibujo se encoge
  nueva.className = (DCP.run ? 'btn-mode' : 'btn-big') + ' ol';   // como en Rumble: un solo botón grande, el resto debajo
  document.getElementById('dc-news-punto').hidden = !dcNovedadSinVer();
  document.getElementById('dc-estado').textContent = DCP.meta.partidas ? tr('Partidas: {a} · Victorias: {b}', { a: DCP.meta.partidas, b: DCP.meta.victorias }) : '';
}
(function () {
  dcCarga(); dcParoTabla();   // paro.js: el paro de las partidas de antes pasa a ser por líder
  const q = (NUCLEO.desarrollo || NUCLEO.alfa) ? location.search : '';   // los atajos de prueba no saltan días en la web
  dcPortadaArte(document.getElementById('dc-portada-arte'));
  const botones = document.getElementById('dc-portada-botones');
  botones.hidden = false;
  document.getElementById('dc-nueva').onclick = () => {
    // líder, después su nivel (normal o paro) y después las ventajas fiscales (tantas como huecos abra el paro de ese líder); VOLVER sube un paso
    const lider = () => dcEligeLider(l => { const nivel = () => dcEligeParo(l, p => dcEligeVentaja(l, v => { dcNuevaPartida(l, v, p); dcPintaMapa(); }, nivel), lider); nivel(); });
    const empieza = () => { play('select'); lider(); };
    if (DCP.run) confirmBox(tr('¿Partida nueva?'), tr('Perderás la partida que tienes a medias.'), tr('SÍ, NUEVA'), empieza); else empieza();
  };
  document.getElementById('dc-continuar').onclick = () => { play('select'); if (DCP.run.pendiente) dcResuelveNodo(); else dcPintaMapa(); };
  document.getElementById('dc-como').onclick = () => { play('select'); dcComoSeJuega(); };
  document.getElementById('dc-bib').onclick = () => { play('select'); dcBibTab = 'c'; dcBiblioteca(dcPortada); };
  document.getElementById('dc-ventajas').onclick = () => { play('select'); dcBibTab = 'v'; dcBiblioteca(dcPortada); };
  document.getElementById('dc-logros').onclick = () => { play('select'); dcLogros(dcPortada); };
  document.getElementById('dc-novedades').onclick = dcNovedades;
  document.getElementById('dc-opciones').onclick = dcOpciones;
  if (/[?&]jugar=1/.test(q)) { const P = /[?&]paro=(\d+)/.exec(q); const Li = /[?&]lider=(\w+)/.exec(q); const Vs = /[?&]ventajas=([\w,]+)/.exec(q); dcNuevaPartida(Li && DC_LIDERES[Li[1]] ? Li[1] : 'bunny', Vs ? Vs[1].split(',') : null, P ? Math.min(+P[1], DC_PARO_MAX) : 0); const A = /[?&]acto=(\d+)/.exec(q), Dd = /[?&]dia=(\d+)/.exec(q); if (A || Dd) { DCP.run.acto = Math.min(+(A ? A[1] : 0), DC_CAMPANA.length - 1); DCP.run.dia = Math.min(+(Dd ? Dd[1] : 0), dcActo().dias.length - 1); dcEmpiezaDia(); DCP.run.pendiente = null; } const n = /[?&]nodo=(\w+)/.exec(q); if (n) { const m = DCP.run.mapa; for (let p = 0; p < m.pisos.length; p++) { const k = m.pisos[p].findIndex(x => x.tipo === n[1]); if (k >= 0) { dcIrA(p, k); break; } } dcResuelveNodo(); } else dcPintaDia(); }
  else dcPortada();
})();

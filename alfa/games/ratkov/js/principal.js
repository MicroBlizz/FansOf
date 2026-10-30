// Fans of Ratkov · PRINCIPAL: arranca el motor, construye la ciudad una sola vez, prepara los controles y lleva el bucle de cada
// fotograma. En el título y en el refugio la cámara pasea despacio por la ciudad nevada, de fondo.
'use strict';
const RELOJ = { antes: 0, hora: 0, paseo: 0 };
function arranca() {
  iniciaMotor(); construyeMapa(); preparaBalas(); preparaControles(); ajustaMochilas(); ajustaAlijo(); // las partidas de antes pasan a la mochila Tetris
  el('carga').hidden = true;
  el('t-ver').textContent = 'v' + (NEWS[0] ? NEWS[0].v : '0.1.0');
  el('t-jugar').onclick = () => { play('select'); abreRefugio('incursion'); };
  el('t-como').onclick = () => { play('select'); muestraComo(); };
  el('t-op').onclick = () => { play('select'); muestraOpciones(); };
  el('r-opciones').onclick = () => { play('select'); muestraOpciones(); };
  document.querySelectorAll('#r-pestanas button').forEach(b => (b.onclick = () => { play('select'); cambiaPestana(b.dataset.p); }));
  el('titulo').hidden = false; musica('olvidados');
  // para probar: ?ir=incursion entra directo
  const q = new URLSearchParams(location.search);
  if (q.get('ir') === 'refugio') abreRefugio(q.get('p') || 'incursion');
  if (q.get('ir') === 'incursion') { el('titulo').hidden = true; empiezaIncursion(); }
  requestAnimationFrame(fotograma);
}
function fotograma(ms) {
  requestAnimationFrame(fotograma);
  const dt = Math.min(0.05, (ms - RELOJ.antes) / 1000 || 0.016); RELOJ.antes = ms; RELOJ.hora += dt;
  vigilaMusica();
  if (RAID.activa) {
    leeControles(JUG.x, JUG.z);
    // las ventanas: Tab abre o cierra la mochila, M el mapa, Esc cierra lo que haya o pausa
    if (pulsado('mochila')) { if (el('v-mochila').hidden) abreMochila(); else cierraVentana('v-mochila'); }
    if (pulsado('mapa') && !RAID.tuto) { if (el('v-mapa').hidden) abreMapa(); else cierraVentana('v-mapa'); }
    if (pulsado('pausa')) { if (!el('v-teclas').hidden) { cierraVentana('v-teclas'); abrePausa(); } else if (!el('v-botin').hidden || !el('v-mochila').hidden || !el('v-mapa').hidden) cierraTodas(); else if (RAID.pausa) cierraVentana('v-pausa'); else abrePausa(); }
    if (!RAID.pausa) { avanzaIncursion(dt); avanzaBotin(dt); }
    if (JUG) {
      const t = TEMBLOR > 0 ? TEMBLOR : 0; TEMBLOR = Math.max(0, TEMBLOR - dt);
      // la cámara va un poco por delante de donde miras, para ver venir las cosas
      const adel = ENT.apunta ? 3.2 : 1.5;
      // de pie, el personaje va algo más arriba en la pantalla para ver lo que viene (los mandos ocupan la parte de abajo)
      const abajo = ORIENTA.vertical && ENT.tactil ? 4.2 : 0;
      const cx = JUG.x + Math.sin(JUG.a) * adel + entre(-t, t), cz = JUG.z + Math.cos(JUG.a) * adel * 0.7 + abajo + entre(-t, t);
      RELOJ.cx = RELOJ.cx == null ? cx : RELOJ.cx + (cx - RELOJ.cx) * Math.min(1, dt * 6); RELOJ.cz = RELOJ.cz == null ? cz : RELOJ.cz + (cz - RELOJ.cz) * Math.min(1, dt * 6);
      camaraEn(RELOJ.cx, RELOJ.cz); avanzaTapan(JUG.x, JUG.z, dt); avanzaHud(dt);
    }
  } else {
    // de fondo: un paseo lento por la ciudad
    PULSO.clear(); RELOJ.paseo += dt * 0.03;
    const x = Math.sin(RELOJ.paseo) * 40, z = -14 + Math.sin(RELOJ.paseo * 0.7) * 18;
    camaraEn(x, z); avanzaTapan(9999, 9999, dt); RELOJ.cx = null; RELOJ.cz = null;
    if (JUG) avanzaParticulas(dt);
    vientoSuena(0.12);
    const u = MOTOR.postMat.uniforms; u.frio.value = 0; u.dano.value = 0; u.lag.value = 0; u.blanco.value = 0;
  }
  animaFuegos(RELOJ.hora, MOTOR.x, MOTOR.z);
  avanzaMotor(dt, RELOJ.hora);
  pintaEscena();
}
arranca();

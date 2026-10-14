// Fans of Island · INTERRUPTORES: botones de ganchillo que, al pisarlos cualquiera de los dos, destejen una puerta de hilo (plataforma
// t: 'puerta'). Son la primera interacción cooperativa obligatoria: el botón está en una repisa a la que solo se llega lanzando al compañero.
'use strict';
function isCargaInterruptores(N) { return (N.interruptores || []).map((b, i) => ({ ...b, id: i, w: 26, h: 10, pulsado: false, anim: 0 })); }
function isInterruptoresActualiza(m, jugadores, dt) {
  for (const b of m.interruptores) {
    if (b.pulsado) { b.anim = Math.min(1, b.anim + dt * 6); continue; }
    if (b.pista && !b.avisado) { const a = jugadores[0]; if (a.suelo && Math.abs(isCentro(a).x - b.x) < 150) { b.avisado = true; IS_P.aviso = 5; IS_P.avisoTexto = tr(b.pista); } }   // una pista la primera vez que se llega
    for (const p of jugadores) {
      if (p.estado !== 'normal' || p.llevadoPor || p.vy < 0 || !(p.x < b.x + b.w && p.x + p.w > b.x && p.y + p.h > b.y - 3 && p.y + p.h < b.y + b.h + 4)) continue;
      b.pulsado = true; play('clank');
      const puerta = m.plataformas.find(q => q.t === 'puerta' && q.puerta === b.abre);
      if (puerta) { puerta.quemando = IS_PODER_C.fuego.quema * 2; puerta.solida = false; }
      if (typeof toast === 'function') toast(tr('¡La puerta de hilo se desteje!'));
      break;
    }
  }
}

// Fans of Rouflage · LA BALIZA DEL BECARIO FANTASMA: un cazador sin cartas (o fuera) no solo mira: ve todo con luz normal (luz.js) y puede dejar una marca especial donde
// quiera (botón AVISAR, Espacio o Q) para decirle a sus compañeros «aquí hay un colado». Solo la ven los cazadores (los colados no); los bots del anfitrión van a mirar.
// En el PvP se avisa con `bz` y cada navegador la dibuja. Las balizas duran BALIZA.dura segundos y entre una y otra pasan BALIZA.cada.
'use strict';

const BALIZA = { cada: 6, dura: 14, max: 3 };
const BALIZAS = [];      // { x, y, t, de } (t: segundos que lleva puesta)
const balizaPuedo = () => espectando() && !!J.yo && J.yo.clase === 'cazador' && !!J.fantasma;

function accionBaliza() {
  const f = J.fantasma; if (!balizaPuedo()) return;
  if ((f.enfriaB || 0) > 0) { play('deny'); pista(tr('Aviso recargándose: {n} s', { n: Math.ceil(f.enfriaB) }), 1.5); return; }
  f.enfriaB = BALIZA.cada; f.usado = (f.usado || 0) + 1;
  balizaPon(f.x, f.y, J.yo.nombre, true);
  if (J.pvp) rfpManda({ t: 'bz', x: Math.round(f.x), y: Math.round(f.y) });
}
// la baliza en sí (aquí y en los demás navegadores). Los bots solo la atienden en el navegador que los lleva (solo o anfitrión)
function balizaPon(x, y, nombre, mio) {
  BALIZAS.push({ x, y, t: 0, de: nombre || '' }); while (BALIZAS.length > BALIZA.max) BALIZAS.shift();
  if (J.yo && J.yo.clase === 'cazador' && !mio) { avisa(tr('{a} avisa: ¡hay un colado por aquí!', { a: nombre || tr('Tu compañero') }), 'aviso'); }
  play('pop');
  if (!J.pvp || RFP.soyHost) for (const b of J.cazadores) if (b.bot && !b.fuera && b.balas > 0) balizaBot(b, x, y);
}
// un becario de la máquina va a mirar al sitio avisado
function balizaBot(e, x, y) {
  const b = e.bot; if (!b || !['ronda', 'mira', 'investiga'].includes(b.estado)) return;
  const c = casillaCerca(x, y); if (!c) return;
  b.destino = [c[0] * CEL + 10, c[1] * CEL + 14];
  if (ponRumbo(e, b.destino[0], b.destino[1])) { b.estado = 'investiga'; b.t = 0; b.atento = 2.4; e.marca = '!'; e.alerta = 0.5; }
}
function balizaRecibida(m, sl) { if (J.fase !== 'caza' || !sl || !sl.ente || sl.ente.clase !== 'cazador') return; balizaPon(+m.x || 0, +m.y || 0, sl.ente.nombre, false); }

function balizaAvanza(dt) {
  const f = J.fantasma; if (f && f.enfriaB > 0) f.enfriaB = Math.max(0, f.enfriaB - dt);
  for (const z of BALIZAS) z.t += dt;
  while (BALIZAS.length && BALIZAS[0].t > BALIZA.dura) BALIZAS.shift();
  if (J.fase !== 'caza' && BALIZAS.length) BALIZAS.length = 0;
}
// se dibuja por encima de la oscuridad y solo la ven los cazadores. Si queda fuera de la pantalla, una flecha en el borde señala hacia dónde
function pintaBalizas(c, t) {
  if (!J.yo || J.yo.clase !== 'cazador') return;
  const mw = VW / CAM.z / 2 - 30 / CAM.z, mh = VH / CAM.z / 2 - 60 / CAM.z;
  for (const z of BALIZAS) {
    const vida = 1 - z.t / BALIZA.dura, pulso = (t * 1.6) % 1, al = Math.min(1, vida * 3);
    c.save(); c.globalAlpha = al;
    const dx = z.x - CAM.x, dy = z.y - CAM.y, fuera = Math.abs(dx) > mw || Math.abs(dy) > mh;
    if (fuera) {
      const k = Math.min(mw / Math.abs(dx || 1e-6), mh / Math.abs(dy || 1e-6)), ax = CAM.x + dx * k, ay = CAM.y + dy * k, a = Math.atan2(dy, dx), s = 1 / CAM.z;
      c.translate(ax, ay); c.rotate(a); c.scale(s, s);
      c.beginPath(); c.moveTo(16, 0); c.lineTo(-8, -12); c.lineTo(-8, 12); c.closePath();
      c.fillStyle = '#7fe8ff'; c.strokeStyle = OL; c.lineWidth = 3; c.lineJoin = 'round'; c.stroke(); c.fill();
    } else {
      c.translate(z.x, z.y);
      c.beginPath(); c.ellipse(0, 0, 14 + pulso * 46, (14 + pulso * 46) * 0.55, 0, 0, TAU); c.strokeStyle = '#7fe8ff'; c.lineWidth = 3; c.globalAlpha = al * (1 - pulso); c.stroke(); c.globalAlpha = al;
      const b = Math.sin(t * 5) * 3;      // el rombo con su exclamación, botando
      c.beginPath(); c.moveTo(0, -46 + b); c.lineTo(13, -30 + b); c.lineTo(0, -14 + b); c.lineTo(-13, -30 + b); c.closePath();
      c.fillStyle = '#7fe8ff'; c.strokeStyle = OL; c.lineWidth = 3; c.lineJoin = 'round'; c.stroke(); c.fill();
      c.fillStyle = OL; c.fillRect(-1.6, -39 + b, 3.2, 8); c.fillRect(-1.6, -28 + b, 3.2, 3.2);
    }
    c.restore();
  }
}

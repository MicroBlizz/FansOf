// Fans of Ratkov · DOS SALIDAS NUEVAS DEL DISTRITO. El TREN DE MERCANCÍAS llega a la playa de vías una vez por incursión, a una hora al
// azar: toca la bocina, se queda dos minutos con las puertas abiertas (súbete: es una salida) y se va. Y la REJILLA DEL COLECTOR, en la
// esquina del control militar: tan estrecha que solo se pasa sin mochila (suéltala en la ventana MOCHILA; te quedan las manos, los
// bolsillos y la riñonera). Las dos van en SALIDAS (js/mapa.js) con cond: 'horario' o 'sinMochila'.
'use strict';
const TREN = { x0: 30, x1: 66, z: 42, grupo: null, solido: null, entra: 5, sale: 5 };
// el tren: una locomotora y tres vagones sobre la vía de arriba de la playa de vías (z = 42). Empieza escondido
function construyeTren() {
  const o = new Obra(), z = TREN.z, cx = (TREN.x0 + TREN.x1) / 2;
  // la locomotora (al este) y los vagones de carga
  o.caja(9, 3.2, 3, 0x2a3a4a, TREN.x1 - 4.5, 1.9, z); o.caja(9.1, 0.15, 3.1, NIEVE_M, TREN.x1 - 4.5, 3.55, z);
  o.caja(3, 1.2, 2.6, 0x1e2a36, TREN.x1 - 1.5, 4.0, z); o.caja(1.2, 0.8, 0.1, 0xffe07a, TREN.x1 + 0.05, 2.4, z, Math.PI / 2);
  o.caja(0.5, 0.5, 0.06, 0xffd27a, TREN.x1 - 1.5, 4.2, z + 1.32);
  for (let i = 0; i < 3; i++) {
    const x = TREN.x0 + 4 + i * 9.2, col = [0x6a3a2a, 0x4a5a3a, 0x5a4a6a][i];
    o.caja(8.4, 2.8, 2.9, col, x, 1.7, z); o.caja(8.5, 0.14, 3.0, NIEVE_M, x, 3.17, z);
    o.caja(2.4, 2.2, 0.08, 0x1a1208, x, 1.6, z - 1.47);   // la puerta abierta (el hueco oscuro)
    o.caja(2.4, 2.2, 0.08, 0x1a1208, x, 1.6, z + 1.47);
  }
  for (let x = TREN.x0 + 1; x < TREN.x1; x += 2.3) for (const s of [-1, 1]) o.cil(0.42, 0.42, 0.2, 8, 0x1a1a1e, x, 0.42, z + s * 1.3, Math.PI / 2);
  TREN.grupo = o.hecha(); TREN.grupo.visible = false; MOTOR.escena.add(TREN.grupo);
  // choca solo mientras está (abierto = no choca)
  TREN.solido = solido(TREN.x0, z - 1.5, TREN.x1, z + 1.5, 3.2, 'tren'); TREN.solido.abierto = true;
  // la rejilla del colector: un hueco en el suelo con barrotes y una farola roja
  const r = SALIDAS.find(s => s.id === 'rejilla'), g = new Obra();
  g.caja(2.2, 0.06, 2.2, 0x0a0c10, r.x, 0.05, r.z); for (let i = -2; i <= 2; i++) g.caja(0.12, 0.08, 2.0, 0x5c6670, r.x + i * 0.42, 0.09, r.z);
  g.caja(0.18, 2.6, 0.18, 0x3a3f46, r.x + 1.6, 1.3, r.z - 1.2); g.caja(0.4, 0.4, 0.4, 0xd8303a, r.x + 1.6, 2.7, r.z - 1.2);
  MOTOR.escena.add(g.hecha());
}
// al empezar cada incursión: a qué hora llega el tren (entre el minuto 2:20 y el 5:20) y cuánto se queda
function preparaTren() {
  RAID.tren = { llega: entre(140, 320), dura: 120, esta: false, fase: 'espera', t: 0, aviso: false };
  if (TREN.grupo) { TREN.grupo.visible = false; TREN.solido.abierto = true; }
}
// ¿estás pegado al tren? (cualquier punto a lo largo de los vagones vale)
const juntoAlTren = J => J.x > TREN.x0 - 1 && J.x < TREN.x1 + 1 && Math.abs(J.z - TREN.z) < 3.4;
function avanzaTren(dt) {
  const T = RAID.tren; if (!T || RAID.tuto || !TREN.grupo) return;
  const g = TREN.grupo;
  if (T.fase === 'espera' && RAID.t >= T.llega) { T.fase = 'entra'; T.t = 0; g.visible = true; play('bocina'); avisa(tr('Bocina en la playa de vías: llega un tren de mercancías. Se va en dos minutos.'), 'info'); oyeRuido(48, TREN.z, 40); }
  if (T.fase === 'entra') { T.t += dt; const f = Math.min(1, T.t / TREN.entra); g.position.x = (1 - f) * (1 - f) * 70; if (f >= 1) { T.fase = 'para'; T.t = 0; T.esta = true; TREN.solido.abierto = false; if (JUG && JUG.vivo) desatasca(JUG, JUG.radio); } }
  if (T.fase === 'para') {
    T.t += dt;
    if (!T.aviso && T.t > T.dura - 20) { T.aviso = true; play('bocina'); avisa(tr('¡El tren se va en 20 segundos!'), 'malo'); }
    if (T.t >= T.dura) { T.fase = 'sale'; T.t = 0; T.esta = false; TREN.solido.abierto = true; avisa(tr('El tren se ha ido. Hasta otro día.'), 'info'); }
  }
  if (T.fase === 'sale') { T.t += dt; const f = Math.min(1, T.t / TREN.sale); g.position.x = -f * f * 80; if (f >= 1) { T.fase = 'fuera'; g.visible = false; } }
}

/* ---------- soltar la mochila (para la rejilla) ---------- */
// la mochila cae al suelo con todo lo de dentro: queda un montón que se puede registrar (y volver a ponérsela desde ahí)
function sueltaMochila() {
  const m = RAID.eq.mochila; if (!m) return;
  contenedor('cadaver', JUG.x + entre(-0.5, 0.5), JUG.z + entre(-0.5, 0.5), { nombre: 'Tu mochila', cosas: [sinSitio(m), ...RAID.mochila.filter(Boolean).map(sinSitio)], abierto: true });
  RAID.eq.mochila = null; RAID.mochila = []; play('select'); avisa(tr('Has soltado la mochila. Ahora solo llevas lo que cabe en las manos.'), 'info');
}

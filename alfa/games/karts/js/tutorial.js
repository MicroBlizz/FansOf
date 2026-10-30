// Fans of Karts · EL TUTORIAL: en el circuito de La Madriguera (pista-tutorial.js) un cartel arriba va diciendo qué hacer, paso a paso,
// y pasa al siguiente cuando lo has hecho (acelerar, girar, turbo, monedas, objeto, derrape, salto). Los rivales van despacito.
// Los textos cambian si juegas con los dedos o con el teclado.
'use strict';

const TUTO = { activo: false, paso: 0, t: 0, bien: 0, giro: 0, tenia: false };
const PASOS_TUTO = [      // lo que hay que hacer en cada paso: una frase corta (cabe en una línea, arriba, sobre el cielo)
  { dedos: 'Acelera solo. FRENO para frenar', teclas: 'Mantén ARRIBA o W para acelerar', ok: k => k.v > 55 },
  { dedos: 'Gira con los botones < y >', teclas: 'Gira con IZQUIERDA y DERECHA', ok: k => Math.abs(k.c.giro) > 0.4 && (TUTO.giro += 1 / 60) > 0.8 },
  { dedos: 'Pisa las flechas naranjas', teclas: 'Pisa las flechas naranjas', ok: k => k.tTurbo > 0 && k.fTurbo === AJ.turbo },
  { dedos: 'Coge 3 monedas de oro', teclas: 'Coge 3 monedas de oro', ok: k => k.monedas >= 3 },
  { dedos: 'Coge un regalo y toca OBJETO', teclas: 'Coge un regalo y pulsa X',
    ok: k => { const usa = TUTO.tenia && !k.objeto && !(k.tRuleta > 0); TUTO.tenia = !!k.objeto; return usa; } },
  { dedos: 'En curva: mantén DERRAPE y suelta', teclas: 'En curva: mantén ESPACIO y suelta', ok: k => k.tTurbo > 0 && k.fTurbo === 1.3 },
  { dedos: 'Salta por la rampa amarilla', teclas: 'Salta por la rampa amarilla', ok: k => k.z > 6 && !k.botado },
];
// al empezar una carrera: el tutorial va solo en su pista; allí los rivales corren mucho menos y son dos vueltas
function tutoPrepara(C, def) {
  TUTO.activo = def.id === 'tutorial' && !C.pvp;
  if (!TUTO.activo) return;
  Object.assign(TUTO, { paso: 0, t: 0, bien: 0, giro: 0, tenia: false });
  C.vueltas = 2;
  for (const k of C.karts) if (k.ia && !k.esJugador) k.ia.nivel *= 0.68;
}
function tutoMira(C, dt) {
  TUTO.t += dt; if (TUTO.bien > 0) TUTO.bien -= dt;
  const k = C.jugador, p = PASOS_TUTO[TUTO.paso];
  if (!p || C.estado !== 'corre' || TUTO.bien > 0.6) return;
  if (p.ok(k)) {
    TUTO.paso++; TUTO.bien = 1.0; TUTO.giro = 0; play('select');
    if (TUTO.paso >= PASOS_TUTO.length) { try { localStorage.setItem('fok-tutorial', '1'); } catch (_) { /* sin guardar */ } }
  }
}
// el aviso: una tira fina arriba, sobre el cielo (no tapa la carretera). Pasos hechos a la izquierda; en verde cuando aciertas.
function pintaTuto() {
  const C = CARRERA, n = PASOS_TUTO.length, x = HM + 4, w = PW - HM - 52 - x, y = 36, bien = TUTO.bien > 0;
  let texto;
  if (C.estado === 'cuenta') texto = tr('Tutorial: haz lo que diga aquí');
  else if (bien) texto = tr('¡Bien hecho!');
  else if (TUTO.paso >= n) texto = tr('¡Ya sabes jugar! Acaba la carrera');
  else { const p = PASOS_TUTO[TUTO.paso]; texto = tr(ENT.tactil ? p.dedos : p.teclas); }
  lx.fillStyle = bien ? 'rgba(20,90,40,0.78)' : 'rgba(28,16,40,0.72)'; lx.fillRect(x, y, w, 12);
  lx.fillStyle = bien ? '#5ef27a' : '#ffcb3d'; lx.fillRect(x, y + 11, w, 1);
  for (let i = 0; i < n; i++) { lx.fillStyle = i < TUTO.paso ? '#5ef27a' : i === TUTO.paso && (RELOJ * 4) % 1 < 0.6 ? '#ffcb3d' : '#4a3a6a'; lx.fillRect(x + 3 + (i % 4) * 4, y + 2 + (i >> 2) * 4, 3, 3); }
  lx.save(); lx.beginPath(); lx.rect(x + 20, y, w - 22, 12); lx.clip();
  // si no cabe (móvil tumbado, con los botones a los lados), con la letra pequeña; y si aún no cabe, va pasando
  if (anchoTexto(texto) <= w - 24) escribe(lx, texto, x + 21, y + 2, bien ? '#ffffff' : '#ffe9a8', '#1c1028');
  else { const m = anchoMini(texto.toUpperCase()), sobra = m - (w - 24), o = sobra > 0 ? Math.round((Math.sin(RELOJ * 0.9) * 0.5 + 0.5) * sobra) : 0; mini(lx, texto.toUpperCase(), x + 21 - o, y + 3, bien ? '#ffffff' : '#ffe9a8', '#1c1028'); }
  lx.restore();
}
function tutoHecho() { try { return localStorage.getItem('fok-tutorial') === '1'; } catch (_) { return false; } }
function empiezaTutorial() {
  copaFin();
  PANT.pista = PISTAS.findIndex(p => p.id === 'tutorial');
  empiezaCarga();
}

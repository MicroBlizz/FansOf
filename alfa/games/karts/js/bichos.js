// Fans of Karts · BICHOS DE VERDAD: mariposas que revolotean junto a la pista (en el mundo, no pintadas encima de la pantalla: crecen
// al acercarte, baten las alas y se apartan cuando pasas) y la MechaVaca en el suelo, bailando como mascota en algunas pistas.
'use strict';

// ---------- mariposas ----------
const COLORES_MARIPOSA = [['#ffcb3d', '#ff8a1f'], ['#ff9ad0', '#ff5c8a'], ['#22e3ff', '#2f7ad8'], ['#ffffff', '#c8c0e0'], ['#c35cff', '#7a2ad6']];
// n mariposas repartidas por la vuelta, a los lados de la pista (en grupitos, como si hubiera flores)
function mariposasEn(P, n, semilla = 3) {
  const az = azarDe(semilla * 131 + 7), l = [];
  for (let g = 0; g < n; g += 3) {
    const f = az(), lado = (az() < 0.5 ? -1 : 1) * (enVia(P, f).ancho / 2 + 6 + az() * 22), p = enVia(P, f, lado);
    for (let i = 0; i < 3 && g + i < n; i++) l.push({ bx: p.x + (az() - 0.5) * 14, by: p.y + (az() - 0.5) * 14, x: 0, y: 0, z: 0, fase: az() * TAU, vel: 0.6 + az() * 0.6, col: COLORES_MARIPOSA[(az() * COLORES_MARIPOSA.length) | 0], susto: 0 });
  }
  return l;
}
// dónde va cada una ahora: vueltas a su flor con giros nerviosos; si un kart pasa cerca, sube y se aparta
function mueveMariposas(P, karts) {
  const t = RELOJ;
  for (const m of P.mariposas) {
    let susto = 0;
    if (karts) for (const k of karts) { const d = Math.hypot(k.x - m.bx, k.y - m.by); if (d < 26) susto = Math.max(susto, 1 - d / 26); }
    m.susto += (susto - m.susto) * 0.08;
    const a = t * m.vel + m.fase, r = 6 + m.susto * 18;
    m.x = m.bx + Math.cos(a) * r + Math.sin(a * 2.7) * 2.5; m.y = m.by + Math.sin(a * 1.3) * r + Math.cos(a * 3.1) * 2.5;
    m.z = 4 + Math.sin(a * 1.9) * 2 + Math.abs(Math.sin(a * 5)) * 1.2 + m.susto * 12;
  }
}
// una mariposa: cuerpo oscuro y cuatro alas que se abren y se cierran (de cerca, más detalle; de lejos no se pinta: serían puntos sueltos)
function pintaMariposa(m, sx, sy, e) {
  if (e < 0.45) return;
  const t = RELOJ * (14 + m.vel * 6) + m.fase, ab = Math.abs(Math.sin(t)), s = Math.max(1, e * 1.5);
  const cx = Math.round(sx), cy = Math.round(sy - m.z * e), wa = Math.max(1, Math.round(s * 1.6 * (0.25 + ab * 0.75))), ha = Math.max(1, Math.round(s * 1.3)), hb = Math.max(1, Math.round(s * 0.9));
  if (e > 1) pintaSombra(sx, sy, 3 * e);
  lx.fillStyle = '#1c1028';
  lx.fillRect(cx - wa - 1, cy - ha - 1, wa * 2 + 2, ha + hb + 2);
  lx.fillStyle = m.col[0]; lx.fillRect(cx - wa, cy - ha, wa, ha); lx.fillRect(cx + 1, cy - ha, wa, ha);
  lx.fillStyle = m.col[1]; lx.fillRect(cx - Math.max(1, wa - 1), cy, Math.max(1, wa - 1), hb); lx.fillRect(cx + 1, cy, Math.max(1, wa - 1), hb);
  if (wa > 2) { lx.fillStyle = '#ffffff'; lx.fillRect(cx - wa + 1, cy - ha + 1, 1, 1); lx.fillRect(cx + wa - 1, cy - ha + 1, 1, 1); }
  lx.fillStyle = '#1c1028'; lx.fillRect(cx, cy - ha - 1, 1, ha + hb + 1);
  if (s > 2) { lx.fillRect(cx - 1, cy - ha - 2, 1, 1); lx.fillRect(cx + 1, cy - ha - 2, 1, 1); }
}
function apuntaMariposas(P, karts) {
  if (!P.mariposas) return;
  mueveMariposas(P, karts);
  for (const m of P.mariposas) apunta(m.x, m.y, pintaMariposa, m, 3);
}

// ---------- la MechaVaca en el suelo (sin los cohetes): se fotografía desde 16 lados para poder girar mientras baila ----------
COSAS.vacaSuelo = Object.assign({}, COSAS.mechavaca, { angs: 16, bajo: 1.2, piezas: COSAS.mechavaca.piezas.filter(q => q.m !== 'fuego') });
// una MechaVaca bailando junto a la pista (y su cartel)
function vacaBailaEn(P, l, u, fuera) {
  const f = P.f(u), v = enVia(P, f), p = enVia(P, f, Math.sign(fuera) * (v.ancho / 2 + Math.abs(fuera)));
  l.push({ x: p.x, y: p.y, fig: figCosa('vacaSuelo'), r: 7, flota: 0, fase: u, baila: true, mira: v.ang + (fuera > 0 ? -Math.PI / 2 : Math.PI / 2) });
}
// cómo se mueve: gira a un lado y al otro, da saltitos y de vez en cuando una vuelta entera
function pintaVaca(c, sx, sy, e) {
  const t = RELOJ + c.fase, vuelta = (t % 9) < 1 ? (t % 9) * TAU : 0;
  const salto = Math.abs(Math.sin(t * 3.4)) * 2.2 * e;
  if (e > 0.5) pintaSombra(sx, sy, c.fig.def.medio * (1.5 - salto / (12 * e)) * e);
  const rel = c.mira + Math.sin(t * 1.7) * 0.7 + vuelta - Math.atan2(c.y - CAM.y, c.x - CAM.x);
  c.fig.pinta(lx, Math.round(sx), Math.round(sy - salto), e, BASE_COSA, -rel);
}

// ---------- dónde hay mariposas y MechaVaca (se añade a lo que pone cada pista) ----------
const BICHOS = { tutorial: { mariposas: 30 }, parque: { mariposas: 18, vaca: [[5.5, -40, ['MECHAVACA', 'NO DAR DE COMER']]] }, selva: { mariposas: 24 }, playa: { mariposas: 0, vaca: [[9.5, 40, ['MECHAVACA', 'DE VACACIONES']]] }, estadio: { vaca: [[2.5, 42, ['MECHAVACA', 'MASCOTA OFICIAL']]] } };
for (const def of PISTAS) {
  const B = BICHOS[def.id] || (def.base && BICHOS[def.base] && BICHOS[def.base].mariposas && { mariposas: BICHOS[def.base].mariposas }); if (!B) continue;      // las premium: solo las mariposas de su pista
  const original = def.cosas;
  def.cosas = P => {
    const l = original ? original(P) : [];
    if (B.mariposas) P.mariposas = mariposasEn(P, B.mariposas, def.id.length);
    for (const [u, fuera, txt] of B.vaca || []) { vacaBailaEn(P, l, u, fuera); cartelEn(P, l, txt, u + 0.5, fuera > 0 ? fuera + 14 : fuera - 14, '#ff8fc8', '#22212c'); }
    return l;
  };
}

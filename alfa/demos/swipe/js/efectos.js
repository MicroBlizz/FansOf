// Fans of Swipe · EFECTOS: lo que se ve y se oye al pasar algo (números que saltan, sacudidas, destellos, píxeles que vuelan,
// el aviso de un combo). Las reglas (js/combate.js) llaman a swFx con lo que ha pasado; aquí se decide cómo se nota.
'use strict';
const SW_FX = { nums: [], parts: [], temblor: 0, flashE: 0, golpeE: 0, rojo: 0, avisos: [], mano: 0, manoIzq: 0, hielo: 0,
  frenesi: 0, estallido: 0, onda: 0, paron: 0, brasas: [], humo: 0, calor: 0 };
// dónde está cada cosa en pantalla (lo rellena js/pintar.js al medir)
const SW_POS = { enemigo: [270, 330], vida: [80, 900], escudo: [230, 900], caos: [360, 900], oro: [480, 28] };
function swNum(txt, x, y, col, grande = false) { SW_FX.nums.push({ txt, x: x + rand(-14, 14), y, col, t: 0, vida: grande ? 1.3 : 1, grande }); }
function swParticulas(x, y, n, cols, fuerza = 260) {
  for (let i = 0; i < n; i++) { const a = rand(0, Math.PI * 2), v = rand(fuerza * 0.4, fuerza); SW_FX.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, t: 0, vida: rand(0.4, 0.8), col: pick(cols), lado: pick([6, 6, 9]) }); }
}
function swAviso(txt, col = '#ffd84a') { SW_FX.avisos.push({ txt, col, t: 0 }); }
function swFx(que, d = {}) {
  const [ex, ey] = SW_POS.enemigo;
  switch (que) {
    case 'golpe':
      if (d.d > 0) { const fr = SW_FX.frenesi > 0; swNum('-' + d.d, ex, ey - 40, fr ? '#ffb13d' : '#ffffff', fr || d.d >= 12); if (fr) { SW_FX.paron = 0.06; swParticulas(ex, ey, 14, ['#ff5a1f', '#ffb13d', '#fff6a0'], 420); } SW_FX.flashE = 1; SW_FX.golpeE = 1; SW_FX.temblor = Math.max(SW_FX.temblor, Math.min(14, 4 + d.d * 0.6)); swParticulas(ex, ey, 10 + Math.min(14, d.d), ['#ffffff', '#ffd84a', '#ff8a2a']); play('swGolpe'); }
      if (d.para) { swNum(tr('Bloquea {n}', { n: d.para }), ex, ey - 90, '#9fd4ff'); play('swEscudo'); }
      SW_FX.mano = 1; break;
    case 'critico': swAviso(tr('¡CRÍTICO!'), '#ff5a4f'); break;
    case 'bloqueo': swNum(tr('Bloqueas {n}', { n: d.para }), SW_POS.escudo[0], SW_POS.escudo[1] - 30, '#9fd4ff'); play('swEscudo'); break;
    case 'herida': swNum('-' + d.d, SW_POS.vida[0], SW_POS.vida[1] - 30, '#ff5a4f', d.d >= 10); SW_FX.rojo = 1; SW_FX.temblor = Math.max(SW_FX.temblor, 10); play('swDano'); break;
    case 'escudo': swNum('+' + d.n, SW_POS.escudo[0], SW_POS.escudo[1] - 30, '#9fd4ff'); SW_FX.manoIzq = 1; play('swEscudo'); break;
    case 'cura': swNum('+' + d.n, SW_POS.vida[0], SW_POS.vida[1] - 30, '#6ee36a'); swParticulas(SW_POS.vida[0], SW_POS.vida[1], 8, ['#6ee36a', '#c8ff9a'], 140); play('swCura'); break;
    case 'caos': if (d.n > 0) { swNum('+' + d.n, SW_POS.caos[0], SW_POS.caos[1] - 30, '#ffb13d'); play('swCaos'); } break;
    case 'veneno': swNum(tr('+{n} veneno', { n: d.n }), ex, ey - 60, '#9cff57'); swParticulas(ex, ey, 8, ['#9cff57', '#4fbf2a'], 120); break;
    case 'tickVeneno': swNum('-' + d.n, ex, ey - 20, '#9cff57'); SW_FX.golpeE = 0.6; break;
    case 'congela': SW_FX.hielo = 1; swAviso(tr('¡CONGELADO!'), '#9fe8ff'); swParticulas(ex, ey, 18, ['#ffffff', '#9fe8ff', '#4fb8ff'], 200); play('swHielo'); break;
    case 'sigueCongelado': swNum(tr('Congelado'), ex, ey - 80, '#9fe8ff'); break;
    case 'oro': swNum('+' + d.n, SW_POS.oro[0], SW_POS.oro[1] + 30, '#ffd84a'); swParticulas(SW_POS.oro[0], SW_POS.oro[1], 6, ['#ffd84a', '#ffb13d'], 120); play('swMoneda'); break;
    case 'robaOro': swNum('-' + d.n, SW_POS.oro[0], SW_POS.oro[1] + 30, '#ff5a4f'); swAviso(tr('¡Te roba {n} de oro!', { n: d.n }), '#ffd84a'); play('swMoneda'); break;
    case 'enemigoEscudo': swNum('+' + d.n, ex + 70, ey - 60, '#9fd4ff'); play('swEscudo'); break;
    case 'enemigoCura': swNum('+' + d.n, ex, ey - 60, '#6ee36a'); play('swCura'); break;
    case 'ataqueEnemigo': SW_FX.golpeE = -1; break;
    case 'combo': swAviso(tr('¡COMBO! {n}', { n: tr(d.nombre) }), '#ffd84a'); play('swCombo'); break;
    case 'reliquia': swAviso(tr(SW_RELIQUIAS[d.id].nombre), '#ffd84a'); play('swReliquia'); break;
    case 'pata': swAviso(tr('¡La pata de la suerte te salva!'), '#6ee36a'); play('swReliquia'); break;
    case 'carta': swAviso(tr('Carta nueva al mazo'), '#ffffff'); play('swCofre'); break;
    case 'mejora': swAviso(tr('Carta mejorada'), '#6ee36a'); play('swReliquia'); break;
    case 'quita': swAviso(tr('Carta triturada'), '#ffffff'); play('swGolpe'); break;
  }
}
// el FRENESÍ: al entrar, estallido (destello, onda de choque, parón, sacudida y el letrero gigante); mientras dura, la pantalla arde
function swFrenesiEntra() {
  Object.assign(SW_FX, { frenesi: 1, estallido: 1, onda: 0.001, paron: 0.22, temblor: 22, calor: 0 });
  const [ex, ey] = SW_POS.enemigo;
  swParticulas(270, SW_V.cartaCY, 70, ['#ff3a1a', '#ff8a2a', '#ffd84a', '#fff6a0'], 620);
  swParticulas(ex, ey, 30, ['#ff8a2a', '#ffd84a'], 400);
  play('swFrenesi');
  if (navigator.vibrate) try { navigator.vibrate([40, 30, 90]); } catch (e) { /* sin vibración */ }
}
function swFrenesiSale() {
  if (!SW_FX.frenesi) return;
  SW_FX.frenesi = 0; SW_FX.humo = 1;
  swAviso(tr('Frenesí perdido'), '#b8a8c8'); play('swApaga');
}
function swFxAvanza(dt) {
  const F = SW_FX;
  if (F.paron > 0) { F.paron -= dt; dt *= 0.08; }   // el parón de impacto: casi todo se congela un instante
  if (F.estallido > 0) F.estallido = Math.max(0, F.estallido - dt * 0.9);
  if (F.onda > 0) { F.onda += dt * 1.8; if (F.onda > 1) F.onda = 0; }
  F.humo = Math.max(0, F.humo - dt * 1.2);
  F.calor = F.frenesi ? Math.min(1, F.calor + dt * 2) : Math.max(0, F.calor - dt * 2);
  // brasas que suben mientras arde
  if (F.frenesi && F.brasas.length < 90) for (let i = 0; i < 3; i++) F.brasas.push({ x: rand(0, 540), y: SW_V.H + 10, vy: rand(-260, -120), vx: rand(-30, 30), t: 0, vida: rand(1.2, 2.6), lado: pick([6, 6, 9, 12]), col: pick(['#ff5a1f', '#ff8a2a', '#ffd84a']) });
  F.brasas = F.brasas.filter(b => { b.t += dt; b.y += b.vy * dt; b.x += b.vx * dt + Math.sin(b.t * 6 + b.y * 0.02) * 0.8; return b.t < b.vida; });
  F.nums = F.nums.filter(n => (n.t += dt) < n.vida);
  F.parts = F.parts.filter(p => { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 700 * dt; return p.t < p.vida; });
  F.avisos = F.avisos.filter(a => (a.t += dt) < 1.5);
  F.temblor = Math.max(0, F.temblor - dt * 40); F.flashE = Math.max(0, F.flashE - dt * 6); F.rojo = Math.max(0, F.rojo - dt * 2.5);
  F.golpeE = F.golpeE > 0 ? Math.max(0, F.golpeE - dt * 5) : Math.min(0, F.golpeE + dt * 4);
  F.mano = Math.max(0, F.mano - dt * 4); F.manoIzq = Math.max(0, F.manoIzq - dt * 4); F.hielo = Math.max(0, F.hielo - dt * 1.5);
}
function swFxLimpia() { Object.assign(SW_FX, { nums: [], parts: [], avisos: [], temblor: 0, flashE: 0, golpeE: 0, rojo: 0, mano: 0, manoIzq: 0, hielo: 0, frenesi: 0, estallido: 0, onda: 0, paron: 0, brasas: [], humo: 0, calor: 0 }); }

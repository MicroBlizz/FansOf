// Fans of Swipe · EFECTOS: lo que se ve y se oye al pasar algo (números que saltan, sacudidas, destellos, píxeles que vuelan,
// el aviso de un combo). Las reglas (js/combate.js) llaman a swFx con lo que ha pasado; aquí se decide cómo se nota.
'use strict';
const SW_FX = { nums: [], parts: [], temblor: 0, flashE: 0, golpeE: 0, rojo: 0, avisos: [], mano: 0, manoIzq: 0, hielo: 0 };
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
      if (d.d > 0) { swNum('-' + d.d, ex, ey - 40, '#ffffff', d.d >= 12); SW_FX.flashE = 1; SW_FX.golpeE = 1; SW_FX.temblor = Math.max(SW_FX.temblor, Math.min(14, 4 + d.d * 0.6)); swParticulas(ex, ey, 10 + Math.min(14, d.d), ['#ffffff', '#ffd84a', '#ff8a2a']); play('swGolpe'); }
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
function swFxAvanza(dt) {
  const F = SW_FX;
  F.nums = F.nums.filter(n => (n.t += dt) < n.vida);
  F.parts = F.parts.filter(p => { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 700 * dt; return p.t < p.vida; });
  F.avisos = F.avisos.filter(a => (a.t += dt) < 1.5);
  F.temblor = Math.max(0, F.temblor - dt * 40); F.flashE = Math.max(0, F.flashE - dt * 6); F.rojo = Math.max(0, F.rojo - dt * 2.5);
  F.golpeE = F.golpeE > 0 ? Math.max(0, F.golpeE - dt * 5) : Math.min(0, F.golpeE + dt * 4);
  F.mano = Math.max(0, F.mano - dt * 4); F.manoIzq = Math.max(0, F.manoIzq - dt * 4); F.hielo = Math.max(0, F.hielo - dt * 1.5);
}
function swFxLimpia() { Object.assign(SW_FX, { nums: [], parts: [], avisos: [], temblor: 0, flashE: 0, golpeE: 0, rojo: 0, mano: 0, manoIzq: 0, hielo: 0 }); }

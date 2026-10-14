// Fans of Rumble: Tácticas · ESPECTÁCULO (técnicas): la animación de cada técnica y del ataque normal. Cada una tiene:
//   antes(h, obs)   lo que pasa antes de golpear (entrada, carrera, salto…) · golpe(h, ob, g) el impacto en cada objetivo
//   entre(h, obs, g) entre golpes (técnicas de varios golpes) · despues(h, obs) la vuelta a su sitio
// El daño, la cura y los números los sigue poniendo combate.js: aquí solo se ve.
'use strict';
const centroDe = u => [u.x + u.dx, u.y + (u.dy || 0) - alto(u) * 0.48];
const medio = l => [l.reduce((s, u) => s + u.x, 0) / l.length, l.reduce((s, u) => s + u.y, 0) / l.length];
// el héroe corre hasta el objetivo (se queda a su derecha) dejando estela, y vuelve
async function correA(h, ob, col, seg = 0.22, sep = 74) {
  estela(h, col); play('blink');
  await mover(h, ob.x + sep - h.x, ob.y - h.y, seg, entra);
}
async function volverA(h, seg = 0.32) { await volverCasa(h, seg, 40); sinEstela(h); }
const golpeLuz = (ob, col, r = 110, ang = rand(0.3, 1)) => { const [x, y] = centroDe(ob); tajoFx(x, y, col, ang, r); corteLuz(x, y, col, ang - 1.2, r * 1.6); nucleo(x, y, col, 70); };

const TEC_ANIM = {
  /* ---------- ataque normal: carrera con estela, tajo de luz ---------- */
  atacar: {
    antes: async (h, [ob]) => { await correA(h, ob, '#ffe58a', 0.18, 80); },
    golpe: (h, ob) => {   // corte de luz en diagonal, destello en estrella, franja que cruza la pantalla y un segundo tajo de remate
      const [x, y] = centroDe(ob), ang = rand(-0.75, -0.45);
      corteLuz(x, y, '#ffd36a', ang, 190, 0.34); tajoFx(x, y, '#ffe58a', ang + 2.2, 85, 0.26); nucleo(x, y, '#ffd36a', 80, 0.42);
      franja(y, '#ffb347', 0.3); chispasLuz(x, y, '#ffe58a', Math.PI + 0.3, 16);
      setTimeout(() => B && corteLuz(x, y + 6, '#ffffff', -ang, 120, 0.22), 70);
    },
    despues: h => volverA(h, 0.26),
  },
  /* ---------- CrazyBunny ---------- */
  saltoCaos: {   // salta fuera de la pantalla y cae en medio de los enemigos
    antes: async (h, obs) => {
      await entradaTecnica(h, 'SALTO CAÓTICO', '#ff9a3c');
      aura(h, '#ff9a3c', 0.5); play('jump'); await espera(250);
      const [mx, my] = medio(obs);
      estela(h, '#ffb347'); await mover(h, (mx - h.x) * 0.5, -900, 0.32, sale); sinEstela(h);
      h.dx = mx - h.x; h.dy = -900; oscuro(0.9, 0.45);
      pilar(mx, my, '#ffb347', 60, 0.7); await espera(380);
      await mover(h, mx - h.x, my - h.y, 0.13, entra);
      play('slam'); play('boom'); B.temblor = 12; parada(0.14); destello('#fff2c8', 0.39, 0.3);
      grieta(mx, my, '#ffb347'); anillo(mx, my, '#ff9a3c', 260, 0.6, 10); rayos(mx, my - 40, '#ffb347', 300, 22, 0.6, 0.06); chispas(mx, my - 10, ['#ffb347', '#ff7a1a', '#fff'], 30, 320);
      await espera(120);
    },
    golpe: (h, ob) => { const [x, y] = centroDe(ob); rayos(x, y, '#ff9a3c', 160, 12, 0.4); },
    despues: async h => { estela(h, '#ffb347'); await mover(h, 0, 0, 0.42, suaveFx); h.dy = 0; sinEstela(h); },
  },
  rabia: {   // llamas rojas en todo el grupo
    antes: async (h, obs) => {
      await entradaTecnica(h, 'RABIA', '#ff4b5c');
      play('hype'); destello('#ff2a2a', 0.19, 0.4); B.temblor = 6;
      for (const u of obs) { aura(u, '#ff4b5c', 1.2); const [x, y] = centroDe(u); rayos(x, y, '#ff6a5a', 160, 14, 0.7); }
      textoFx('¡RABIA!', 270, 300, '#ff6a5a', 70); await espera(700);
    },
  },
  /* ---------- EpicChampion ---------- */
  tajoEpico: {   // carrera dorada y una media luna gigante
    antes: async (h, [ob]) => {
      await entradaTecnica(h, 'TAJO ÉPICO', '#ffcb3d');
      aura(h, '#ffcb3d', 0.5); const [x] = centroDe(h); pilar(x, h.y, '#ffe58a', 50, 0.5); await espera(280);
      await correA(h, ob, '#ffcb3d', 0.16, 90); velocidad(ob.y - 60, '#ffe58a', 0.4);
    },
    golpe: (h, ob) => {
      const [x, y] = centroDe(ob); play('slam'); tajoFx(x, y, '#ffcb3d', 0.5, 170, 0.45); tajoFx(x, y, '#fff6d8', 2.1, 130, 0.4);
      rayos(x, y, '#ffcb3d', 320, 24, 0.6, 0.06); destello('#fff2b0', 0.3, 0.3); parada(0.16); B.temblor = 10;
    },
    despues: h => volverA(h),
  },
  gritoHeroico: {   // ondas doradas y escudos en todo el grupo
    antes: async (h, obs) => {
      await entradaTecnica(h, 'GRITO HEROICO', '#ffcb3d');
      play('horn'); const [x, y] = centroDe(h);
      for (let k = 0; k < 3; k++) { anillo(x, h.y, '#ffcb3d', 220 + k * 60, 0.7); rayos(x, y, '#ffe58a', 200, 18, 0.6); await espera(140); }
      for (const u of obs) escudo(u, '#ffcb3d', 1.2); play('shield'); await espera(600);
    },
  },
  /* ---------- StreamKing ---------- */
  donacion: {   // lluvia de monedas y columnas de luz que curan
    antes: async (h, obs) => {
      await entradaTecnica(h, 'DONACIÓN', '#c084fc');
      play('crown'); for (const u of obs) lluvia(u.x, 90, 'moneda', '#ffcb3d', 7, 1.2);
      await espera(500); play('heal');
      for (const u of obs) { pilar(u.x, u.y, '#8be06a', 55, 0.9); lluvia(u.x, 60, 'luz', '#d6ffc2', 5, 1); }
      await espera(400);
    },
  },
  baneo: {   // un relámpago del cielo con el martillo de baneo
    antes: async (h, [ob]) => {
      await entradaTecnica(h, 'BANEO', '#c084fc');
      aura(h, '#c084fc', 0.5); await espera(300); oscuro(0.6, 0.5);
    },
    golpe: (h, ob) => {
      const [x, y] = centroDe(ob); play('zap'); rayoCielo(x, ob.y - 10, '#d08bff', 0.5); rayoCielo(x + 10, ob.y - 10, '#ffffff', 0.25);
      rayos(x, y, '#c084fc', 260, 20, 0.55); destello('#e6c8ff', 0.28, 0.25); textoFx('BAN', x, y - alto(ob) * 0.6, '#ff6aa8', 54, 0.8); parada(0.12); B.temblor = 8;
    },
  },
  /* ---------- NecroLord ---------- */
  drenaje: {   // las almas del enemigo vuelan al NecroLord
    antes: async (h, [ob]) => {
      await entradaTecnica(h, 'DRENAJE', '#5ef2c0');
      oscuro(1.4, 0.55); aura(h, '#5ef2a0', 1.3); play('wail'); await espera(300);
    },
    golpe: (h, ob) => {
      const [x, y] = centroDe(ob), [hx, hy] = centroDe(h);
      anillo(ob.x, ob.y, '#5ef2a0', 150, 0.6); rayos(x, y, '#5ef2a0', 220, 16, 0.55);
      for (let i = 0; i < 6; i++) setTimeout(() => B && proyectil(x + rand(-20, 20), y + rand(-20, 20), hx, hy, 0.5, 'alma', '#5ef2c0', rand(40, 120)), i * 70);
    },
  },
  levantar: {   // columna de luz sobre el caído
    antes: async (h, obs) => {
      await entradaTecnica(h, 'LEVANTAR CAÍDOS', '#5ef2c0');
      for (const u of obs) { pilar(u.x, u.y, '#c8ffe0', 70, 1.3); lluvia(u.x, 70, 'luz', '#5ef2c0', 8, 1.2); } play('revive'); await espera(700);
    },
  },
  /* ---------- CyberMarine ---------- */
  rafaga: {   // dos ráfagas de balas trazadoras
    antes: async (h, obs) => { await entradaTecnica(h, 'RÁFAGA', '#22e3ff'); },
    golpe: (h, ob, g) => {
      const [hx, hy] = centroDe(h), [x, y] = centroDe(ob); nucleo(hx - 30, hy, '#ffe14d', 50, 0.15);
      for (let i = 0; i < 5; i++) setTimeout(() => B && proyectil(hx - 30, hy + rand(-6, 6), x + rand(-14, 14), y + rand(-18, 18), 0.12, 'bala', '#ffe14d'), i * 45);
      setTimeout(() => B && rayos(x, y, '#ffe14d', 150, 12, 0.35), 160); play('gun');
    },
    entre: async () => { await espera(260); },
  },
  plasma: {   // cúpulas de plasma en todo el grupo
    antes: async (h, obs) => {
      await entradaTecnica(h, 'ESCUDO PLASMA', '#22e3ff');
      play('plasma'); const [x, y] = centroDe(h); rayos(x, y, '#22e3ff', 220, 18, 0.5);
      for (const u of obs) { escudo(u, '#22e3ff', 1.3); anillo(u.x, u.y, '#22e3ff', 110, 0.6); } play('shield'); await espera(700);
    },
  },
  /* ---------- MemeLord ---------- */
  ruleta: {
    antes: async h => { await entradaTecnica(h, 'RULETA RNG', '#a3e635'); fx({ t: 'ruleta', dur: 1.4 }); play('roll'); await espera(1250); destello('#ffffff', 0.22, 0.2); },
  },
  stonks: {   // la gráfica sube y llueve dinero
    antes: async (h, [ob]) => {
      await entradaTecnica(h, 'STONKS', '#a3e635');
      const [x, y] = centroDe(h); proyectil(x, y, x - 120, y - 260, 0.45, 'moneda', '#a3e635', 0); textoFx('STONKS', 270, 280, '#a3e635', 64, 0.9); play('hype'); await espera(450);
    },
    golpe: (h, ob) => { const [x, y] = centroDe(ob); rayoCielo(x, ob.y, '#a3e635', 0.4); rayos(x, y, '#a3e635', 230, 18, 0.5); lluvia(ob.x, 120, 'moneda', '#ffcb3d', 10, 1.1); parada(0.08); },
  },
  /* ---------- ProGamer ---------- */
  combo: {   // tres tajos rapidísimos en ángulos distintos
    antes: async (h, [ob]) => { await entradaTecnica(h, 'COMBO X3', '#4ade80'); await correA(h, ob, '#4ade80', 0.13, 70); },
    golpe: (h, ob, g) => {
      const [x, y] = centroDe(ob), cols = ['#4ade80', '#22e3ff', '#ffe58a'];
      tajoFx(x, y, cols[g], [0.4, 2.4, 1.3][g], 120, 0.3); rayos(x, y, cols[g], 180 + g * 50, 14, 0.4); velocidad(y, cols[g], 0.3);
      textoFx('x' + (g + 1), x + 60, y - 80, cols[g], 44 + g * 8, 0.5); parada(0.06 + g * 0.03); h.dx += g % 2 ? 14 : -14;
    },
    entre: async () => { await espera(170); },
    despues: h => volverA(h),
  },
  energetica: {   // rayos amarillos y velocidad en todo el grupo
    antes: async (h, obs) => {
      await entradaTecnica(h, 'ENERGÉTICA', '#4ade80');
      play('levelup'); for (const u of obs) { const [x] = centroDe(u); rayoCielo(x, u.y, '#ffe14d', 0.35); aura(u, '#ffe14d', 1.1); velocidad(u.y - 40, '#ffe14d', 0.8); }
      destello('#fff3a0', 0.19, 0.25); await espera(700);
    },
  },
  /* ---------- VikingoPerdido ---------- */
  hachazo: {   // salta muy alto y parte el suelo
    antes: async (h, [ob]) => {
      await entradaTecnica(h, 'HACHAZO', '#d6a96a');
      aura(h, '#ffb347', 0.4); play('jump');
      estela(h, '#ffd08a'); await mover(h, ob.x + 60 - h.x, ob.y - h.y - 260, 0.32, sale); await espera(120);
      await mover(h, ob.x + 60 - h.x, ob.y - h.y, 0.1, entra); sinEstela(h);
    },
    golpe: (h, ob) => {
      const [x, y] = centroDe(ob); play('slam'); play('boom'); B.temblor = 13; parada(0.16); destello('#fff2c8', 0.33, 0.3);
      tajoFx(x, y, '#ffd08a', 1.57, 150, 0.4); grieta(ob.x, ob.y, '#ffb347'); anillo(ob.x, ob.y, '#ffb347', 220, 0.6); rayos(x, y, '#ffcf7a', 320, 22, 0.6, 0.06);
      chispas(ob.x, ob.y - 6, ['#ffb347', '#d6a96a', '#fff'], 26, 300);
    },
    despues: h => volverA(h, 0.4),
  },
  provocar: {   // anillos rojos que llaman la atención de los enemigos
    antes: async (h) => {
      await entradaTecnica(h, 'PROVOCAR', '#d6a96a');
      play('horn'); const [x, y] = centroDe(h);
      for (let k = 0; k < 3; k++) { anillo(h.x, h.y, '#ff4b5c', 140 + k * 40, 0.6); await espera(150); }
      aura(h, '#ff4b5c', 1); escudo(h, '#d6a96a', 1); textoFx('¡AQUÍ!', x, y - 120, '#ff6a5a', 50, 0.8); rayos(x, y, '#ff6a5a', 200, 16, 0.5); await espera(450);
    },
  },
  /* ---------- LaDirectora ---------- */
  corten: {   // bandas de cine, flash de cámara y «¡CORTEN!»
    antes: async h => {
      await entradaTecnica(h, '¡CORTEN!', '#ff6b9a');
      fx({ t: 'barras', dur: 1.3 }); play('clank'); await espera(350);
      destello('#ffffff', 0.47, 0.35); textoFx('¡CORTEN!', 270, 330, '#ff6b9a', 76, 0.9); B.temblor = 7; await espera(300);
    },
    golpe: (h, ob) => { const [x, y] = centroDe(ob); rayos(x, y, '#ff6b9a', 180, 14, 0.5); anillo(ob.x, ob.y, '#ffffff', 110, 0.5); },
  },
  remake: {   // columna dorada y estrellas sobre un aliado
    antes: async (h, [ob]) => {
      await entradaTecnica(h, 'REMAKE', '#ff6b9a');
      if (ob) { pilar(ob.x, ob.y, '#ffe58a', 75, 1.2); lluvia(ob.x, 80, 'luz', '#ffe58a', 10, 1.2); const [x, y] = centroDe(ob); rayos(x, y, '#ffe58a', 220, 18, 0.7); }
      play('heal'); await espera(650);
    },
  },
};

/* ---------- los ataques de los jefes también se lucen ---------- */
async function previaEnemigo(u, x) {
  if (!u.jefe) return;
  if (x.t === 'todos' || x.t === 'llamar' || x.t === 'aturdir') {
    oscuro(1.2, 0.5); aura(u, '#ff4b5c', 0.9); const [cx0, cy0] = centroDe(u); rayos(cx0, cy0, '#ff4b5c', 260, 20, 0.6); textoFx(x.n.toUpperCase(), 270, 300, '#ff8a8a', 44, 0.9); play('horn'); await espera(650);
  } else { aura(u, '#ff6a5a', 0.6); await espera(250); }
}
function golpeEnemigo(u, h, x) {
  const [cx0, cy0] = centroDe(h);
  if (x.t === 'todos') { pilar(h.x, h.y, u.jefe ? '#ff4b5c' : '#ff8a5a', 55, 0.7); lluvia(h.x, 90, u.key === 'necrolord' ? 'lapida' : 'papel', '#fff', 4, 0.7); }
  else if (u.jefe) { tajoFx(cx0, cy0, '#ff4b5c', rand(0.3, 2), 130, 0.4); parada(0.08); }
  else tajoFx(cx0, cy0, '#ff8a8a', rand(0.3, 2), 80, 0.28);
}

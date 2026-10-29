// Fans of Vikings · PINTAR EL COMBATE: la sede de Microblizz de fondo (moqueta azul de oficina y ventanales, en píxel),
// los enemigos arriba y tus fans abajo con su vida, la flecha del fan que actúa, los números de daño que saltan, el panel
// de habilidades (con su recarga), AUTO y HUIR, y la pantalla de victoria o derrota con el botín.
'use strict';
function vkPintaFondoCombate(c, t) {
  const W = VK_V.W, H = VK_V.H;
  // la pared con ventanales
  c.fillStyle = '#2c3e66'; c.fillRect(0, 0, W, 96);
  for (let x = 6; x < W; x += 42) {
    c.fillStyle = '#1a2440'; c.fillRect(x, 26, 34, 50);
    c.fillStyle = '#6fa8e8'; c.fillRect(x + 2, 28, 30, 46);
    c.fillStyle = '#9fd0ff'; c.fillRect(x + 2, 28, 30, 6);
    c.fillStyle = '#1a2440'; c.fillRect(x + 16, 28, 2, 46);
  }
  c.fillStyle = '#ffd34d'; c.fillRect(0, 92, W, 2);
  // la moqueta de cuadros
  for (let y = 96; y < H; y += 8) for (let x = 0; x < W; x += 8) {
    c.fillStyle = ((x + y) / 8) % 2 ? '#3a4f80' : '#34477a'; c.fillRect(x, y, 8, 8);
  }
  // el cartel de la planta
  vkCaja(c, W / 2 - 50, 6, 100, 16, '#c8d4ea', '#ffffff');
  vkTexto(W / 2, 14, tr('MICROBLIZZ · PLANTA {n}', { n: VK_C.planta + 1 }), { tam: 6, al: 'center', col: '#2c3e66', borde: false, negrita: true });
}
const vkPosEnemigo = (i, n) => ({ x: Math.round((VK_V.W * (i + 1)) / (n + 1)), y: Math.round(VK_V.H * 0.44) });
const vkPosFan = i => ({ x: 28 + i * 53, y: VK_V.H - 92 });

function vkPintaCombate(c, t) {
  const C = VK_C, W = VK_V.W, H = VK_V.H;
  VK_BOTONES.length = 0;
  vkPintaFondoCombate(c, t);
  // cabecera: el asalto y la oleada
  vkTexto(6, 102, tr(C.A.nombre), { tam: 7, negrita: true, col: VK_COL.oro });
  vkTexto(W - 6, 102, tr('Oleada {a}/{b}', { a: C.oleada + 1, b: C.A.oleadas.length }), { tam: 6.5, al: 'right' });
  // los enemigos
  C.enemigos.forEach((e, i) => {
    const p = vkPosEnemigo(i, C.enemigos.length), E = VK_ENEMIGOS[e.tipo];
    const marca = C.fase === 'jugador' && e.vida > 0;
    const avance = e.anim === 'atacar' ? Math.sin(Math.min(1, e.t / 0.45) * Math.PI) * 14 : 0;
    const x = p.x + Math.round(e.entra * 120);
    if (marca && (C.hab !== null || C.sel >= 0)) { c.fillStyle = `rgba(255,211,77,${0.35 + 0.25 * Math.sin(t * 8)})`; c.fillRect(x - 14, p.y - 2, 28, 4); }
    vkPersonaje(c, E.dibujo, x, p.y, e.vida > 0 ? e.anim : 'ko', e.t, { blanco: e.blanco, avance, alfa: e.vida > 0 ? 1 : Math.max(0, 1 - e.t * 1.5) });
    if (e.vida > 0) {
      vkBarra(c, x - 18, p.y + 4, 36, 5, e.vida / e.max, VK_COL.rojo);
      vkTexto(x, p.y + 13, tr(E.nombre), { tam: 5.5, al: 'center', col: E.jefe ? VK_COL.oro : VK_COL.crema });
      if (E.especial) { const falta = E.cada - (e.turnos % E.cada); if (falta === 1) vkTexto(x, p.y - 58, '!', { tam: 9, al: 'center', col: VK_COL.rojoClaro, negrita: true }); }
      vkZona('enemigo', x - 20, p.y - 56, 40, 66, i);
    }
  });
  // tus fans
  C.fans.forEach((f, i) => {
    const p = vkPosFan(i), elegido = C.fase === 'jugador' && i === C.sel;
    const avance = f.anim === 'atacar' ? -Math.sin(Math.min(1, f.t / 0.45) * Math.PI) * 14 : 0;
    if (elegido) { vkCaja(c, p.x - 22, p.y - 54, 44, 60, 'rgba(255,211,77,0.18)'); }
    vkPersonaje(c, f.id, p.x, p.y, f.vida > 0 ? (f.anim === 'reposo' && f.actuo ? 'reposo' : f.anim) : 'ko', f.t, { blanco: f.blanco, avance, alfa: f.actuo && f.vida > 0 && C.fase === 'jugador' ? 0.7 : 1 });
    vkBarra(c, p.x - 22, p.y + 4, 44, 6, f.vida / f.max, f.vida > f.max * 0.3 ? VK_COL.vida : VK_COL.rojo);
    vkTexto(p.x, p.y + 15, f.vida + '/' + f.max, { tam: 5.5, al: 'center' });
    if (f.provoca > 0) vkTexto(p.x, p.y - 56, tr('PROVOCA'), { tam: 5, al: 'center', col: VK_COL.oro });
    if (elegido) { const b = Math.floor(t * 4) % 2; c.fillStyle = VK_COL.oro; c.fillRect(p.x - 3, p.y - 62 - b, 7, 2); c.fillRect(p.x - 2, p.y - 60 - b, 5, 2); c.fillRect(p.x - 1, p.y - 58 - b, 3, 2); }
    vkZona('fanC', p.x - 24, p.y - 56, 48, 64, i);
  });
  // los números que saltan
  for (const n of C.numeros) {
    const lista = n.o.lado === 'fan' ? C.fans : C.enemigos, i = lista.indexOf(n.o);
    const p = n.o.lado === 'fan' ? vkPosFan(i) : vkPosEnemigo(i, lista.length);
    vkTexto(p.x + n.dx, p.y - 44 - n.t * 22, n.txt, { tam: 8, al: 'center', col: n.col, negrita: true });
  }
  vkPintaMandos(c, t);
  if (C.fase === 'fin') vkPintaFinCombate(c, t);
}
function vkPintaMandos(c, t) {
  const C = VK_C, W = VK_V.W, H = VK_V.H, y = H - 66;
  vkCaja(c, -1, y + 2, W + 2, 66, '#4a2c18', '#6b4428');
  const fan = C.fans[C.sel];
  if (C.fase === 'jugador' && fan && !C.auto) {
    const F = VK_FANS[fan.id];
    vkTexto(8, y + 10, F.nombre + ' · ' + tr(F.clase), { tam: 6.5, col: VK_COL.oro, negrita: true });
    F.habs.forEach((H2, k) => {
      const rec = fan.rec[H2.id] || 0, x = 6 + k * 70;
      const elegida = C.hab === k;
      vkBoton(c, 'hab', x, y + 18, 66, 24, rec ? tr(H2.nombre) + ' (' + rec + ')' : tr(H2.nombre), { col: elegida ? 'verde' : k ? 'naranja' : 'madera', tam: 6.5, dato: k, apagado: rec > 0 });
    });
    vkTexto(6, y + 52, C.hab !== null || VK_FANS[fan.id].habs[0].obj === 'uno' ? tr('Toca a un enemigo para atacarle') : '', { tam: 5.5, col: VK_COL.crema });
  } else if (C.fase !== 'fin') {
    vkTexto(76, y + 30, C.auto ? tr('Combate automático…') : C.fase === 'enemigos' ? tr('Turno de Microblizz…') : '…', { tam: 7, al: 'center', col: VK_COL.crema });
  }
  vkBoton(c, 'auto', W - 62, y + 10, 56, 20, C.auto ? tr('AUTO: SÍ') : tr('AUTO: NO'), { col: C.auto ? 'verde' : 'azul', tam: 6 });
  vkBoton(c, 'huye', W - 62, y + 36, 56, 20, tr('HUIR'), { col: 'rojo', tam: 7 });
}
function vkPintaFinCombate(c, t) {
  const C = VK_C, W = VK_V.W, H = VK_V.H, gana = C.resultado === 'gana';
  VK_BOTONES.length = 0;
  c.fillStyle = 'rgba(20,12,28,0.72)'; c.fillRect(0, 0, W, H);
  const y = H / 2 - 70;
  vkCaja(c, 14, y, W - 28, 140, gana ? '#6b4428' : '#4a2c2c', gana ? VK_COL.maderaClara : '#7a4a4a');
  vkTexto(W / 2, y + 16, gana ? tr('¡VICTORIA!') : tr('DERROTA'), { tam: 14, al: 'center', negrita: true, col: gana ? VK_COL.oro : VK_COL.rojoClaro });
  if (gana) {
    const p = C.premio;
    c.fillStyle = VK_COL.oro; c.fillRect(W / 2 - 40, y + 38, 6, 6);
    vkTexto(W / 2 - 30, y + 41, tr('+{n} de oro', { n: p.oro }), { tam: 8, col: VK_COL.oro });
    vkTexto(W / 2, y + 56, tr('+{n} de experiencia para cada fan', { n: p.xp }), { tam: 6.5, al: 'center' });
    if (p.suben.length) vkTexto(W / 2, y + 70, tr('¡Suben de nivel!') + ' ' + p.suben.join(', '), { tam: 6.5, al: 'center', col: VK_COL.verdeClaro, ancho: W - 44 });
    if (C.A.jefe) vkTexto(W / 2, y + 90, tr('El Ejecutivo huye a la planta de arriba con su bonus.'), { tam: 6, al: 'center', col: VK_COL.crema, ancho: W - 44 });
  } else {
    vkTexto(W / 2, y + 46, tr('Recursos Humanos ha despedido a tu equipo.'), { tam: 6.5, al: 'center', ancho: W - 44 });
    vkTexto(W / 2, y + 66, tr('Cúralos con pan en la Casa y vuelve a intentarlo.'), { tam: 6.5, al: 'center', col: VK_COL.naranjaClaro, ancho: W - 44 });
    vkTexto(W / 2, y + 92, tr('+{n} de experiencia para cada fan', { n: C.premio.xp }), { tam: 6.5, al: 'center' });
  }
  vkBoton(c, 'vuelve', W / 2 - 50, y + 108, 100, 22, tr('A LA ALDEA'), { col: 'naranja' });
}
function vkPulsaCombate(b) {
  const C = VK_C;
  if (b.id === 'vuelve') { play('select'); vkSalCombate(); return; }
  if (b.id === 'auto') { C.auto = !C.auto; play('select'); return; }
  if (b.id === 'huye') { play('vkNoVale'); vkHuye(); return; }
  if (C.auto) return;
  if (b.id === 'hab') { if (b.apagado) { play('vkNoVale'); return; } vkEligeHab(b.dato); return; }
  if (b.id === 'enemigo') { vkTocaEnemigo(C.enemigos[b.dato]); return; }
  if (b.id === 'fanC') vkTocaFan(b.dato);
}

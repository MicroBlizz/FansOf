// Fans of Crush · REACCIONES: lo que se ve y se oye cuando pasa algo en el tablero (los avisos de js/tablero.js y js/partida.js):
// estallidos, gritos de combo, cohetes, rayos, fichas que vuelan al marcador, el jefe, las HORAS EXTRA y lo que comenta Lola.
'use strict';
const CR_DESPUES = [];
function crDespues(s, fn) { CR_DESPUES.push({ t: s, fn }); }   // tiempo de pantalla (no el de la jugada)
function crDespuesAvanza(dt) { for (let i = CR_DESPUES.length - 1; i >= 0; i--) { const d = CR_DESPUES[i]; d.t -= dt; if (d.t <= 0) { CR_DESPUES.splice(i, 1); d.fn(); } } }
const crElige = a => a[Math.floor(Math.random() * a.length)];
const CR_GRITOS_OLA = ['', '', '¡BIEN!', '¡SINERGIA!', '¡PRODUCTIVIDAD!', '¡DESPIDO MASIVO!', '¡CAOS TOTAL!'];
const CR_COMBOS = {
  hh: ['¡CRUZ DE DESPIDOS!', '¡Cohete con cohete! Una cruz, como la de tu currículum.'],
  hb: ['¡SUPERCOHETE!', '¡Supercohete! Tres filas y tres columnas de una vez.'],
  bb: ['¡MEGADINAMITA!', '¡Megadinamita! Eso se ha oído en la planta de arriba.'],
  l: ['¡IP BURIAL!', 'Enterradas. Como las IP buenas de Microblizz.'],
  lh: ['¡LLUVIA DE COHETES!', '¡Lluvia de cohetes! Microblizz no sabe dónde meterse.'],
  lb: ['¡LLUVIA DE DINAMITA!', '¡Lluvia de dinamita! Esto no lo cubre el seguro.'],
  ll: ['¡REESTRUCTURACIÓN TOTAL!', 'Doble láser: reestructuración total de la plantilla.'],
};
const CR_LOLA_NUEVO = {
  h: '¡Un cohete Chaos Jump! Júntalo con dos de su color y barrerá la fila entera.',
  v: '¡Un cohete Chaos Jump! Este barre la columna entera de arriba abajo.',
  b: '¡Dinamita de BoomBeaver! Júntala con su color y volará todo lo que tiene alrededor.',
  l: '¡Láser IP Burial! Cámbialo con cualquier cara y enterrará a todas las iguales.',
};
const CR_LOLA_COMBO = ['¡Eso no estaba en el plan trimestral!', '¡Sinergia de la buena! Apúntalo en tu evaluación.', 'Recursos Humanos está tomando notas. Con boli rojo.', '¡Así se despide a lo grande!', 'El chat de empresa echa humo.'];
const CR_LOLA_RESCATE = ['¡Becario libre! Ya puede volver a no cobrar.', '¡Otro becario fuera! Se lleva la grapadora, eso sí.'];
const CR_LOLA_ROMPE = ['¡StarBot descongelado y despedido!', 'Ese StarBot ya no vuelve. Ni a por su taza.', 'Un StarBot menos. Microblizz dirá que fue «salida voluntaria».'];
const CR_JEFE_FRASES = ['Te comunico que tu sueldo queda congelado.', 'Esto no es personal. Es un Excel.', 'Hemos detectado felicidad. Corrigiendo.', 'Tu puesto ha sido optimizado.', 'Por favor, valora esta congelación del 1 al 5.'];
let CR_ULTIMO_GRITO = 0;
const crGritoCon = (txt, col, tam, sub) => { if (performance.now() - CR_ULTIMO_GRITO < 260) return; CR_ULTIMO_GRITO = performance.now(); crGrita(txt, col, tam, 1.15, sub); };
const crColorDe = c => (c >= 0 ? CR_FICHAS[c].col : '#ffffff');

crOye('empieza', N => {
  crFxLimpia(); CR_DESPUES.length = 0; crMide();
  Object.assign(CR_HUD, { puntos: 0, pulso: 0, golpe: 0, estrellas: 0, vida: CR_P.jefe ? CR_P.jefe.max : 0 });
  for (const o of CR_P.obj) { o.visto = 0; o.pulso = 0; }
  CR_LOLA.txt = ''; CR_LOLA.prio = 0;
  crLola(N.lola || N.memo, 3, 9);
  crMusica(N.musica); CR_MUS.prisa = false;
});
crOye('cambio', () => play('crCambio'));
crOye('no-vale', (A, B) => { play('crNoVale'); A.bote = 0.8; B.bote = 0.8; });
crOye('ola', n => {
  play('crPop', n);
  if (n >= 2) { crGritoCon(CR_GRITOS_OLA[Math.min(6, n)], ['', '', '#7cc8ff', '#6fe0b9', '#ffc94d', '#ff7a96', '#b79cff'][Math.min(6, n)], 38 + Math.min(4, n) * 4); play('crCombo', n); if (n >= 3) crTiembla(2 + n); }
  if (n >= 4) crLola(crElige(CR_LOLA_COMBO), 1, 3.5);
});
crOye('raya', (g, esp) => {
  const cel = [...g.cel.values()], mx = cel.reduce((a, q) => a + crCx(q[0]), 0) / cel.length, my = cel.reduce((a, q) => a + crCy(q[1]), 0) / cel.length;
  crFlota('+' + Math.round(cel.length * CR_PUNTOS.ficha * crMult()), mx, my - 6, '#ffffff', 20 + Math.min(10, (CR_JUGADA.ola - 1) * 3));
});
crOye('despide', (p, x, y, causa) => {
  const n = causa === 'raya' ? 9 : 5;
  crEstallido(crCx(x), crCy(y), crColorDe(p.c), n, causa === 'raya' ? 1 : 0.8, p.c >= 0 ? CR_FICHAS[p.c].luz : '#ffffff');
});
crOye('especial', (p, x, y, cel) => {
  const tx = crCx(x), ty = crCy(y);
  for (const [cx, cy] of cel) {
    if (cx === x && cy === y) continue;
    const q = CR_T.p[cy][cx]; if (q && q.muere) { q.oculta = true; crFantasma(crSprite(q.t === 'n' ? 'n' : q.t, Math.max(0, q.c), CR_V.px), crCx(cx), crCy(cy), tx, ty, 0.14); }
  }
  crOnda(tx, ty, CR_V.cel * 0.9, '#ffffff', 0.4, 7); crEstallido(tx, ty, '#ffd36b', 10, 0.7);
  play('crNace');
  if (!SAVE.vistos[p.t]) { SAVE.vistos[p.t] = 1; crGuarda(); crLola(CR_LOLA_NUEVO[p.t], 3, 6); }
});
crOye('cohete', (x, y, t) => {
  const cx = crCx(x), cy = crCy(y);
  crCoheteFx(cx, cy, t === 'h' ? 1 : 0, t === 'v' ? 1 : 0);
  play('crCohete'); crTiembla(5);
  if (Math.random() < 0.5) crGritoCon('¡CHAOS JUMP!', '#ff7a96', 34);
});
crOye('dinamita', (x, y) => {
  crProgramar(0.1, () => {
    const cx = crCx(x), cy = crCy(y);
    crOnda(cx, cy, CR_V.cel * 2.6, '#ffc94d', 0.5, 12); crOnda(cx, cy, CR_V.cel * 1.6, '#ffffff', 0.35, 6);
    crTrozos(cx, cy, ['#ff7a96', '#ffd36b', '#ffffff'], 14, 1.2); crHumo(cx, cy, 6, 18);
    play('crBoom'); crTiembla(11); crDestella('#fff6e0', 0.22);
  });
  crGritoCon('¡BOOM!', '#ffc94d', 44);
});
crOye('laser', (x, y, c, blancos) => {
  const ox = crCx(x), oy = crCy(y), col = crColorDe(c);
  play('crLaser'); crDestella(col, 0.18); crTiembla(5);
  blancos.forEach(([bx, by], i) => crProgramar(0.12 + i * 0.03, () => { crRayo(ox, oy, crCx(bx), crCy(by), col, 0.3); play('crRayito'); }));
  if (blancos.length > 4) crGritoCon('¡IP BURIAL!', '#b79cff', 40);
});
crOye('combo', (tipo, x, y) => {
  const C = CR_COMBOS[tipo]; if (!C) return;
  crGrita(C[0], tipo === 'll' ? '#ff7a96' : '#ffc94d', tipo === 'll' ? 38 : 44, 1.4);
  play('crMega'); crTiembla(tipo === 'll' || tipo === 'bb' ? 16 : 10); crDestella(tipo === 'll' ? '#ffe3ef' : '#fff6e0', 0.35);
  crOnda(crCx(x), crCy(y), CR_V.cel * 3.5, '#ffffff', 0.6, 14);
  crLola(C[1], 2, 4);
});
crOye('convierte', q => { crEstallido(crCx(q.x), crCy(q.y), '#ffffff', 5, 0.5); q.nace = 1; play('crTic', 3); });
crOye('golpe', (x, y) => { crParte({ x: crCx(x), y: crCy(y), tam: CR_V.cel * 0.32, vida: 0.18, col: 'rgba(255,250,235,.85)', tipo: 'bola' }); });
crOye('traba', (x, y, tb) => {
  tb.sacude = 0.3;
  crTrozos(crCx(x), crCy(y), tb.t === 'caja' ? ['#5bbcff', '#ffd36b', '#b79cff'] : ['#e4f6ff', '#9fd3ff', '#ffffff'], 7, 0.8);
  play('crHielo');
});
crOye('rompe', (x, y, t) => {
  const cx = crCx(x), cy = crCy(y), k = t === 'caja' ? 'cajabotin' : 'starbot';
  crTrozos(cx, cy, t === 'caja' ? ['#5bbcff', '#ffd36b', '#b79cff'] : ['#e4f6ff', '#9fd3ff', '#ffffff'], 14, 1.2);
  // el despedido sale volando de la oficina
  const ang = crAzar(-0.6, 0.6), dx = cx + Math.sin(ang) * 300;
  crVuela(cx, cy, () => [dx, -80], (c, px, py, s, k2) => { c.save(); c.translate(px, py); c.rotate(k2 * 6); const e = CR_V.cel / 50; c.scale(e * s, e * s); if (ART[k]) ART[k](c); c.restore(); }, null, 0.9);
  crFlota('¡FUERA!', cx, cy - 10, '#ff7a96', 22, 1);
  play('crRompe');
  if (Math.random() < 0.35) crLola(crElige(CR_LOLA_ROMPE), 1, 3);
});
crOye('cinta', (x, y) => {
  const cx = crCx(x), cy = crCy(y);
  for (let i = 0; i < 5; i++) crParte({ x: cx, y: cy, vx: crAzar(-160, 160), vy: crAzar(-220, -60), g: 600, tam: crAzar(9, 14), vida: crAzar(0.5, 0.8), col: i % 2 ? '#ffd36b' : '#6a4a9a', tipo: 'trozo', rot: crAzar(0, 3), vr: crAzar(-10, 10) });
  play('crCinta');
});
crOye('rescate', (p, x, y) => {
  const cx = crCx(x), cy = crCy(y);
  crEstallido(cx, cy, '#6fe0b9', 16, 1.2); crFlota('¡LIBRE!', cx, cy - 14, '#6fe0b9', 26, 1.2);
  play('crRescate'); crLola(crElige(CR_LOLA_RESCATE), 2, 3.5);
});
let CR_CAIDAS = 0;
crOye('aterriza', () => { if (++CR_CAIDAS % 5 === 0) play('crCae'); });
// lo que cuenta para un objetivo vuela hasta su icono del marcador
crOye('objetivo', (o, p, x, y) => {
  const i = CR_P.obj.indexOf(o); if (i < 0 || o.t === 'puntos' || o.t === 'jefe') { if (o.visto !== undefined) o.visto = o.hecho; return; }
  const dib = o.t === 'color' ? (c, px, py, s) => { c.save(); c.translate(px, py); c.scale(s * 0.55, s * 0.55); crChapa(c, o.c, CR_V.cel * 0.43); c.restore(); }
    : (c, px, py, s) => { c.save(); c.translate(px, py); crIcono(c, o.t, 0, 0, 0, 14 * s); c.restore(); };
  crVuela(crCx(x), crCy(y), () => crPosObjetivo(i), dib, () => { o.visto = Math.min(o.hecho, (o.visto || 0) + 1); o.pulso = 1; play('crMoneda'); }, 0.5);
});
let CR_CHISPAS_JEFE = 0;
crOye('jefe-golpe', (n, x, y) => {
  if (++CR_CHISPAS_JEFE % 2) crVuela(crCx(x), crCy(y), crPosJefe, (c, px, py, s) => { c.save(); c.beginPath(); starPath(c, px, py, 9 * s, 4 * s); c.fillStyle = '#ffd36b'; c.fill(); c.lineWidth = 2; c.strokeStyle = CR_COL.tinta; c.stroke(); c.restore(); }, () => { CR_P.jefe.golpe = 1; play('crJefeAy'); }, 0.45);
});
crOye('jefe-ataca', sitios => {
  const [jx, jy] = crPosJefe();
  crGrita('¡CONGELACIÓN SALARIAL!', '#9fd3ff', 30, 1.3);
  crLola(crElige(CR_JEFE_FRASES), 3, 4, 'SURVIVALBOT · JEFE DE RRHH');
  play('crJefeAtaca'); crTiembla(6);
  sitios.forEach(([x, y], i) => crDespues(0.15 + i * 0.1, () => crRayo(jx, jy, crCx(x), crCy(y), '#9fd3ff', 0.45)));
});
crOye('congela', (x, y) => { const tb = CR_T.traba[y][x]; if (tb) tb.nace = 0; crEstallido(crCx(x), crCy(y), '#bfe8ff', 8, 0.6); play('crCongela'); });
crOye('horas-extra', () => {
  crGrita('¡HORAS EXTRA!', '#ffc94d', 50, 1.6, 'Los movimientos que sobran se vuelven cohetes');
  crLola('¡HORAS EXTRA! Los movimientos que te sobran trabajan gratis. Como siempre.', 3, 5);
  play('crHoras'); crDestella('#fff6e0', 0.25);
});
let CR_TICS = 0;
crOye('horas-mov', p => {
  const [mx, my] = crPosMovs(); CR_HUD.pulso = 1;
  crVuela(mx, my, () => [crCx(p.x), crCy(p.y)], (c, px, py, s) => crZanahoria(c, px, py, 12 * s, 0), () => crEstallido(crCx(p.x), crCy(p.y), '#ff7a96', 6, 0.6), 0.35);
  play('crTic', CR_TICS++ % 12);
});
crOye('baraja', () => { crGrita('REESTRUCTURACIÓN', '#9fd3ff', 36, 1.3, 'No quedaban jugadas'); crLola('No quedan jugadas: Microblizz lo llama «reestructuración de plantilla».', 2, 4); play('crBaraja'); });
crOye('movs', n => {
  CR_HUD.pulso = 1;
  if (n === 5 && CR_P.estado === 'jugando') { crLola('Te quedan 5 movimientos. Como a Microblizz de credibilidad.', 2, 4); play('crPocos'); CR_MUS.prisa = true; }
});
crOye('cafe', n => { const [mx, my] = crPosMovs(); crFlota('+' + n, mx + 60, my, '#6fe0b9', 30, 1.2); play('crCafe'); CR_MUS.prisa = CR_P.movs <= 5; });
crOye('martillo', (x, y) => {
  crDespues(0.15, () => { crTiembla(8); crTrozos(crCx(x), crCy(y), ['#ff7a96', '#ffffff', '#e8b27a'], 10); play('crMartillo'); });
  crFlota('¡DESPEDIDO!', crCx(x), crCy(y) - 20, '#ff7a96', 24, 1);
});
crOye('gana', () => {
  CR_MUS.prisa = false; crConfeti(110); crGrita('¡NIVEL SUPERADO!', '#6fe0b9', 44, 1.8);
  crSintonia('win'); crMusica('menu');
  crDespues(1.7, () => crPantallaFin(true));
});
crOye('pierde', () => {
  CR_MUS.prisa = false; crSintonia('lose'); crMusica('menu');
  crDespues(0.7, () => crPantallaFin(false));
});

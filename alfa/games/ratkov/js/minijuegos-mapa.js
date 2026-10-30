// Fans of Ratkov · MINIJUEGOS DEL MAPA (la ventana v-mini, como la cerradura; el juego sigue mientras tanto):
// - TERMINALES DE MICROBLIZZ: cuatro en el Distrito. Adivina la contraseña entre ocho palabras con cuatro intentos (cada intento dice
//   cuántas letras están en su sitio). Si aciertas, se abre su armario de servidores (botín de oficina) y durante un minuto ves a los
//   enemigos en el minimapa. Si fallas los cuatro, salta la alarma y el terminal se bloquea.
// - TRAMPAS DE CABLE: en cada incursión hay unas cuantas cruzando caminos (cuesta verlas; agachado se ven antes). Si tú o un enemigo
//   tocáis el cable, explota. Junto a la caja se pueden DESACTIVAR: hay que cortar el cable que dice la pegatina antes de que acabe la
//   cuenta atrás. Bien hecho, te quedas con la pólvora y los cables; mal hecho, explota.
// - PUENTE A UN COCHE: en el maletero de un coche, «HACER UN PUENTE»: lleva la punta del cable azul al borne y aguántala hasta que salte la
//   chispa (con frío te tiembla). Se abre la guantera (botín) y a los pocos segundos salta la alarma del coche: los enemigos van a mirar.
'use strict';
const TERMINALES = [[-21, 17], [51, -31], [-42, -33], [53, 38]];
const SITIOS_TRAMPA = [[-30, -10], [10, -22], [-10, -32], [32, -12], [-52, -2], [-20, 30], [18, 28], [40, -40], [-60, 36], [62, 20], [-34, -46], [30, 50], [-8, 40], [66, -16]];
TABLAS.terminal = { n: 'Terminal de Microblizz', veces: [1, 2], t: 1, sale: [['chip', 5, 1, 2], ['disco', 5, 1, 1], ['documentos', 4, 1, 1], ['mando', 2, 1, 1], ['blizzcoin', 1, 1, 1], ['tarjeta', 0.4, 1, 1]] };
TABLAS.guantera = { n: 'Guantera', veces: [1, 2], t: 1, sale: [['m9', 5, 10, 20], ['cart', 3, 4, 8], ['venda', 4, 1, 1], ['te', 3, 1, 1], ['chip', 2, 1, 1], ['inyector', 1.5, 1, 1], ['llave-despacho', 1, 1, 1], ['blizzcoin', 0.6, 1, 1]] };
const PALABRAS = {
  es: ['DATOS', 'CLAVE', 'TECLA', 'RATON', 'PLATA', 'CHAPA', 'NIEVE', 'TORRE', 'LAPIZ', 'SILLA', 'MESAS', 'CAJAS', 'BOTAS', 'VENDA', 'BALAS', 'LISTA', 'NOTAS', 'CARTA', 'PAPEL', 'GRAPA', 'SELLO', 'JEFES', 'CUOTA', 'MULTA', 'BECAS'],
  en: ['MOUSE', 'CLOCK', 'PAPER', 'STAMP', 'CHAIR', 'DESKS', 'BOXES', 'BOOTS', 'NOTES', 'LISTS', 'CARDS', 'TOWER', 'FROST', 'BADGE', 'MONEY', 'COINS', 'CLERK', 'AUDIT', 'LOGIN', 'ADMIN', 'PIXEL', 'CABLE', 'MEMOS', 'BOSSY'],
};
const COLOR_CABLE = { rojo: '#d8303a', azul: '#3a6ad8', amarillo: '#f9c531', verde: '#4aa83a', blanco: '#e8eef4' };
const TRAMPAS = [];

/* ---------- al construir el mapa: los terminales ---------- */
function construyeTerminales() {
  const o = new Obra();
  for (const [x, z] of TERMINALES) {
    o.caja(0.9, 1.5, 0.6, 0x2a3038, x, 0.75, z); o.caja(0.95, 0.08, 0.65, NIEVE_M, x, 1.54, z);
    o.caja(0.7, 0.5, 0.05, 0x0a2a14, x, 1.15, z + 0.31); o.caja(0.55, 0.36, 0.06, 0x3cff7a, x, 1.15, z + 0.32);
    o.caja(0.6, 0.1, 0.3, 0x1a1e24, x, 0.85, z + 0.4);   // el teclado
    solido(x - 0.45, z - 0.3, x + 0.45, z + 0.3, 1.5, 'bajo');
    contenedor('terminal', x, z + 0.9, { hackeo: true });
  }
  MOTOR.escena.add(o.hecha());
}
// al empezar cada incursión: terminales como nuevos, trampas nuevas, sin alarmas ni radar
function preparaMinisMapa() {
  RAID.radar = 0; RAID.alarmas = []; RAID.trampaCerca = null;
  for (const c of MAPA.contenedores) if (c.tipo === 'terminal') { c.bloqueado = false; c.hackeo = true; }
  for (const t of TRAMPAS) MOTOR.escena.remove(t.m); TRAMPAS.length = 0;
  if (RAID.tuto) return;
  const sitios = SITIOS_TRAMPA.slice().sort(() => Math.random() - 0.5);
  const libre = (x, z) => !choca(x, z, 0.3) && !MAPA.contenedores.some(c => lejos(c.x, c.z, x, z) < 1.6);
  for (const [x0, z0] of sitios) {
    if (TRAMPAS.length >= 5) break;
    for (let k = 0; k < 8; k++) {
      const a = Math.random() * Math.PI, L = entre(2.4, 3.4), x1 = x0 + Math.cos(a) * L, z1 = z0 + Math.sin(a) * L;
      if (![0, 0.25, 0.5, 0.75, 1].every(f => libre(x0 + (x1 - x0) * f, z0 + (z1 - z0) * f))) continue;
      if (ENTRADAS.some(e => lejos(e.x, e.z, x0, z0) < 10) || SALIDAS.some(s => lejos(s.x, s.z, x0, z0) < 6)) break;
      TRAMPAS.push(creaTrampa(x0, z0, x1, z1)); break;
    }
  }
}
function creaTrampa(x0, z0, x1, z1) {
  const o = new Obra(), L = Math.hypot(x1 - x0, z1 - z0), a = Math.atan2(x1 - x0, z1 - z0);
  o.caja(0.42, 0.3, 0.32, 0x4a5a3a, x0, 0.15, z0, a); o.caja(0.12, 0.06, 0.12, 0xd8303a, x0, 0.33, z0, a);
  o.caja(0.08, 0.4, 0.08, 0x3a3f46, x1, 0.2, z1);
  o.caja(0.025, 0.025, L, 0xc8202c, (x0 + x1) / 2, 0.26, (z0 + z1) / 2, a);
  const m = o.hecha(false); m.visible = false; MOTOR.escena.add(m);
  return { x0, z0, x1, z1, m, viva: true };
}
// la distancia de un punto al cable
function aCable(t, x, z) {
  const dx = t.x1 - t.x0, dz = t.z1 - t.z0, L2 = dx * dx + dz * dz, f = Math.max(0, Math.min(1, ((x - t.x0) * dx + (z - t.z0) * dz) / L2));
  return Math.hypot(x - (t.x0 + dx * f), z - (t.z0 + dz * f));
}
function explotaTrampa(t, x, z, dano = 45) {
  if (!t.viva) return; t.viva = false; MOTOR.escena.remove(t.m);
  if (MINI.tipo === 'trampa' && MINI.T === t) cierraMini();
  explosion(x, z, 3.2, dano, 'trampa'); vibra([80, 40, 120]);
}

/* ---------- cada fotograma ---------- */
// junto a la caja de una trampa (o a un puente roto): el botón de registrar se vuelve DESACTIVAR (antes de que lo gaste frotarse las manos)
function avanzaTrampaCerca() {
  RAID.trampaCerca = null;
  if (RAID.tuto || RAID.cerca || !JUG || !JUG.vivo || MINI.tipo) return;
  for (const t of TRAMPAS) if (t.viva && lejos(JUG.x, JUG.z, t.x0, t.z0) < 1.7) { RAID.trampaCerca = t; break; }
  if (RAID.trampaCerca && (ENT.accion || pulsado('registrar'))) abreTrampa(RAID.trampaCerca);
}
function avanzaMinisMapa(dt) {
  if (!JUG) return;
  RAID.radar = Math.max(0, (RAID.radar || 0) - dt);
  // las trampas: se ven de cerca (agachado, antes) y explotan al tocar el cable
  const ve = JUG.agacha ? 11 : 7;
  for (const t of TRAMPAS) {
    if (!t.viva) continue;
    t.m.visible = lejos(JUG.x, JUG.z, t.x0, t.z0) < ve;
    if (JUG.vivo && JUG.tEsquiva <= 0 && aCable(t, JUG.x, JUG.z) < 0.32) { avisa(tr('¡Has tocado un cable trampa!'), 'malo'); explotaTrampa(t, JUG.x, JUG.z); continue; }
    for (const e of ENEMIGOS) if (e.vivo && aCable(t, e.x, e.z) < 0.4) { explotaTrampa(t, e.x, e.z); break; }
  }
  // las alarmas de coche: suenan un rato y atraen a todos los de alrededor
  for (const a of RAID.alarmas || []) {
    a.t -= dt; if (a.t > 0) continue;
    if (!a.sonando) { a.sonando = true; avisa(tr('¡La alarma del coche aúlla! Los enemigos van a mirar.'), 'info'); oyeRuido(a.x, a.z, 45); }
    a.dura -= dt; a.tic = (a.tic || 0) - dt; if (a.tic <= 0 && a.dura > 0) { a.tic = 0.45; play('alerta'); }
  }
  if (RAID.alarmas) RAID.alarmas = RAID.alarmas.filter(a => a.dura > 0);
}

/* ---------- EL TERMINAL ---------- */
const parecidas = (a, b) => [...a].filter((ch, i) => b[i] === ch).length;
function abreTerminal(c) {
  if (MINI.tipo) return;
  if (c.bloqueado) { avisa(tr('Terminal bloqueado. Microblizz ha cambiado la contraseña.'), 'malo'); return; }
  const lista = (PALABRAS[NUCLEO.idioma] || PALABRAS.en).slice().sort(() => Math.random() - 0.5).slice(0, 8);
  Object.assign(MINI, { tipo: 'terminal', c, t: 0, titulo: tr('TERMINAL DE MICROBLIZZ'), H: { clave: pick(lista), lista, intentos: 4, log: [] } });
  pintaTerminal();
}
function pintaTerminal() {
  const H = MINI.H;
  let h = cabecera(MINI.titulo, '') + '<div class="term"><p class="term-cab">MICROBLIZZ OS 9.9 · ' + esc(tr('ACCESO RESTRINGIDO')) + '</p>';
  h += '<p class="term-ayuda">' + esc(tr('Adivina la contraseña. Cada intento te dice cuántas letras están en su sitio.')) + '</p><div class="term-pal">';
  for (const w of H.lista) { const usada = H.log.find(l => l[0] === w); h += '<button type="button" data-w="' + w + '"' + (usada ? ' disabled' : '') + '>' + w + (usada ? ' <i>' + usada[1] + '/5</i>' : '') + '</button>'; }
  h += '</div><p class="term-int">' + esc(tr('INTENTOS')) + ': ' + '<b>' + '■ '.repeat(H.intentos) + '</b>' + '<span>' + '□ '.repeat(4 - H.intentos) + '</span></p><p class="mini-estado"></p></div>';
  const v = abreVentana('v-mini', h); enganchaCerrar(v, 'v-mini'); v.querySelector('[data-cierra]').onclick = () => cierraMini();
  v.querySelectorAll('[data-w]').forEach(b => (b.onclick = () => pruebaClave(b.dataset.w)));
}
function pruebaClave(w) {
  const H = MINI.H, c = MINI.c; if (!H || H.fin) return;
  if (w === H.clave) {
    H.fin = true; play('raro'); vibra(40);
    c.hackeo = false; c.abierto = true; c.cosas = sorteaBotin(TABLAS.terminal); RAID.radar = 60;
    avisa(tr('Acceso concedido: el armario de servidores se abre y ves a los enemigos en el minimapa durante un minuto.'), 'bien');
    cierraMini(); RAID.registro = null; abreBotin(c, true); return;
  }
  H.intentos--; H.log.push([w, parecidas(w, H.clave)]); play('metal'); vibra(25);
  if (H.intentos <= 0) {
    H.fin = true; c.bloqueado = true; cierraMini(); RAID.registro = null;
    avisa(tr('¡Acceso denegado! Salta la alarma del terminal.'), 'malo'); oyeRuido(c.x, c.z, 35); play('alerta'); return;
  }
  pintaTerminal(); miniEstado(trf('%1: %2 de 5 letras en su sitio.', w, parecidas(w, H.clave)), 'oro');
}

/* ---------- LA TRAMPA ---------- */
const REGLAS_TRAMPA = [
  { t: 'Corte el cable que va solo (el único de su color).', crea: () => { const c = Object.keys(COLOR_CABLE).sort(() => Math.random() - 0.5); const l = [c[0], c[0], c[1], c[1], c[2]].sort(() => Math.random() - 0.5); return [l, l.findIndex(x => l.filter(y => y === x).length === 1)]; } },
  { t: 'Corte el último cable rojo.', crea: () => { const c = Object.keys(COLOR_CABLE); const l = [0, 1, 2, 3, 4].map(() => pick(c)); if (!l.includes('rojo')) l[entero(0, 4)] = 'rojo'; return [l, l.lastIndexOf('rojo')]; } },
  { t: 'Si hay un cable amarillo, corte el primero. Si no, corte el tercero.', crea: () => { const c = Object.keys(COLOR_CABLE); const l = [0, 1, 2, 3, 4].map(() => pick(c)); return [l, l.includes('amarillo') ? 0 : 2]; } },
];
function abreTrampa(t) {
  if (MINI.tipo || !t.viva) return;
  const R = pick(REGLAS_TRAMPA), [cables, bueno] = R.crea();
  Object.assign(MINI, { tipo: 'trampa', c: { x: t.x0, z: t.z0 }, T: t, t: 0, titulo: tr('DESACTIVAR TRAMPA'), D: { cables, bueno, regla: R.t, queda: 8, cortado: -1 } });
  const v = abreMini('<canvas class="mini-cv" width="128" height="128"></canvas><p class="term-regla">' + esc(tr('PEGATINA DE MICROBLIZZ')) + ': <b>«' + esc(tr(R.t)) + '»</b></p><div class="mini-barra">' + esc(tr('TIEMPO')) + '<i class="barra"><i id="mini-tiempo" style="background:var(--rk-mal)"></i></i></div><p class="mini-estado"></p>');
  miniEstado(tr('Toca el cable que hay que cortar.'), 'oro');
  MINI.cv.addEventListener('pointerdown', e => {
    e.preventDefault(); const D = MINI.D; if (!D || D.cortado >= 0) return;
    const r = MINI.cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 128;
    const i = Math.max(0, Math.min(4, Math.floor((x - 14) / 20))); D.cortado = i; play('metal');
    if (i === D.bueno) {
      t.viva = false; MOTOR.escena.remove(t.m); vibra(30); play('select');
      contenedor('cadaver', t.x0 + 0.6, t.z0, { nombre: 'Restos de la trampa', cosas: [nuevoObj('polvora', 1), nuevoObj('cables', 1)], abierto: true });
      miniEstado(tr('Desactivada. La pólvora y los cables son tuyos.'), 'bien'); setTimeout(() => { if (MINI.tipo === 'trampa') cierraMini(); }, 900);
    } else { miniEstado(tr('¡Ese no era!'), 'mal'); setTimeout(() => { if (MINI.T === t) { cierraMini(); explotaTrampa(t, t.x0, t.z0, 30); } }, 350); }
  });
}
function avanzaTrampa(dt) {
  const D = MINI.D; if (!D) return;
  if (D.cortado < 0) { D.queda -= dt; if (Math.random() < dt * 2) play('select'); if (D.queda <= 0) { const t = MINI.T; cierraMini(); avisa(tr('¡Se ha acabado el tiempo!'), 'malo'); explotaTrampa(t, t.x0, t.z0, 30); return; } }
  miniBarra('mini-tiempo', D.queda / 8);
  const g = MINI.g; g.fillStyle = '#10151a'; g.fillRect(0, 0, 128, 128);
  g.fillStyle = '#4a5a3a'; g.fillRect(6, 6, 116, 30); g.fillStyle = '#3a4a2a'; g.fillRect(6, 30, 116, 6);
  g.fillStyle = Math.sin(MINI.t * 12) > 0 ? '#ff4b5c' : '#5a1a1a'; g.fillRect(56, 12, 16, 10);
  g.fillStyle = '#4a5a3a'; g.fillRect(6, 102, 116, 20);
  D.cables.forEach((col, i) => {
    const x = 18 + i * 20; g.fillStyle = COLOR_CABLE[col];
    if (D.cortado === i) { g.fillRect(x, 36, 6, 28); g.fillRect(x, 74, 6, 28); } else g.fillRect(x, 36, 6, 66);
    g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(x + 4, 36, 2, 66);
  });
}

/* ---------- EL PUENTE ---------- */
function abrePuente(c) {
  if (MINI.tipo || c.puenteHecho) return;
  Object.assign(MINI, { tipo: 'puente', c, t: 0, titulo: tr('HACER UN PUENTE'), P: { x: 24, y: 104, dedo: false, chispa: 0, bx: 92, by: 44 } });
  abreMini('<canvas class="mini-cv" width="128" height="128"></canvas><p class="mini-estado"></p><div class="mini-barra">' + esc(tr('CHISPA')) + '<i class="barra"><i id="mini-chispa" style="background:var(--rk-oro)"></i></i></div>');
  miniEstado(tr('Arrastra la punta del cable azul hasta el borne y aguanta hasta que salte la chispa.'), 'oro');
  const punto = e => { const r = MINI.cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 128, (e.clientY - r.top) / r.height * 128]; };
  MINI.cv.addEventListener('pointerdown', e => { e.preventDefault(); try { MINI.cv.setPointerCapture(e.pointerId); } catch (x) { /* sin captura */ } const P = MINI.P; if (!P) return; const [x, y] = punto(e); P.dedo = true; P.x = x; P.y = y; });
  MINI.cv.addEventListener('pointermove', e => { const P = MINI.P; if (!P || !P.dedo) return; const [x, y] = punto(e); P.x = x; P.y = y; });
  for (const ev of ['pointerup', 'pointercancel']) MINI.cv.addEventListener(ev, () => { if (MINI.P) MINI.P.dedo = false; });
}
function avanzaPuente(dt) {
  const P = MINI.P, c = MINI.c; if (!P) return;
  // el borne tiembla (más con frío)
  const tiembla = 1.5 + Math.min(1, JUG.frio / 100) * 5;
  const bx = P.bx + Math.sin(MINI.t * 7) * tiembla, by = P.by + Math.cos(MINI.t * 5.3) * tiembla;
  const toca = Math.hypot(P.x - bx, P.y - by) < 9;
  P.chispa = Math.max(0, Math.min(1, P.chispa + (toca ? dt / 1.3 : -dt / 2)));
  if (toca && Math.random() < 0.5) play('select');
  miniBarra('mini-chispa', P.chispa);
  const g = MINI.g; g.fillStyle = '#1a1e24'; g.fillRect(0, 0, 128, 128);
  g.fillStyle = '#2a3038'; g.fillRect(70, 20, 50, 60); g.fillStyle = '#3a3f46'; g.fillRect(74, 24, 42, 52);
  g.fillStyle = '#d8303a'; g.fillRect(118, 30, 10, 4); g.fillRect(bx, by - 2, 128 - bx, 4); g.fillStyle = '#c99a3a'; g.fillRect(bx - 4, by - 4, 8, 8);
  g.strokeStyle = '#3a6ad8'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 120); g.quadraticCurveTo(20, 80, P.x, P.y); g.stroke();
  g.fillStyle = '#c99a3a'; g.fillRect(P.x - 3, P.y - 3, 6, 6);
  if (toca) { g.fillStyle = '#ffe07a'; for (let i = 0; i < 5; i++) g.fillRect(bx + entre(-8, 8), by + entre(-8, 8), 2, 2); }
  if (P.chispa >= 1) {
    c.puenteHecho = true; play('raro'); vibra([30, 30, 60]);
    const nuevas = sorteaBotin(TABLAS.guantera); c.cosas = (c.cosas || []).concat(nuevas);
    RAID.alarmas.push({ x: c.x, z: c.z, t: 6, dura: 8 });
    avisa(tr('¡Arranca! Se abre la guantera… y en 6 segundos saltará la alarma. Aléjate o úsala para distraer.'), 'bien');
    cierraMini(); RAID.registro = null; abreBotin(c);
  }
}

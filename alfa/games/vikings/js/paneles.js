// Fans of Vikings · LAS VENTANAS de la aldea (paneles que suben desde abajo): la de cada edificio que produce (sus recetas y
// su cola de 3 con el tiempo que falta), la Casa (la tribu: vida, nivel y equipo de cada fan, comer pan y equipar), el Almacén
// (vender lo que sobra) y el Autobús (los asaltos contra la sede de Microblizz). También qué hace cada botón al tocarlo.
'use strict';
const vkSeg = s => s >= 60 ? Math.floor(s / 60) + 'm ' + String(Math.floor(s % 60)).padStart(2, '0') + 's' : Math.ceil(s) + 's';

function vkPintaPanel(c, t) {
  const id = VK_ALDEA.panel, E = VK_EDIFICIOS[id], W = VK_V.W, H = VK_V.H;
  const alto = id === 'casa' ? 236 : id === 'autobus' ? 230 : id === 'almacen' ? 150 : 66 + E.recetas.length * 30;
  const y0 = H - 30 - alto;
  vkZona('fondo', 0, 0, W, H);   // tapa el mapa: tocar fuera cierra
  vkZona('nada', 2, y0, W - 4, alto);
  vkCaja(c, 2, y0, W - 4, alto, '#6b4428', VK_COL.maderaClara);
  vkCaja(c, 6, y0 + 4, W - 12, 15, '#4a2c18');
  vkTexto(12, y0 + 12, tr(E.nombre).toUpperCase(), { tam: 8, negrita: true, col: VK_COL.oro });
  vkBoton(c, 'cerrar', W - 22, y0 + 4, 15, 15, 'X', { col: 'rojo', tam: 7 });
  const y = y0 + 24;
  if (E.recetas) vkPanelProduce(c, id, y, t);
  else if (id === 'casa') vkPanelTribu(c, y);
  else if (id === 'almacen') vkPanelAlmacen(c, y);
  else if (id === 'autobus') vkPanelAsaltos(c, y);
}

function vkCoste(c, coste, x, y) {
  for (const k in coste) {
    const hay = k === 'oro' ? SAVE.oro : SAVE.inv[k] || 0, falta = hay < coste[k];
    if (k === 'oro') { c.fillStyle = VK_COL.oro; c.fillRect(x - 2, y - 2, 4, 4); }
    else vkIcono(c, VK_COSAS[k].icono, x, y);
    vkTexto(x + 6, y + 0.5, coste[k], { tam: 7, col: falta ? VK_COL.rojoClaro : VK_COL.crema });
    x += 26;
  }
  if (!Object.keys(coste).length) vkTexto(x - 2, y + 0.5, tr('Gratis'), { tam: 7, col: VK_COL.verdeClaro });
}
function vkPanelProduce(c, id, y, t) {
  const E = VK_EDIFICIOS[id], W = VK_V.W, cola = SAVE.colas[id];
  E.recetas.forEach((r, i) => {
    const yy = y + i * 30;
    vkCaja(c, 8, yy, W - 16, 26, '#8a5a32', '#a87444');
    vkCaja(c, 11, yy + 3, 20, 20, VK_COL.crema);
    vkIcono(c, VK_COSAS[r.da].icono, 21, yy + 13);
    vkTexto(36, yy + 7, (r.n > 1 ? r.n + ' x ' : '') + tr(VK_COSAS[r.da].nombre), { tam: 7, negrita: true });
    vkCoste(c, r.coste, 40, yy + 19);
    vkTexto(124, yy + 19, vkSeg(r.seg), { tam: 6, col: VK_COL.azulClaro });
    const puede = vkPuedePagar(r.coste) && cola.length < E.cola;
    vkBoton(c, 'encola', W - 58, yy + 4, 46, 18, tr('HACER'), { col: puede ? 'verde' : 'madera', dato: [id, i], apagado: !puede });
  });
  // la cola: 3 huecos
  const yc = y + E.recetas.length * 30 + 4;
  vkTexto(10, yc + 4, tr('Cola'), { tam: 6, col: VK_COL.crema });
  for (let i = 0; i < E.cola; i++) {
    const x = 36 + i * 58, tarea = cola[i];
    vkCaja(c, x, yc - 2, 54, 30, tarea ? '#4a2c18' : '#5a3a24');
    if (!tarea) { vkTexto(x + 27, yc + 13, tr('libre'), { tam: 6, al: 'center', col: '#c9a37a' }); continue; }
    const r = E.recetas[tarea.r], ahora = Date.now();
    vkIcono(c, VK_COSAS[r.da].icono, x + 12, yc + 10);
    const queda = Math.max(0, (tarea.fin - ahora) / 1000);
    vkTexto(x + 22, yc + 10, i === 0 ? vkSeg(queda) : tr('espera'), { tam: 6 });
    if (i === 0) vkBarra(c, x + 4, yc + 20, 46, 5, vkProgreso(id), VK_COL.oro);
  }
}

function vkPanelTribu(c, y) {
  const W = VK_V.W;
  VK_ORDEN_FANS.forEach((id, i) => {
    const yy = y + i * 51, F = VK_FANS[id], s = SAVE.fans[id], st = vkStats(id), vida = vkVida(id);
    vkCaja(c, 8, yy, W - 16, 48, vida > 0 ? '#8a5a32' : '#6a4a3a', '#a87444');
    // retrato: el sprite entero, de pie o tumbado si está KO
    c.save(); c.beginPath(); c.rect(10, yy + 2, 36, 44); c.clip();
    vkPersonaje(c, id, 28, yy + 47, vida > 0 ? 'reposo' : 'ko', VK_ALDEA.t + i);
    c.restore();
    vkTexto(50, yy + 7, F.nombre, { tam: 7, negrita: true, col: VK_COL.oro });
    vkTexto(50, yy + 15, tr(F.clase) + ' · ' + tr('nv. {n}', { n: s.nivel }), { tam: 6 });
    vkBarra(c, 50, yy + 20, 70, 6, vida / st.vidaMax, vida > 0 ? VK_COL.vida : VK_COL.rojo);
    vkTexto(124, yy + 23, vida + '/' + st.vidaMax, { tam: 5.5 });
    vkTexto(50, yy + 32, tr('Ataque {a} · Defensa {d}', { a: st.atq, d: st.def }), { tam: 5.5, col: VK_COL.crema });
    vkBarra(c, 50, yy + 39, 70, 4, s.xp / vkXpFan(s.nivel), VK_COL.azulClaro);
    // el equipo puesto y los botones
    vkCaja(c, 160, yy + 3, 16, 16, s.arma ? VK_COL.crema : '#5a3a24'); if (s.arma) vkIcono(c, 'espada', 168, yy + 11);
    vkCaja(c, 178, yy + 3, 16, 16, s.escudo ? VK_COL.crema : '#5a3a24'); if (s.escudo) vkIcono(c, 'escudo', 186, yy + 11);
    const lleno = vida >= st.vidaMax;
    if (!s.arma && SAVE.inv.espada > 0) vkBoton(c, 'equipa', 160, yy + 3, 16, 16, '', { col: 'verde', icono: 'espada', dato: [id, 'arma'] });
    if (!s.escudo && SAVE.inv.escudo > 0) vkBoton(c, 'equipa', 178, yy + 3, 16, 16, '', { col: 'verde', icono: 'escudo', dato: [id, 'escudo'] });
    vkBoton(c, 'comer', 156, yy + 24, 42, 18, tr('COMER'), { col: !lleno && SAVE.inv.pan > 0 ? 'naranja' : 'madera', icono: 'pan', tam: 6, dato: id, apagado: lleno || !SAVE.inv.pan });
  });
}

function vkPanelAlmacen(c, y) {
  const W = VK_V.W;
  ['zanahoria', 'pan', 'espada', 'escudo'].forEach((k, i) => {
    const yy = y + i * 26, C = VK_COSAS[k], n = SAVE.inv[k] || 0;
    vkCaja(c, 8, yy, W - 16, 23, '#8a5a32', '#a87444');
    vkIcono(c, C.icono, 20, yy + 11);
    vkTexto(32, yy + 8, tr(C.nombre), { tam: 7, negrita: true });
    vkTexto(32, yy + 17, n + ' / ' + VK_TOPE_ALMACEN, { tam: 6, col: n >= VK_TOPE_ALMACEN ? VK_COL.rojoClaro : VK_COL.crema });
    vkBoton(c, 'vende', W - 66, yy + 3, 54, 17, tr('VENDER {n}', { n: C.vende }), { col: n ? 'naranja' : 'madera', tam: 6, dato: k, apagado: !n });
  });
}

function vkPanelAsaltos(c, y) {
  const W = VK_V.W, vivos = VK_ORDEN_FANS.filter(id => SAVE.fans[id].vida > 0).length;
  vkTexto(10, y + 3, tr('Sede de Microblizz · planta {n}', { n: SAVE.planta + 1 }), { tam: 6.5, col: VK_COL.crema });
  VK_ASALTOS.forEach((a, i) => {
    const yy = y + 10 + i * 25, hecho = i < SAVE.asalto, toca = i === SAVE.asalto, cerrado = i > SAVE.asalto;
    vkCaja(c, 8, yy, W - 16, 22, toca ? '#a8642a' : hecho ? '#6b6a2a' : '#5a3a24', toca ? '#d08a44' : null);
    vkTexto(14, yy + 7, (i + 1) + '. ' + tr(a.nombre), { tam: 6.5, negrita: toca, col: cerrado ? '#c9a37a' : VK_COL.crema });
    const p = vkPremio(i, SAVE.planta);
    vkTexto(14, yy + 16, tr('{o} de oro · {n} oleadas', { o: p.oro, n: a.oleadas.length }) + (a.jefe ? ' · ' + tr('JEFE') : ''), { tam: 5.5, col: a.jefe ? VK_COL.rojoClaro : VK_COL.oro });
    if (!cerrado) vkBoton(c, 'asalta', W - 62, yy + 3, 50, 16, hecho ? tr('REPETIR') : tr('¡A POR ELLOS!'), { col: hecho ? 'azul' : 'naranja', tam: hecho ? 6 : 5.5, dato: i, apagado: !vivos });
  });
  if (!vivos) vkTexto(W / 2, y + 10 + 7 * 25 + 4, tr('Tus fans están KO: dales pan en la Casa'), { tam: 6, al: 'center', col: VK_COL.rojoClaro });
}

/* ---------- qué hace cada botón ---------- */
function vkPulsaAldea(b) {
  const id = b.id;
  if (id === 'fondo') { VK_ALDEA.panel = null; return; }
  if (id === 'nada') return;
  if (id === 'cerrar') { play('select'); VK_ALDEA.panel = null; return; }
  if (id === 'opciones') { play('select'); vkAbreOpciones(); return; }
  if (id === 'abre' || id === 'edif') {
    if (!vkAbierto(b.dato)) { play('vkNoVale'); vkAviso(tr('Se abre con la aldea a nivel {n}', { n: VK_EDIFICIOS[b.dato].nivel }), 'mal'); return; }
    play('select'); VK_ALDEA.panel = b.dato; return;
  }
  if (b.apagado) { play('vkNoVale'); return; }
  if (id === 'encola') {
    const r = vkEncola(b.dato[0], b.dato[1]);
    if (r === 'ok') play('vkPon'); else { play('vkNoVale'); vkAviso(r === 'llena' ? tr('La cola está llena') : tr('Te falta material'), 'mal'); }
    return;
  }
  if (id === 'comer') {
    const st = vkStats(b.dato);
    SAVE.inv.pan--; SAVE.fans[b.dato].vida = Math.min(st.vidaMax, SAVE.fans[b.dato].vida + VK_COSAS.pan.cura);
    SAVE.hechos.comer++; play('vkCura'); vkGuardaLuego(); return;
  }
  if (id === 'equipa') {
    const [fan, hueco] = b.dato, cosa = hueco === 'arma' ? 'espada' : 'escudo';
    SAVE.inv[cosa]--; SAVE.fans[fan][hueco] = 1;
    if (hueco === 'escudo') SAVE.fans[fan].vida += VK_COSAS.escudo.vida;
    SAVE.hechos.equipar++; play('vkEquipa'); vkGuardaLuego(); return;
  }
  if (id === 'vende') { SAVE.inv[b.dato]--; SAVE.oro += VK_COSAS[b.dato].vende; play('vkMoneda'); vkGuardaLuego(); return; }
  if (id === 'asalta') { play('select'); VK_ALDEA.panel = null; vkEmpiezaAsalto(b.dato); }
}

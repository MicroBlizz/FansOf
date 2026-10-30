// Fans of Goose · LOS CAMINOS QUE SE BIFURCAN (como en Slay the Spire): al vencer al minijefe de la puerta de una tierra, eliges por
// dónde sigues. El CAMINO SEGURO pone en esa tierra una Fuente (te cura) y un Mercader (compras con tus monedas). El CAMINO DEL PELIGRO
// pone un Altar (todas tus armas suben un nivel a cambio de vida) y un Tesoro (tumba a sus tres guardianas y llévate dos cofres), y las
// ocas de esa tierra son más duras pero dan más plumas. Cada partida, un mapa distinto. En Con amigos no hay cruce (todos el mismo).
// También aquí: ELECCION, la ventana de elegir entre dos (la usan el cruce y el altar), y ajustaEnemigo (noche + camino).
'use strict';

const CAMINOS = {
  seguro:  { nombre: 'CAMINO SEGURO', color: '#3f9a3a', casillas: ['fuente', 'mercader'], desc: 'Una Fuente que te cura y un Mercader.' },
  peligro: { nombre: 'CAMINO DEL PELIGRO', color: '#c0302f', casillas: ['altar', 'tesoro'], desc: 'Un Altar y un Tesoro con guardianas. Ocas más duras, que dan más plumas.' },
};
const CASILLA_CAMINO = {
  fuente:   { nombre: 'LA FUENTE', icono: 's-fuente', color: '#6bf2ff' },
  mercader: { nombre: 'EL MERCADER', icono: 's-mercader', color: '#ffd34d' },
  altar:    { nombre: 'EL ALTAR', icono: 's-altar', color: '#ff4d4d' },
  tesoro:   { nombre: 'EL TESORO', icono: 's-tesoro', color: '#ffcf33' },
};
const MERCADER = [
  { id: 'carta', nombre: 'Una mejora', desc: 'Elige una mejora ahora', coste: 25, icono: 'cadencia' },
  { id: 'asada', nombre: 'Oca asada', desc: 'Te cura la mitad', coste: 12, icono: 'pollo' },
  { id: 'tirada', nombre: 'Dado de repuesto', desc: '+1 «Volver a tirar»', coste: 20, icono: 'dado6' },
  { id: 'bendito', nombre: 'Dado bendito', desc: 'El próximo dado sale par, +1', coste: 18, icono: 'suerte' },
];

// --- cada oca al nacer: la noche y el camino ---
function ajustaEnemigo(e) {
  e.oculta = false;
  nocheEnemigo(e);
  const J = JUEGO; if (!J.ruta || e.tipo === 'jefe' || e.tipo === 'parca') return;
  if (J.ruta[tierraActual()] === 'peligro' && !e.tipo.startsWith('mj-')) { e.hpMax = e.hp = e.hp * 1.3; e.xp *= 1.5; }
}

// --- el cruce: al vencer al minijefe ---
function abreCruce(tierra) {
  const J = JUEGO; if (J.carrera || !J.ruta || J.ruta[tierra]) return;
  const B = datosTierra(tierra) || biomaDe(J.casilla);
  abreEleccion(tr('¿POR DÓNDE SIGUES?'), tr(B.nombre), ['seguro', 'peligro'].map(id => {
    const C = CAMINOS[id];
    return { titulo: tr(C.nombre), color: C.color, texto: tr(C.desc), iconos: C.casillas.map(c => CASILLA_CAMINO[c].icono), accion: () => eligeCamino(tierra, id) };
  }));
}
function eligeCamino(tierra, id) {
  const J = JUEGO, B = BIOMAS.find(b => b.id === tierra); J.ruta[tierra] = id;
  if (B) for (const tipo of CAMINOS[id].casillas) { const t = casillaLibre(B.desde + 2, B.desde + 8); if (t) J.extra[t] = { tipo, usada: false }; }
  if (id === 'peligro') { SAVE.peligros = (SAVE.peligros || 0) + 1; guarda(); }
  aviso(tr(CAMINOS[id].nombre), CAMINOS[id].color, 1.6); aviso2(tr(CAMINOS[id].desc));
}
// una casilla de ese tramo que no tenga ya otra cosa
function casillaLibre(a, b) {
  const J = JUEGO, C = J.casillas, ocupada = new Set([C.puenteDe, C.puenteA, C.pozo, C.dado1, C.dado2, C.posada, C.laberinto, C.carcel, C.muerte, ...C.puertas, ...CFG.ocasAdorno]);
  for (const t in CFG.ocaSalta) { ocupada.add(+t); ocupada.add(CFG.ocaSalta[t]); }
  const libres = []; for (let t = a; t <= Math.min(b, CFG.muerte - 2); t++) if (!ocupada.has(t) && !J.extra[t]) libres.push(t);
  return libres.length ? libres[(azar() * libres.length) | 0] : 0;
}

// --- al caer en una de estas casillas (lo llama llegada). true si era una de ellas ---
function llegadaCamino(t) {
  const J = JUEGO, X = J.extra && J.extra[t]; if (!X || X.usada) return false;
  X.usada = true; const C = CASILLA_CAMINO[X.tipo];
  aviso(tr(C.nombre), C.color, 1.6);
  if (X.tipo === 'fuente') {
    const cura = J.st.vidaMax * 0.5 * J.mod.cura; J.vida = Math.min(J.st.vidaMax, J.vida + cura);
    aviso2(tr('El agua te cura')); texto(J.yo.x, J.yo.y - 16, '+' + Math.round(cura), '#6bf2ff', 9, 1); anillo(J.yo.x, J.yo.y, 70, '#6bf2ff', 0.6, 4); SONIDO.cura();
  } else if (X.tipo === 'mercader') {
    J.escena = { tipo: 'mercader', compradas: {} }; for (let i = ENE.n - 1; i >= 0; i--) ENE.lista[i].hp = 0; BALAS.vacia();
    aviso2(tr('Compra con tus monedas. Tira el dado para irte')); SONIDO.posada();
  } else if (X.tipo === 'altar') {
    const precio = Math.round(J.st.vidaMax * 0.3);
    abreEleccion(tr('EL ALTAR'), tr('La sangre por el poder'), [
      { titulo: tr('OFRECER {n} DE VIDA', { n: precio }), color: '#c0302f', texto: tr('Todas tus armas suben un nivel.'), iconos: ['s-altar'], accion: () => ofreceAltar(precio), puede: J.vida > precio + 1 },
      { titulo: tr('DEJARLO'), color: '#2f74c0', texto: tr('Mejor no tentar a la suerte.'), iconos: [], accion: () => {} },
    ]);
  } else if (X.tipo === 'tesoro') {
    const cx = centroX(t), cy = yCentro(t);
    J.escena = { tipo: 'tesoro', restan: 3, cx, cy, t };
    for (let i = 0; i < 3; i++) { const e = creaEnemigo('gorda', cx + (i - 1) * 40, cy - 40); if (e) { e.pozo = true; e.hpMax = e.hp = e.hp * 1.5; e.xp = 12; } }
    aviso2(tr('Tumba a sus tres guardianas')); SONIDO.jefe(); tiembla(4);
  }
  return true;
}
function ofreceAltar(precio) {
  const J = JUEGO; J.vida -= precio; destella('#ff2d2d', 0.5); SONIDO.evolucion(); tiembla(5);
  for (const id in J.armas) if (ARMAS[id] && J.armas[id].nivel < MAX_NIVEL) aplicaCarta(cartaArma(id));
  aviso(tr('¡PODER!'), '#ff4d4d', 1.4); aviso2(tr('Todas tus armas suben un nivel'));
}
function compraMercader(o) {
  const J = JUEGO, E = J.escena; if (!E || E.compradas[o.id]) return;
  if (J.monedasPartida < o.coste) { toast(tr('Te faltan monedas')); SONIDO.dadoMalo(); return; }
  J.monedasPartida -= o.coste; E.compradas[o.id] = true; J.compro = true; SONIDO.moneda();
  if (o.id === 'carta') J.pendientes++;
  else if (o.id === 'asada') { J.vida = Math.min(J.st.vidaMax, J.vida + J.st.vidaMax * 0.5 * J.mod.cura); SONIDO.cura(); }
  else if (o.id === 'tirada') J.tiradas++;
  else if (o.id === 'bendito') { J.dado.bendito = true; J.dado.maldito = false; }
}
// el tesoro: cuando caen las tres guardianas, dos cofres
function avanzaCaminos() {
  const J = JUEGO, E = J.escena;
  if (E && E.tipo === 'tesoro' && E.restan <= 0) {
    J.escena = null; J.quieto = 0;
    suelta('cofre', E.cx - 14, E.cy - 20, 1); suelta('cofre', E.cx + 14, E.cy - 20, 1);
    for (let i = 0; i < 10; i++) suelta('moneda', E.cx + (Math.random() - 0.5) * 50, E.cy + (Math.random() - 0.5) * 30, 1);
    aviso(tr('¡EL TESORO ES TUYO!'), '#ffcf33', 1.8); SONIDO.victoria(); destella('#ffd34d', 0.4);
  }
}

// --- dibujo: las casillas del camino en el tablero y la tienda del mercader en el marcador ---
function pintaCaminos() {
  const J = JUEGO; if (!J.extra) return;
  // el cartel del cruce en la puerta de cada tierra donde ya elegiste
  if (SPR['s-cruce']) for (const B of BIOMAS) if (J.ruta[B.id] && B.desde > 1) { const y = yCentro(B.desde) - 30; if (y < J.camY + PAN.H + 40 && y > J.camY - 60 && y < J.yD) pinta('s-cruce', centroX(B.desde) - anchoDe(B.desde) * 0.36, y, J.ruta[B.id] === 'peligro'); }
  for (const k in J.extra) {
    const t = +k, X = J.extra[k], y = yCentro(t) - 24; if (y > J.camY + PAN.H + 40 || y < J.camY - 60 || y > J.yD) continue;
    const C = CASILLA_CAMINO[X.tipo], x = centroX(t);
    G.globalAlpha = X.usada ? 0.35 : 0.3 + Math.sin(J.t * 4 + t) * 0.12; G.fillStyle = C.color; G.beginPath(); G.ellipse(x, y + 14, 26, 8, 0, 0, 6.283); G.fill();
    G.globalAlpha = X.usada ? 0.45 : 1;
    if (SPR[C.icono]) pinta(C.icono, x, y + Math.sin(J.t * 2 + t) * 1.2);
    else { G.fillStyle = '#120808'; G.fillRect(x - 10, y - 10, 20, 20); G.fillStyle = C.color; G.fillRect(x - 8, y - 8, 16, 16); }
    G.globalAlpha = 1;
    if (!X.usada) texto2(tr(C.nombre), x, y + 26, 5.5, C.color, 'center', FUENTE, 800, 0.3);
  }
}
function pintaCaminosHud() {
  const J = JUEGO, E = J.escena, W = PAN.W, H = PAN.H; if (!E) return false;
  if (E.tipo === 'tesoro') { texto2(tr('GUARDIANAS'), W / 2, 66, 7, '#c9b98a'); texto2(String(Math.max(0, E.restan)), W / 2, 80, 20, '#ffcf33', 'center', FUENTE_G, 400, 0.2); return true; }
  if (E.tipo !== 'mercader') return false;
  const y0 = H - 118;
  caja(8, y0, W - 16, 110, 8, 'rgba(26,14,8,.92)', '#ffd34d', 1.5);
  texto2(tr('EL MERCADER'), W / 2, y0 + 10, 9, '#ffd34d', 'center', FUENTE_G, 400, 0.25);
  MERCADER.forEach((o, i) => {
    const x = 14 + (i % 2) * ((W - 28) / 2 + 4), y = y0 + 20 + Math.floor(i / 2) * 36, w = (W - 32) / 2, hecha = E.compradas[o.id], puede = J.monedasPartida >= o.coste;
    caja(x, y, w, 32, 6, hecha ? '#160b08' : '#2a1610', hecha ? '#3a2016' : puede ? '#ffd34d' : '#6e4426', 1.2);
    icono(o.icono, x + 12, y + 16, 9);
    texto2(tr(o.nombre), x + 24, y + 9, 6.5, hecha ? '#6e4426' : '#fff4dc', 'left');
    texto2(hecha ? tr('comprado') : tr(o.desc), x + 24, y + 19, 5, hecha ? '#6e4426' : '#c9b98a', 'left', FUENTE, 700, 0);
    if (!hecha) { pinta('moneda', x + w - 22, y + 26, false, false, 0.7); texto2(String(o.coste), x + w - 16, y + 26.5, 6, puede ? '#ffcf33' : '#ff8a6b', 'left'); BOTONES.push({ x, y, w, h: 32, accion: () => compraMercader(o) }); }
  });
  texto2(tr('Tira el dado para irte'), W / 2, y0 + 101, 6, '#ffd34d', 'center', FUENTE, 700, 0);
  return true;
}

// --- ELECCION: dos (o más) tarjetas grandes; la partida espera ---
// si en ese momento sale otra ventana (un cofre que cae encima), espera: avanzaPartida la abre al volver al juego
function abreEleccion(titulo, sub, opciones) { const J = JUEGO; J.eleccion = { titulo, sub, opciones, t: 0 }; if (J.modo === 'juego') J.modo = 'eleccion'; ENTRADA.mx = ENTRADA.my = 0; SONIDO.nivel(); }
function pintaEleccion(dt) {
  const J = JUEGO, E = J.eleccion, W = PAN.W, H = PAN.H; if (!E) { J.modo = 'juego'; return; }
  E.t += dt; oscurece(Math.min(0.8, E.t * 3));
  texto2(E.titulo, W / 2, 46, 15, '#ffd34d', 'center', FUENTE_G, 400, 0.2);
  if (E.sub) texto2(E.sub, W / 2, 62, 7, '#f1e6c8');
  const n = E.opciones.length, alto = Math.min(110, (H - 120) / n - 10);
  E.opciones.forEach((o, i) => {
    const y = 76 + i * (alto + 10), k = Math.max(0, Math.min(1, E.t * 4 - i * 0.5)), x = 16 + (1 - k) * (i % 2 ? 60 : -60), w = W - 32, puede = o.puede !== false;
    G.globalAlpha = k * (puede ? 1 : 0.5);
    caja(x, y, w, alto, 8, '#24120c', o.color, 2.2);
    texto2(o.titulo, x + w / 2, y + 14, 10, o.color, 'center', FUENTE_G, 400, 0.25);
    o.iconos.forEach((ic, j) => { const ix = x + w / 2 + (j - (o.iconos.length - 1) / 2) * 44, iy = y + alto / 2 + 2; if (SPR[ic]) pinta(ic, ix, iy, false, false, Math.min(1, 34 / Math.max(SPR[ic].w, SPR[ic].h))); });
    parrafo(o.texto, x + 10, y + alto - 18, w - 20, 6, '#f1e6c8');
    G.globalAlpha = 1;
    if (puede && k >= 1) BOTONES.push({ x, y, w, h: alto, accion: () => { SONIDO.boton(); J.eleccion = null; J.modo = 'juego'; J.invul = Math.max(J.invul, 0.6); o.accion(); } });
  });
}

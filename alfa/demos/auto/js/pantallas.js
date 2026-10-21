// Fans of Auto · LAS PANTALLAS: el título (con el barrio vivo de fondo), la pausa, las opciones (sonido, música, pantalla
// completa, detalle de gráficos para móviles flojos, tamaño de los mandos táctiles y las teclas del PC) y el final. Los menús
// se manejan con el dedo (tocando una fila) o con el teclado (arriba, abajo y la tecla de acción).
'use strict';

const MENU = { items: [], sel: 0, titulo: '', filas: [] };
function abreMenu(titulo, items, sel = 0) { MENU.titulo = titulo; MENU.items = items; MENU.sel = sel; MENU.filas = []; }
function pasoMenu() {
  const t = MANDO.toque;
  if (t) { const i = MENU.filas.findIndex(f => t.y >= f.y - 2 && t.y < f.y + 10 && t.x > f.x0 && t.x < f.x1); if (i >= 0) { MENU.sel = i; activaMenu(0); } }
  if (MANDO.pulso.arriba) { MENU.sel = (MENU.sel + MENU.items.length - 1) % MENU.items.length; play('blip'); }
  if (MANDO.pulso.abajo) { MENU.sel = (MENU.sel + 1) % MENU.items.length; play('blip'); }
  if (MANDO.pulso.izquierda) activaMenu(-1);
  if (MANDO.pulso.derecha) activaMenu(1);
  if (MANDO.pulso.ok) activaMenu(0);
  if (MANDO.pulso.atras) { const v = MENU.items.find(i => i.atras); if (v) v.haz(0); }
  MANDO.pulso.arriba = MANDO.pulso.abajo = MANDO.pulso.izquierda = MANDO.pulso.derecha = MANDO.pulso.ok = MANDO.pulso.atras = false;
}
function activaMenu(d) { const it = MENU.items[MENU.sel]; if (it && it.haz) { play('select'); it.haz(d); } }
function pintaMenu(g, y0) {
  const W = J.W, w = Math.min(W - 24, 260), x = (W - w) / 2, h = 18 + MENU.items.length * 12;
  g.fillStyle = 'rgba(14,16,22,0.88)'; g.fillRect(x, y0, w, h);
  g.fillStyle = '#f28c28'; g.fillRect(x, y0, w, 2);
  escribe(g, MENU.titulo, W / 2, y0 + 5, { c: ORO, borde: TINTA, alin: 'centro' });
  MENU.filas = [];
  MENU.items.forEach((it, i) => {
    const y = y0 + 17 + i * 12, sel = i === MENU.sel;
    if (sel) { g.fillStyle = 'rgba(242,140,40,0.25)'; g.fillRect(x + 4, y - 2, w - 8, 11); }
    const texto = typeof it.texto === 'function' ? it.texto() : it.texto;
    escribe(g, (sel ? '> ' : '') + texto, x + 10, y, { c: sel ? '#ffffff' : '#d9d4c7', borde: TINTA });
    if (it.valor) escribe(g, it.valor(), x + w - 10, y, { c: sel ? ORO : '#8fc3e6', borde: TINTA, alin: 'der' });
    MENU.filas.push({ y, x0: x, x1: x + w });
  });
}

/* ---------- el título ---------- */
function alTitulo() {
  J.estado = 'titulo'; J.cam.inicio = true;
  if (!S || S.jugadores[0].vidas < 0) nuevoEstado(cargaPartida());
  S.pausa = false; S.oferta = null;
  const hay = !!cargaPartida();
  abreMenu(tr('FANS OF AUTO'), [
    ...(hay ? [{ texto: tr('Continuar'), haz: () => empiezaJuego(false) }] : []),
    { texto: hay ? tr('Nueva partida') : tr('Jugar'), haz: () => empiezaJuego(true) },
    { texto: tr('Opciones'), haz: () => abreOpciones('titulo') },
  ]);
  musica('menu');
}
function empiezaJuego(nueva) {
  if (nueva) { borraPartida(); nuevoEstado(null); }
  J.estado = 'juego'; J.cam.inicio = true; S.pausa = false;
  musica('animales');
  mensaje(tr('Distrito Beta Abierta. Roba un coche: nadie te va a decir que no.'), 300);
}
function pasoTitulo() {
  // el barrio sigue vivo de fondo (el jugador quieto)
  pasoSim({});
  pasoCamara();
  pasoMenu();
}
function pintaTitulo(g) {
  pintaMundo(g);
  g.fillStyle = 'rgba(14,16,22,0.35)'; g.fillRect(0, 0, J.W, J.H);
  escribe(g, 'FANS OF', J.W / 2, 14, { esc: 2, c: ['#ffffff', '#e8eeff', '#a9b8e6'], borde: TINTA, alin: 'centro' });
  escribe(g, 'AUTO', J.W / 2, 34, { esc: 4, c: ORO, borde: TINTA, alin: 'centro' });
  escribe(g, tr('DISTRITO BETA ABIERTA · DEMO ') + VERSION_AUTO, J.W / 2, 72, { fuente: 'mini', c: '#d9d4c7', borde: TINTA, alin: 'centro' });
  pintaMenu(g, 88);
  const ayuda = MANDO.tactil ? tr('Palanca para moverte · ENTRAR sube al coche · TIRO dispara / FRENO derrapa') : tr('Mover: ') + nombreTecla(teclasDe('arriba')[0]) + nombreTecla(teclasDe('izquierda')[0]) + nombreTecla(teclasDe('abajo')[0]) + nombreTecla(teclasDe('derecha')[0]) + ' · ' + nombreTecla(teclasDe('entrar')[0]) + tr(' coche · ') + nombreTecla(teclasDe('accion')[0]) + tr(' disparar o freno de mano');
  escribe(g, ayuda, J.W / 2, J.H - 12, { fuente: 'mini', c: '#8fc3e6', borde: TINTA, alin: 'centro' });
}

/* ---------- la pausa ---------- */
function pausa() {
  J.estado = 'pausa'; S.pausa = true; sueltaTodo();
  abreMenu(tr('PAUSA'), [
    { texto: tr('Continuar'), haz: continua, atras: true },
    { texto: tr('Opciones'), haz: () => abreOpciones('pausa') },
    { texto: tr('Volver al título'), haz: () => { S = null; alTitulo(); } },
  ]);
}
function continua() { J.estado = 'juego'; S.pausa = false; }
function pasoPausa() { pasoMenu(); }
function pintaPausa(g) { pintaMundo(g); g.fillStyle = 'rgba(14,16,22,0.5)'; g.fillRect(0, 0, J.W, J.H); pintaMenu(g, 50); }

/* ---------- las opciones ---------- */
function abreOpciones(desde) {
  J.estado = 'opciones'; J.desde = desde;
  const siNo = v => (v ? tr('Sí') : tr('No'));
  abreMenu(tr('OPCIONES'), [
    { texto: tr('Sonido'), valor: () => siNo(!AJUSTES.mudo), haz: cambiaSonido },
    { texto: tr('Música'), valor: () => siNo(!AJUSTES.sinMusica), haz: cambiaMusica },
    { texto: tr('Pantalla completa'), valor: () => siNo(!!document.fullscreenElement), haz: pantallaCompleta },
    { texto: tr('Gráficos'), valor: () => (AJUSTES.detalle === 'bajo' ? tr('Bajos (móvil flojo)') : tr('Normales')), haz: () => { AJUSTES.detalle = AJUSTES.detalle === 'bajo' ? 'normal' : 'bajo'; guardaAjustes(); } },
    { texto: tr('Tamaño de los mandos táctiles'), valor: () => ({ 0.8: tr('Pequeños'), 1: tr('Normales'), 1.25: tr('Grandes') })[AJUSTES.mandos], haz: d => { const v = [0.8, 1, 1.25], i = v.indexOf(AJUSTES.mandos); AJUSTES.mandos = v[(i + (d < 0 ? 2 : 1)) % 3]; guardaAjustes(); } },
    { texto: tr('Mandos en pantalla con ratón'), valor: () => siNo(!!AJUSTES.mandosPc), haz: () => { AJUSTES.mandosPc = !AJUSTES.mandosPc; } },
    { texto: tr('Teclas del ordenador'), haz: abreTeclas },
    { texto: tr('Volver'), haz: cierraOpciones, atras: true },
  ]);
}
function cierraOpciones() { if (J.desde === 'pausa') pausa(); else alTitulo(); }
function pantallaCompleta() {
  try { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); } catch (_) { /* no se puede */ }
}
function pasoOpciones() { if (J.desde === 'titulo') { pasoSim({}); pasoCamara(); } pasoMenu(); }
function pintaOpciones(g) { pintaMundo(g); g.fillStyle = 'rgba(14,16,22,0.5)'; g.fillRect(0, 0, J.W, J.H); pintaMenu(g, 30); }

/* ---------- las teclas del ordenador ---------- */
function abreTeclas() {
  J.estado = 'teclas'; J.esperaTecla = null;
  abreMenu(tr('TECLAS: elige una y pulsa la nueva'), [
    ...ACCIONES.map(a => ({ texto: tr(a[1]), valor: () => (J.esperaTecla === a[0] ? tr('¿Cuál?') : teclasDe(a[0]).map(nombreTecla).join(' / ')), haz: () => { J.esperaTecla = a[0]; MANDO.ultimaTecla = null; } })),
    { texto: tr('Teclas de serie'), haz: () => { teclasDeSerie(); } },
    { texto: tr('Volver'), haz: () => abreOpciones(J.desde), atras: true },
  ]);
}
function pasoTeclas() {
  if (J.esperaTecla) {
    if (MANDO.ultimaTecla && MANDO.ultimaTecla !== 'Escape') { ponTecla(J.esperaTecla, MANDO.ultimaTecla); J.esperaTecla = null; play('select'); }
    else if (MANDO.ultimaTecla === 'Escape') J.esperaTecla = null;
    MANDO.ultimaTecla = null;
    for (const k in MANDO.pulso) MANDO.pulso[k] = false;
    return;
  }
  pasoMenu();
}
function pintaTeclas(g) { pintaMundo(g); g.fillStyle = 'rgba(14,16,22,0.6)'; g.fillRect(0, 0, J.W, J.H); pintaMenu(g, 20); }

/* ---------- el final ---------- */
function alFin() {
  J.estado = 'fin'; S.pausa = true; sueltaTodo();
  const hay = !!cargaPartida();
  abreMenu(tr('FIN DEL ACCESO ANTICIPADO'), [
    ...(hay ? [{ texto: tr('Cargar la partida guardada'), haz: () => { nuevoEstado(cargaPartida()); empiezaJuego(false); } }] : []),
    { texto: tr('Volver al título'), haz: () => { S = null; alTitulo(); } },
  ]);
  musica('lose');
}
function pasoFin() { pasoMenu(); }
function pintaFin(g) {
  pintaMundo(g); g.fillStyle = 'rgba(14,16,22,0.6)'; g.fillRect(0, 0, J.W, J.H);
  escribe(g, tr('Te han cancelado para siempre.'), J.W / 2, 34, { c: ROJO_ROTULO, borde: TINTA, alin: 'centro' });
  escribe(g, tr('Dinero final: ') + miles(S.jugadores[0].dinero), J.W / 2, 46, { fuente: 'mini', c: '#d9d4c7', borde: TINTA, alin: 'centro' });
  pintaMenu(g, 64);
}

/* ---------- el juego ---------- */
function pasoJuego() {
  if (S.oferta) { pasoOferta(); return; }
  if (MANDO.pulso.pausa) { MANDO.pulso.pausa = false; pausa(); return; }
  leeMando();
  pasoSim(ORDENES);
  pasoCamara();
  const j = S.jugadores[0];
  if (j.vidas < 0 && j.muerto === 1) { alFin(); return; }
  if (!S.mision && j.buscado >= 3 && MUSICA !== 'boss') musica('boss'); else if (j.buscado < 2 && MUSICA === 'boss') musica('animales');
}
function pintaJuego(g) { pintaMundo(g); pintaMarcador(g); }

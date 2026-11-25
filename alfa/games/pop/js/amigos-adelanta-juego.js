// Fans of Pop · «TE HA ADELANTADO UN AMIGO», el cartel del camino (adaptador; tarea 384, ADR 224; forma A elegida por Pepins).
// · ppAdelantoActivo(): con el flag de amigos abierto y, mientras se prueba, solo en la alfa o en desarrollo.
// · ppAdelantoRevisa(latido): lo llama ppAmigosLatido con cada latido bueno. Compara con la foto guardada (SAVE.amigosFoto) usando las reglas
//   (js/amigos-adelanta.js). Sin adelanto, guarda la foto nueva. Con uno, lo deja esperando hasta que se vea en el camino; desde ese momento y
//   hasta cerrar Pop la foto ya no cambia, así que los adelantos de después salen la próxima vez que se abra (uno por sesión).
// · ppPintaAdelanto(c, t): lo llama ppPintaMapa al final de cada fotograma. En el modo fácil del camino baja el cartel arriba (cara del amigo,
//   «Ana te ha adelantado», por dónde va y JUGAR), se queda 6 s y se va solo; tocarlo lo cierra y JUGAR abre tu nivel. Al salir guarda la foto.
'use strict';
const PP_ADELANTO_CFG = Object.freeze({ dura: 6, baja: 0.35, x: 20, y: 18, w: 500, h: 96, cara: 64 });
// pendiente: { amigo, foto } esperando al camino; visto: ya salió en esta sesión; desde: t del primer fotograma en pantalla
const PP_ADELANTO = { pendiente: null, visto: false, desde: null, cerrado: false };
const ppAdelantoActivo = () => ppAmigosActivo() && typeof NUCLEO !== 'undefined' && !!(NUCLEO.alfa || NUCLEO.desarrollo);
function ppAdelantoRevisa(latido) {
  const A = PP_ADELANTO;
  if (!latido || !latido.ok || A.pendiente || A.visto || !ppAdelantoActivo()) return;
  const r = PP_ADELANTA.revisa(SAVE.amigosFoto, latido.amigos, ppAmigosPosicion());
  if (r.adelanto) { A.pendiente = { amigo: r.adelanto, foto: r.foto }; return; }
  if (r.foto && JSON.stringify(r.foto) !== JSON.stringify(SAVE.amigosFoto || null)) { SAVE.amigosFoto = r.foto; ppGuarda(); }
}
// al verse, la foto de ese momento queda guardada: el mismo adelanto no vuelve a salir
function ppAdelantoVisto(t) {
  const A = PP_ADELANTO;
  A.visto = true; A.desde = t;
  SAVE.amigosFoto = A.pendiente.foto; ppGuarda();
}
// 0 escondido arriba, 1 del todo abajo: baja, se queda y sube
function ppAdelantoBajada(pasado) {
  const K = PP_ADELANTO_CFG;
  if (pasado < 0 || pasado > K.dura) return 0;
  return Math.min(1, pasado / K.baja, (K.dura - pasado) / K.baja);
}
function ppAdelantoDibuja(c, a, y) {
  const K = PP_ADELANTO_CFG, cy = y + K.h / 2;
  c.fillStyle = '#fff'; c.beginPath(); c.roundRect(K.x, y, K.w, K.h, 26); c.fill();
  c.lineWidth = 5; c.strokeStyle = '#ff5fa8'; c.stroke();
  c.drawImage(ppAmigosMapaCara(ppAmigosMapaPersonaje(a)), K.x + 14, cy - K.cara / 2, K.cara, K.cara);
  const r = PP_AMIGOS_REGLAS.rotuloNivel(a), ancho = 260, tx = K.x + 14 + K.cara + 12 + ancho / 2;
  ppTextoCabe(c, tr('{nombre} te ha adelantado', { nombre: a.nombre || tr('Un amigo') }), tx, cy - 16, 26, ancho, '#c43a84', '#fff');
  ppTextoCabe(c, tr('Va por el mundo {m} · nivel {n}', { m: r.mundo, n: r.nivel }), tx, cy + 18, 20, ancho, '#7a1f4f', '#fff');
  const bx = K.x + K.w - 72;
  c.fillStyle = '#ff3d8b'; c.beginPath(); c.roundRect(bx - 56, cy - 26, 112, 52, 26); c.fill();
  ppTexto(c, tr('JUGAR'), bx, cy + 1, 24, '#fff', 'center', '#b0145a');
  return { x: bx, y: cy };
}
// panel DEV: el primer amigo del latido (o una Ana de prueba) te adelanta un nivel; el cartel sale al volver al camino. La foto guardada no cambia
function ppAdelantoDev() {
  const l = PP_AMIGOS_SRV.ultimo(), yo = ppAmigosPosicion();
  const a = (l && l.amigos && l.amigos[0]) || { codigo: 'DEVPRUEB', nombre: 'Ana', perfil: null };
  const fin = yo.nivel + 1 >= PP_MUNDOS[yo.mundo].niveles, pos = fin ? { mundo: yo.mundo + 1, nivel: 0 } : { mundo: yo.mundo, nivel: yo.nivel + 1 };
  Object.assign(PP_ADELANTO, { pendiente: { amigo: { ...a, ...pos }, foto: SAVE.amigosFoto || null }, visto: false, desde: null, cerrado: false });
  return ppAdelantoActivo() ? 'Vuelve al camino' : 'Abre antes el flag amigos';
}
function ppPintaAdelanto(c, t) {
  const A = PP_ADELANTO, K = PP_ADELANTO_CFG;
  if (!A.pendiente || A.cerrado || PP_MAPA.dif || !ppAdelantoActivo()) return;
  // con una ventana encima (Amigos, tienda, presentación del mundo) espera: si no, se gastaría sin verse
  if (!A.visto && (!$pp('#pp-modal').hidden || ppPresentaAbierta())) return;
  if (!A.visto) ppAdelantoVisto(t);
  const pasado = t - A.desde;
  if (pasado >= K.dura) { A.cerrado = true; return; }
  const b = ppAdelantoBajada(pasado);
  const y = K.y - (1 - b) * (K.y + K.h + 10);
  const jugar = ppAdelantoDibuja(c, A.pendiente.amigo, y);
  // van delante de los del mapa: el primero que toca el dedo gana (ppMapaArriba)
  PP_BOTONES_MAPA.unshift(
    { caja: [jugar.x - 56, jugar.y - 26, 112, 52], f: () => { A.cerrado = true; ppEntra(); } },
    { caja: [K.x, y, K.w, K.h], f: () => { A.cerrado = true; } });
}

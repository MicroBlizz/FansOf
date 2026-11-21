// Fans of Pop · CORAZONES ENTRE AMIGOS, abrir el enlace de un amigo (tarea #96, ADR 150): al arrancar con ?corazon=CÓDIGO (y el flag abierto)
// sale «Ana te pide un corazón» con el panel de su perfil y, según el caso, el botón REGALAR UN CORAZÓN o un aviso amable.
// · ppCorazonEnlaceArranca(): lo llama el arranque (js/principal.js); con el flag cerrado no hace nada y el parámetro se ignora.
// · ppCorazonAbreEnlace(codigo): pregunta quién pide (PP_CORAZON_SRV, js/pantalla-corazones.js) y abre la ventana cuando no haya otra abierta
//   (#pp-modal es uno solo: el reto de un amigo o el regalo diario no la pisan ni la tapan); ?corazon= se quita de la dirección al abrirla.
// Qué aviso y qué botones toca en cada caso lo dice js/corazones-vista.js; aquí solo se pinta y se pregunta.
'use strict';
const PP_CORAZON_ENLACE = { reloj: 0 };
// el panel del perfil de quien pide, animado mientras la ventana está abierta (perfil limpio; sin perfil, Lola de serie)
function ppCorazonPanel(perfil, nombre) {
  const cv = document.createElement('canvas'), px = Math.min(2, window.devicePixelRatio || 1), W = 220, H = 290;
  cv.className = 'pp-pf-panel'; cv.width = W * px; cv.height = H * px; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  const c = cv.getContext('2d'), turno = ++PP_CORAZON_ENLACE.reloj;
  const P = perfil ? PP_PERFIL.limpia(perfil, PP_MI.cat, null) : PP_PERFIL.inicial(PP_MI.cat);
  const pinta = t => {
    if (turno !== PP_CORAZON_ENLACE.reloj || !cv.isConnected) return;   // otra ventana: este lienzo ya no se usa
    c.setTransform(px, 0, 0, px, 0, 0); c.clearRect(0, 0, W, H);
    ppPerfilPanel(c, P, PP_MI.cat, nombre || tr('Alguien'), 13, 13, W - 26, H - 26, t / 1000);
    requestAnimationFrame(pinta);
  };
  requestAnimationFrame(() => requestAnimationFrame(pinta));
  return cv;
}
const ppCorazonTitulo = (nombre, caso) => (caso === 'propio' ? tr('Tu enlace de corazón') : nombre ? tr('{nombre} te pide un corazón', { nombre }) : tr('¡Te piden un corazón!'));
// regala el corazón; si sale bien, lo dice y deja solo seguir; si no, el caso amable del motivo
async function ppCorazonRegala(codigo, aviso, botones, seguir) {
  botones.hidden = true;
  const r = await PP_CORAZON_SRV.regalar(codigo);
  aviso.textContent = r.ok ? tr('¡Corazón enviado!') : ppCorazonAviso(r.motivo);
  if (r.ok) play('ppPremio');
  botones.hidden = false; botones.replaceChildren(seguir());
}
function ppCorazonSeguir(v) {
  if (v.seguir === 'jugar') return ppBoton(tr('JUGAR YO TAMBIÉN'), 'pp-btn2 pp-verde', () => { ppCierra(); ppEmpieza(false); });
  return ppBoton(tr('VOLVER'), 'pp-btn2 pp-azul', ppCierra);
}
function ppCorazonVentanaEnlace(codigo, q) {
  const caso = PP_CORAZONES_REGLAS.caso(q), v = PP_CORAZONES_VISTA.enlace(caso, SAVE.mejor);
  const nombre = q.ok ? q.nombre : null;
  const t = ppAbre('<h2></h2><p class="pp-sub" id="pp-cz-aviso"></p>');
  t.firstChild.textContent = ppCorazonTitulo(nombre, caso);
  if (q.ok) t.insertBefore(ppCorazonPanel(q.perfil, nombre), t.lastChild);
  const aviso = t.querySelector('#pp-cz-aviso'), botones = document.createElement('div');
  botones.className = 'pp-cz-botones';
  aviso.textContent = v.aviso ? ppCorazonAviso(v.aviso) : '';
  if (v.regalar) botones.appendChild(ppBoton(tr('REGALAR UN CORAZÓN'), 'pp-btn2 pp-verde', () => ppCorazonRegala(codigo, aviso, botones, () => ppCorazonSeguir(v))));
  if (v.pedir) ppBotonPedirCorazones(botones);
  if (!v.regalar) botones.appendChild(ppCorazonSeguir(v));
  t.appendChild(botones);
}
// #pp-modal es una sola ventana: si hay otra abierta (el reto de un amigo, el regalo diario…), se espera a que se cierre para no pisarla
const PP_CORAZON_HUECO = 500;   // ms entre una mirada y otra
async function ppCorazonEsperaHueco() {
  while (!$pp('#pp-modal').hidden) await new Promise(ok => setTimeout(ok, PP_CORAZON_HUECO));
}
// pregunta quién pide, espera a que la ventana esté libre y la abre; solo entonces se quita ?corazon= de la dirección
async function ppCorazonAbreEnlace(codigo) {
  const q = await PP_CORAZON_SRV.quien(codigo);
  await ppCorazonEsperaHueco();
  ppCorazonVentanaEnlace(codigo, q);
  ppCorazonQuitaUrl();
}
// la cuenta de invitado tarda un poco en estar lista: se espera hasta unos segundos; si no llega, se abre igual (saldrá el aviso de sin cuenta)
async function ppCorazonEsperaCuenta(intentos) {
  for (let i = 0; i < intentos && typeof CUENTA !== 'undefined' && CUENTA.activa && !CUENTA.usuario; i++) await new Promise(ok => setTimeout(ok, 1000));
}
// quita ?corazon= de la dirección sin recargar (no vuelve a abrirse al recargar)
function ppCorazonQuitaUrl() {
  try { const u = new URL(location.href); u.searchParams.delete('corazon'); history.replaceState(null, '', u.toString()); } catch (e) { /* da igual: solo se queda el parámetro */ }
}
function ppCorazonEnlaceArranca() {
  const codigo = PP_CORAZONES_REGLAS.deUrl(location.search);
  if (!codigo) return;
  setTimeout(async () => {   // con los flags ya leídos (como el botón PERFIL)
    if (!ppCorazonesActivo()) return;
    await ppCorazonEsperaCuenta(10);
    await ppCorazonAbreEnlace(codigo);
  }, 2500);
}

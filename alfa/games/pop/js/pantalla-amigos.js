// Fans of Pop · PESTAÑA AMIGOS, composición (tarea #145, ADR 189; boceto B elegido por Pepins): junta las reglas (js/amigos-reglas.js), los casos
// de uso con el servidor (js/amigos-servidor.js, sobre la lista común de core js/sistema/amigos.js) y la partida de este móvil. De aquí cuelgan:
// · ppAmigosActivo(): el flag 'amigos' de Pop. Cerrado, no hay botón AMIGOS, ni reloj, ni enlace ?amigo=, ni se habla con el servidor.
// · PP_AMIGOS_SRV: los casos de uso ya montados con la cuenta (lo usan también las caras del mapa, js/mapa-amigos.js).
// · ppAmigosVigila(): su reloj (lo arranca js/principal.js); en la portada o el camino pide el latido al llegar y luego cada 45 s.
// · ppAmigosBoton(): el botón AMIGOS de la barra de la portada con su globito (regalos del servidor y el de Lola).
// · El regalo diario de Lola (día de España con el reloj de confianza HORA, guardado en SAVE.amigosLola).
// La ventana está en js/pantalla-amigos-ventana.js; recoger, dar las gracias, «a todos» y el enlace ?amigo=, en js/pantalla-amigos-regalos.js.
'use strict';
const ppAmigosActivo = () => NUCLEO.flag('amigos', 'Pop: pestaña Amigos (tarea #145, ADR 189)', false);
const PP_AMIGOS_SRV = PP_AMIGOS.crea({
  cuenta: typeof CUENTA !== 'undefined' ? CUENTA : null,
  core: AMIGOS.crea({ cuenta: typeof CUENTA !== 'undefined' ? CUENTA : null, juego: 'pop', activo: ppAmigosActivo, enLinea: () => navigator.onLine !== false }),
  activo: ppAmigosActivo, enLinea: () => navigator.onLine !== false, reglas: PP_AMIGOS_REGLAS,
});
// latido: lo último que contestó el servidor (bueno o con su motivo); hoja: el amigo tocado; gracias: las que han llegado y aún no se han visto
const PP_AM = { latido: null, pedido: 0, va: null, aqui: false, hoja: null, quitar: false, aviso: '', gracias: [], sube: false, frase: 'gracias', enlace: { url: null, usuario: null, va: null } };
const PP_AM_CADA = 45000;   // ms entre un latido y otro con la portada o el camino a la vista
/* ---------- avisos amables ---------- */
// los motivos propios de Pop; los demás, con la frase común de core (AMIGOS.motivoTexto)
const PP_AM_AVISO = {
  sin_amigos: () => tr('Hoy no hay a quién mandar más corazones.'), frase: () => tr('Elige una frase.'),
  ya_hoy: () => tr('Hoy ya le has dado las gracias.'),
};
const ppAmAviso = motivo => (PP_AM_AVISO[motivo] ? PP_AM_AVISO[motivo]() : AMIGOS.motivoTexto(motivo));
/* ---------- por dónde vas (para que tus amigos te vean en el mapa) ---------- */
// el camino abierto o, en la portada, el guardado; sin camino, el principio. Mundo y nivel en base 0, como ppVaPor
function ppAmigosPosicion() {
  const run = PP_P || (SAVE.run && SAVE.run.v === 2 ? SAVE.run : null);
  if (!run) return { mundo: 0, nivel: 0 };
  const mundo = ppMundoDe(Math.min(run.nivel || 0, PP_TOTAL_NIVELES - 1))[0];
  const nivel = PP_SALTO.vaPor(run.nivel || 0, ppInicioMundo(mundo), PP_MUNDOS[mundo].niveles, PP_SALTO.esPendiente(run.pendientes || [], mundo));
  return { mundo, nivel: Math.min(nivel, PP_MUNDOS[mundo].niveles - 1) };   // acabado el mundo, se queda en su último nivel
}
/* ---------- el latido ---------- */
const ppAmLatidoBueno = () => (PP_AM.latido && PP_AM.latido.ok ? PP_AM.latido : null);
// las gracias se entregan una sola vez: se guardan hasta que se ven en la ventana (como mucho 5)
function ppAmGuardaGracias(r) {
  if (r.ok && r.gracias.length) PP_AM.gracias = [...r.gracias, ...PP_AM.gracias].slice(0, 5);
}
// los retos de amigos también llegan una sola vez: se pasan al reto (js/amigos-reto.js) si ya está cargado
function ppAmPasaRetos(r) {
  if (r.ok && typeof ppAmigosRetos === 'function') ppAmigosRetos(PP_AMIGOS_SRV.retos(r));
}
// pide el latido (uno a la vez); repinta: la ventana abierta se vuelve a pintar al llegar
function ppAmigosLatido(repinta = false) {
  if (PP_AM.va) return repinta ? PP_AM.va.then(r => { if (ppAmAbierta()) ppVentanaAmigos(); return r; }) : PP_AM.va;
  PP_AM.pedido = Date.now();
  const p = ppAmigosPosicion();
  PP_AM.va = PP_AMIGOS_SRV.latido(p.nivel, p.mundo).then(r => {
    PP_AM.latido = r;
    ppAmGuardaGracias(r); ppAmPasaRetos(r); ppAmigosGlobo();
    if (repinta && ppAmAbierta()) ppVentanaAmigos();
    return r;
  }).finally(() => { PP_AM.va = null; });
  return PP_AM.va;
}
// el reloj: solo con el flag abierto y en la portada o el camino; al llegar pide ya, y luego cada 45 s
function ppAmigosVigila() {
  if (!ppAmigosActivo()) { PP_AM.aqui = false; return; }
  const aqui = PP_PANT.actual === 'titulo' || PP_PANT.actual === 'mapa', llega = aqui && !PP_AM.aqui;
  PP_AM.aqui = aqui;
  if (aqui && (llega || Date.now() - PP_AM.pedido >= PP_AM_CADA)) ppAmigosLatido(true);
}
/* ---------- el regalo diario de Lola ---------- */
// el día de hoy en España (AAAA-MM-DD) con la hora de confianza de core
const ppAmigosDia = () => new Date(typeof HORA !== 'undefined' ? HORA.ahora() : Date.now()).toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
const ppAmLola = () => PP_AMIGOS_REGLAS.lola(ppAmigosDia(), SAVE.amigosLola || '');
const ppAmLolaHay = () => { const l = ppAmLola(); return l.ok && l.disponible; };
// abre el de hoy si cabe el corazón: suma el corazón y la ayuda, y guarda el día. Devuelve lo de las reglas ({ ok, ayuda } o { ok:false, error })
function ppAmLolaAbre() {
  const r = PP_AMIGOS_REGLAS.lolaAbrir(ppAmigosDia(), SAVE.amigosLola || '', ppVidas(), PP_CFG.vida, ppInfinitas());
  if (!r.ok) return r;
  ppSumaVida(r.corazones); ppDaAyuda(r.ayuda, 1);
  SAVE.amigosLola = r.dia; ppGuarda();
  PP_AM.sube = true;
  ppAmigosGlobo();
  return r;
}
/* ---------- el botón de la barra y su globito ---------- */
const ppAmRegalosN = () => { const l = ppAmLatidoBueno(); return l ? l.regalos.length : 0; };
const ppAmigosGloboN = () => ppAmRegalosN() + (ppAmLolaHay() ? 1 : 0);
function ppAmigosGlobo() {
  const b = $pp('#pp-amigos'); if (!b || b.hidden) return;
  let g = b.querySelector('.pp-am-globo');
  const n = ppAmigosGloboN();
  if (!n) { if (g) g.remove(); return; }
  if (!g) { g = document.createElement('em'); g.className = 'pp-am-globo'; b.appendChild(g); }
  g.textContent = String(n);
}
// AMIGOS en la barra de la portada: solo con el flag abierto (lo llaman ppIrA('titulo') y el arranque, con los flags ya leídos)
function ppAmigosBoton() {
  const b = $pp('#pp-amigos'); if (!b) return;
  b.hidden = !ppAmigosActivo();
  if (b.hidden) return;
  ppBarraBoton('#pp-amigos', 'amigos', tr('AMIGOS'));   // js/portada-barra.js
  ppAmigosGlobo();
}
/* ---------- invitar: el enlace propio ---------- */
// pedido por adelantado al abrir la ventana: así el toque de INVITAR comparte sin esperar (Safari solo comparte en el mismo toque)
const ppAmUsuario = () => (typeof CUENTA !== 'undefined' ? CUENTA.usuario : null);
const ppAmEnlaceUrl = () => (PP_AM.enlace.url && PP_AM.enlace.usuario === ppAmUsuario() ? PP_AM.enlace.url : null);
function ppAmEnlacePrepara() {
  const e = PP_AM.enlace;
  if (!e.va) {
    e.va = PP_AMIGOS_SRV.miEnlace(location.origin + location.pathname).then(r => {
      if (r.ok) { e.url = r.url; e.usuario = ppAmUsuario(); }
      return r;
    }).finally(() => { e.va = null; });
  }
  return e.va;
}
const ppAmInvitaTexto = () => tr('¡Juega conmigo a Fans of Pop! Con este enlace nos hacemos amigos:');
function ppAmEstado(boton, texto) {
  const p = boton.closest('.pp-am-pie') && boton.closest('.pp-am-pie').querySelector('.pp-am-estado');
  if (p) p.textContent = texto;
}
function ppAmCopia(boton, url) {
  if (!navigator.clipboard || !navigator.clipboard.writeText) { ppPedirMuestra(boton, url); return; }
  navigator.clipboard.writeText(ppAmInvitaTexto() + ' ' + url).then(() => ppAmEstado(boton, tr('¡Enlace copiado! Pásaselo a tus amigos.')), () => ppPedirMuestra(boton, url));
}
// comparte en el mismo toque: el menú del móvil; si no hay o falla (salvo que se cancele), copiado; si tampoco, a la vista (ppPedirMuestra)
function ppAmComparte(boton, url) {
  if (!navigator.share) { ppAmCopia(boton, url); return; }
  navigator.share({ title: 'Fans of Pop', text: ppAmInvitaTexto(), url }).catch(e => { if (!e || e.name !== 'AbortError') ppAmCopia(boton, url); });
}
// INVITAR: con el enlace ya en memoria se comparte al momento; si aún no estaba, este toque lo pide y lo enseña para un segundo toque
function ppAmInvita(boton) {
  const url = ppAmEnlaceUrl();
  if (url) { ppAmComparte(boton, url); return; }
  boton.disabled = true;
  ppAmEnlacePrepara().then(r => {
    boton.disabled = false;
    if (!r.ok) { ppAmEstado(boton, ppAmAviso(r.motivo)); return; }
    boton.textContent = tr('COMPARTIR');
    ppPedirMuestra(boton, r.url);   // js/pantalla-corazones.js
  });
}

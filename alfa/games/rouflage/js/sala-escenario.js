// Fans of Rouflage · LA SALA DE ESPERA EN TU ESCENARIO: en la sala CON AMIGOS, mientras el anfitrión elige las opciones, todos esperan dentro
// de SU escenario decorado («Mi escenario», escenario*.js), cada uno con su galleta y su nombre. El anfitrión lo sube a la sala al abrirla
// (red.escenario, servidor/59-rouflage-sala-escenario.sql) y los demás lo piden cada pocos segundos (red.escenarioVer), que solo lo manda
// si ha cambiado (y si está oculto por reportes o baneo, sala-votos.js lo deja en la sala de serie). Con desconocidos (BUSCAR PARTIDA) no se enseña: lo pintado a mano solo lo ven los amigos. Lo llama pvpPintaBusca.
'use strict';
const SALA_ESP = { datos: null, v: 0, codigo: '', mandado: '', tManda: 0, tPide: 0, pidiendo: false, raf: 0, t0: 0 };
const SALA_ESP_VACIA = { v: 1, e: 'oficina', m: [] };

function salaEspPaso(i, soyAnf) {
  const caja = E('busca-escenario'), ver = !!(i && i.privada && i.estado === 'espera' && typeof escenarioPinta === 'function');
  caja.hidden = !ver; if (!ver) { if (typeof salaVotosPaso === 'function') salaVotosPaso(null); return; }
  if (SALA_ESP.codigo !== i.codigo) Object.assign(SALA_ESP, { datos: null, v: 0, codigo: i.codigo, mandado: '', tManda: 0 });
  const red = RFRED.red;
  if (soyAnf) {
    SALA_ESP.datos = escenarioDatos();
    // lo sube al abrir la sala y, por si lo cambia mientras espera (o alguien lo pisó), otra vez cada 15 s
    if ((SALA_ESP.mandado !== i.codigo || Date.now() - SALA_ESP.tManda > 15000) && red.escenario) { SALA_ESP.mandado = i.codigo; SALA_ESP.tManda = Date.now(); Promise.resolve(red.escenario(SALA_ESP.datos)).then(r => { if (typeof salaVotosLee === 'function') salaVotosLee(r, true); })
      .catch(e => { if (!(typeof salaVotosError === 'function' && salaVotosError(e))) SALA_ESP.mandado = ''; }); }      // baneado o dibujo retirado: sala-votos.js lo dice y no se reintenta hasta dentro de 15 s
  } else if (red.escenarioVer && !SALA_ESP.pidiendo && Date.now() - SALA_ESP.tPide > 3500) {
    SALA_ESP.tPide = Date.now(); SALA_ESP.pidiendo = true;
    Promise.resolve(red.escenarioVer(SALA_ESP.v)).then(r => { if (r && r.v != null) { if (r.datos) SALA_ESP.datos = r.datos; SALA_ESP.v = r.v; if (typeof salaVotosLee === 'function') salaVotosLee(r, false); } })
      .catch(() => { /* sin servidor nuevo: el escenario de siempre */ }).finally(() => { SALA_ESP.pidiendo = false; });
  }
  const anf = (i.jugadores || []).find(j => j.orden === i.anfitrion);
  E('busca-escenario-t').textContent = soyAnf ? tr('Tus amigos esperan en tu escenario') : tr('Estáis en el escenario de {n}', { n: anf ? anf.nombre : '' });
  if (typeof salaVotosPaso === 'function') salaVotosPaso(i, soyAnf);      // me gusta, no me gusta y reportar (sala-votos.js)
  if (!SALA_ESP.raf) { SALA_ESP.t0 = performance.now(); SALA_ESP.raf = requestAnimationFrame(salaEspPinta); }
}

// cada fotograma, mientras se vea: el escenario y los de la sala de pie en él, respirando, con su nombre encima
function salaEspPinta(ahora) {
  const cv = E('busca-escenario-cv'), caja = E('busca-escenario');
  if (caja.hidden || E('p-busca').hidden || !RFP.info) { SALA_ESP.raf = 0; return; }
  SALA_ESP.raf = requestAnimationFrame(salaEspPinta);
  const dpr = Math.min(2, window.devicePixelRatio || 1), w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
  if (!w || !h) return;
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  const c = cv.getContext('2d'), k = w / SALA.W, alto = h / k, oy = Math.max(0, (SALA.H - alto) * 0.55), t = (ahora - SALA_ESP.t0) / 1000;
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#191430'; c.fillRect(0, 0, w, h);
  c.setTransform(k, 0, 0, k, 0, -oy * k);
  const jug = (RFP.info.jugadores || []).slice().sort((a, b) => a.orden - b.orden), n = jug.length, ancho = SALA.X1 - SALA.X0 - 120;
  const personajes = jug.map((j, idx) => {
    const x = SALA.X0 + 60 + (n === 1 ? ancho / 2 : ancho * idx / (n - 1)), y = oy + alto * 0.62 + (idx % 2) * 26;
    const ropa = j.yo && typeof ropaDe === 'function' ? ropaDe() : (j.ropa || {});
    return { x, y, pinta(g) {
      const bote = Math.sin(t * 3 + idx * 1.7) * 1.4;
      g.save(); g.translate(x - 34, y - 70 + bote); ARD.vestida(g, 68, 72, Object.assign({}, ropa, { mascota: null })); g.restore();
      rotulo(g, j.nombre || '', x, y - 82 + bote, 12, j.yo ? '#ffcb3d' : '#fff6ea', OL, LETRA_UI);
    } };
  });
  escenarioPinta(c, SALA_ESP.datos || SALA_ESP_VACIA, { k: Math.max(0.25, Math.round(k * 4) / 4), personajes, t });
}

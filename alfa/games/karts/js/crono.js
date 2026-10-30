// Fans of Karts · LOS MODOS DE CADA PISTA: carrera normal, CONTRARRELOJ (tú solo, tres Hotfix y tus fantasmas: el de tu mejor tiempo y
// el del desarrollador de Microblizz) y ESPEJO o «Sede invertida» (la pista del revés: se pinta volteada y el volante va al contrario;
// se abre ganando una carrera en nivel CEO). Los fantasmas propios se guardan en este navegador (fok-fantasmas); los tiempos, en la partida.
'use strict';

const MODOS = ['normal', 'crono', 'espejo'];
const NOMBRE_MODO = { normal: 'CARRERA', crono: 'CONTRARRELOJ', espejo: 'ESPEJO' };
PANT.modo = (() => { const m = new URLSearchParams(location.search).get('modo'); return MODOS.includes(m) ? m : 'normal'; })();
// el espejo de una pista se abre quedando 1.º en ella; ganar en nivel CEO los abre todos
const espejoAbierto = d => !!SAVE.logros.espejo || !!(d && SAVE.espejo && SAVE.espejo[d.id]) || new URLSearchParams(location.search).get('modo') === 'espejo';
function cambiaModo() {
  let i = MODOS.indexOf(PANT.modo);
  do i = (i + 1) % MODOS.length; while (MODOS[i] === 'espejo' && !espejoAbierto(PISTAS[PANT.pista]));
  PANT.modo = MODOS[i];
}
// ¿qué toca en esta carrera? (se llama al prepararla)
function modoDeCarrera(C, def, pvp) {
  const tuto = def.mundo === 0;
  C.crono = !pvp && !COPA.activa && !tuto && PANT.modo === 'crono';
  C.espejo = !pvp && !tuto && PANT.modo === 'espejo' && espejoAbierto(def);
  C.fantasmas = []; C.graba = null; C.premiada = false; C.gana = null; C.cronoCerrado = false; C.crono_ = null;
  if (C.crono) {
    const yo = C.karts[C.karts.length - 1]; yo.objeto = 'hotfix'; yo.usos = 3;
    for (const c of PISTA.regalos) c.t = 1e9;        // en la contrarreloj no hay regalos
    C.graba = { pts: [], vueltas: [], ultima: 0, vuelta: 1 };
    const mio = leeFantasmas()[claveCrono(def)], dev = fantasmaDev(claveCrono(def));
    if (dev) C.fantasmas.push(dev);
    if (mio) C.fantasmas.push({ pts: mio.pts, hz: 20, t: mio.t, fig: figuraCon(mio.piloto, Object.fromEntries(Object.entries(mio.lleva || {}).filter(([, v]) => COS[v]).map(([k, v]) => [k, COS[v]]))), nombre: 'TU RÉCORD' });
    comenta(dev ? 'El fantasma del desarrollador lo grabó un becario un viernes a las 18:59.' : 'Contrarreloj: tú, la pista y tres Hotfix.');
  }
  if (C.espejo) comenta('Sede invertida: Microblizz ha montado la pista al revés para ahorrar en planos.');
}

// ---------- los fantasmas ----------
function leeFantasmas() { try { return JSON.parse(localStorage.getItem('fok-fantasmas') || '{}'); } catch (_) { return {}; } }
// cada 1/20 s se apunta dónde va el jugador (x y y por 4, el ángulo por 100), y el tiempo de cada vuelta
function grabaFantasma(C) {
  const g = C.graba, yo = C.jugador; if (!g || C.estado !== 'corre' || yo.fin) return;
  const n = Math.floor(C.reloj * 20);
  while (g.pts.length / 3 <= n) g.pts.push(Math.round(yo.x * 4), Math.round(yo.y * 4), Math.round(yo.angVis * 100));
  if (yo.vuelta > g.vuelta) { g.vueltas.push(C.reloj - g.ultima); g.ultima = C.reloj; g.vuelta = yo.vuelta; }
}
// dónde va un fantasma en el tiempo t (entre dos puntos apuntados)
function posFantasma(f, t) {
  const n = f.pts.length / 3, i = limita(t * f.hz, 0, n - 1), a = Math.floor(i), b = Math.min(n - 1, a + 1), u = i - a, P = f.pts, e = f.hz === 20 ? 4 : 1;
  const x = (P[a * 3] + (P[b * 3] - P[a * 3]) * u) / e, y = (P[a * 3 + 1] + (P[b * 3 + 1] - P[a * 3 + 1]) * u) / e;
  const ang = f.hz === 20 ? (P[a * 3 + 2] + difAng(P[a * 3 + 2] / 100, P[b * 3 + 2] / 100) * 100 * u) / 100 : P[a * 3 + 2] / 100;
  return { x, y, ang, fin: i >= n - 1 };
}
function pintaFantasma(g, sx, sy, e) {
  lx.globalAlpha = g.f.dev ? 0.42 : 0.55;
  const rel = g.ang - Math.atan2(g.y - CAM.y, g.x - CAM.x);
  g.f.fig.pinta(lx, Math.round(sx), Math.round(sy), e, BASE_KART, -rel);
  lx.globalAlpha = 1;
  if (e > 0.7 * CAL && e < 3 * CAL) enUI(f => mini(lx, tr(g.f.nombre), Math.round(sx * f), Math.round((sy - 19 * e) * f), g.f.dev ? '#22e3ff' : '#ffe9a8', '#1c1028', 'centro'));
}
const VISTAS_FANTASMA = [];
function pintaFantasmas(C) {
  if (C.estado === 'cuenta') return;
  C.fantasmas.forEach((f, i) => {
    const p = posFantasma(f, C.reloj); if (p.fin) return;
    const g = VISTAS_FANTASMA[i] || (VISTAS_FANTASMA[i] = {}); Object.assign(g, p, { f });
    apunta(p.x, p.y, pintaFantasma, g, 10);
  });
}

// ---------- al acabar la contrarreloj: el récord (y su fantasma) y el del desarrollador ----------
function cierraCrono() {
  const C = CARRERA, yo = C.jugador, def = C.def; if (!C.crono || C.cronoCerrado) return; C.cronoCerrado = true;
  const t = yo.cerrado ? 0 : yo.fin, previo = SAVE.crono[claveCrono(def)], dev = fantasmaDev(claveCrono(def));
  if (t) C.graba.vueltas.push(t - C.graba.ultima);
  C.crono_ = { t, previo, dev: dev && dev.t, vueltas: C.graba.vueltas.slice(), record: !!t && (!previo || t < previo) };
  if (C.crono_.record) {
    SAVE.crono[claveCrono(def)] = Math.round(t * 1000) / 1000;
    const F = leeFantasmas(), L = llevaPara(yo.piloto.id);
    F[claveCrono(def)] = { t, piloto: yo.piloto.id, lleva: Object.fromEntries(Object.entries(L).map(([k, c]) => [k, c.id])), pts: C.graba.pts };
    try { localStorage.setItem('fok-fantasmas', JSON.stringify(F)); } catch (_) { /* sin sitio: el tiempo sí queda en la partida */ }
  }
  if (t && dev && t < dev.t) daCos('titulo-fantasma', '¡FANTASMA SUPERADO!');
}
function pantallaCrono() {
  const C = CARRERA, R = C.crono_ || {}, d = C.def;
  paseo(20, 34); velo(0.66);
  escribeB(lx, tr('CONTRARRELOJ'), PW / 2, 4, '#22e3ff', '#1c1028', 'centro', 2);
  marco(4, 22, 232, 96);
  escribe(lx, tr(d.nombre), PW / 2, 27, '#ffcb3d', '#1c1028', 'centro');
  escribeB(lx, R.t ? tiempoTxt(R.t) : tr('SIN TIEMPO'), PW / 2, 38, '#ffffff', '#1c1028', 'centro', 2);
  (R.vueltas || []).slice(0, 3).forEach((v, i) => mini(lx, trf('VUELTA %1', i + 1) + ': ' + tiempoTxt(v), 24 + i * 72, 58, '#bdb6d6'));
  const filas = [[tr('TU RÉCORD'), R.record ? tiempoTxt(R.t) : R.previo ? tiempoTxt(R.previo) : '--:--', R.record ? '#5ef27a' : '#ffffff'], [tr('FANTASMA DEL DESARROLLADOR'), R.dev ? tiempoTxt(R.dev) : '--:--', '#22e3ff']];
  filas.forEach(([n, v, c], i) => { mini(lx, n, 14, 72 + i * 11, '#bdb6d6'); escribe(lx, v, 226, 71 + i * 11, c, '#1c1028', 'der'); });
  const msg = !R.t ? 'Microblizz ha cerrado los servidores antes de que llegaras.' : R.record && R.previo ? '¡NUEVO RÉCORD! Microblizz lo pondrá en un anuncio sin pedirte permiso.' : R.record ? 'Primer récord. Ya tienes fantasma propio.' : 'Sin récord. El fantasma te ha visto llorar.';
  escribeLineas(lx, tr(msg), PW / 2, 96, 220, R.record ? '#5ef27a' : '#ffe9a8', null, 'centro', 9);
  if (R.t && R.dev && R.t < R.dev) mini(lx, tr('¡HAS GANADO AL DESARROLLADOR!'), PW / 2, 121, '#22e3ff', '#1c1028', 'centro');
  if (C.gana) mini(lx, trf('+%1 ORO · +%2 XP DE PASE', C.gana.oro, C.gana.xp), PW / 2, 132, '#ffe9a8', '#1c1028', 'centro');
  boton('OTRA VEZ', 4, 144, 74, () => empiezaCarga(), 13, '#22e3ff');
  boton('OTRA PISTA', 83, 144, 74, () => { musica('menu'); ve('pista'); }, 13);
  boton('MENÚ', 162, 144, 74, () => { musica('menu'); ve('titulo'); }, 13);
  PANT.atras = null;
}

// ---------- el espejo: la pantalla se voltea entera (como en las consolas) y el volante va al revés ----------
// (el volteo lo hace modoUI al copiar el mundo al lienzo de los menús: suelo.js; así las letras no salen al revés)
function volteaPantalla() { /* ya está volteado */ }

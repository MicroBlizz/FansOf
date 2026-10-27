// Fans of Rouflage · EL RETO «¿ME ENCUENTRAS?» (bocetos 5 y 6, aprobados por Daniel el 23-10-2026). Al acabar una partida de colado, COMPARTIR guarda tu
// escondite en el servidor (rouflage_reto_crear, servidor/79-rouflage-retos.sql: mapa, sitio, postura, animal y tu pintura) y manda la foto CON EL ENLACE
// ?reto=CODIGO. Quien lo abre (sin cuenta, sin descargar nada) ve quién le reta y en qué sala está, y juega un mini reto de becario: luces encendidas,
// empieza cerca de esa sala, 20 segundos y 3 cartas de despido, nada de bots ni de pistas. Al acabar se apunta el resultado y puede DEVOLVERLE EL RETO
// (jugar de colado y compartir su propia foto) o jugar una partida entera. La foto, el sitio y la pintura se guardan al hacer la foto (foto.js).
'use strict';

const RETO = { activo: false, d: null, tiempo: 20, cartas: 3, creando: null, codigo: '' };
const retoUrl = c => refEnlace(urlJuego() + '?reto=' + c);      // con tu código de amigo, si lo tienes (referidos.js)

// crear el reto con lo que guardó la foto (FOTO.reto): una vez por foto. Devuelve el código, o null si no hay red (entonces se comparte sin enlace de reto)
function retoCrear() {
  const f = FOTO.reto; if (!f) return Promise.resolve(null);
  if (RETO.creando) return RETO.creando;
  const cuerpo = { p_mapa: f.mapa, p_x: f.x, p_y: f.y, p_postura: f.postura, p_animal: f.animal, p_piel: f.piel, p_camo: f.camo, p_nombre: (typeof TIT !== 'undefined' && TIT.nombre) || '' };
  RETO.creando = Promise.race([RFRED.rpc('rouflage_reto_crear', cuerpo), new Promise((_, no) => setTimeout(() => no(new Error('tarda')), 4000))])
    .then(r => (RETO.codigo = (r && r.codigo) || '')).catch(e => { console.warn('[reto]', e); RETO.creando = null; return null; });
  return RETO.creando;
}

/* ---------- abrir un reto: ?reto=CODIGO ---------- */
// lo llama el arranque (principal.js): si el enlace trae un reto, se abre en vez del título. Devuelve si lo ha abierto
function retoEntrada() {
  const q = new URLSearchParams(location.search), c = (q.get('reto') || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5);
  if (c.length !== 5) return false;
  q.delete('reto'); history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash);      // recargar no vuelve a abrirlo
  retoAbre(c); return true;
}
async function retoAbre(c) {
  escenaTitulo(); pantalla('p-reto'); retoPinta('cargando');
  let d = null; try { d = await RFRED.rpcAnon('rouflage_reto_leer', { p_codigo: c }); } catch (e) { console.warn('[reto]', e); }
  if (!d || !d.piel || !MAPAS[d.mapa]) { retoPinta('error'); return; }
  RETO.d = d; retoPinta('intro');
}
// la ventana del reto: cargando, no existe, la presentación y el resultado
function retoPinta(estado, res) {
  const d = RETO.d, caja = E('reto-caja'); caja.dataset.estado = estado; E('p-reto').classList.toggle('abajo', estado === 'fin');
  const t = E('reto-titulo'), s = E('reto-sub'), x = E('reto-datos');
  E('b-reto-ir').hidden = estado !== 'intro'; E('b-reto-devolver').hidden = E('b-reto-jugar').hidden = estado !== 'fin';
  E('b-reto-titulo').hidden = estado === 'fin' || estado === 'cargando';
  x.textContent = '';
  if (estado === 'cargando') { t.textContent = tr('¿ME ENCUENTRAS?'); s.textContent = tr('Cargando el reto…'); return; }
  if (estado === 'error') { t.textContent = tr('ESTE RETO NO EXISTE'); s.textContent = tr('Puede que el enlace esté mal copiado o que el reto tenga más de 30 días. Pero puedes jugar igual.'); return; }
  const quien = d.nombre || tr('Tu amigo'), z = zonaEnMapa(d);
  if (estado === 'intro') {
    t.textContent = tr('RETO DE {n}', { n: quien.toUpperCase() });
    s.textContent = tr('Se ha escondido en {sala} ({mapa}). Tienes {s} segundos y {c} cartas de despido. Toca donde creas que está.', { sala: z, mapa: tr(MAPAS[d.mapa].nombre), s: RETO.tiempo, c: RETO.cartas });
    x.textContent = d.jugados ? tr('Lo han encontrado {e} de {j}', { e: d.encontrados, j: d.jugados }) : tr('Eres el primero en intentarlo');
    return;
  }
  // el resultado
  t.textContent = res.encontrado ? tr('¡ENCONTRADO EN {s} S!', { s: Math.max(1, Math.round(res.segundos)) }) : tr('¡SE TE HA ESCAPADO!');
  s.textContent = res.encontrado ? tr('{n} se lo merecía. Ahora te toca esconderte a ti.', { n: quien }) : tr('{n} estaba ahí, delante de tus narices. ¿Te vengas?', { n: quien });
  x.textContent = res.jugados ? tr('Lo han encontrado {e} de {j}', { e: res.encontrados, j: res.jugados }) : '';
}
// el nombre de la sala donde está escondido (cargando ese mapa un momento si hace falta: los nombres salen de sus datos)
function zonaEnMapa(d) {
  try { if (MAPA.id !== d.mapa) cargaMapa(d.mapa); const z = zonaEn(d.x, d.y); return z && z.nombre ? tr(z.nombre) : tr('el mapa'); } catch (e) { return tr('el mapa'); }
}

// un sitio libre para empezar: en la misma sala que el escondido, a 150-260 de distancia (o más cerca si la sala es pequeña)
function retoSitio(x, y) {
  const z = zonaEn(x, y);
  for (const [r0, r1, misma] of [[150, 260, true], [90, 170, true], [120, 260, false]]) {
    for (let i = 0; i < 250; i++) {
      const a = Math.random() * TAU, r = r0 + Math.random() * (r1 - r0), px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      if (px < 30 || py < 40 || px > ANCHO - 30 || py > ALTO - 10) continue;
      if (misma && z && zonaEn(px, py) !== z) continue;
      if (cabe(px, py)) return [px, py];
    }
  }
  return SALIDA_CAZADORES[1];
}

/* ---------- la partida del reto ---------- */
function retoEmpieza() {
  const d = RETO.d; if (!d) return;
  audioInit(); play('select'); pantalla(null);
  if (MAPA.id !== d.mapa) cargaMapa(d.mapa);
  limpiaPartida(); modoPon({ m: 'normal', x: { dia: 1 } });      // con las luces encendidas, como en la foto
  RETO.activo = true; J.modo = 'cazador'; J.t = 0; eventosPrepara();
  // el escondido: su animal, su postura y su pintura, ya congelado. No silba ni se mueve
  const k = nuevoEnte('camaleon', NOMBRES[d.animal] ? d.animal : 'bunny', d.nombre || tr('Tu amigo'), d.x, d.y);
  cambiaPostura(k, POSTURAS[d.postura] ? d.postura : 'firmes'); k.silbido = 1e9; k.granada = 0; k.reto = true; k.congelado = true; k.hielo = 1;
  const img = new Image();
  img.onload = () => { k.pctx.save(); k.pctx.globalCompositeOperation = 'copy'; k.pctx.drawImage(img, 0, 0); k.pctx.restore(); k.pintado = true; mideCamuflaje(k); };
  img.src = 'data:image/png;base64,' + d.piel;
  // tú: el becario, cerca y mirando hacia su sala
  const [sx, sy] = retoSitio(d.x, d.y);
  const yo = nuevoEnte('cazador', 'becario', tr('Tú'), sx, sy); yo.jugador = true; J.yo = yo; J.cuenta = yo.pts; yo.balas = RETO.cartas;
  yo.dir = Math.atan2(d.y - sy, d.x - sx); yo.mira = d.x >= sx ? 1 : -1; vistePartida(yo, ropaPartida());
  cambiaFase('caza');
  J.reloj = RETO.tiempo; J.recta = true; J.pings = 1e9;      // sin RECTA FINAL ni pistas: solo tus ojos
  cartel(tr('¡ENCUÉNTRALO!'), tr('{s} segundos y {c} cartas', { s: RETO.tiempo, c: RETO.cartas }));
  avanzaCamara(0, true); refrescaHud(true);
}
// el final del reto: en vez de la pantalla de siempre, el resultado (y se apunta en el servidor)
function retoAcaba(victoria) {
  REPORTE.suceso('reto', { victoria: !!victoria });
  J.fase = 'fin'; J.tFase = 0; J.finMostrado = true; RETO.activo = false;
  const k = J.camaleones.find(e => e.reto), segundos = RETO.tiempo - Math.max(0, J.reloj);
  if (k && !k.fuera) { descongela(k); fxTexto(k.x, k.y - 74, k.nombre, '#fff6ea', 14); }
  play(victoria ? 'crown' : 'deny'); if (typeof chatConsejoCierra === 'function') chatConsejoCierra();
  const res = { encontrado: victoria, segundos, jugados: (RETO.d.jugados || 0) + 1, encontrados: (RETO.d.encontrados || 0) + (victoria ? 1 : 0) };
  Promise.resolve(RFRED.rpcAnon('rouflage_reto_resultado', { p_codigo: RETO.d.codigo, p_encontrado: victoria, p_segundos: segundos })).catch(() => {});
  setTimeout(() => { pantalla('p-reto'); retoPinta('fin', res); }, 1300);
}

function preparaReto() {
  if (!PANTALLAS.includes('p-reto')) PANTALLAS.push('p-reto');
  E('b-reto-ir').onclick = retoEmpieza;
  E('b-reto-titulo').onclick = () => { play('select'); RETO.d = null; irTitulo(); };
  E('b-reto-jugar').onclick = () => { play('select'); RETO.d = null; irTitulo(); };
  E('b-reto-devolver').onclick = () => { RETO.d = null; abreBots('camaleon'); avisa(tr('Escóndete y, al acabar, comparte tu foto para devolverle el reto'), 'bueno'); };
  // el reto acaba con su propia pantalla, no con la del final de siempre
  const fin = termina;
  termina = (victoria, motivo, f) => { if (!RETO.activo || !J.camaleones.some(e => e.reto)) { RETO.activo = false; return fin(victoria, motivo, f); } if (J.fase !== 'fin') retoAcaba(!!victoria); };
}

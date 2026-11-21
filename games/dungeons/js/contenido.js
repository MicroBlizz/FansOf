// Fans of Dungeons · Lo nuevo de la 0.2.0 que se juega: SlyFox (sigilo, invisibilidad y ganzúa), los cafés y objetos nuevos
// (descafeinado, manzanilla y bomba), lo que hacen los enemigos nuevos al pegar, los mini-jefes y las tres salas especiales:
// la prisión (rescatas a MadSquirrel, que te acompaña para siempre), la biblioteca (un atril que lo identifica todo y
// pergaminos) y la sala maldita (un cofre enorme que cierra las rejas y llena la sala de enemigos hasta que no queda ninguno).
'use strict';

/* ---------- SlyFox y la invisibilidad ---------- */
const invisible = ent => !!ent && tieneEstado(ent, 'invisible');
// el multiplicador del golpe «a traición»: SlyFox ×3 contra quien no le ha visto o desde la invisibilidad; los demás, ×1,5 invisibles
function multTraicion(a, b) {
  if (a.bando !== 'heroe' || !b || b.bando !== 'enemigo') return 1;
  const sorpresa = !b.despierto || invisible(a);
  if (!sorpresa) return 1;
  return a.clase === 'slyfox' ? 2.5 : invisible(a) ? 1.5 : 1;
}
// después del golpe: la invisibilidad se rompe, salvo si SlyFox ha despedido a alguien (vuelve a desaparecer)
function trasTraicion(a, b, mult) {
  if (mult > 1) { fxRotulo(tr('¡A TRAICIÓN!'), '#b070f0'); }
  if (!invisible(a)) return;
  if (a.clase === 'slyfox' && b.vida <= 0) { a.estados.invisible = Math.max(a.estados.invisible, 2); log(tr('SlyFox vuelve a desaparecer entre las sombras.'), '#b070f0'); return; }
  a.estados.invisible = 0; log(tr('Te han visto: se acabó la invisibilidad.'), '#8c879a');
}
function esfumarse(h) {
  ponEstado(h, 'invisible', 4); fxExplosion(h.x, h.y, 0.7, '#7b2cbf'); fxRotulo(tr('¡ESFUMARSE!'), '#b070f0'); sonido('invocar'); anima(h, 'golpe', 0.3);
  for (const e of J.enemigos) if (e.ultimo) {   // te buscan donde no estás (siempre en un sitio por el que se puede andar)
    for (let i = 0; i < 12; i++) { const x = e.ultimo.x + D.entre(-3, 3), y = e.ultimo.y + D.entre(-3, 3); if (pasableM(J.mapa, x, y)) { e.ultimo = { x, y }; break; } }
  }
  log(tr('Esfumarse: 4 turnos invisible. Los enemigos te pierden de vista.'), '#b070f0');
}

/* ---------- los consumibles nuevos ---------- */
function usaNuevo(h, def) {
  if (def.efecto === 'invisible') { ponEstado(h, 'invisible', def.valor); fxExplosion(h.x, h.y, 0.5, '#7b2cbf'); log(tr('Café descafeinado: nadie se fija en ti durante 5 turnos.'), '#b070f0'); return true; }
  if (def.efecto === 'antidoto') {
    for (const k of ['veneno', 'quemado', 'bug']) h.estados[k] = 0;
    const n = Math.min(def.valor, h.vidaMax - h.vida); h.vida += n; recalcula(h);
    fxNumero(h.x, h.y, '+' + n, '#5fd36a'); log(tr('Manzanilla: se te pasa todo. Hasta las ganas de dimitir.'), '#5fd36a'); return true;
  }
  if (def.efecto === 'bomba') {
    const e = enemigoMasCercanoVisible(h);
    if (!e || pasos(h.x, h.y, e.x, e.y) > 5) { log(tr('No ves a nadie a quien lanzar la bomba.'), '#ff9aa4'); return false; }
    explota(e.x, e.y, def.valor + J.planta * 3, h);
    return true;
  }
  return null;   // no es nuevo
}
// una explosión de confeti en 3 × 3: daña a enemigos (y a ti, si estás dentro) y rompe lo que se rompe
function explota(x, y, dano, quien) {
  fxRayo(quien.x, quien.y, x, y, '#ffd040'); fxExplosion(x, y, 1.6, '#ff8ad0'); TEMBLOR.t = 0.3; TEMBLOR.f = 5; sonido('explosionGrande');
  fxRotulo(tr('¡CONFETI!'), '#ff8ad0');
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const cx = x + dx, cy = y + dy;
    if (enM(J.mapa, cx, cy) === T.ROMPIBLE) rompe(cx, cy, quien);
    const q = quienHay(cx, cy);
    if (q && q.bando === 'enemigo') dana(q, dano, 'golpe', quien);
    else if (q && q.bando === 'heroe') dana(q, Math.ceil(dano / 3), 'golpe', quien);
    fxChispas(cx, cy, D.elige(['#ff8ad0', '#ffd040', '#5ef2ff', '#5fd36a']), 4);
  }
  log(tr('¡La bomba revienta en una lluvia de confeti y despidos!'), '#ff8ad0');
}

/* ---------- lo que hacen al pegar los enemigos nuevos ---------- */
function trasGolpeEnemigo(a, b) {
  if (a.bando !== 'enemigo' || !b || b.bando !== 'heroe' || b.vida <= 0) return;
  const E = ENEMIGOS[a.tipo];
  if (E.flamea && D.prob(0.4)) { ponEstado(b, 'quemado', 2); log(tr('El Troll te flamea: te quemas 2 turnos.'), '#ff8a5c'); }
  if (E.roba && b.monedas > 0 && D.prob(0.35)) { const n = Math.min(b.monedas, 3 + J.planta); b.monedas -= n; fxNumero(b.x, b.y, '-' + n, '#ffd040', -10); log(fmt(tr('El Reclutador te cobra la «formación»: pierdes {n} monedas.'), { n }), '#ffd040'); }
}

/* ---------- mini-jefes: uno por zona, a veces, en una sala lejos de la entrada ---------- */
function ponMiniJefe(m, d, P, Z, planta, campo, out) {
  if (!Z.mini || P.jefe || planta < 2 || !d.prob(0.45)) return;
  const salas = m.salas.filter(s => s.tipo === 'normal' || s.tipo === 'cripta');
  const lejos = salas.filter(s => campo[s.cy * m.w + s.cx] >= 18);
  const s = d.elige(lejos.length ? lejos : salas); if (!s) return;
  const cas = casillasDe(m, s, T.SUELO).filter(([x, y]) => !out.ocupadas.has(clave(x, y)) && !m.trampas.has(clave(x, y)));
  if (!cas.length) return;
  const [x, y] = d.elige(cas);
  out.enemigos.push({ tipo: Z.mini, x, y, elite: false, sala: s }); out.ocupadas.add(clave(x, y));
}

/* ---------- salas especiales ---------- */
// la prisión: una jaula con MadSquirrel dentro, pegada a una pared, y dos guardias
function preparaPrision(m, s, d, planta, out) {
  const cas = casillasDe(m, s, T.SUELO).filter(([x, y]) => enM(m, x, y - 1) === T.MURO && pasableM(m, x, y + 1));
  const sitio = cas.length ? d.elige(cas) : [s.cx, s.cy];
  ponM(m, sitio[0], sitio[1], T.JAULA);
  const Z = ZONAS[zonaDe(planta)], libres = d.baraja(casillasDe(m, s, T.SUELO).filter(([x, y]) => pasos(x, y, sitio[0], sitio[1]) >= 2));
  for (let i = 0; i < Math.min(2, libres.length); i++) out.enemigos.push({ tipo: d.elige(Z.enemigos.filter(t => t !== 'cajabotin')), x: libres[i][0], y: libres[i][1], elite: false, sala: s });
}
function abreJaula(x, y) {
  const m = J.mapa, h = J.heroe;
  ponM(m, x, y, T.SUELO); fxExplosion(x, y, 0.6, '#b14d1c'); sonido('cofre');
  const ya = J.aliados.find(a => a.fig === 'ardilla');
  if (ya) { const n = D.entre(10, 20) + J.planta * 4; h.monedas += n; fxMonedas(x, y, 8); log(fmt(tr('Una prima de MadSquirrel te da las gracias con {n} monedas y una bellota (que se queda).'), { n }), '#ffd040'); accion(); return; }
  const a = nuevoAliado('bug', x, y, 999, h);
  Object.assign(a, { nombre: 'MadSquirrel', fig: 'ardilla', fiel: true, vida: 26 + h.nivel * 5, vidaMax: 26 + h.nivel * 5, atq: 6 + h.nivel, vel: 120 });
  J.aliados.push(a); hito('ardilla');
  fxRotulo(tr('¡MADSQUIRREL SE UNE!'), '#e0804a');
  log(tr('MadSquirrel sale de la jaula: «¡Por los Animales Locos!». Te acompaña planta a planta.'), '#e0804a');
  accion();
}
// la biblioteca: alfombra, un atril que identifica todo y dos pergaminos por el suelo
function preparaBiblioteca(m, s, d, planta, out) {
  for (let j = s.y; j < s.y + s.h; j++) for (let i = s.x; i < s.x + s.w; i++) if (enM(m, i, j) === T.SUELO) ponM(m, i, j, T.ALFOMBRA2);
  const cas = casillasDe(m, s, T.ALFOMBRA2).filter(([x, y]) => enM(m, x, y - 1) === T.MURO && pasableM(m, x, y + 1) && pasableM(m, x - 1, y) && pasableM(m, x + 1, y));
  const sitio = cas.length ? d.elige(cas) : [s.cx, s.cy];
  ponM(m, sitio[0], sitio[1], T.ATRIL);
  const resto = d.baraja(casillasDe(m, s, T.ALFOMBRA2));
  for (let i = 0; i < Math.min(2, resto.length); i++) out.objetos.push({ x: resto[i][0], y: resto[i][1], obj: { id: d.elige(['perg_auditoria', 'perg_reestructuracion', 'perg_despido', 'perg_ascenso', 'perg_auditoria']), rar: 0 } });
}
function leeAtril(x, y) {
  const m = J.mapa, h = J.heroe, k = clave(x, y);
  if (m.usado[k]) { log(tr('El atril ya no tiene nada nuevo. Solo el manual de estilo de 2009.'), '#8c879a'); return; }
  m.usado[k] = true;
  const antes = J.ident.length;
  for (const id of CONSUMIBLES_MISTERIO) if (!J.ident.includes(id)) J.ident.push(id);
  ganaXp(h, 10 + J.planta * 3); sonido('nivel'); fxExplosion(h.x, h.y, 0.6, '#c8a040');
  log(J.ident.length > antes ? tr('Lees el Manual del Empleado: ya sabes qué es cada café y cada pergamino. Y ganas experiencia.') : tr('Lees el Manual del Empleado. No aprendes nada nuevo, pero ganas experiencia.'), '#c8a040');
  accion();
}
// la sala maldita: un cofre enorme en el centro; al abrirlo, rejas y enemigos
function preparaMaldita(m, s, d) {
  for (let j = s.y; j < s.y + s.h; j++) for (let i = s.x; i < s.x + s.w; i++) if (enM(m, i, j) === T.SUELO) ponM(m, i, j, T.ALFOMBRA);
  s.maldita = true;
}
function abreMaldito(h, o) {
  const m = J.mapa, s = m.salas.find(q => q.maldita && h.x >= q.x && h.y >= q.y && h.x < q.x + q.w && h.y < q.y + q.h);
  const i = J.objetos.indexOf(o); if (i >= 0) J.objetos.splice(i, 1);
  if (!s) return;
  // las rejas: todas las puertas de la sala se cierran hasta que no quede ningún enemigo de la emboscada
  const rejas = [];
  for (let y = s.y - 1; y <= s.y + s.h; y++) for (let x = s.x - 1; x <= s.x + s.w; x++) {
    const t = enM(m, x, y), borde = x === s.x - 1 || y === s.y - 1 || x === s.x + s.w || y === s.y + s.h;
    if (borde && (t === T.PUERTA || t === T.PUERTA_ABIERTA || PASABLE.has(t)) && !quienHay(x, y)) { rejas.push([x, y, t]); ponM(m, x, y, T.REJA); }
  }
  const Z = ZONAS[m.zona], n = 3 + Math.min(3, Math.floor(J.planta / 3)), cas = D.baraja(casillasDe(m, s, T.ALFOMBRA).filter(([x, y]) => !quienHay(x, y) && pasos(x, y, h.x, h.y) >= 2));
  for (let k = 0; k < Math.min(n, cas.length); k++) {
    const e = nuevoEnemigo(D.elige(Z.enemigos.filter(t => t !== 'cajabotin')), cas[k][0], cas[k][1], J.planta, D.prob(0.25));
    e.despierto = true; e.maldito = true; J.enemigos.push(e); fxExplosion(e.x, e.y, 0.5, '#a8323a');
  }
  J.maldita = { rejas, premio: true };
  fxRotulo(tr('¡EMBOSCADA!'), '#ff4b5c'); TEMBLOR.t = 0.4; TEMBLOR.f = 5; sonido('jefe');
  log(tr('¡Era una reunión sorpresa de Recursos Humanos! Las rejas se cierran: nadie sale hasta que no quede nadie.'), '#ff4b5c');
}
// cada turno: si ya no queda nadie de la emboscada, se abren las rejas y llega el premio gordo
function revisaMaldita() {
  const mm = J.maldita; if (!mm || J.enemigos.some(e => e.maldito)) return;
  for (const [x, y, t] of mm.rejas) ponM(J.mapa, x, y, t === T.PUERTA ? T.PUERTA_ABIERTA : t);
  const h = J.heroe, n = D.entre(30, 50) + J.planta * 10;
  h.monedas += n; J.monedasVistas += n; fxMonedas(h.x, h.y, 10);
  J.objetos.push({ x: h.x, y: h.y, obj: generaObjeto(J.planta, D, D.elige(['arma', 'armadura', 'accesorio']), 3) });
  cogeDelSuelo(h);
  fxRotulo(tr('¡SUPERVIVIENTE!'), '#ffd040'); sonido('nivel');
  log(fmt(tr('Las rejas se abren. Premio por sobrevivir a la reunión: {n} monedas y un objeto épico.'), { n }), '#ffd040');
  J.maldita = null;
}

/* ---------- el dibujo de lo nuevo ---------- */
function creaIconosContenido() {
  const P = PAL_OBJ;
  icono('descafeinado', 26, 26, p => { taza(p, pal5('#c8a888', '#9a7a5a', '#e8d0b0', '#4a3020'), ''); p.plano(F.re(-3, -10, 6, 1), '#7b2cbf'); p.plano(F.re(-3, -8, 6, 1), '#7b2cbf'); });
  icono('manzanilla', 26, 26, p => { taza(p, pal5('#e8c84a', '#b8941a', '#fff09a', '#6a4a08'), 'vapor'); p.plano(F.tr(4, -13, 9, -19, 0.5), '#d9d2e0'); p.parte(F.rr(8, -21, 4, 4, 0.5), pal5('#5fd36a'), { sombra: 0 }); });
  icono('bomba', 26, 26, p => {
    p.parte(F.ov(0, -9, 8, 8), pal5('#ff8ad0', '#c04a98', '#ffc8ec', '#5a1a44'), { sombra: 2 });
    for (const [x, y, c] of [[-3, -12, '#ffd040'], [2, -7, '#5ef2ff'], [-1, -5, '#5fd36a'], [4, -12, '#ffffff']]) p.px(x, y, c);
    p.parte(F.rr(-2.5, -19, 5, 3, 1), P.acero, { sombra: 0 }); p.plano(F.tr(0, -19, 4, -23, 0.6), '#c8a888'); p.px(4.5, -24, '#ffd040'); p.px(5, -23, '#ff6a2a');
  });
  icono('jaula', 32, 44, p => {   // la jaula: barrotes por delante (la ardilla se pinta dentro, detrás)
    p.parte(F.rr(-13, -36, 26, 4, 1.5), P.acero, { sombra: 1 });
    p.parte(F.rr(-13, -4, 26, 4, 1), P.acero, { sombra: 1 });
    for (let x = -11; x <= 11; x += 4.4) p.parte(F.re(x, -33, 1.6, 30), P.acero, { sombra: 0, linea: false });
    p.parte(F.rr(-3, -40, 6, 4, 1), P.acero, { sombra: 0 }); p.plano(F.re(4, -22, 4, 5), P.oro.b);   // el candado
  });
  icono('atril', 32, 40, p => {   // el atril con el Manual del Empleado abierto
    p.parte(F.tr(0, -2, 0, -16, 2.2), P.madera, { sombra: 1 }); p.parte(F.rr(-8, -4, 16, 3, 1), P.madera, { sombra: 1 });
    p.parte(F.pol(-12, -24, 12, -24, 10, -15, -10, -15), P.madera, { sombra: 2 });
    p.parte(F.pol(-11, -27, 0, -24, 0, -17, -10, -19), P.papel, { sombra: 1 }); p.parte(F.pol(11, -27, 0, -24, 0, -17, 10, -19), P.papel, { sombra: 1 });
    for (let k = 0; k < 3; k++) { p.plano(F.re(-8, -24 + k * 2, 6, 0.8), P.papel.o); p.plano(F.re(2, -24 + k * 2, 6, 0.8), P.papel.o); }
  });
  icono('atril_leido', 32, 40, p => { p.parte(F.tr(0, -2, 0, -16, 2.2), P.madera, { sombra: 1 }); p.parte(F.rr(-8, -4, 16, 3, 1), P.madera, { sombra: 1 }); p.parte(F.pol(-12, -24, 12, -24, 10, -15, -10, -15), P.madera, { sombra: 2 }); p.parte(F.rr(-8, -22, 16, 3, 1), pal5('#6a2a3a'), { sombra: 0 }); });
  icono('reja', 32, 40, p => { for (let x = -13; x <= 12; x += 5) p.parte(F.re(x, -34, 2.2, 34), pal5('#8a2a30', '#5a1018', '#c04a50', '#2a0408'), { sombra: 0 }); p.parte(F.rr(-14, -36, 28, 4, 1), pal5('#8a2a30', '#5a1018', '#c04a50', '#2a0408'), { sombra: 1 }); p.parte(F.rr(-14, -18, 28, 3, 1), pal5('#8a2a30', '#5a1018', '#c04a50', '#2a0408'), { sombra: 1 }); });
  icono('cofre_maldito', 40, 40, p => {   // el cofre enorme de la sala maldita: rojo oscuro, con calavera dorada
    p.parte(F.rr(-15, -18, 30, 16, 2), pal5('#7a1a2a', '#4a0a16', '#a83a4a', '#1e0408'), { sombra: 2 });
    p.parte(F.rr(-16, -24, 32, 8, 3), pal5('#7a1a2a', '#4a0a16', '#a83a4a', '#1e0408'), { sombra: 2 });
    for (const x of [-11, 9]) p.parte(F.re(x, -24, 3, 22), P.oro, { sombra: 0 });
    p.parte(F.ov(0, -15, 4, 4), P.oro, { sombra: 1 }); p.px(-1.5, -15.5, '#1e0408'); p.px(1.5, -15.5, '#1e0408'); p.plano(F.re(-1, -12.5, 2, 1), '#1e0408');
  });
  ESCOMBROS_COLOR.ardilla = ESCOMBROS_COLOR.ardilla || ['#b14d1c', '#f6d7a7'];
}

// partidas guardadas con algo metido en un muro (fallo de la 0.2.0 con Esfumarse): se saca a la casilla libre más cercana
function rescataDeMuros() {
  const m = J.mapa, mal = (x, y) => !pasableM(m, x, y) && enM(m, x, y) !== T.PUERTA_ABIERTA;
  const cerca = (x, y, libre) => { for (let r = 1; r <= 4; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const nx = x + dx, ny = y + dy; if (pasableM(m, nx, ny) && libre(nx, ny)) return [nx, ny]; } return null; };
  for (const o of J.objetos) if (mal(o.x, o.y)) { const c = cerca(o.x, o.y, () => true); if (c) { o.x = c[0]; o.y = c[1]; } }
  for (const e of J.enemigos.concat(J.aliados)) if (mal(e.x, e.y)) { const c = cerca(e.x, e.y, (x, y) => !quienHay(x, y)); if (c) { e.x = c[0]; e.y = c[1]; } }
}

// Fans of Karts · LA ECONOMÍA: el oro (se gana corriendo), las gemas (la moneda «premium»: en este prototipo se ganan jugando o en la
// tienda de prueba, que no cobra), lo que tienes y lo que llevas puesto, el pase de temporada (XP por carrera), la Licencia VIP de prueba
// y los premios del nivel CEO. Todo va en SAVE (la partida, que core sube a la nube con la cuenta). Nada de esto corre más: solo se ve.
'use strict';

const KECO = {
  oroPuesto: [60, 45, 35, 25, 20, 15, 10, 5], oroMoneda: 4, multNivel: [1, 1.5, 2], vipOro: 1.5,      // oro por puesto, por moneda recogida, por nivel y con VIP
  oroCopa: [300, 200, 100], oroCrono: 25,
  xpPuesto: [70, 60, 50, 45, 40, 35, 30, 25], xpCrono: 35, xpPvp: 60, xpNivel: 100,                  // XP del pase: por puesto, contrarreloj, PvP y lo que cuesta cada nivel
  premium: 100,                                                                                       // el pase premium, en gemas
  obsequio: { oro: 150, gemas: 10, xp: 40 },                                                          // la caja del CEO al ganar online (siempre lo mismo: no es una caja de botín)
};
const KTEMP = { n: 1, nombre: 'Despidos masivos', fin: '2026-12-31' };

// lo que falte en la partida se pone a cero
for (const [k, v] of Object.entries({ oro: 0, gemas: 0, tengo: {}, lleva: {}, xp: 0, premium: false, cobrado: {}, vip: false, logros: {}, copasCeo: {}, crono: {}, liga: 1000, espejo: {} })) if (SAVE[k] === undefined) SAVE[k] = v;

// ---------- el catálogo de cosméticos ----------
// de: 'tienda' (con oro u gemas), 'ceo' (premio del nivel CEO), 'pase' (pase de temporada), 'vip' (con la licencia), 'logro', 'gratis'
const TIPOS_COS = [['humo', 'HUMO'], ['ruedas', 'RUEDAS'], ['pintura', 'PINTURA'], ['kart', 'KART'], ['skin', 'ASPECTO'], ['titulo', 'TÍTULO']];
const KCOS = [
  { id: 'humo-rosa', tipo: 'humo', nombre: 'Humo rosa chicle', de: 'tienda', oro: 250, c: ['#ff8ac0', '#ffd6ea'] },
  { id: 'humo-verde', tipo: 'humo', nombre: 'Humo radiactivo', de: 'tienda', oro: 250, c: ['#5ef27a', '#d0ffd8'] },
  { id: 'humo-morado', tipo: 'humo', nombre: 'Humo de streamer', de: 'tienda', oro: 400, c: ['#a855f7', '#e2c8ff'] },
  { id: 'humo-arcoiris', tipo: 'humo', nombre: 'Humo arcoíris', de: 'tienda', gemas: 30, c: 'arcoiris' },
  { id: 'humo-caido', tipo: 'humo', nombre: 'Humo de servidor caído', de: 'pase', c: ['#ff3348', '#2b2d3a'] },
  { id: 'humo-billetes', tipo: 'humo', nombre: 'Humo de billetes', de: 'pase', c: ['#5ef27a', '#c8f0a0'] },
  { id: 'humo-oro', tipo: 'humo', nombre: 'Paracaídas dorado', de: 'ceo', como: 'Gana las 4 copas en nivel CEO.', c: ['#ffcb3d', '#fff3a0'] },
  { id: 'ruedas-hielo', tipo: 'ruedas', nombre: 'Llantas azul hielo', de: 'tienda', oro: 300, c: ['#3a3446', '#22e3ff'] },
  { id: 'ruedas-chicle', tipo: 'ruedas', nombre: 'Llantas chicle', de: 'tienda', oro: 300, c: ['#3a3446', '#ff8ac0'] },
  { id: 'ruedas-neon', tipo: 'ruedas', nombre: 'Ruedas de neón', de: 'tienda', gemas: 25, c: ['#22e3ff', '#ff3df0'] },
  { id: 'ruedas-cono', tipo: 'ruedas', nombre: 'Ruedas de obras', de: 'pase', c: ['#ff8a1f', '#ffffff'] },
  { id: 'ruedas-oro', tipo: 'ruedas', nombre: 'Ruedas de oro macizo', de: 'ceo', como: 'Gana las 4 copas en nivel CEO.', c: ['#ffcb3d', '#fff3a0'] },
  { id: 'pintura-negra', tipo: 'pintura', nombre: 'Negro mate ejecutivo', de: 'tienda', oro: 600, c: ['#2b2d3a', '#5b556b'] },
  { id: 'pintura-cromo', tipo: 'pintura', nombre: 'Cromo de lujo', de: 'tienda', gemas: 40, c: ['#c3cbe0', '#ffffff'], brillo: true },
  { id: 'pintura-becario', tipo: 'pintura', nombre: 'Beige de becario', de: 'pase', c: ['#d8c8a0', '#a89870'] },
  { id: 'pintura-oro', tipo: 'pintura', nombre: 'Oro corporativo', de: 'pase', c: ['#ffcb3d', '#fff3a0'], brillo: true },
  { id: 'pintura-vip', tipo: 'pintura', nombre: 'Licencia dorada', de: 'vip', c: ['#1c1028', '#ffcb3d'] },
  { id: 'kart-silla', tipo: 'kart', nombre: 'Silla de oficina dorada', de: 'ceo', como: 'Gana una copa en nivel CEO.' },
  { id: 'kart-carrito', tipo: 'kart', nombre: 'Carrito de micropagos', de: 'pase' },
  { id: 'skin-ceo-bunny', tipo: 'skin', nombre: 'CrazyBunny CEO', de: 'ceo', solo: 'bunny', como: 'Gana dos copas en nivel CEO.' },
  { id: 'titulo-becario', tipo: 'titulo', nombre: 'Becario del mes', de: 'gratis' },
  { id: 'titulo-empleado', tipo: 'titulo', nombre: 'Empleado ejemplar', de: 'logro', como: 'Gana una carrera en nivel Empleado.' },
  { id: 'titulo-ceo', tipo: 'titulo', nombre: 'CEO de Microblizz', de: 'ceo', como: 'Gana una carrera en nivel CEO.' },
  { id: 'titulo-derrape', tipo: 'titulo', nombre: 'Rey del derrape', de: 'tienda', oro: 500 },
  { id: 'titulo-influencer', tipo: 'titulo', nombre: 'Influencer de karts', de: 'tienda', gemas: 20 },
  { id: 'titulo-fantasma', tipo: 'titulo', nombre: 'Fantasma de oficina', de: 'logro', como: 'Gana al fantasma del desarrollador en una contrarreloj.' },
  { id: 'titulo-agresivo', tipo: 'titulo', nombre: 'Ejecutivo agresivo', de: 'pase' },
  { id: 'titulo-farmeo', tipo: 'titulo', nombre: 'Farmeador profesional', de: 'pase' },
  { id: 'titulo-accionista', tipo: 'titulo', nombre: 'Accionista mayoritario', de: 'pase' },
  { id: 'titulo-vip', tipo: 'titulo', nombre: 'Piloto con licencia', de: 'vip' },
];
const COS = {}; for (const c of KCOS) COS[c.id] = c;

// ---------- el pase de temporada: 10 niveles, cada uno con su premio gratis (g) y el premium (p) ----------
const KPASE = [
  { g: { oro: 100 }, p: { gemas: 20 } }, { g: { cos: 'ruedas-cono' }, p: { cos: 'humo-caido' } }, { g: { oro: 150 }, p: { oro: 400 } },
  { g: { gemas: 10 }, p: { cos: 'titulo-agresivo' } }, { g: { cos: 'pintura-becario' }, p: { cos: 'kart-carrito' } }, { g: { oro: 200 }, p: { gemas: 30 } },
  { g: { cos: 'titulo-farmeo' }, p: { cos: 'humo-billetes' } }, { g: { gemas: 15 }, p: { oro: 600 } }, { g: { oro: 300 }, p: { cos: 'pintura-oro' } },
  { g: { gemas: 25 }, p: { cos: 'titulo-accionista' } },
];
for (const [i, n] of KPASE.entries()) for (const r of [n.g, n.p]) if (r.cos) COS[r.cos].nivel = i + 1;
// cómo se consigue lo que aún no tienes (ya traducido)
const comoCos = c => c.nivel ? trf('Pase de temporada: nivel %1.', c.nivel) : c.de === 'vip' ? tr('Viene con la Licencia VIP.') : tr(c.como || '');
const nivelPase = () => Math.min(KPASE.length, Math.floor(SAVE.xp / KECO.xpNivel));

// ---------- tener, llevar y comprar ----------
const tieneCos = id => { const c = COS[id]; return !!c && (c.de === 'gratis' || !!SAVE.tengo[id] || (c.de === 'vip' && SAVE.vip)); };
const llevaCos = tipo => { const id = SAVE.lleva[tipo]; return id && tieneCos(id) ? COS[id] : null; };
const sirveA = (c, piloto) => !c.solo || c.solo === piloto;
function ponCos(id) { const c = COS[id]; if (!c || !tieneCos(id)) return; SAVE.lleva[c.tipo] = SAVE.lleva[c.tipo] === id ? null : id; guardaPartida(); }
function compraCos(id) {
  const c = COS[id]; if (!c || tieneCos(id) || c.de !== 'tienda') return false;
  if (c.oro && SAVE.oro < c.oro) return 'Te falta oro. Microblizz recomienda correr más (o comprar gemas).';
  if (c.gemas && SAVE.gemas < c.gemas) return 'Te faltan gemas.';
  if (c.oro) SAVE.oro -= c.oro; if (c.gemas) SAVE.gemas -= c.gemas;
  SAVE.tengo[id] = 1; SAVE.lleva[c.tipo] = id; guardaPartida(); play('levelup');
  return true;
}

// ---------- premios: la cola de ventanas que salen encima (¡DESBLOQUEADO!, nivel del pase…) ----------
const KPREMIOS = [];
function avisaPremio(titulo, lineas, color = '#ffcb3d') { KPREMIOS.push({ titulo, lineas, color }); }
// un premio { oro | gemas | cos } se da y devuelve su línea para la ventana
function daPremio(r) {
  if (r.oro) { SAVE.oro += r.oro; return { ico: 'oro', txt: '+' + r.oro + ' ' + tr('ORO') }; }
  if (r.gemas) { SAVE.gemas += r.gemas; return { ico: 'gema', txt: '+' + r.gemas + ' ' + tr('GEMAS') }; }
  if (r.cos && !tieneCos(r.cos)) { SAVE.tengo[r.cos] = 1; return { ico: 'cos', cos: r.cos, txt: tr(COS[r.cos].nombre) }; }
  return null;
}
function daCos(id, titulo) { if (tieneCos(id)) return false; const l = daPremio({ cos: id }); avisaPremio(titulo || '¡DESBLOQUEADO!', [l]); return true; }
// XP del pase: al subir de nivel se cobra lo de ese nivel (y lo premium, si lo tienes)
function darXp(n) {
  const antes = nivelPase(); SAVE.xp += n;
  for (let i = antes; i < nivelPase(); i++) cobraNivel(i, true);
}
function cobraNivel(i, aviso) {
  const ls = [];
  for (const [fila, r] of [['g', KPASE[i].g], ['p', KPASE[i].p]]) {
    if (SAVE.cobrado[i + fila] || (fila === 'p' && !SAVE.premium)) continue;
    SAVE.cobrado[i + fila] = 1; const l = daPremio(r); if (l) ls.push(l);
  }
  if (aviso && ls.length) avisaPremio(trf('PASE: NIVEL %1', i + 1), ls, '#5ef27a');
  return ls;
}
function compraPremium() {
  if (SAVE.premium) return true;
  if (SAVE.gemas < KECO.premium) return 'Te faltan gemas. Las puedes conseguir en la tienda (en el prototipo, gratis).';
  SAVE.gemas -= KECO.premium; SAVE.premium = true;
  const ls = []; for (let i = 0; i < nivelPase(); i++) ls.push(...cobraNivel(i, false));
  avisaPremio('¡PASE PREMIUM!', ls.length ? ls : [{ ico: 'cos', txt: tr('Los premios premium se cobran al subir de nivel.') }], '#ff5cf0');
  guardaPartida(); play('levelup');
  return true;
}
const diasTemporada = () => Math.max(0, Math.ceil((new Date(KTEMP.fin + 'T23:59:59') - Date.now()) / 864e5));

// ---------- al acabar una carrera (contra la máquina, contrarreloj o PvP): oro, XP y premios del nivel ----------
function premiosCarrera() {
  const C = CARRERA; if (!C.resultado || C.premiada) return; C.premiada = true;
  const yo = C.resultado.find(r => r.jugador); if (!yo) return;
  const dif = C.pvp ? 1 : nivelDif(), mult = C.crono ? 1 : KECO.multNivel[dif] * (SAVE.vip ? KECO.vipOro : 1);
  const oro = Math.round(((C.crono ? KECO.oroCrono : KECO.oroPuesto[yo.puesto - 1] || 5) + yo.monedas * KECO.oroMoneda) * mult);
  const xp = C.crono ? KECO.xpCrono : C.pvp ? KECO.xpPvp : KECO.xpPuesto[yo.puesto - 1] || 25;
  SAVE.oro += oro; C.gana = { oro, xp };
  darXp(xp);
  // los premios de ganar en cada nivel (no en el tutorial, ni en la contrarreloj, ni en el PvP)
  if (!C.pvp && !C.crono && !TUTO.activo && yo.puesto === 1) {
    // quedar 1.º en una pista abre su espejo (si no lo tenías ya por ganar en CEO)
    if (!SAVE.espejo[C.def.id] && !SAVE.logros.espejo && dif < 2) { SAVE.espejo[C.def.id] = 1; avisaPremio('¡ESPEJO DESBLOQUEADO!', [{ ico: 'cos', txt: trf('%1: ya puedes correrla del revés. Elige ESPEJO al escoger pista.', tr(C.def.nombre)) }], '#22e3ff'); }
    SAVE.espejo[C.def.id] = 1;
    if (dif === 1) daCos('titulo-empleado');
    if (dif === 2) {
      daCos('titulo-ceo', '¡ERES CEO!');
      if (!SAVE.logros.espejo) { SAVE.logros.espejo = 1; avisaPremio('¡MODO ESPEJO!', [{ ico: 'cos', txt: tr('Sede invertida: todas las pistas, del revés. Elígelo al escoger pista.') }], '#22e3ff'); }
    }
  }
  guardaPartida();
}
// al ver el podio de una copa: oro según el puesto y, en nivel CEO, los premios ejecutivos
function premioCopa(m, puesto) {
  const dif = nivelDif();
  if (puesto <= 3) { const o = Math.round(KECO.oroCopa[puesto - 1] * KECO.multNivel[dif] * (SAVE.vip ? KECO.vipOro : 1)); SAVE.oro += o; avisaPremio(trf('COPA: %1', puestoTxt(puesto)), [{ ico: 'oro', txt: '+' + o + ' ' + tr('ORO') }]); }
  if (puesto === 1 && dif === 2) {
    SAVE.copasCeo[m] = 1;
    const n = Object.keys(SAVE.copasCeo).length;
    if (n >= 1) daCos('kart-silla', 'PREMIO EJECUTIVO');
    if (n >= 2) daCos('skin-ceo-bunny', 'PREMIO EJECUTIVO');
    if (n >= 4) { daCos('ruedas-oro', 'PREMIO EJECUTIVO'); daCos('humo-oro', 'PREMIO EJECUTIVO'); }
  }
  guardaPartida();
}
// la caja del CEO: al ganar una carrera online con más jugadores. Siempre trae lo mismo (y se dice antes de abrirla).
function obsequioCeo() {
  const O = KECO.obsequio;
  SAVE.oro += O.oro; SAVE.gemas += O.gemas;
  const antes = KPREMIOS.length; darXp(O.xp);
  KPREMIOS.splice(antes, 0, { titulo: 'OBSEQUIO DEL CEO', color: '#ffcb3d', lineas: [{ ico: 'oro', txt: '+' + O.oro + ' ' + tr('ORO') }, { ico: 'gema', txt: '+' + O.gemas + ' ' + tr('GEMAS') }, { ico: 'xp', txt: '+' + O.xp + ' XP' }], caja: true });
  guardaPartida(); play('levelup');
}

// ---------- gemas y VIP de prueba (en el prototipo no se cobra nada) ----------
const PACKS_GEMAS = [{ n: 80, precio: '0,99 €', nombre: 'Bolsita' }, { n: 500, precio: '4,99 €', nombre: 'Maletín' }, { n: 1200, precio: '9,99 €', nombre: 'Cámara acorazada' }];
function compraGemas(i) { const p = PACKS_GEMAS[i]; SAVE.gemas += p.n; guardaPartida(); play('levelup'); avisaPremio('GEMAS DE PRUEBA', [{ ico: 'gema', txt: '+' + p.n + ' ' + tr('GEMAS') }, { ico: 'cos', txt: tr('Prototipo: no se ha cobrado nada.') }], '#ff5cf0'); }
function cambiaVip() {
  SAVE.vip = !SAVE.vip; guardaPartida();
  if (SAVE.vip) { play('levelup'); avisaPremio('LICENCIA VIP', [{ ico: 'cos', cos: 'pintura-vip', txt: tr(COS['pintura-vip'].nombre) }, { ico: 'cos', cos: 'titulo-vip', txt: tr(COS['titulo-vip'].nombre) }, { ico: 'oro', txt: tr('+50 % de oro en cada carrera') }], '#ffcb3d'); }
  else { for (const t of ['pintura', 'titulo']) if (SAVE.lleva[t] && COS[SAVE.lleva[t]].de === 'vip') SAVE.lleva[t] = null; guardaPartida(); }
}

// Fans of Dungeons · Lo que hace que cada turno sea una decisión (tras investigar Hoplite, Into the Breach, Brogue y Pixel
// Dungeon): las intenciones de los enemigos (qué van a hacer el turno que viene, con su casilla roja), los golpes cargados
// que se pueden esquivar, el empuje (contra muros, enemigos y trampas), los efectos especiales de los objetos raros, los
// altares de mejora (elegir 1 de 3), las pociones y pergaminos sin identificar y los modificadores del reto diario.
'use strict';

/* ---------- intenciones: qué hará cada enemigo visible en su próximo turno ---------- */
const CARGAN = new Set(['zombi', 'cosido', 'fallen', 'survivalbot', 'parche', 'ceo', 'moderador', 'troll']);   // pegan fuerte, pero avisan un turno antes
// ¿este enemigo, pegado a ti, prepara un golpe fuerte en vez de pegar? (los jefes, uno de cada dos turnos). futuro: antes de su turno
function vaACargar(e, futuro) { return CARGAN.has(e.tipo) && (!(e.jefe || e.mini) || (e.contador + (futuro ? 1 : 0)) % 2 === 0); }
function danoEstimado(e, h, mult = 1) { return Math.max(1, Math.round(e.atq * mult - h.def)); }
// { tipo: 'golpe' | 'carga' | 'dispara' | 'avanza' | 'cura' | null, casillas: [[x, y]], dano }
function intencion(e) {
  const h = J.heroe;
  if (!h || e.mimico || !e.despierto || tieneEstado(e, 'bug')) return null;
  if (e.carga) return { tipo: 'golpe', casillas: [[e.carga.x, e.carga.y]], dano: danoEstimado(e, h, 1.6), fuerte: true };
  const obj = objetivoDe(e);
  if (!obj) return null;
  const pegado = rey(e.x, e.y, obj.x, obj.y) <= 1;
  if (e.comp === 'sanador' && J.enemigos.some(q => q !== e && q.vida < q.vidaMax && pasos(q.x, q.y, e.x, e.y) <= 3)) return { tipo: 'cura', casillas: [] };
  if ((e.comp === 'tirador' || e.comp === 'sanador') && !pegado && pasos(e.x, e.y, obj.x, obj.y) <= e.alcance && veDesde(J.mapa, e.x, e.y, obj.x, obj.y)) return { tipo: 'dispara', casillas: [[obj.x, obj.y]], dano: danoEstimado(e, obj) };
  if (pegado) return vaACargar(e, true) ? { tipo: 'carga', casillas: [[obj.x, obj.y]] } : { tipo: 'golpe', casillas: [[obj.x, obj.y]], dano: danoEstimado(e, obj) };
  return { tipo: 'avanza', casillas: [] };
}
// el golpe cargado: el primer turno se prepara apuntando a una casilla; el siguiente golpea esa casilla (si te has ido, falla)
function golpeCargado(e, obj) {
  if (!e.carga) {
    if (J.mapa && rey(e.x, e.y, obj.x, obj.y) > 1) return;
    e.carga = { x: obj.x, y: obj.y }; anima(e, 'golpe', 0.15); fxNumero(e.x, e.y, '!', '#ff9a2a', -10);
    if (!e.avisoCarga) { e.avisoCarga = true; log(fmt(tr('{e} se prepara para un golpe fuerte. ¡Sal de la casilla roja!'), { e: tr(e.nombre) }), '#ff9a2a'); }
    return;
  }
  const c = e.carga; e.carga = null;
  const q = quienHay(c.x, c.y);
  if (c.x !== e.x) e.izq = c.x < e.x;
  if (q && q.bando !== 'enemigo') { ataca(e, q, 1.6); TEMBLOR.t = Math.max(TEMBLOR.t, 0.2); TEMBLOR.f = 4; }
  else { anima(e, 'golpe', 0.3); fxArco(c.x, c.y, Math.sign(c.x - e.x), Math.sign(c.y - e.y), '#ff9a2a'); fxNumero(c.x, c.y, tr('¡fallo!'), '#c8c0b0'); sonido('golpeEnemigo'); }
}

/* ---------- empuje: CrazyBunny empuja con cada golpe cuerpo a cuerpo; con el efecto «empuja», cualquiera ---------- */
function empuja(a, b) {
  if (!b || b.vida <= 0 || b.jefe || b.mini) return;
  const dx = Math.sign(b.x - a.x), dy = Math.sign(b.y - a.y), nx = b.x + dx, ny = b.y + dy, m = J.mapa;
  const otro = quienHay(nx, ny);
  const caja = enM(m, nx, ny) === T.ROMPIBLE;
  if (!pasableM(m, nx, ny) || otro) {   // choca: estampado
    if (caja) rompe(nx, ny, a);
    const n = Math.max(1, Math.ceil(a.atq * 0.5));
    fxNumero(b.x, b.y, tr('¡ESTAMPADO!'), '#ff9a2a', -14); fxChispas(b.x, b.y, '#c8c0b0', 6); TEMBLOR.t = Math.max(TEMBLOR.t, 0.12); TEMBLOR.f = 3;
    dana(b, n, 'golpe', a);
    if (otro && otro.bando === 'enemigo' && otro.vida > 0) dana(otro, Math.ceil(n / 2), 'golpe', a);
    return;
  }
  mueveA(b, nx, ny); b.carga = null;
  const tp = m.trampas.get(clave(nx, ny));
  if (tp) { m.trampas.delete(clave(nx, ny)); fxExplosion(nx, ny, 0.7, '#ffd040'); log(fmt(tr('¡{e} cae en la trampa!'), { e: tr(b.nombre) }), '#ffd040'); dana(b, 8 + J.planta * 3, 'trampa', a); }
}

/* ---------- efectos de los objetos raros (o mejores): cambian cómo juegas, no solo los números ---------- */
const EFECTOS = {
  empuja: { para: 'arma', nombre: 'de empuje', desc: 'Tus golpes empujan una casilla. Contra un muro, más daño.' },
  vampiro: { para: 'arma', nombre: 'vampírica', desc: 'Cada enemigo que despides te cura 4.' },
  veneno: { para: 'arma', nombre: 'tóxica', desc: 'Tus golpes envenenan 3 turnos.' },
  fuego: { para: 'arma', nombre: 'ardiente', desc: 'Tus golpes queman 2 turnos.' },
  sorpresa: { para: 'arma', nombre: 'traicionera', desc: 'Contra un enemigo que no te ha visto, crítico seguro.' },
  espinas: { para: 'armadura', nombre: 'con pinchos', desc: 'Quien te pegue cuerpo a cuerpo se lleva 3 de daño.' },
  esquiva: { para: 'armadura', nombre: 'escurridiza', desc: 'Un 15 % de los golpes no te dan.' },
  cafeina: { para: 'armadura', nombre: 'cafeinada', desc: 'Cada enemigo que despides te da 3 de Café.' },
  rapido: { para: 'accesorio', nombre: 'veloz', desc: 'Velocidad +15: a veces actúas antes que ellos.' },
  botin: { para: 'accesorio', nombre: 'de la suerte', desc: 'Los enemigos sueltan el doble de monedas.' },
  lupa: { para: 'accesorio', nombre: 'de auditor', desc: 'Al subir de planta, identificas un objeto misterioso.' },
};
const tieneEf = (h, ef) => !!(h && h.equipo && HUECOS.some(k => h.equipo[k] && h.equipo[k].ef === ef));
function efectoAzar(tipo, d) { const l = Object.keys(EFECTOS).filter(k => EFECTOS[k].para === tipo); return l[Math.floor(d.f() * l.length)]; }
// después de un golpe del héroe: veneno, fuego, empuje
function trasGolpe(a, b, o) {
  if (a.bando !== 'heroe' || !b || b.vida <= 0) return;
  if (tieneEf(a, 'veneno')) ponEstado(b, 'veneno', 3);
  if (tieneEf(a, 'fuego')) ponEstado(b, 'quemado', 2);
  const cuerpo = rey(a.x, a.y, b.x, b.y) <= 1;
  if ((a.clase === 'bunny' && cuerpo && !o.habilidad) || tieneEf(a, 'empuja')) empuja(a, b);
}

/* ---------- altares: elegir 1 de 3 mejoras (algunas cuestan vida máxima) ---------- */
const MEJORAS = [
  { id: 'vida', texto: '+12 de Vida máxima.', haz: h => { h.vidaBase += 12; h.vida += 12; } },
  { id: 'atq', texto: '+3 de Ataque, pero -8 de Vida máxima.', haz: h => { h.atqBase += 3; h.vidaBase -= 8; } },
  { id: 'def', texto: '+1 de Defensa.', haz: h => { h.defBase += 1; } },
  { id: 'cafe', texto: '+10 de Café máximo y lo llenas.', haz: h => { h.cafeBase += 10; h.cafe += 10 + h.cafeMax; } },
  { id: 'vision', texto: '+1 de Visión: ves más lejos en la oscuridad.', haz: h => { h.visionBase += 1; } },
  { id: 'cura', texto: 'Te curas del todo.', haz: h => { h.vida = h.vidaMax; } },
  { id: 'efecto', texto: 'Tu arma gana un efecto especial al azar.', puede: h => !!h.equipo.arma && !h.equipo.arma.ef, haz: h => { h.equipo.arma.ef = efectoAzar('arma', D); } },
  { id: 'ident', texto: 'Identificas todos los cafés y pergaminos.', puede: () => CONSUMIBLES_MISTERIO.some(id => !J.ident.includes(id)), haz: () => { for (const id of CONSUMIBLES_MISTERIO) if (!J.ident.includes(id)) J.ident.push(id); } },
  { id: 'enfria', texto: 'Tu Poder cuesta 2 de Café menos.', haz: h => { h.ahorro = (h.ahorro || 0) + 2; } },
  { id: 'sangre', texto: '+5 de Ataque, pero -15 de Vida máxima. Solo para valientes.', haz: h => { h.atqBase += 5; h.vidaBase -= 15; } },
];
const costePoder = h => Math.max(2, CLASES[h.clase].coste - (h.ahorro || 0));
function abreAltar(x, y) {
  const m = J.mapa, k = clave(x, y);
  if (m.usado[k]) { log(tr('El altar está apagado. Ya hiciste tu ofrenda.'), '#8c879a'); return; }
  const d = dados((J.semilla + J.planta * 131 + x * 7 + y) | 0);
  const opciones = d.baraja(MEJORAS.filter(o => !o.puede || o.puede(J.heroe))).slice(0, 3).map(o => o.id);
  J.panel = { tipo: 'altar', x, y, opciones, sel: 0 }; J.modo = 'panel'; sonido('invocar');
}
function eligeAltar(id) {
  const p = J.panel, h = J.heroe, o = MEJORAS.find(q => q.id === id);
  if (!p || !o) return;
  o.haz(h); recalcula(h); h.vida = Math.max(1, Math.min(h.vida, h.vidaMax));
  J.mapa.usado[clave(p.x, p.y)] = true;
  fxExplosion(h.x, h.y, 0.9, '#c8a040'); sonido('nivel'); log(fmt(tr('Ofrenda aceptada: {t}'), { t: tr(o.texto) }), '#c8a040');
  cierraPanel(); accion();
}

/* ---------- cafés y pergaminos sin identificar: su aspecto cambia en cada partida ---------- */
const CONSUMIBLES_MISTERIO = ['cafe_hielo', 'cafe_doble', 'cafe_quemado', 'descafeinado', 'perg_despido', 'perg_reestructuracion', 'perg_auditoria', 'perg_ascenso'];
const ASPECTOS_CAFE = [['verde', '#3a8a40'], ['morado', '#6a3a8a'], ['rojo', '#8a2a2a'], ['dorado', '#a8862a']];
const ASPECTOS_PERG = [['rojo', '#a8323a'], ['azul', '#2a5aa8'], ['verde', '#2a8a4a'], ['negro', '#2a2228']];
function repartirAspectos(semilla) {
  const d = dados(semilla ^ 0x5eed), cafes = d.baraja(ASPECTOS_CAFE.map((a, i) => i)), pergs = d.baraja(ASPECTOS_PERG.map((a, i) => i));
  const asp = {};
  ['cafe_hielo', 'cafe_doble', 'cafe_quemado', 'descafeinado'].forEach((id, i) => { asp[id] = 'c' + cafes[i]; });
  ['perg_despido', 'perg_reestructuracion', 'perg_auditoria', 'perg_ascenso'].forEach((id, i) => { asp[id] = 'p' + pergs[i]; });
  return asp;
}
const conocido = o => !CONSUMIBLES_MISTERIO.includes(o.id) || !J.ident || J.ident.includes(o.id);
function iconoObj(o) {
  const def = OBJETOS[o.id]; if (!def) return 'restos';
  if (conocido(o) || !J.aspecto) return def.icono;
  return 'misterio_' + J.aspecto[o.id];
}
function nombreMisterio(o) {
  const a = J.aspecto[o.id], i = +a.slice(1);
  return a[0] === 'c' ? fmt(tr('Café de color {c}'), { c: tr(ASPECTOS_CAFE[i][0]) }) : fmt(tr('Pergamino de lazo {c}'), { c: tr(ASPECTOS_PERG[i][0]) });
}
function identifica(o, aviso = true) {
  if (conocido(o)) return;
  const antes = nombreMisterio(o); J.ident.push(o.id);
  if (aviso) log(fmt(tr('{a} era: {b}.'), { a: antes, b: tr(OBJETOS[o.id].nombre) }), '#c8a040');
}
function creaIconosTactica() {
  // los misteriosos: taza entera del color (no solo el café) y una interrogación bien grande, para que se distingan de un vistazo
  const interroga = (p, c, dx = 0, dy = 0) => { for (const [x, y] of [[-1, -12], [0, -12.5], [1, -12], [1.5, -11], [1, -10], [0, -9], [0, -8], [0, -6]]) p.px(x + dx, y + dy, c); };
  ASPECTOS_CAFE.forEach(([, col], i) => icono('misterio_c' + i, 26, 26, p => {
    const pl = pal5(col);
    p.parte(F.rr(-7, -14, 14, 13, 2), pl, { sombra: 2 }); p.plano(F.ov(9, -8, 3, 3), pl.o); p.plano(F.ov(9, -8, 1.4, 1.4), pl.b);
    p.parte(F.ov(0, -13, 6, 2), pal5('#2a1a12'), { sombra: 1, luz: false });
    for (const [x, y] of [[-3, -18], [0, -20], [3, -18]]) p.px(x, y, '#ffffff');
    interroga(p, '#fff6ea', 0, 2);
  }));
  ASPECTOS_PERG.forEach(([, col], i) => icono('misterio_p' + i, 26, 26, p => { pergamino(p, pal5(col)); interroga(p, '#3a1e14', -5, 2); }));
  // el Altar de la Productividad: un bloque de piedra con un trofeo de «Empleado del mes» y dos velas
  const piedra = pal5('#4a4450', '#2e2a34', '#6a6474', '#16121c'), cera = pal5('#d8ccb0', '#a89a7a', '#f4ecd8', '#5a4e3a');
  for (const encendido of [true, false]) icono(encendido ? 'altar' : 'altar_apagado', 32, 40, p => {
    p.parte(F.rr(-12, -16, 24, 14, 1.5), piedra, { sombra: 2 });
    p.parte(F.rr(-14, -19, 28, 4, 1), piedra, { sombra: 1 });
    for (const [x, y] of [[-6, -12], [-4, -10], [-2, -11], [0, -8], [2, -9], [4, -6], [6, -7]]) p.px(x, y, '#6a1a20');   // una gráfica que baja, tallada
    p.parte(F.rr(-4, -31, 8, 7, 2), encendido ? PAL_OBJ.oro : piedra, { sombra: 1 });
    p.plano(F.re(-1, -24, 2, 3), encendido ? PAL_OBJ.oro.s : piedra.s); p.plano(F.re(-3, -21, 6, 2), encendido ? PAL_OBJ.oro.o : piedra.o);
    for (const x of [-11, 9]) {
      p.parte(F.re(x, -25, 2, 6), cera, { sombra: 0 });
      if (encendido) { p.px(x + 1, -27, '#ff9a2a'); p.px(x + 1, -28, '#ffd040'); p.px(x, -26, '#c84a1a'); }
    }
  });
}

/* ---------- reto del día: la misma torre para todos ese día, con dos reglas raras ---------- */
const MODS = {
  rapidos: { nombre: 'Horas extra', desc: 'Los enemigos van más rápido.' },
  oscuro: { nombre: 'Apagón', desc: 'Ves 2 casillas menos.' },
  cristal: { nombre: 'Mandíbula de cristal', desc: 'Todo el mundo recibe un 50 % más de daño.' },
  rico: { nombre: 'Bonus de productividad', desc: 'Monedas dobles.' },
  carga: { nombre: 'Reunión de equipo', desc: 'Empiezas con 3 cafés más.' },
};
function semillaDelDia() { const f = new Date(); return f.getFullYear() * 10000 + (f.getMonth() + 1) * 100 + f.getDate(); }
function modsDelDia(sem) { const d = dados(sem * 17 + 3); return d.baraja(Object.keys(MODS)).slice(0, 2); }
// la mejor puntuación del reto de hoy (se olvida al cambiar de día)
function mejorDiario() { const g = GUARDA.diario; return g && g.dia === semillaDelDia() ? g.puntos : 0; }
function apuntaDiario(puntos) { if (J.diario && J.semilla === semillaDelDia() && puntos > mejorDiario()) GUARDA.diario = { dia: J.semilla, puntos }; }
const hayMod = id => !!(J.mods && J.mods.includes(id));

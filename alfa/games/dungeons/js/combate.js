// Fans of Dungeons · El combate: la fórmula de daño (Ataque menos Defensa, nunca menos de 1, ±20 %, críticos), atacar cuerpo
// a cuerpo o a distancia, recibir daño (escudo de CyberMarine, Renacer de NecroLord), morir (explosión, escombros, botín y
// experiencia), subir de nivel y los hitos que liberan clases.
'use strict';

// daño de a sobre b. mult multiplica (habilidades); devuelve lo que ha hecho
function ataca(a, b, mult = 1, o = {}) {
  if (!b || b.vida <= 0) return 0;
  let atq = a.atq;
  if (a.bando === 'heroe' && a.clase === 'bunny') { let pegados = 0; for (const e of J.enemigos) if (rey(e.x, e.y, a.x, a.y) <= 1) pegados++; atq *= 1 + 0.15 * pegados; }   // Rabia
  if (a.bando === 'heroe' && a.alcance > 1 && rey(a.x, a.y, b.x, b.y) <= 1 && !o.habilidad) mult *= 0.7;   // a bocajarro
  const traicion = multTraicion(a, b); mult *= traicion;   // SlyFox y la invisibilidad
  let n = Math.max(1, Math.round(atq * mult - b.def)) ;
  n = Math.max(1, Math.round(n * (0.8 + D.f() * 0.4)));
  if (hayMod('cristal')) n = Math.round(n * 1.5);
  if (b.bando === 'heroe' && tieneEf(b, 'esquiva') && D.prob(0.15)) {   // armadura escurridiza
    anima(a, 'golpe', 0.3); fxNumero(b.x, b.y, tr('¡esquivado!'), '#8ac0ff'); sonido('golpeEnemigo'); return 0;
  }
  const crit = D.prob(a.bando === 'heroe' && a.clase === 'cybermarine' ? 0.12 : 0.05) || (a.bando === 'heroe' && !b.despierto && tieneEf(a, 'sorpresa'));
  if (crit) n *= 2;
  if (a.x !== b.x) a.izq = b.x < a.x;
  anima(a, 'golpe', 0.3);
  const dx = Math.sign(b.x - a.x), dy = Math.sign(b.y - a.y);
  a.dx -= dx * 6; a.dy -= dy * 6;   // el impulso del golpe
  if (a.alcance > 1 && rey(a.x, a.y, b.x, b.y) > 1) fxRayo(a.x, a.y, b.x, b.y, a.bando === 'heroe' ? (a.clase === 'cybermarine' ? '#4a9aa8' : '#6aa878') : '#ff6a2a');
  else fxArco(b.x, b.y, dx, dy, a.bando === 'heroe' ? '#ffffff' : '#ff8ad0');
  if (a.bando === 'heroe') apuntaGolpe(n);
  dana(b, n, crit ? 'critico' : 'golpe', a);
  if (crit) { fxRotulo(tr('¡CRÍTICO!'), '#ffd040'); }
  trasGolpe(a, b, o); trasGolpeEnemigo(a, b);
  if (a.bando === 'heroe') trasTraicion(a, b, traicion);
  if (b.bando === 'heroe' && b.vida > 0 && a.vida > 0 && rey(a.x, a.y, b.x, b.y) <= 1 && tieneEf(b, 'espinas')) dana(a, 3, 'golpe', b);   // armadura con pinchos
  sonido(a.bando === 'heroe' ? (a.alcance > 1 ? 'disparo' : 'golpe') : 'golpeEnemigo');
  return n;
}
// quita vida. causa: 'golpe', 'critico', 'veneno', 'quemado', 'trampa', 'despido'…
function dana(b, n, causa, origen) {
  if (!b || b.vida <= 0) return;
  if (b.bando === 'heroe') {
    if (b.escudo > 0 && causa !== 'veneno' && causa !== 'quemado') { const abs = Math.min(b.escudo, n); b.escudo -= abs; n -= abs; fxNumero(b.x, b.y, '-' + abs, '#4a9aa8', -8); if (n <= 0) { sonido('escudo'); b.sinGolpes = 0; return; } }
    b.sinGolpes = 0;
    TEMBLOR.t = Math.max(TEMBLOR.t, n >= 10 ? 0.25 : 0.12); TEMBLOR.f = n >= 10 ? 4 : 2;
  }
  b.vida -= n; b.blanco = 0.12; anima(b, 'dano', 0.25);
  fxNumero(b.x, b.y, '-' + n, causa === 'critico' ? '#ffd040' : b.bando === 'heroe' ? '#ff4b5c' : '#ffffff');
  fxChispas(b.x, b.y, causa === 'quemado' ? '#ff8a5c' : causa === 'veneno' ? '#5fd36a' : '#a8323a', 5);
  if (b.bando === 'heroe') sonido('dano');
  if (b.vida <= 0) muere(b, causa, origen);
  else if (b.bando === 'enemigo') { b.despierto = true; if (b.mimico) { b.mimico = false; } if (origen && origen.bando !== 'enemigo') b.ultimo = { x: origen.x, y: origen.y }; }
}
// la muerte de una entidad
function muere(b, causa, origen) {
  b.vida = 0;
  if (b.bando === 'heroe') {
    if (b.renacer) { b.renacer = false; b.vida = Math.ceil(b.vidaMax / 2); fxExplosion(b.x, b.y, 1, '#6aa878'); fxRotulo(tr('¡RENACER!'), '#6aa878'); log(tr('Renacer: te levantas con la mitad de la vida. Solo una vez.'), '#6aa878'); sonido('nivel'); return; }
    finPartida(causa, origen);
    return;
  }
  const i = b.bando === 'enemigo' ? J.enemigos.indexOf(b) : J.aliados.indexOf(b);
  if (i >= 0) (b.bando === 'enemigo' ? J.enemigos : J.aliados).splice(i, 1);
  if (b.bando === 'aliado') { fxExplosion(b.x, b.y, 0.5, '#6aa878'); if (b.fig === 'ardilla') log(tr('MadSquirrel cae. Los Animales Locos no la olvidarán.'), '#e0804a'); else if (b.fig === 'bug') log(tr('Un bug se cuelga: error 404, aliado no encontrado.'), '#6aa878'); return; }
  // explosión con escombros, monedas, restos y botín
  fxExplosion(b.x, b.y, b.jefe ? 2.2 : b.elite ? 1.3 : 0.9, b.tipo === 'fantasma' ? '#8ac0ff' : '#ff9a2a');
  fxEscombros(b.x, b.y, b.jefe ? 18 : 8, b.fig);
  fxMuerto(b);
  sonido(b.jefe ? 'explosionGrande' : 'explosion');
  J.hitstop = Math.max(J.hitstop || 0, b.jefe ? 0.25 : 0.07);   // un instante congelado: el golpe se siente
  J.restos.push({ x: b.x, y: b.y });
  const h = J.heroe;
  if (h) {
    h.muertes++; cuenta('despedidos');
    const n = D.entre(1 + J.planta, 4 + J.planta * 2) * (b.elite ? 2 : 1) * (b.jefe ? 6 : 1) * (tieneEf(h, 'botin') ? 2 : 1) * (hayMod('rico') ? 2 : 1);
    if (tieneEf(h, 'vampiro') && h.vida > 0 && h.vida < h.vidaMax) { const c = Math.min(4, h.vidaMax - h.vida); h.vida += c; fxNumero(h.x, h.y, '+' + c, '#5fd36a', -8); }
    if (tieneEf(h, 'cafeina')) h.cafe = Math.min(h.cafeMax, h.cafe + 3);
    J.objetos.push({ x: b.x, y: b.y, obj: { id: 'monedas', n } });
    if (b.llave) J.objetos.push({ x: b.x, y: b.y, obj: { id: 'llave' } });
    if (b.elite || ENEMIGOS[b.tipo].suelta || b.jefe) J.objetos.push({ x: b.x, y: b.y, obj: generaObjeto(J.planta, D, null, b.jefe ? 3 : b.elite ? 2 : 1) });
    else if (D.prob(0.12)) J.objetos.push({ x: b.x, y: b.y, obj: generaObjeto(J.planta, D) });
    log(fmt(tr('{e} cae. {f}'), { e: tr(b.nombre), f: tr(ENEMIGOS[b.tipo].frase) }), b.jefe ? '#ffd040' : '#d9d2e0');
    ganaXp(h, b.xp);
    if (b.jefe) { h.jefes++; J.jefeMuerto = true; fxRotulo(fmt(tr('¡{e} DESPEDIDO!'), { e: tr(b.nombre).toUpperCase() }), '#ffd040'); hito(b.tipo); if (b.tipo === 'ceo') victoria(); }
  }
  if (!J.enemigos.length && J.modo === 'juego') { J.limpia = true; }
}
function ganaXp(h, n) {
  h.xp += n;
  while (h.xp >= xpPara(h.nivel)) { h.xp -= xpPara(h.nivel); h.nivel++; recalcula(h); h.vida = Math.min(h.vidaMax, h.vida + Math.ceil(h.vidaMax * 0.3)); fxRotulo(fmt(tr('¡NIVEL {n}!'), { n: h.nivel }), '#ffd040'); fxExplosion(h.x, h.y, 0.9, '#ffd040'); log(fmt(tr('¡Subes a nivel {n}! Más Vida, Ataque y Café.'), { n: h.nivel }), '#ffd040'); sonido('nivel'); }
}
// un hito: se guarda para siempre y puede liberar una clase
function hito(id) {
  const H = HITOS[id]; if (!H || GUARDA.hitos[id]) return;
  GUARDA.hitos[id] = true; guardaMeta();
  log(fmt(tr('Hito: {h}.'), { h: tr(H.texto) }), '#ffd040');
  if (H.libera) { fxRotulo(fmt(tr('¡{c} LIBERADO!'), { c: CLASES[H.libera].nombre.toUpperCase() }), '#6aa878'); log(fmt(tr('{c} se une a la rebelión: ya puedes elegirlo.'), { c: CLASES[H.libera].nombre }), '#6aa878'); }
}

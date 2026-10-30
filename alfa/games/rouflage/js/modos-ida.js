// Fans of Rouflage · IDA Y VUELTA (modo «ida», modos.js): no hay bandos. Todos salen de colados, se pintan y se congelan. Al empezar la caza, el CUERPO
// pintado de cada uno se queda escondido donde estaba y su dueño sale de Recursos Humanos con camisa de becario, linterna y IDA.balas cartas a buscar
// los cuerpos de los demás (el suyo no lo puede despedir). Si alguien despide tu cuerpo, estás fuera. Se acaba cuando solo queda un cuerpo, se acaba
// el tiempo o nadie tiene cartas, y gana una sola persona: la que más puntos sume (lo que aguantó su cuerpo más lo que cazó su becario).
// En el PvP cada plaza pasa a mover a su becario (los mensajes de siempre) y los cuerpos estrenan plazas nuevas detrás de las de siempre,
// iguales en todos los navegadores; los cuerpos no se mueven y sus silbidos los lleva el anfitrión.
'use strict';

const IDA = { balas: 3 };

// mientras se pintan (preparación y cuenta atrás) los colados no se ven entre ellos: cada uno se pinta a solas; a la caza ya salen los becarios y los cuerpos quietos
const idaOculto = e => modoEs('ida') && (J.fase === 'prep' || J.fase === 'cuenta') && e.clase === 'camaleon' && e !== J.yo;

// al empezar la caza (modoEmpiezaCaza): de cada colado sale su becario
function idaEmpieza() {
  if (!modoEs('ida')) return;
  const cuerpos = J.camaleones.slice(), base = J.pvp ? RFP.slots.length : 0;
  cuerpos.forEach((k, i) => {
    const p = SALIDA_CAZADORES[i % SALIDA_CAZADORES.length], v = Math.floor(i / SALIDA_CAZADORES.length);
    const h = nuevoEnte('cazador', 'becario', k.nombre, p[0] + (v % 2 ? 1 : -1) * 18 * Math.ceil(v / 2), p[1] + v * 6);
    if (k.ropa) { h.tipo = 'fan'; h.ropa = k.ropa; }      // su becario lleva lo mismo del armario
    h.cuerpo = k; k.dueno = h; h.balas = IDA.balas; h.dir = -Math.PI / 2; h.mira = i % 2 ? -1 : 1;
    // el cuerpo: quieto y congelado para siempre (sin cerebro), con sus puntos de colado
    if (!k.congelado) congela(k);
    k.hielo = 1; k.vx = k.vy = 0; k.bot = null; k.red = null;
    if (J.pvp) {
      const sl = RFP.slots[k.slot];
      h.slot = k.slot; h.humano = k.humano; sl.ente = h; sl.clase = 'cazador';
      k.slot = base + i; k.humano = false; k.remoto = !RFP.soyHost;
      RFP.slots.push({ s: k.slot, humano: false, clase: 'camaleon', tipo: k.tipo, nombre: k.nombre, mana: 0, yo: false, ente: k, cuerpo: true });
      if (k.jugador) { h.jugador = true; h.remoto = false; }
      else if (h.humano) h.remoto = true;
      else if (RFP.soyHost) { cerebroCazador(h); ronda(h); }
      else h.remoto = true;
    } else if (k.jugador) h.jugador = true;
    else { cerebroCazador(h); ronda(h); }
    if (k.jugador) { k.jugador = false; k.mio = true; J.yo = h; J.cuenta = h.pts; J.modo = 'cazador'; }
  });
  if (TALLER.abierto) cierraTaller();
  J.peligro = 0;
  cartel(tr('¡IDA Y VUELTA!'), tr('Tu cuerpo se queda escondido: despide a los demás antes de que encuentren el tuyo'), true);
  refrescaHud(true);
}
// han despedido un cuerpo (lo llama despide): su dueño queda fuera
function idaDespido(k) {
  const h = k.dueno; if (!h || h.fuera) return;
  h.fuera = true; h.tFuera = 0; h.balas = 0; h.vx = h.vy = 0; h.bot = null; h.marca = ''; h.alerta = 0;
  if (h.jugador) { avisa(tr('Han encontrado tu cuerpo: estás fuera'), 'malo'); refrescaHud(true); }
}
// ¿se acaba? (solo quien manda): queda un cuerpo, no hay tiempo o nadie tiene cartas
const idaAcaba = () => modoEs('ida') && (escondidos().length <= 1 || J.reloj <= 0 || !cazadoresVivos().length);

// tu cuerpo, para que no lo pierdas de vista: un «TÚ» flojito encima
function idaPinta(c) {
  if (!modoEs('ida') || J.fase !== 'caza' || !J.yo || !J.yo.cuerpo || J.yo.cuerpo.fuera) return;
  const k = J.yo.cuerpo; c.save(); c.globalAlpha = 0.55;
  rotulo(c, tr('TU CUERPO'), k.x, k.y - 66, 11, '#fff6ea', '#20102c', LETRA_GORDA);
  c.restore();
}

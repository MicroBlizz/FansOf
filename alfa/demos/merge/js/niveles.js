// Fans of Merge · NIVELES de la Aventura: 15 niveles de más fácil a más difícil, cada uno con su tablero, sus turnos, su objetivo
// y, los primeros, un guion de tutorial (qué pieza te toca y dónde hay que plantarla, con su explicación).
// Cada nivel enseña UNA cosa nueva. Las cartas salen desde el nivel 6 y los eventos desde el 8. El Modo libre se abre al pasar el 3.
// Formato: lado (casillas por lado), movs (turnos), obj (lista: { crear: tipo, n } · { dormir: n } · { puntos: n }),
// inicio (piezas ya puestas: [x, y, tipo]), guion (las primeras piezas: { p: tipo, c: [x, y] casilla obligatoria, reserva: true para
// obligar a guardarla y despues: la pieza que llega entonces, txt }), pesos (qué sale después; si falta, los de MG_CFG), cartas y eventos (true para tenerlos), intro (frase al empezar).
'use strict';
const MG_LIBRE_DESDE = 3;   // el Modo libre se abre al pasar este nivel
const MG_NIVELES = [
  { id: 1, lado: 4, movs: 3, obj: [{ crear: 'huerto', n: 1 }], intro: 'Aprende a juntar.',
    inicio: [[0, 1, 'brote'], [1, 1, 'brote'], [2, 2, 'zanahoria'], [2, 3, 'zanahoria']],
    guion: [{ p: 'brote', c: [2, 1], txt: 'Planta el brote junto a los otros dos: tres iguales que se tocan se juntan.' }],
    pesos: { brote: 70, zanahoria: 30 } },
  { id: 2, lado: 4, movs: 12, obj: [{ crear: 'huerto', n: 2 }], intro: 'Tres zanahorias hacen un huerto.',
    inicio: [[0, 0, 'zanahoria'], [1, 0, 'zanahoria'], [3, 2, 'zanahoria'], [3, 3, 'zanahoria'], [0, 3, 'brote'], [1, 3, 'brote']],
    guion: [{ p: 'zanahoria', c: [2, 0], txt: 'Junta las zanahorias. ¡La pieza nueva sale justo donde pones la última!' }],
    pesos: { brote: 50, zanahoria: 50 } },
  { id: 3, lado: 5, movs: 12, obj: [{ dormir: 2 }], intro: 'Cuidado con el zorro.',
    inicio: [[0, 0, 'zorro'], [1, 0, 'brote'], [3, 3, 'zanahoria']],
    guion: [{ p: 'zanahoria', c: [0, 1], txt: 'El zorro anda por los huecos. Si lo encierras, se duerme. ¡Tápale la salida!' }],
    pesos: { brote: 50, zanahoria: 25, zorro: 25 } },
  { id: 4, lado: 5, movs: 12, obj: [{ crear: 'madriguera', n: 1 }], intro: 'La semilla mágica.',
    inicio: [[1, 1, 'casita'], [3, 1, 'casita'], [0, 3, 'huerto'], [4, 4, 'huerto']],
    guion: [{ p: 'semilla', c: [2, 1], txt: 'La semilla mágica se convierte en lo que más te conviene. ¡Ponla entre las dos casitas!' }],
    pesos: { brote: 50, zanahoria: 25, huerto: 5, zorro: 12, semilla: 8 } },
  { id: 5, lado: 5, movs: 16, obj: [{ puntos: 1000 }], intro: 'La reserva.',
    inicio: [[0, 0, 'zanahoria'], [1, 0, 'zanahoria'], [4, 4, 'brote']],
    guion: [{ p: 'zorro', reserva: true, despues: 'zanahoria', txt: 'No quieres ese zorro ahora. Toca la RESERVA para guardarlo y usar otra pieza.' }],
    pesos: { brote: 55, zanahoria: 22, zorro: 15, semilla: 4, huerto: 4 } },
  { id: 6, lado: 5, movs: 18, obj: [{ crear: 'cueva', n: 1 }], intro: 'Elige una carta: te acompaña todo el nivel.', cartas: true,
    inicio: [[0, 4, 'dormido'], [1, 4, 'dormido'], [4, 0, 'piedra']],
    pesos: { brote: 50, zanahoria: 18, zorro: 22, topo: 5, semilla: 5 } },
  { id: 7, lado: 6, movs: 22, obj: [{ crear: 'madriguera', n: 1 }], intro: 'El topo quita la pieza que estorba.', cartas: true,
    inicio: [[2, 2, 'piedra'], [3, 3, 'piedra'], [0, 0, 'casita'], [5, 5, 'casita']],
    guion: [{ p: 'topo', c: [2, 2], txt: 'El topo quita una pieza. Toca la piedra para quitarla.' }],
    pesos: { brote: 55, zanahoria: 16, zorro: 14, topo: 5, semilla: 4, huerto: 4, casita: 2 } },
  { id: 8, lado: 6, movs: 22, obj: [{ dormir: 3 }], intro: 'Llegan los cuervos: saltan a cualquier hueco. Y empiezan los eventos.', cartas: true, eventos: true,
    pesos: { brote: 52, zanahoria: 15, zorro: 14, cuervo: 6, topo: 4, semilla: 4, huerto: 3, casita: 2 } },
  { id: 9, lado: 6, movs: 30, obj: [{ puntos: 5000 }], cartas: true, eventos: true, inicio: [[0, 0, 'casita'], [5, 5, 'casita']] },
  { id: 10, lado: 6, movs: 30, obj: [{ crear: 'madriguera', n: 2 }], cartas: true, eventos: true, inicio: [[0, 0, 'casita'], [5, 0, 'casita'], [2, 5, 'casita']] },
  { id: 11, lado: 6, movs: 30, obj: [{ crear: 'cueva', n: 2 }, { puntos: 3000 }], cartas: true, eventos: true, inicio: [[0, 5, 'dormido'], [5, 5, 'dormido'], [3, 0, 'zorro']] },
  { id: 12, lado: 6, movs: 35, obj: [{ puntos: 12000 }], cartas: true, eventos: true, inicio: [[0, 0, 'madriguera'], [5, 5, 'madriguera'], [5, 0, 'casita'], [0, 5, 'casita']] },
  { id: 13, lado: 6, movs: 35, obj: [{ crear: 'torre', n: 1 }], cartas: true, eventos: true, inicio: [[0, 0, 'madriguera'], [5, 5, 'madriguera'], [2, 2, 'casita'], [3, 3, 'casita']] },
  { id: 14, lado: 6, movs: 40, obj: [{ crear: 'torre', n: 2 }], cartas: true, eventos: true, inicio: [[0, 0, 'madriguera'], [5, 0, 'madriguera'], [0, 5, 'madriguera'], [2, 3, 'casita'], [3, 2, 'casita'], [5, 5, 'casita']] },
  { id: 15, lado: 6, movs: 45, obj: [{ crear: 'palacio', n: 1 }], cartas: true, eventos: true, inicio: [[0, 0, 'torre'], [5, 5, 'torre'], [5, 0, 'madriguera'], [0, 5, 'madriguera'], [2, 2, 'casita'], [3, 3, 'casita']] },
];
const mgNivel = id => MG_NIVELES.find(N => N.id === id);
const mgEstrellasDe = id => (SAVE.niveles && SAVE.niveles[id]) || 0;
const mgAbierto = id => id === 1 || mgEstrellasDe(id - 1) > 0;
const mgLibreAbierto = () => mgEstrellasDe(MG_LIBRE_DESDE) > 0;

// cuánto lleva de un objetivo y cuánto pide
function mgObjValor(o) {
  const P = MG_P;
  if (o.crear) return [Math.min(o.n, P.creadas[o.crear] || 0), o.n];
  if (o.dormir) return [Math.min(o.dormir, P.dormidos), o.dormir];
  return [Math.min(o.puntos, P.pts), o.puntos];
}
function mgObjTexto(o) {
  if (o.crear) return o.n > 1 ? tr('Haz {n}: {p}', { n: o.n, p: tr(MG_PIEZAS[o.crear].nombre) }) : tr('Haz una pieza: {p}', { p: tr(MG_PIEZAS[o.crear].nombre) });
  if (o.dormir) return tr('Duerme {n} bichos', { n: o.dormir });
  return tr('Consigue {n} puntos', { n: fmt(o.puntos) });
}
const mgNivelHecho = () => MG_P.nivel.obj.every(o => { const [a, b] = mgObjValor(o); return a >= b; });
// tras cada turno (y cada cofre o rayo): ¿ganado? ¿sin turnos?
function mgNivelComprueba() {
  const P = MG_P; if (!P.nivel || P.estado !== 'jugando') return false;
  if (mgNivelHecho()) { mgNivelFin(true); return true; }
  if (P.movs <= 0) { mgNivelFin(false); return true; }
  return false;
}
function mgNivelFin(gana) {
  const P = MG_P, N = P.nivel; P.estado = 'fin';
  let estrellas = 0;
  if (gana) {
    estrellas = P.movs >= Math.ceil(N.movs * 0.4) ? 3 : P.movs >= Math.ceil(N.movs * 0.2) ? 2 : 1;
    SAVE.niveles[N.id] = Math.max(estrellas, mgEstrellasDe(N.id));
    if (P.pts > SAVE.record) SAVE.record = P.pts;
    mgGuarda();
    play('mgRecord'); mgSintonia('win');
  } else { play('mgFin'); mgSintonia('lose'); }
  setTimeout(() => mgPantallaNivelFin(gana, estrellas), gana ? 1100 : 800);
}
// el paso del guion que toca ahora (o null)
const mgPaso = () => (MG_P.guion && MG_P.guion[MG_P.paso]) || null;

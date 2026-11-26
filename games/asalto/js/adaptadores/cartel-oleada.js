// Fans of Asalto · ADAPTADORES · El cartel grande de las oleadas especiales, como en el tráiler de Slotbound. En la del JEFE cae desde
// arriba un estandarte con «¡JEFE!», su nombre en una cinta granate entre dos escudos y su lema en un pergamino: al tocar fondo tiembla
// la pantalla, destella en rojo, el jefe ruge y la arena se oscurece un poco. En la de ÉLITE («Auditoría») sale uno más pequeño. Se va
// solo (unos 2 s) y no para la batalla. Lo enciende el aviso 'oleada' que deja la batalla al crearse (B.eventos): empieza(E, aviso).
'use strict';
AS.cartelOleada = (() => {
  const fx = AS.fx, C = AS.tema.C;
  // cuánto dura cada uno, cuándo toca fondo, cuánto oscurece la arena y desde qué altura cae
  const TIPOS = {
    jefe: { dura: 2.2, cae: 0.22, sombra: 0.8, alto: 300 },
    elite: { dura: 1.8, cae: 0.18, sombra: 0.66, alto: 200 },
  };
  const SALE = 0.3;

  // aviso: { e: 'oleada', tipo: 'jefe' | 'elite', jefe, n }
  function empieza(E, aviso) {
    const T = TIPOS[aviso.tipo];
    if (!T) return;
    E.intro = { tipo: aviso.tipo, jefe: aviso.jefe, t: 0, golpe: false, ...T };
    if (aviso.tipo === 'jefe') { AS.suena('jefe'); AS.suena.musica(ASALTO.jefes[aviso.jefe].musica); } else AS.suena('aviso');
  }
  // el golpe al tocar fondo: temblor, destello rojo, una onda y chispas a lo ancho
  function golpe(E, I) {
    const P = E.P, y = centro(P, I), jefe = I.tipo === 'jefe';
    fx.sacude(jefe ? 18 : 9); fx.fogonazo(jefe ? 0.5 : 0.28, '#d8402f');
    fx.onda(P.W / 2, y, jefe ? 260 : 170, '#ff5a3a');
    for (let i = 0; i < (jefe ? 7 : 4); i++) fx.chispas(P.W * (i + 0.5) / (jefe ? 7 : 4), y + 40, 6, '#ff8a2a', 220, true);
    fx.luz(P.W / 2, y, 360, [255, 60, 40], jefe ? 0.9 : 0.5);
    if (jefe) { AS.suena('furia'); const j = E.batalla && E.batalla.jefe; if (j) { const s = E.P.aPantalla(j.x, j.y); fx.onda(s.x, s.y - 10, 190, '#ff5a3a'); } }
    else AS.suena('lucha');
  }
  function avanza(E, dt) {
    const I = E.intro;
    if (!I) return;
    I.t += dt;
    if (!I.golpe && I.t >= I.cae) { I.golpe = true; golpe(E, I); }
    if (I.t >= I.dura) E.intro = null;
  }

  /* ---------- el dibujo ---------- */
  // dónde queda el centro del cartel: en el tercio de arriba de la arena (el jefe espera abajo a la derecha)
  const centro = (P, I) => P.arena.y + Math.round(P.arena.h * (I.tipo === 'jefe' ? 0.4 : 0.34));
  // cuánto le falta para tocar fondo (con un rebote al llegar) y cuánto se ha ido ya al salir
  function caida(I) {
    if (I.t < I.cae) { const k = 1 - I.t / I.cae; return -Math.round(k * k * I.alto); }
    const d = I.t - I.cae;
    return Math.round(Math.sin(d * 28) * Math.exp(-d * 9) * 12);
  }
  const fuera = I => Math.max(0, (I.t - (I.dura - SALE)) / SALE);
  // la sombra roja a lo alto y lo bajo de la arena, a franjas de píxel
  function franjas(g, P, a) {
    const A = P.arena;
    for (let i = 0; i < 6; i++) {
      g.fillStyle = `rgba(138,31,36,${(a * (6 - i) / 10).toFixed(3)})`;
      g.fillRect(0, A.y + i * 8, P.W, 8); g.fillRect(0, A.y + A.h - (i + 1) * 8, P.W, 8);
    }
  }
  // el estandarte del jefe: «¡JEFE!» grande arriba, su nombre en una cinta entre dos escudos y su lema debajo
  function pintaJefe(g, P, I, y) {
    const d = ASALTO.jefes[I.jefe], w = P.W - 24, x = 12, late = I.golpe && I.t - I.cae < 0.6 && Math.floor((I.t - I.cae) / 0.1) % 2 === 0;
    AS.texto.pinta(g, tr('¡JEFE!'), P.W / 2, y - 92, { t: 96, col: late ? C.crema : C.oro, ancla: 'c' });
    AS.tema.cinta(g, x, y - 46, w, 96, C.sangre);
    AS.tema.escudo(g, x - 4, y - 58, 52, 64, C.rojo); AS.tema.escudo(g, x + w - 48, y - 58, 52, 64, C.rojo);
    AS.texto.pinta(g, tr(d.nombre), P.W / 2, y - 2, { t: 64, col: C.oro, ancla: 'c', max: w - 120 });
    AS.tema.pergamino(g, x + 30, y + 46, w - 60, 62);
    AS.texto.parrafo(g, tr(d.lema), P.W / 2, y + 77, { col: C.tinta, borde: false, max: w - 96 });
  }
  // el de élite: una cinta roja más estrecha con «AUDITORÍA» y lo que se juega uno debajo
  function pintaElite(g, P, I, y) {
    const w = Math.min(P.W - 40, 400), x = Math.round((P.W - w) / 2);
    AS.texto.pinta(g, tr('OLEADA DE ÉLITE'), P.W / 2, y - 64, { t: 48, col: C.oro, ancla: 'c' });
    AS.tema.cinta(g, x, y - 38, w, 80, C.rojo);
    AS.texto.pinta(g, tr('AUDITORÍA'), P.W / 2, y - 2, { t: 64, col: C.crema, ancla: 'c', max: w - 60 });
    AS.tema.pergamino(g, x + 24, y + 38, w - 48, 46);
    AS.texto.pinta(g, tr('Si pierdes esta oleada, se acaba'), P.W / 2, y + 61, { col: C.tinta, borde: false, ancla: 'c', max: w - 70 });
  }
  function pinta(g, P, E) {
    const I = E.intro;
    if (!I) return;
    const f = fuera(I), y = centro(P, I) + caida(I) - Math.round(f * f * I.alto);
    franjas(g, P, (1 - f) * (I.tipo === 'jefe' ? 1 : 0.6));
    g.globalAlpha = 1 - f;
    if (I.tipo === 'jefe') pintaJefe(g, P, I, y); else pintaElite(g, P, I, y);
    g.globalAlpha = 1;
  }
  // la penumbra de la arena mientras está el cartel (sube al caer y baja al irse); fuera de él, la de siempre
  function sombra(E, normal) {
    const I = E.intro;
    if (!I) return normal;
    const k = Math.min(1, I.t / I.cae) * (1 - fuera(I));
    return normal + (I.sombra - normal) * k;
  }
  // luces sobre el cartel, para que la penumbra no lo apague
  function luces(P, E) {
    const I = E.intro;
    if (!I || !I.golpe) return [];
    const y = centro(P, I), a = 1 - fuera(I);
    return [0.12, 0.38, 0.62, 0.88].map(k => ({ x: P.W * k, y, r: I.tipo === 'jefe' ? 230 : 180, col: null, a }));
  }
  // el foco de la entrada es para el jefe; en la de élite nadie se queda a oscuras
  const foco = E => (E.intro && E.intro.tipo === 'jefe' ? E.intro : null);
  return { empieza, avanza, pinta, sombra, luces, foco, TIPOS };
})();

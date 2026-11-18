// Fans of Asalto · ADAPTADORES · Los consejos: la primera vez que algo aparece en la partida (las misiones, las clases, la esencia para
// la tienda, una misión de piedra, una piedra para usar, la racha, el banquillo, mover héroes, las improntas y el ascenso), sale la
// franja con una frase sencilla y la mano señalándolo. Uno cada vez y solo con el equipo en preparación; no corta el juego (se puede
// seguir tocando todo) y se cierra con VALE, que lo apunta en los consejos vistos para no repetirlo. Después de la partida guiada.
'use strict';
AS.consejos = (() => {
  const C = AS.tema.C, F = AS.franja;
  // el héroe del campo que cumple `pide` (o null), con su hueco
  const heroeQue = (q, pide) => AS.equipo.enCampo(q.equipo).find(({ h }) => pide(h)) || null;
  const enHeroe = (P, x) => (x ? { r: F.heroe(P, x.i), lado: 'abajo', fx: 0.5 } : null);
  // cada consejo: cuándo sale (devuelve qué señalar, o null) y su frase. En este orden: si hay dos a la vez, sale antes el primero
  const LISTA = [
    { id: 'c-misiones', txt: 'Cumple estas misiones y ganas oro y plumas',
      donde: (q, P) => (q.misiones.length ? { r: AS.pinta.misiones.reparto(P, q.misiones.length).misiones, lado: 'abajo', fx: 0.5 } : null) },
    { id: 'c-clases', txt: 'Cada héroe suma a sus clases: más puntos, más poder',
      donde: (q, P) => (Object.keys(q.sinergias.puntos).length ? { r: P.clases, lado: 'abajo', fx: 0.2 } : null) },
    { id: 'c-tienda', txt: 'La esencia (el diamante) se gasta en la TIENDA',
      donde: (q, P) => (q.esencia > 0 ? { r: P.objetos, lado: 'arriba', fx: 0.13 } : null) },
    { id: 'c-piedra-mision', txt: 'Misión de piedra: cúmplela a tiempo y ganas una piedra',
      donde: (q, P) => (q.piedras.mision ? { r: AS.pinta.misiones.reparto(P, q.misiones.length).piedras, lado: 'abajo', fx: 0.5 } : null) },
    { id: 'c-piedra-usar', txt: 'Toca tu piedra: invocación gratis y héroes más raros',
      donde: (q, P) => (q.piedras.bolsa.length ? { r: AS.pinta.misiones.reparto(P, q.misiones.length).piedras, lado: 'abajo', fx: 0.5 } : null) },
    { id: 'c-racha', txt: '¡Racha! Línea tras línea ganas oro extra',
      donde: (q, P) => (q.racha >= 2 ? { r: P.invocar, lado: 'arriba', fx: 0.8 } : null) },
    { id: 'c-banquillo', txt: 'En el banquillo no luchan: arrástralo a un hueco',
      donde: (q, P) => (q.equipo.banquillo.length ? { r: P.banquillo[0], lado: 'abajo', fx: 0.5 } : null) },
    { id: 'c-mover', txt: 'Arrastra a un héroe para cambiarlo de sitio',
      donde: (q, P) => (q.oleada >= 3 ? enHeroe(P, heroeQue(q, () => true)) : null) },
    { id: 'c-impronta', txt: 'Únele dos de la misma clase y gana su poder',
      donde: (q, P) => enHeroe(P, heroeQue(q, h => h.marcas && Object.keys(h.marcas).length)) },
    { id: 'c-ascenso', txt: 'Al nivel 5, este héroe asciende y gana un poder',
      donde: (q, P) => enHeroe(P, heroeQue(q, h => !h.rama && h.nivel >= 3 && h.nivel < ASALTO.niveles.ascenso)) },
  ];
  const S = { ahora: null, t: 0, tapa: null };   // tapa: el recuadro de la franja si está arriba (las cintas de misión van debajo)
  // ¿se puede enseñar un consejo ahora? Con el equipo en preparación, sin guía, sin ventanas ni carteles y sin nada a medias
  const toca = E => !AS.guia.activa && E.casos.partida.fase === 'preparar' && !E.batalla && !E.giro && !E.intro && !E.cartel && !E.arrastre && !AS.ventanas.abierta();
  function busca(E, P) {
    const q = E.casos.partida, vistos = E.casos.progreso.consejos;
    for (const c of LISTA) {
      if (vistos[c.id]) continue;
      const o = c.donde(q, P);
      if (o) return { c, o };
    }
    return null;
  }
  function pinta(g, P, E, dt) {
    const a = toca(E) ? busca(E, P) : null;
    if (!a || !S.ahora || a.c.id !== S.ahora.c.id) S.t = 0;
    S.ahora = a; S.tapa = null;
    if (!a) return;
    S.t += dt;
    const centro = a.o.r.y + a.o.r.h / 2, lado = centro < P.arena.y + P.arena.h / 2 ? 'abajo' : 'arriba';   // la franja, lejos de lo que señala
    const r = F.pinta(g, P, E, { txt: tr(a.c.txt), lado, boton: { txt: tr('VALE'), col: C.verde, que: 'vale-consejo' } });
    if (lado === 'arriba') S.tapa = r;
    F.senala(g, a.o, S.t);
  }
  // VALE: no vuelve a salir
  function vale(E) {
    if (!S.ahora) return;
    E.casos.consejoVisto(S.ahora.c.id); S.ahora = null; AS.suena('clic');
  }
  return { pinta, vale, LISTA, get tapa() { return S.tapa; } };
})();

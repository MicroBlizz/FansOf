// Fans of Asalto · ADAPTADORES · La primera partida guiada: una mano señala dónde tocar, paso a paso (invocar, el empujón que completa
// una línea, unir a dos héroes con el botón UNIR y salir a luchar), con una frase en letra grande en una franja de lado a lado en lo alto de la arena y un botón para saltarla. Mientras dura, solo deja
// tocar lo que toca en cada paso. El paso sale del estado de la partida (no se guarda aparte), así que si se sale y se vuelve, sigue
// donde iba. Acaba al terminar la primera oleada, o al saltarla, y lo apunta en los consejos vistos. No decide reglas.
'use strict';
AS.guia = (() => {
  const C = AS.tema.C;
  const G = { activa: false, paso: '', visto: '', t: 0 };
  const TEXTO = {
    invoca: 'Pulsa INVOCAR para conseguir tu primer héroe',
    empuja: 'Toca la runa que brilla y te llega otro héroe',
    absorbe: 'Pulsa UNIR y junta dos héroes en uno más fuerte',
    lucha: '¡Equipo listo! Pulsa ¡A LUCHAR!',
    batalla: 'Ahora luchan solos. ¡Que nadie pase la valla!',
  };
  // lo que se puede tocar en cada paso (la pausa y saltar la guía, siempre)
  const PERMITE = { invoca: ['invoca'], espera: ['invoca'], empuja: ['empuja'], absorbe: ['unir', 'heroe'], lucha: ['lucha', 'invoca', 'heroe', 'unir', 'tienda', 'misiones'], batalla: ['velocidad', 'misiones'] };
  const ORDEN = ['invoca', 'empuja', 'absorbe', 'lucha', 'batalla'];

  function empieza(E) {
    const q = E.casos.partida;
    Object.assign(G, { activa: q.guiada && q.oleada === 1 && !E.casos.progreso.consejos.guia, paso: '', visto: '', t: 0 });
  }
  function acaba(E) {
    G.activa = false;
    E.casos.consejoVisto('guia'); E.casos.consejoVisto('inicio');
  }
  function salta(E) { acaba(E); AS.suena('clic'); }
  function pasoDe(E) {
    const q = E.casos.partida;
    if (E.batalla) return 'batalla';
    if (E.giro) return 'espera';
    if (q.cuenta.tiradas === 0) return 'invoca';
    if (q.empujones > 0 && q.altar && AS.altar.empujonConLinea(q.altar)) return 'empuja';
    if (q.cuenta.absorbidos === 0 && AS.equipo.enCampo(q.equipo).length >= 2) return 'absorbe';
    return 'lucha';
  }
  function avanza(E, dt) {
    if (!G.activa) return;
    const q = E.casos.partida;
    if (q.oleada > 1 || q.final) {   // la primera oleada ha terminado: hasta aquí llega la mano
      acaba(E);
      if (!q.final && q.cuenta.oleadasGanadas) AS.pantalla.cartel(tr('¡OLEADA SUPERADA!'), tr('Así se juega. Ahora sigue tú'), C.verde, 2.2);
      return;
    }
    const paso = pasoDe(E);
    if (paso !== G.paso) { G.paso = paso; G.t = 0; }
    if (TEXTO[paso]) G.visto = paso;   // mientras giran las columnas, la franja sigue con la última frase
    G.t += dt;
  }
  function permite(E, que, dato) {
    if (!G.activa || que === 'pausa' || que === 'salta-guia') return true;
    if (!(PERMITE[G.paso] || []).includes(que)) return false;
    if (G.paso !== 'empuja') return true;
    const e = AS.altar.empujonConLinea(E.casos.partida.altar);
    return !!e && dato.col === e.col && dato.dir === e.dir;
  }
  // mover de hueco, abrir fichas y deshacer: solo cuando la mano ya no lleva al jugador (el último paso)
  const libre = () => !G.activa || G.paso === 'lucha';

  /* ---------- lo que se pinta (la franja y la mano son de franja.js) ---------- */
  const F = AS.franja;
  // el paso de unir: la mano señala el botón UNIR y, con el modo encendido, al héroe que toca elegir (primero uno y luego el otro)
  function une(g, P, E, t) {
    if (!E.unir) { F.senala(g, { r: P.unir, lado: 'arriba', fx: 0.5 }, t); return; }
    const campo = AS.equipo.enCampo(E.casos.partida.equipo), q = E.unir.queda;
    const toca = campo.find(c => !(q && q.donde === 'campo' && q.i === c.i));
    if (!toca || (E.arrastre && E.arrastre.movido)) return;
    F.senala(g, { r: F.heroe(P, toca.i), lado: 'abajo', fx: 0.5 }, t);
  }
  // dónde está lo que hay que tocar en cada paso y por qué lado entra la mano: casi siempre por encima (sobre el Altar e INVOCAR está
  // la tira de la tienda, vacía al empezar; sobre UNIR y ¡A LUCHAR!, el borde del Altar y el banquillo), porque por debajo de los
  // botones de abajo no queda sitio en todas las pantallas
  const OBJETIVO = {
    invoca: P => ({ r: P.invocar, lado: 'arriba', fx: 0.8 }),
    lucha: P => ({ r: P.luchar, lado: 'arriba', fx: 0.8 }),
    empuja(P, E) {
      const e = AS.altar.empujonConLinea(E.casos.partida.altar);
      return e ? { r: P.losa(e.col, e.dir === 1 ? -1 : 3), lado: e.dir === 1 ? 'arriba' : 'abajo', fx: 0.5 } : null;
    },
  };
  // la franja va arriba, de lado a lado (tapa la tira de misiones mientras dura), con SALTAR y por qué paso va
  function pinta(g, P, E) {
    if (!G.activa || !G.visto || AS.ventanas.abierta()) return;
    F.pinta(g, P, E, { txt: tr(TEXTO[G.visto]), lado: 'arriba', boton: { txt: tr('SALTAR'), col: C.azul, que: 'salta-guia' }, pasos: { n: ORDEN.indexOf(G.visto), total: ORDEN.length } });
    if (G.paso === 'absorbe') { une(g, P, E, G.t); return; }
    const o = OBJETIVO[G.paso] ? OBJETIVO[G.paso](P, E) : null;
    if (o) F.senala(g, o, G.t);
  }
  // la frase va en la franja de arriba (también en plena batalla), así que la pista del pie se queda callada
  const pie = () => '';
  return { empieza, avanza, permite, libre, salta, pinta, pie, get activa() { return G.activa; }, get paso() { return G.paso; } };
})();

// Fans of Asalto · ADAPTADORES · La primera partida guiada: una mano señala dónde tocar, paso a paso (invocar, el empujón que completa
// una línea, absorber a un héroe y salir a luchar), con una frase en un pergamino (a la derecha de la arena) y un botón para saltarla. Mientras dura, solo deja
// tocar lo que toca en cada paso. El paso sale del estado de la partida (no se guarda aparte), así que si se sale y se vuelve, sigue
// donde iba. Acaba al terminar la primera oleada, o al saltarla, y lo apunta en los consejos vistos. No decide reglas.
'use strict';
AS.guia = (() => {
  const T = AS.tema, C = T.C;
  const G = { activa: false, paso: '', t: 0 };
  const TEXTO = {
    invoca: 'Pulsa INVOCAR: tres runas iguales en línea traen a un héroe',
    empuja: 'Toca la runa que brilla: mueve su columna y completa otra línea',
    absorbe: 'Arrastra un héroe sobre otro: se juntan y sube de nivel',
    lucha: 'Tu equipo está listo. Pulsa ¡A LUCHAR!',
    batalla: 'Luchan solos. Que nadie cruce la empalizada',
  };
  // lo que se puede tocar en cada paso (la pausa y saltar la guía, siempre)
  const PERMITE = { invoca: ['invoca'], espera: ['invoca'], empuja: ['empuja'], absorbe: ['heroe'], lucha: ['lucha', 'invoca', 'heroe', 'misiones'], batalla: ['velocidad', 'misiones'] };
  const ORDEN = ['invoca', 'empuja', 'absorbe', 'lucha'];

  function empieza(E) {
    const q = E.casos.partida;
    Object.assign(G, { activa: q.guiada && q.oleada === 1 && !E.casos.progreso.consejos.guia, paso: '', t: 0 });
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

  /* ---------- lo que se pinta ---------- */
  // una mano de píxeles que señala hacia arriba; (x, y) es la punta del dedo
  const MANO = ['..X.....', '.XWX....', '.XWX....', '.XWX....', '.XWXXX..', '.XWWXWXX', 'XXWWWWWX', 'XWWWWWWX', 'XWWWWWWX', '.XWWWWX.', '..XXXX..'];
  function mano(g, x, y, aprieta) {
    const k = 5, x0 = Math.round(x) - 2 * k - 2, y0 = Math.round(y) + (aprieta ? 4 : 0);
    MANO.forEach((fila, j) => { for (let i = 0; i < fila.length; i++) if (fila[i] !== '.') { g.fillStyle = fila[i] === 'X' ? C.tinta : C.crema; g.fillRect(x0 + i * k, y0 + j * k, k, k); } });
    g.fillStyle = C.oro; g.fillRect(x0 + 2 * k, y0 + k, k, k);   // la uña, para que se vea dónde apunta
  }
  // un marco de oro que late alrededor de lo que hay que tocar
  function marco(g, r, t) {
    const e = 4 + Math.round(Math.abs(Math.sin(t * 5)) * 6);
    g.fillStyle = C.tinta; g.fillRect(r.x - e - 2, r.y - e - 2, r.w + e * 2 + 4, 8); g.fillRect(r.x - e - 2, r.y + r.h + e - 6, r.w + e * 2 + 4, 8); g.fillRect(r.x - e - 2, r.y - e - 2, 8, r.h + e * 2 + 4); g.fillRect(r.x + r.w + e - 6, r.y - e - 2, 8, r.h + e * 2 + 4);
    g.fillStyle = C.oro; g.fillRect(r.x - e, r.y - e, r.w + e * 2, 4); g.fillRect(r.x - e, r.y + r.h + e - 4, r.w + e * 2, 4); g.fillRect(r.x - e, r.y - e, 4, r.h + e * 2); g.fillRect(r.x + r.w + e - 4, r.y - e, 4, r.h + e * 2);
    AS.fx.luz(r.x + r.w / 2, r.y + r.h / 2, Math.max(r.w, r.h) * 0.8, [255, 215, 90], 0.05);
  }
  function senala(g, r, t) {
    marco(g, r, t);
    mano(g, r.x + r.w / 2, r.y + Math.round(r.h * 0.55) + Math.round(Math.abs(Math.sin(t * 5)) * 10), Math.sin(t * 5) > 0.7);
  }
  // la mano va de un héroe a otro, una y otra vez: coge, arrastra y suelta
  function arrastra(g, P, E, t) {
    const campo = AS.equipo.enCampo(E.casos.partida.equipo);
    if (campo.length < 2 || (E.arrastre && E.arrastre.movido)) return;
    const a = P.hueco(campo[campo.length - 1].i), b = P.hueco(campo[0].i), k = Math.min(1, Math.max(0, ((t % 1.8) - 0.3) / 1.0)), e = k * k * (3 - 2 * k);
    marco(g, { x: b.x - 44, y: b.y - 96, w: 88, h: 104 }, t);
    mano(g, a.x + (b.x - a.x) * e, a.y - 50 + (b.y - a.y) * e, k > 0 && k < 1);
  }
  const OBJETIVO = {
    invoca: P => P.invocar, espera: () => null, lucha: P => P.luchar, batalla: () => null, absorbe: () => null,
    empuja(P, E) { const e = AS.altar.empujonConLinea(E.casos.partida.altar); return e ? P.losa(e.col, e.dir === 1 ? -1 : 3) : null; },
  };
  // el pergamino con la frase del paso, a la derecha de la arena (los héroes están a la izquierda), con los pasos que van y el botón de saltar
  function pergamino(g, P, E) {
    const r = P.guia, n = ORDEN.indexOf(G.paso), b = { x: r.x + r.w - 124, y: r.y + r.h - 52, w: 112, h: 42 };
    T.pergamino(g, r.x, r.y, r.w, r.h);
    for (let i = 0; i < ORDEN.length; i++) { g.fillStyle = i <= n ? C.sangre : C.perg3; g.fillRect(r.x + 16 + i * 18, r.y + r.h - 34, 12, 8); }   // por qué paso va
    AS.texto.parrafo(g, tr(TEXTO[G.paso]), r.x + r.w / 2, r.y + Math.round((r.h - 52) / 2) + 6, { col: C.tinta, borde: false, max: r.w - 30 });
    T.boton(g, b.x, b.y, b.w, b.h, C.azul);
    AS.texto.pinta(g, tr('SALTAR'), b.x + b.w / 2, b.y + Math.round((b.h - 8) / 2), { col: C.crema, ancla: 'c', max: b.w - 12 });
    E.zona(b, 'salta-guia');
  }
  function pinta(g, P, E) {
    if (!G.activa || !ORDEN.includes(G.paso) || AS.ventanas.abierta()) return;
    pergamino(g, P, E);
    if (G.paso === 'absorbe') { arrastra(g, P, E, G.t); return; }
    const r = OBJETIVO[G.paso](P, E);
    if (r) senala(g, r, G.t);
  }
  // en plena batalla no hay pergamino (taparía la pelea): la frase va en la pista del pie
  const pie = () => (G.paso === 'batalla' ? tr(TEXTO.batalla) : '');
  return { empieza, avanza, permite, libre, salta, pinta, pie, get activa() { return G.activa; }, get paso() { return G.paso; } };
})();

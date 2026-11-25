// Fans of Asalto · ADAPTADORES · La pantalla de la partida mientras se prepara la oleada: lleva el estado de lo que se ve (E), recoge los
// toques (tocar un botón, arrastrar un héroe a un hueco o sobre otro para cambiarle el sitio, y el modo UNIR: se pulsa el botón, se
// eligen dos héroes y una ventana dice qué gana el que se queda antes de confirmar), llama a los casos de uso y anima el Altar: el
// giro de las columnas, las líneas que se encienden una a una, los héroes que llegan en su columna de luz y los premios. En cada
// fotograma pinta todo en el lienzo pequeño y pasa las luces a la capa de luces. La batalla la lleva pantalla-batalla.js; la mano de
// la primera partida guiada, guia.js (que dice qué se puede tocar en cada paso); los consejos de la primera vez, consejos.js; las misiones, pinta-misiones.js.
'use strict';
AS.pantalla = (() => {
  const L = AS.lienzo.L, fx = AS.fx, C = AS.tema.C;
  const E = { casos: null, activa: false, t: 0, P: null, plano: '', zonas: [], oroVisto: 0, vidasRojo: 0, destinoOro: { x: 0, y: 0 }, giro: null, ocultos: new Set(), apariciones: new Map(),
    celdasOro: new Set(), arrastre: null, toque: null, batalla: null, vel: 1, destellos: new Map(), ascensos: new Map(), cartel: null, pista: '', intro: null, tFin: 0, cerrando: false,
    casi: new Set(), cumplidas: [], misionHecha: null, combo: 0, tCombo: 0, unir: null };   // unir: null, o { queda: el sitio del héroe que se queda } con el modo UNIR encendido
  E.zona = (r, que, dato) => { E.zonas.push({ x: r.x, y: r.y, w: r.w, h: r.h, que, dato }); };
  // ¿está hundido el botón de esta zona? Mientras el dedo lo aprieta y un momento después de soltarlo (para que se vea en un toque rápido)
  E.pulsado = que => (!!E.toque && E.toque.que === que) || (!!E.soltado && E.soltado.que === que);
  // cómo se pinta el botón de esa zona: apagado (true), apretado ('apretado') o normal (false); ver AS.tema.boton
  E.hunde = (que, apagado) => (apagado ? true : E.pulsado(que) ? 'apretado' : false);
  const p = () => E.casos.partida;
  const COLOR = { tanque: [90, 160, 255], luchador: [255, 130, 80], asesino: [80, 230, 220], tirador: [140, 240, 110], mago: [255, 200, 90], sanador: [255, 150, 200], brujo: [255, 100, 150], comodin: [255, 240, 200] };
  const ERRORES = { 'sin-oro': 'No te llega el oro', 'sin-sitio': 'Sin sitio: une a dos héroes', 'faltan-heroes': 'Hacen falta dos héroes', 'sin-empujones': 'No te quedan empujones', 'sin-estallido': 'Ya has usado el Estallido de esta oleada', 'sin-repetidas': 'No hay runas repetidas que romper', 'sin-tirada': 'Invoca primero', 'sin-piedra': 'No tienes esa piedra', 'sin-heroes': 'Pon un héroe en el campo',
    'hueco-cerrado': 'Ese hueco se abre con mejoras', 'banquillo-lleno': 'El banquillo está lleno' };

  function cartel(txt, sub, col, vida) { E.cartel = { txt, sub: sub || '', col: col || C.oro2, t: 0, vida: vida || 1.5 }; }
  function noVale(error) { AS.suena('noVale'); if (ERRORES[error]) E.pistaFija = { txt: tr(ERRORES[error]), t: 2 }; }
  // el punto de la pantalla de un sitio del equipo (los pies en el campo, el centro de su casilla en el banquillo)
  function puntoDe(sitio) {
    if (sitio.donde === 'campo') return E.P.hueco(sitio.i);
    const b = E.P.banquillo[Math.min(2, sitio.i)];
    return { x: b.x + b.w / 2, y: b.y + b.h - 6 };
  }

  /* ---------- el Altar: invocar, empujar y su animación ---------- */
  function lanzaGiro(tipo, res) {
    E.celdasOro.clear(); E.casi.clear();
    for (const l of res.llegados) if (!l.fundido) E.ocultos.add(l.heroe.id);
    if (res.dorado && !res.dorado.fundido) E.ocultos.add(res.dorado.heroe.id);
    E.giro = { tipo, t: 0, res, para: tipo === 'tira' ? [0.45, 0.7, 0.95] : [0, 0, 0], parada: [false, false, false], hechas: 0, t0: tipo === 'tira' ? 1.1 : 0.18 };
    AS.suena(tipo === 'tira' ? 'gira' : 'empuja');
    if (tipo === 'empuja') fx.sacude(3);
  }
  function invoca() {
    if (E.giro) { E.giro.t = 99; return; }   // tocar otra vez salta la animación
    const r = E.casos.invoca();
    if (!r.ok) { noVale(r.error); return; }
    lanzaGiro('tira', r.valor);
  }
  // la tirada de una piedra de destino (la i de la bolsa): gira como una invocación, pero gratis
  function tiraPiedra(i) {
    if (E.giro || !AS.guia.libre()) return;
    const r = E.casos.tiraPiedra(i);
    if (!r.ok) { noVale(r.error); return; }
    E.unir = null;
    lanzaGiro('tira', r.valor);
  }
  function empuja(d) {
    if (E.giro) return;
    const r = E.casos.empuja(d.col, d.dir);
    if (!r.ok) { noVale(r.error); return; }
    lanzaGiro('empuja', r.valor);
  }
  // el Estallido: revientan las runas de la clase que más se repite y caen nuevas, como un empujón de todas las columnas a la vez
  function estalla() {
    if (E.giro || !AS.guia.libre()) return;
    const r = E.casos.estalla();
    if (!r.ok) { noVale(r.error); return; }
    for (const [c, f] of r.valor.rotas) { const l = E.P.losa(c, f), x = l.x + l.w / 2, y = l.y + l.h / 2; fx.chispas(x, y, 12, '#f08a2a', 190, true); fx.onda(x, y, 56, '#ffd23a'); }
    cartel(tr('¡ESTALLIDO!'), tr(ASALTO.clases[r.valor.clase].nombre), C.naranja, 1.1);
    fx.fogonazo(0.3, '#ffb060'); fx.sacude(8); AS.suena('premio', 2);
    lanzaGiro('empuja', r.valor);
  }
  // un héroe llega: su columna de luz donde le toca
  function revela(ll) {
    if (!ll) return;
    E.ocultos.delete(ll.heroe.id);
    const s = puntoDe(ll.sitio), col = ll.heroe.dorado ? [255, 215, 90] : COLOR[ll.clase] || COLOR.comodin;
    fx.columna(s.x, s.y, col); fx.brasas(s.x, s.y - 30, 14, '#ffe9a0', 30); fx.onda(s.x, s.y - 6, 60, '#fff3d6');
    AS.suena('invoca');
    if (ll.fundido) fx.numero(s.x, s.y - 120, '+' + ll.heroe.nivel, '#ffd23a', 48);
    else E.apariciones.set(ll.heroe.id, 0);
  }
  function revelaLinea(G, i) {
    const l = G.res.lineas[i];
    for (const [c, f] of l.celdas) {
      const r = E.P.losa(c, f), x = r.x + r.w / 2, y = r.y + r.h / 2;
      E.celdasOro.add(c + ',' + f);
      fx.chispas(x, y, 9, '#ffd23a', 150, true); fx.luz(x, y, 130, [255, 215, 90], 0.6);
    }
    AS.suena('linea', i);
    revela(G.res.llegados[i]);
  }
  function premioGordo(res) {
    revela(res.dorado);
    cartel(tr('¡PREMIO GORDO!'), tr('¡Un Animal Dorado!'), C.oro2, 2.6);
    fx.fogonazo(0.8, '#ffe9a0'); fx.sacude(12); AS.suena('gordo');
    for (let i = 0; i < 10; i++) fx.brasas(E.P.W * (0.1 + i * 0.09), E.P.arena.y + E.P.arena.h - 10, 8, '#ffd23a', 20);
  }
  const NOMBRE_LINEAS = ['', '', '¡DOBLE!', '¡TRIPLE!', '¡CUÁDRUPLE!', '¡LLUVIA DE LÍNEAS!'];
  function remata(G) {
    const res = G.res, n = res.lineas.length, a = E.P.altar;
    const oro = res.oroExtra + res.oroRacha;
    if (res.dorado) premioGordo(res);
    else if (n >= 2) { cartel(tr(NOMBRE_LINEAS[Math.min(n, 5)]), tr('+{n} de oro', { n: oro }), C.oro2); AS.suena('premio', n); fx.sacude(4 + n); }
    else if (res.piedra) cartel(AS.pinta.piedras.nombre(res.piedra), res.llegados.some(l => l.heroe.rareza > 0) ? tr('¡Llega con más rareza!') : '', C.celeste, 1.4);
    else if (res.repite) cartel(tr('¡OTRA GRATIS!'), '', C.verde, 1.1);
    else if (n && res.racha >= 2) rachaSube(res, oro);
    else if (n) fx.sacude(3);
    if (oro) fx.monedas(a.x + a.w / 2, a.y + a.h / 2, 4 + oro, E.destinoOro.x, E.destinoOro.y, () => AS.suena('moneda'));
    if (!n && G.tipo === 'tira') casiLinea(a);
  }
  // otra invocación seguida con línea: la racha sube y paga
  function rachaSube(res, oro) {
    cartel(tr('¡RACHA x{n}!', { n: res.racha }), oro ? tr('+{n} de oro', { n: oro }) : '', C.oro2, 1.1);
    AS.suena('racha', res.racha); fx.sacude(3 + Math.min(res.racha, 5));
    for (let i = 0; i < 3; i++) fx.brasas(E.P.invocar.x + E.P.invocar.w * (0.25 + i * 0.25), E.P.invocar.y + 10, 5, '#ffd23a', 16);
  }
  // una invocación sin línea: se marca la que se ha quedado a una runa y, si un empujón la completa, se dice
  function casiLinea(a) {
    const q = p(), casi = AS.altar.casi(q.altar)[0];
    fx.chispas(a.x + a.w / 2, a.y + a.h / 2, 5, '#b9a77c', 60);
    if (!casi) return;
    for (const [c, f] of casi.celdas) E.casi.add(c + ',' + f);
    if (q.empujones > 0 && AS.altar.empujonConLinea(q.altar)) { cartel(tr('¡CASI!'), tr('Un empujón la completa'), C.naranja, 1.3); AS.suena('casi'); }
  }
  function avanzaGiro(dt) {
    const G = E.giro, n = G.res.lineas.length;
    G.t += dt;
    for (let c = 0; c < 3 && G.tipo === 'tira'; c++) if (!G.parada[c] && G.t >= G.para[c]) { G.parada[c] = true; AS.suena('para', c); fx.sacude(2); }
    if (G.tipo === 'tira' && G.t < G.para[2]) AS.suena('gira');
    while (G.hechas < n && G.t >= G.t0 + G.hechas * 0.36) revelaLinea(G, G.hechas++);
    if (G.t >= G.t0 + n * 0.36 + (n ? 0.2 : 0.05)) { E.giro = null; remata(G); }
  }

  /* ---------- el equipo: tocar y arrastrar ---------- */
  function absorbe(desde, hasta) {
    const r = E.casos.absorbe(desde, hasta);
    if (!r.ok) { noVale(r.error); return; }
    const a = puntoDe(desde), s = puntoDe(hasta);
    for (let i = 0; i < 8; i++) fx.brasas(a.x + (s.x - a.x) * i / 8, a.y - 40 + (s.y - a.y) * i / 8, 2, '#ffe9a0', 8);
    fx.columna(s.x, s.y, [255, 230, 140], 160); fx.onda(s.x, s.y - 40, 70, '#ffd23a');
    fx.numero(s.x, s.y - 124, tr('NIVEL {n}', { n: r.valor.nivel }), '#ffd23a', 48);
    AS.suena('absorbe');
  }
  function cambia(a, b) {
    const r = E.casos.cambia(a, b);
    if (!r.ok) { noVale(r.error); return; }
    AS.suena('clic'); AS.consejos.hecho(E, 'mover');
  }
  // el botón UNIR enciende y apaga el modo de unir (se queda encendido después de cada unión hasta que se vuelve a pulsar)
  function modoUnir() {
    const q = p();
    if (E.giro || q.fase !== 'preparar') return;
    if (E.unir) { E.unir = null; AS.suena('clic'); return; }
    if (AS.equipo.todos(q.equipo).length < 2) { noVale('faltan-heroes'); return; }
    E.unir = { queda: null }; AS.suena('clic');
  }
  // pide confirmar: el de `hasta` se queda y crece, el de `desde` se une a él. Hasta que no se confirma, no cambia nada
  function pideUnion(desde, hasta) {
    const r = E.casos.vistaUnion(desde, hasta);
    if (!r.ok) { noVale(r.error); return; }
    AS.suena('clic');
    AS.ventanas.union(E, r.valor, { si: () => { absorbe(desde, hasta); sigueUniendo(); }, alReves: () => pideUnion(hasta, desde), no: () => { if (E.unir) E.unir.queda = null; } });
  }
  // tras una unión el modo UNIR sigue encendido, para unir todos los que se quiera seguidos; se apaga solo si ya no quedan dos héroes
  function sigueUniendo() { E.unir = AS.equipo.todos(p().equipo).length >= 2 ? { queda: null } : null; }
  // con el modo encendido: el primer héroe que se toca es el que se queda; el segundo, el que se une a él
  function eligeUnir(sitio) {
    const U = E.unir;
    if (!U.queda || mismoSitio(U.queda, sitio)) { U.queda = U.queda ? null : sitio; AS.suena('clic'); return; }
    pideUnion(sitio, U.queda);
  }
  function mueve(desde, hasta) {
    const r = E.casos.mueve(desde, hasta);
    if (!r.ok) { noVale(r.error); return; }
    AS.suena('clic'); AS.consejos.hecho(E, 'mover');
  }
  const mismoSitio = (a, b) => a && b && a.donde === b.donde && a.i === b.i;
  function zonaEn(pt, salta) {
    for (let i = E.zonas.length - 1; i >= 0; i--) {
      const z = E.zonas[i];
      if (pt.x >= z.x && pt.x <= z.x + z.w && pt.y >= z.y && pt.y <= z.y + z.h && !(salta && z.que === 'heroe' && mismoSitio(z.dato, salta))) return z;
    }
    return null;
  }
  function suelta(A, pt) {
    const z = zonaEn(pt, A.desde);
    if (!z) return;
    if (z.que === 'heroe') { if (E.unir) pideUnion(A.desde, z.dato); else if (AS.guia.libre()) cambia(A.desde, z.dato); }   // sin el modo UNIR, solo se cambian el sitio
    else if (z.que === 'hueco' && AS.guia.libre()) mueve(A.desde, z.dato);
  }
  const ACCIONES = {
    invoca, empuja, estalla, unir: modoUnir,
    lucha: () => { if (!E.giro) { E.unir = null; AS.pantallaBatalla.lucha(E); } },
    velocidad: () => { E.vel = E.vel % 3 + 1; AS.suena('clic'); },
    deshace: () => { if (AS.guia.libre() && E.casos.deshace().ok) AS.suena('clic'); },
    misiones: () => { AS.suena('clic'); AS.ventanas.misiones(E); },
    cifras: () => { if (!E.giro) { AS.suena('clic'); AS.ventanas.cifras(E); } },
    piedras: () => { if (!E.giro) { AS.suena('clic'); AS.ventanas.piedras(E); } },
    suerte: () => { if (!E.giro) { AS.suena('clic'); AS.ventanas.suerte(E); } },
    tienda: () => { if (p().fase === 'preparar' && !E.giro) { AS.suena('clic'); AS.ventanas.tienda(E); } },
    reliquias: () => { if (p().fase === 'preparar' && !E.giro) { AS.suena('clic'); AS.ventanas.reliquias(E); } },
    'salta-guia': () => AS.guia.salta(E),
    'vale-consejo': () => AS.consejos.vale(E),
    pausa: () => { AS.suena('clic'); AS.ventanas.pausa(E); },
    clase: k => { AS.suena('clic'); AS.ventanas.clase(E, k); },
    'ayuda-empujon': () => { E.pistaFija = { txt: tr('Toca una runa que asoma: mueve su columna'), t: 3 }; },
    candado: () => { noVale('hueco-cerrado'); },
  };
  function alBajar(ev) {
    if (!E.activa || AS.ventanas.abierta()) return;
    const pt = AS.lienzo.punto(ev), z = zonaEn(pt), libre = p().fase === 'preparar' && !E.giro && !E.batalla;
    if (z && z.que === 'heroe' && libre && AS.guia.permite(E, 'heroe', z.dato)) { const h = AS.equipo.leer(p().equipo, z.dato); if (h) { E.arrastre = { desde: z.dato, h, x: pt.x, y: pt.y, x0: pt.x, y0: pt.y, movido: false }; return; } }
    E.toque = z;
  }
  function alMover(ev) {
    const A = E.arrastre;
    if (!A) return;
    const pt = AS.lienzo.punto(ev);
    A.x = pt.x; A.y = pt.y;
    if (Math.hypot(pt.x - A.x0, pt.y - A.y0) > 12) A.movido = true;
  }
  function alSubir(ev) {
    if (!E.activa) return;
    const pt = AS.lienzo.punto(ev), A = E.arrastre, t = E.toque;
    E.arrastre = null; E.toque = null;
    if (t) E.soltado = { que: t.que, t: 0.12 };
    if (A) { if (A.movido) suelta(A, pt); else if (E.unir) eligeUnir(A.desde); else if (AS.guia.libre()) { AS.suena('clic'); AS.ventanas.heroe(E, A.desde); } return; }
    const z = zonaEn(pt);
    if (!(t && z && z.que === t.que && ACCIONES[z.que] && AS.guia.permite(E, z.que, z.dato))) return;
    AS.consejos.hecho(E, z.que);   // si el consejo de ahora enseñaba esto, ya está aprendido
    ACCIONES[z.que](z.dato);
  }

  /* ---------- la pista del pie ---------- */
  const hayLineaConEmpujon = q => !!q.altar && q.altarVivo && q.empujones > 0 && !!AS.altar.empujonConLinea(q.altar);
  function pista(q) {
    if (E.pistaFija) return E.pistaFija.txt;
    if (AS.guia.activa) return AS.guia.pie();   // en la partida guiada habla el pergamino de la mano
    if (E.batalla) return q.proxima.tipo === 'normal' ? tr('Que no crucen la empalizada') : tr('Si pierdes esta, se acaba la partida');
    if (E.unir) return E.unir.queda ? tr('Ahora toca al que se une a él') : tr('Toca al héroe que se queda y crece');
    if (q.despertar.oferta) return tr('Toca a tu legendario: elige su carta');
    if (AS.equipo.todos(q.equipo).some(x => AS.heroe.puedeAscender(ASALTO, x.h))) return tr('Toca al héroe de la flecha: asciende');
    if (q.equipo.banquillo.length) return tr('Pulsa UNIR y junta a dos héroes');
    if (hayLineaConEmpujon(q)) return tr('Toca la runa dorada: ¡hace línea!');
    if (q.oro < q.coste) return q.estallidos > 0 && q.altarVivo ? tr('Aún te queda el ESTALLIDO') : tr('Sin oro. Pulsa ¡A LUCHAR!');
    return q.cuenta.lineas ? tr('Invoca, ordena tu equipo y a luchar') : tr('Pulsa INVOCAR y busca tres en línea');
  }

  /* ---------- el fotograma ---------- */
  function relojes(dt) {
    for (const [k, v] of E.apariciones) { if (v + dt > 0.3) E.apariciones.delete(k); else E.apariciones.set(k, v + dt); }
    for (const [k, v] of E.destellos) { if (v - dt <= 0) E.destellos.delete(k); else E.destellos.set(k, v - dt); }
    for (const [k, v] of E.ascensos) { if (v - dt <= 0) E.ascensos.delete(k); else E.ascensos.set(k, v - dt); }
    const oro = p().oro + (E.oroBatalla || 0);
    E.oroVisto += (oro - E.oroVisto) * Math.min(1, dt * 10);
    if (Math.abs(oro - E.oroVisto) < 0.5) E.oroVisto = oro;
    E.vidasRojo = Math.max(0, E.vidasRojo - dt); E.tCombo = Math.max(0, E.tCombo - dt);
    if (E.cartel && (E.cartel.t += dt) > E.cartel.vida) E.cartel = null;
    if (E.pistaFija && (E.pistaFija.t -= dt) <= 0) E.pistaFija = null;
    if (E.soltado && (E.soltado.t -= dt) <= 0) E.soltado = null;
  }
  function pintaArrastre(g) {
    const A = E.arrastre;
    if (!A || !A.movido) return;
    AS.dibujos.muneco(g, { tipo: A.h.tipo, aspecto: AS.aspecto.deHeroe(ASALTO, A.h), anim: 'andar', tAnim: E.t, lado: 'heroe', dorado: A.h.dorado, alfa: 0.9 }, A.x, A.y + 40);
    const z = zonaEn(A, A.desde), txt = z && z.que === 'heroe' ? (E.unir ? tr('UNIR') : tr('CAMBIAR')) : z && z.que === 'hueco' ? tr('MOVER') : '';
    if (txt) AS.texto.pinta(g, txt, A.x, A.y - 90, { col: z.que === 'heroe' ? C.oro : '#b8ff7a', ancla: 'c' });
  }
  // con el modo UNIR encendido: unas esquinas de oro en cada héroe que se puede elegir y un marco que late en el que se queda
  function pintaUnir(g) {
    if (!E.unir || E.batalla) return;
    for (const z of E.zonas) {
      if (z.que !== 'heroe') continue;
      if (mismoSitio(z.dato, E.unir.queda)) { AS.franja.marco(g, z, E.t); AS.texto.pinta(g, tr('SE QUEDA'), z.x + z.w / 2, z.y - 12, { col: C.oro, ancla: 'c' }); continue; }
      const n = 18, e = 4;
      for (const [x, y, sx, sy] of [[z.x, z.y, 1, 1], [z.x + z.w, z.y, -1, 1], [z.x, z.y + z.h, 1, -1], [z.x + z.w, z.y + z.h, -1, -1]]) {
        g.fillStyle = C.oro; g.fillRect(Math.min(x, x + sx * n), Math.min(y, y + sy * e), n, e); g.fillRect(Math.min(x, x + sx * e), Math.min(y, y + sy * n), e, n);
      }
    }
  }
  function pintaCartel(g, P) {
    const c = E.cartel;
    if (!c) return;
    const k = Math.min(1, c.t / 0.15), w = Math.min(P.W - 20, Math.max(AS.texto.ancho(c.txt, 64), AS.texto.ancho(c.sub, 32)) + 80), y = P.arena.y + Math.round(P.arena.h * 0.42) - Math.round((1 - k) * 30);
    const oro = c.col === C.oro2;   // los carteles de premio: cinta granate con letras de oro
    g.globalAlpha = c.t > c.vida - 0.25 ? Math.max(0, (c.vida - c.t) / 0.25) : k;
    AS.tema.cinta(g, P.W / 2 - w / 2, y - 40, w, 86, oro ? C.sangre : c.col);
    AS.texto.pinta(g, c.txt, P.W / 2, y, { t: 64, col: oro ? C.oro : C.crema, ancla: 'c', max: w - 60 });
    if (c.sub) { AS.tema.pergamino(g, P.W / 2 - w / 2 + 30, y + 44, w - 60, 44); AS.texto.pinta(g, c.sub, P.W / 2, y + 66, { col: C.tinta, borde: false, ancla: 'c', max: w - 80 }); }
    g.globalAlpha = 1;
  }
  // la luz que lleva encima cada uno en la batalla; en la entrada del jefe, todo el foco es para él
  function luzDe(P, u, I) {
    const s = P.aPantalla(u.x, u.y);
    if (u.jefe) return { x: s.x, y: s.y - 80, r: I ? 250 : 200, col: I || u.enFuria ? [255, 70, 50] : null, a: I ? 1 : 0.55 };
    return { x: s.x, y: s.y - 40, r: 90, col: u.dorado ? [255, 215, 90] : null, a: (u.lado === 'heroe' ? 0.75 : 0.5) * (I ? 0.3 : 1) };
  }
  function luces(P, q) {
    const A = P.arena, a = P.altar, lista = AS.mazmorra.luces(ASALTO.zonas[q.zona].tema, A.x, A.y, A.w, A.h, E.t), I = E.intro;
    if (!E.batalla) for (const { h, i } of AS.equipo.enCampo(q.equipo)) { const s = P.hueco(i); lista.push({ x: s.x, y: s.y - 40, r: h.dorado ? 130 : 96, col: h.dorado ? [255, 215, 90] : null, a: 0.75 }); }
    else for (const u of E.batalla.u) if (!u.muerta) lista.push(luzDe(P, u, I));
    if (I && I.t > 0.9) for (const k of [0.12, 0.38, 0.62, 0.88]) lista.push({ x: P.W * k, y: A.y + A.h - 96, r: 200, col: null, a: 1 });   // la cinta con su nombre, a plena luz
    lista.push({ x: a.x + a.w / 2, y: a.y + a.h / 2, r: 240, col: [255, 170, 80], a: 0.16 + Math.sin(E.t * 2) * 0.03 });
    return lista.concat(fx.luces());
  }
  function fotograma(dt) {
    if (!E.activa || !p()) return;
    const q = p(), clave = L.W + 'x' + L.H;
    if (E.plano !== clave) { E.plano = clave; E.P = AS.plano(L.W, L.H); }
    E.t += dt; E.zonas.length = 0;
    if (E.giro) avanzaGiro(dt);
    if (E.batalla) AS.pantallaBatalla.avanza(E, dt);
    if (!E.giro) for (const a of E.casos.avisos()) if (!AS.ventanas.leyendas.avisa(E, a)) AS.pinta.misiones.avisa(E, a);   // legendarios y seres; misiones recién cumplidas, con el Altar ya parado
    AS.guia.avanza(E, dt);
    relojes(dt); fx.avanza(dt);
    E.pista = pista(q);
    const g = L.b, P = E.P, tb = fx.temblor();
    g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false;
    g.fillStyle = C.noche; g.fillRect(0, 0, P.W, P.H);
    g.translate(tb.x, tb.y);
    AS.pinta.arena(g, P, q, E); AS.pinta.marcador(g, P, q, E); AS.pinta.altar(g, P, q, E); AS.pinta.misiones(g, P, q, E, dt);
    pintaUnir(g); AS.guia.pinta(g, P, E); AS.consejos.pinta(g, P, E, dt); pintaArrastre(g); fx.pinta(g);
    if (E.intro) AS.pantallaBatalla.pintaIntro(g, P, E);
    pintaCartel(g, P);
    g.setTransform(1, 0, 0, 1, 0, 0);
    fx.pintaFogonazo(g, P.W, P.H);
    const jefe = E.batalla && E.batalla.jefe && !E.batalla.jefe.muerta;
    AS.lienzo.presenta(luces(P, q), { y0: P.arena.y, y1: P.arena.y + P.arena.h, a: E.intro ? 0.88 : jefe ? 0.62 : 0.5 });
  }
  function empieza(casos) {
    Object.assign(E, { casos, activa: true, giro: null, arrastre: null, toque: null, batalla: null, cartel: null, intro: null, cerrando: false, unir: null, oroBatalla: 0, pistaFija: null, oroVisto: casos.partida.oro, misionHecha: null, combo: 0, tCombo: 0 });
    E.ocultos.clear(); E.apariciones.clear(); E.celdasOro.clear(); E.destellos.clear(); E.ascensos.clear(); E.casi.clear(); E.cumplidas.length = 0; fx.limpia();
    AS.guia.empieza(E);
    AS.suena.musica(ASALTO.zonas[casos.partida.zona].musica);
    if (casos.partida.fase === 'premio') AS.ventanas.premios(E);   // se cerró con premios por cobrar (tarea #314): vuelven a la vista, y al cobrarlos se sigue
    else if (!AS.guia.activa && !casos.progreso.consejos.inicio) AS.ventanas.ayuda(E, () => casos.consejoVisto('inicio'));   // sin guía, la primera vez: cómo se juega
  }
  function sal() { E.activa = false; E.batalla = null; E.giro = null; fx.limpia(); }
  function monta(cv) {
    cv.addEventListener('pointerdown', ev => { ev.preventDefault(); alBajar(ev); });
    cv.addEventListener('pointermove', alMover);
    cv.addEventListener('pointerup', alSubir);
    cv.addEventListener('pointercancel', () => { E.arrastre = null; E.toque = null; });
  }
  return { E, monta, empieza, sal, fotograma, cartel, puntoDe, tiraPiedra, get activa() { return E.activa; } };
})();

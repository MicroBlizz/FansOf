// Fans of Zombies · CONSTRUIR (dominio, ADR 084): con martillo, tablas y clavos levantas cosas donde quieras (e.obras = [{ id, tipo, x,
// z, giro, on }]): vallas y muros de madera (son huecos en e.huecos que los fans tienen que romper, y se les pueden clavar tablas
// encima), cajas y armarios que guardan cosas, cama (dormir en el suelo descansa menos), mesa de trabajo (los muebles grandes se hacen
// a su lado) y lámparas (dan luz mientras haya corriente; de noche atraen a los fans). Cada obra pide un nivel de carpintería, tarda,
// hace ruido de martillo y da experiencia; moverte la corta. Desmontar devuelve la mitad del material. Cifras en AJ.construir.
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  const O = (AJ, tipo) => AJ.construir.obras[tipo];
  Z.obraDe = (e, id) => (e.obras || []).find((o) => o.id === id) || null;
  Z.esObra = (id) => typeof id === 'string' && id.startsWith('obra-');
  const cerca = (e, tipo, x, z, r) => (e.obras || []).some((o) => o.tipo === tipo && Z.dist(o.x, o.z, x, z) < r);
  // lo que falta para poder hacer una obra (nivel, herramienta, material o la mesa de trabajo); null si se puede
  Z.faltaObra = function (AJ, e, tipo) {
    const Ob = O(AJ, tipo), J = e.jugador;
    if (!Ob) return 'noExiste';
    if (Z.nivel(AJ, J, 'carpinteria') < Ob.nivel) return 'nivel';
    if (Ob.martillo !== false && !Z.lleva(J, 'martillo')) return 'sinMartillo';
    if (Ob.con.some(([id, n]) => Z.cuantosLleva(J, id) < n)) return 'faltaMaterial';
    if (Ob.mesa && !cerca(e, 'mesa', J.x, J.z, AJ.construir.mesaCerca)) return 'sinMesa';
    return null;
  };
  // empezar a levantar una obra en (x, z); giro 0 o 1 (de lado). mundo.choca dice si el sitio está libre
  Z.empiezaObra = function (AJ, e, tipo, x, z, giro, mundo) {
    const falta = Z.faltaObra(AJ, e, tipo), J = e.jugador;
    if (falta) return Z.error(falta, { tipo });
    if (Z.dist(x, z, J.x, J.z) > AJ.construir.alcance) return Z.error('muyLejos');
    if ((mundo && mundo.choca && mundo.choca(x, z, 0.3)) || (e.obras || []).some((o) => Z.dist(o.x, o.z, x, z) < 0.6)) return Z.error('ocupado');
    const t = O(AJ, tipo).tiempo * Z.menos(AJ, J, 'carpinteria', 'tiempo');
    J.construye = { tipo, x, z, giro: giro ? 1 : 0, t, total: t };
    return Z.ok(tipo);
  };
  Z.pasoObra = function (AJ, e, dt) {
    const J = e.jugador, C = J.construye;
    if (!C || (C.t -= dt) > 0) return;
    J.construye = null;
    if (Z.faltaObra(AJ, e, C.tipo)) return;                 // te has quedado sin material por el camino
    const Ob = O(AJ, C.tipo);
    for (const [id, n] of Ob.con) Z.gastaLleva(J, id, n);
    const o = { id: 'obra-' + (++e.ultimoId), tipo: C.tipo, x: C.x, z: C.z, giro: C.giro, on: true };
    (e.obras || (e.obras = [])).push(o);
    if (Ob.muro) e.huecos[o.id] = { tipo: C.tipo, vida: Ob.vida, tablas: 0, roto: false, abierta: false };   // los fans lo rompen como un hueco (js/casas.js)
    e.contenidos[o.id] = []; e.registrados[o.id] = true;    // se abre al momento; lo que guarda, según su sitio (Z.capacidad)
    if (Ob.martillo !== false) Z.haceRuido(AJ, e, J.x, J.z, AJ.ruido.martillo * (J.A.ruido || 1), 'jugador');
    Z.ganaXp(AJ, e, 'carpinteria', 'obra');
    e.eventos.push({ tipo: 'obra', obra: C.tipo, id: o.id });
  };
  // desmontar una obra: con martillo o palanca, al lado; devuelve la mitad del material y lo que guardaba va a un montón a tus pies
  Z.desmontaObra = function (AJ, e, id) {
    const o = Z.obraDe(e, id), J = e.jugador;
    if (!o || Z.dist(o.x, o.z, J.x, J.z) > AJ.construir.alcance + 0.5) return Z.error('nadaCerca');
    if (!Z.lleva(J, 'martillo') && !Z.lleva(J, 'palanca')) return Z.error('sinHerramienta');
    const dentro = e.contenidos[id] || [];
    e.obras = e.obras.filter((q) => q !== o); delete e.huecos[id]; delete e.contenidos[id]; delete e.registrados[id];
    if (e.abierto === id) e.abierto = null;
    const vuelve = O(AJ, o.tipo).con.map(([cid, n]) => [cid, O(AJ, o.tipo).martillo === false ? n : Math.floor(n / 2)]).filter(([, n]) => n > 0);
    for (const c of dentro.concat(vuelve.map(([cid, n]) => ({ id: cid, n })))) { const q = Z.meterLleva(AJ, J, c.id, c.n, c.dur); if (q) Z.dejaEnSitio(e, c.dur != null ? { id: c.id, n: q, dur: c.dur } : { id: c.id, n: q }, AJ); }
    e.eventos.push({ tipo: 'desmontaObra', obra: o.tipo, id });
    return Z.ok(o.tipo);
  };
  // cuántas casillas caben en un sitio: el maletero (js/coches-piezas.js), las cajas y armarios; las demás obras, nada; lo demás, sin límite
  Z.capacidad = function (AJ, e, sitio) {
    if (Z.esMaletero(sitio)) return AJ.coches.maletero;
    const o = Z.esObra(sitio) && Z.obraDe(e, sitio);
    return o ? O(AJ, o.tipo).guarda || 0 : null;
  };
  Z.cabeEnSitio = function (AJ, e, cosa) {
    const cap = Z.capacidad(AJ, e, e.abierto);
    return cap == null || Z.casillasDe(AJ, (e.contenidos[e.abierto] || []).concat([cosa])) <= cap;
  };
  // encender o apagar una lámpara
  Z.cambiaLampara = function (AJ, e, id) {
    const o = Z.obraDe(e, id);
    if (!o || o.tipo !== 'lampara') return Z.error('nadaCerca');
    o.on = !o.on;
    e.eventos.push({ tipo: 'lampara', on: o.on });
    return Z.ok(o.on);
  };
  // ¿da luz? Mientras haya corriente (antes del corte) o con un generador cerca (Z.hayCorriente lo añade el generador)
  Z.luce = (AJ, e, o) => o.tipo === 'lampara' && o.on && (Z.hayCorriente ? Z.hayCorriente(AJ, e, o.x, o.z) : !e.sinLuz);
  // ¿hay una cama cerca? (las tuyas y las de las casas, que da el mundo)
  Z.camaCerca = (AJ, e, mundo) => { const J = e.jugador; return cerca(e, 'cama', J.x, J.z, AJ.construir.camaCerca) || !!(mundo && mundo.camaCerca && mundo.camaCerca(J.x, J.z)); };
  // cada media hora de juego, de noche, las lámparas encendidas atraen a los fans tranquilos de alrededor
  Z.pasoLuces = function (AJ, e, horas) {
    if ((e.tLuces = (e.tLuces || 0) - horas) > 0) return;
    e.tLuces = 0.5;
    if (!Z.esNoche(AJ, e.min)) return;
    for (const o of (e.obras || []).filter((q) => Z.luce(AJ, e, q))) {
      for (const zb of Z.vivos(e)) if (zb.estado === 'vaga' && !zb.planta && Z.dist(zb.x, zb.z, o.x, o.z) < AJ.construir.luzAtrae) { zb.estado = 'oye'; zb.obj = { x: o.x, z: o.z }; zb.olvida = AJ.ia.olvida; }
    }
  };
})(ZOM);

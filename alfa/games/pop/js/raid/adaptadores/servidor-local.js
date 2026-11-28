// Fans of Pop · RAID, el servidor de mentira (adaptador, tarea 448, ADR 243): cumple el MISMO contrato que servidor/205-pop-raid.sql y
// servidor/208-pop-raid-objetos.sql (las cinco funciones, los mismos motivos de error y la misma forma de respuesta: versión por trozo, depósito,
// jefe con barra de vida al 5 %, cobro una sola vez, BURBUJAS DOBLES y OBJETOS con su tope), pero EN MEMORIA y hecho con el dominio (tablero,
// dobles, objetos, depósito, premios). Sirve para el modo `?raid=local` y para los tests. Cambios a propósito respecto al SQL real: no hay
// monedero (el cobro devuelve las perlas del escalón sin moverlas), la semana se cuenta con el lunes de Madrid pero su inicio se toma en UTC, las
// raids viejas no se borran y la semilla de la raid de prueba no es al azar (la primera, desde la dada, que mezcla zonas dobles y normales).
// Si el SQL cambia de contrato, este archivo cambia con él.
// · crea({ reloj, cfg, semilla, alfa, jefeVida }) → { rpc, llama, exporta, importa }. reloj() en ms; cfg = PP_CFG.raid; semilla de los cofres y de
//   las zonas dobles; alfa(usuario) dice quién tiene rol alfa (todos, por defecto); jefeVida (por defecto cfg.jefe.vida, como el SQL).
// · rpc(nombre, args, usuario): async, igual que CUENTA.rpc pero diciendo quién llama (sin usuario: sin_sesion). Los fallos LANZAN Error(motivo),
//   como el servidor; un objeto que pasa del tope, o un martillazo a un jefe que no está, NO lanza: se salta solo ese objeto, va en `rechazados`
//   ({ objeto, motivo }) y el resto de la tanda vale.
//   `llama` es lo mismo pero síncrono (lo usa servidor-local-pestanas.js). exporta()/importa(obj): el estado como JSON.
// Depende de PP_RAID_TABLERO, PP_RAID_DEPOSITO, PP_RAID_PREMIOS, PP_RAID_SEMANA, PP_RAID_COFRES, PP_RAID_DOBLES y PP_RAID_OBJETOS.
'use strict';
const PP_RAID_SERVIDOR_LOCAL = (() => {
  const T = PP_RAID_TABLERO;
  const D = PP_RAID_DEPOSITO;
  const DOB = PP_RAID_DOBLES;
  const O = PP_RAID_OBJETOS;
  const DIA_MS = 86400000;
  const falla = motivo => { throw new Error(motivo); };
  const suma = a => a.reduce((x, y) => x + y, 0);

  // el lunes (AAAA-MM-DD) de la semana de un instante, en hora de Madrid
  function lunesDe(ms) {
    const dia = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms));
    return PP_RAID_SEMANA.lunes(dia);
  }
  // un toque válido: [x, y] enteros dentro del tablero
  const toqueValido = t => Array.isArray(t) && t.length === 2 && t.every(n => Number.isInteger(n) && n >= 0 && n < T.LADO);
  // los trozos de las cuatro esquinas de una zona cuadrada
  const trozosDeZona = z => [...new Set([[0, 0], [1, 0], [0, 1], [1, 1]].map(([i, j]) => T.trozoDe(z.x + i * (z.lado - 1), z.y + j * (z.lado - 1))))];

  function crea({ reloj, cfg, semilla = 1, alfa = () => true, jefeVida = cfg.jefe.vida }) {
    let estado = { version: 0, raids: {} };

    const sigVersion = () => ++estado.version;
    function nuevaRaid(id, ahora, o) {
      const tab = T.crear();
      if (o.zona) {
        for (let y = 0; y < T.LADO; y++) for (let x = 0; x < T.LADO; x++) {
          if (x < o.zona.x || y < o.zona.y || x >= o.zona.x + o.zona.lado || y >= o.zona.y + o.zona.lado) T.reventar(tab, x, y);
        }
      }
      const v = sigVersion();
      return {
        id, inicio: o.inicio, fin: o.fin, semilla: o.semilla, total: T.contarVivas(tab), capacidad: o.capacidad, cadaMs: o.cadaMs, jefeVida: o.jefeVida,
        jefeGolpes: 0, vaciada: null, creada: ahora, tablero: tab, tocadas: DOB.crear(), vivas: T.vivasPorTrozo(tab),
        versiones: new Array(T.TROZOS).fill(v), jugadores: {},
      };
    }
    function creaSemanal(id) {
      const inicio = Date.parse(id + 'T00:00:00Z');
      return nuevaRaid(id, reloj(), { inicio, fin: inicio + 7 * DIA_MS, semilla, capacidad: cfg.deposito.capacidad, cadaMs: cfg.deposito.cadaMs, jefeVida });
    }
    // la primera semilla, desde la dada, que deja en esos trozos alguna zona doble y alguna normal (para probar las dos cosas)
    function semillaMixta(trozos) {
      for (let s = semilla; ; s++) {
        const z = DOB.zonas(s, cfg.dobles.cada), n = trozos.filter(t => z[t]).length;
        if (n > 0 && n < trozos.length) return s;
      }
    }
    // la raid 'prueba' (como pop_raid_prueba): el bloque vivo de cfg.prueba, depósito de 200 con 1 cada 2 s, jefe de cfg.jefe.vidaPrueba y 3 días
    function creaPrueba() {
      const z = cfg.prueba?.cofres?.zona || { x: 232, y: 232, lado: 48 };
      const trozos = trozosDeZona(z);
      const s = trozos.length > 1 && cfg.dobles.cada > 1 ? semillaMixta(trozos) : semilla;
      return nuevaRaid('prueba', reloj(), { inicio: reloj(), fin: reloj() + 3 * DIA_MS, semilla: s, capacidad: 200, cadaMs: 2000, jefeVida: cfg.jefe.vidaPrueba, zona: z });
    }
    function de(usuario, pRaid) {
      if (!usuario) falla('sin_sesion');
      const lunes = lunesDe(reloj());
      const id = pRaid ?? lunes;
      if (id === 'prueba' && !alfa(usuario)) falla('sin_rol_alfa');
      if (id === lunes && !estado.raids[id]) estado.raids[id] = creaSemanal(id);
      return estado.raids[id] || falla('raid_no_existe');
    }
    function jugador(r, u) {
      if (!r.jugadores[u]) r.jugadores[u] = { burbujas: 0, golpes: 0, toques: r.capacidad, desde: reloj(), cobrado: null, objetos: O.cero() };
      return r.jugadores[u];
    }
    const depCfg = r => ({ capacidad: r.capacidad, cadaMs: r.cadaMs });
    const vivasDe = r => (r.vaciada === null ? suma(r.vivas) : 0);
    const acabada = r => r.vaciada !== null || reloj() >= r.fin;
    const jefeActivo = (r, vivas) => r.vaciada === null && reloj() < r.fin && T.faseFinal(vivas, r.total, cfg.faseFinal) && r.jefeGolpes < r.jefeVida;
    const toquesDe = (j, r) => D.toquesAhora({ toques: j.toques, desde: j.desde }, reloj(), depCfg(r));

    // un trozo como viaja: sus vivas y, solo si alguna burbuja doble ya recibió su primer pop, sus tocadas
    function trozoPara(r, t) {
      const tocadas = T.bytesTrozo(r.tocadas, t.n);
      return { n: t.n, v: t.v, bits: T.trozoABase64(r.tablero, t.n), ...(tocadas.some(b => b) ? { tocadas: T.aBase64(tocadas) } : {}) };
    }
    // los trozos pedidos cuya versión no es la del móvil (ordenados; ninguno si la raid ya está vaciada)
    function trozosNuevos(r, ids, vers) {
      if (!Array.isArray(ids) || !Array.isArray(vers) || ids.length > T.TROZOS || ids.length !== vers.length) falla('trozos_no_valen');
      if (r.vaciada !== null) return [];
      const salen = ids.map((n, i) => ({ n, v: r.versiones[n], p: vers[i] })).filter(t => t.v !== undefined && t.v !== t.p);
      return salen.sort((a, b) => a.n - b.n).map(t => trozoPara(r, t));
    }
    function foto(r, j, ids, vers) {
      const vivas = vivasDe(r);
      const trozos = trozosNuevos(r, ids, vers);
      return {
        id: r.id, inicio: r.inicio, fin: r.fin, ahora: reloj(), semilla: r.semilla, total: r.total, vivas,
        deposito: { capacidad: r.capacidad, cadaMs: r.cadaMs },
        jefe: { activo: jefeActivo(r, vivas), vida: r.jefeVida, golpes: r.jefeGolpes },
        vaciada: r.vaciada !== null, acabada: acabada(r),
        yo: { burbujas: j.burbujas, golpes: j.golpes, toques: toquesDe(j, r), desde: j.desde, cobrado: j.cobrado !== null, objetos: { ...j.objetos } }, trozos,
      };
    }
    const lista = v => (v === undefined || v === null ? [] : v);

    function estadoRpc(u, a) {
      const r = de(u, a.p_raid);
      return foto(r, jugador(r, u), lista(a.p_trozos), lista(a.p_versiones));
    }
    // una tanda bien formada: toques [[x, y], ...], golpes y objetos, sin pasar de la capacidad
    function validaTanda(r, toques, golpes, objetos) {
      if (!Array.isArray(toques) || !toques.every(toqueValido) || !Number.isInteger(golpes)) falla('toques_no_valen');
      if (!Array.isArray(objetos) || !objetos.every(O.valido) || objetos.length > r.capacidad) falla('toques_no_valen');
      if (toques.length > r.capacidad || golpes < 0 || golpes > r.capacidad || toques.length + golpes + objetos.length === 0) falla('toques_no_valen');
    }
    // ¿llegan los toques para la tanda? Se mira ANTES de cambiar nada, con todos los golpes que pide (los que el jefe no acepte no se cobrarán)
    function cabenToques(j, r, extra, pedidos) {
      if (pedidos > toquesDe(j, r) + extra) falla('sin_toques');
    }
    // el depósito tras meter `extra` toques y gastar `gastados` (como el SQL: aunque no gaste, deja apuntado lo que llevaba recargado)
    function depositoTras(j, r, extra, gastados) {
      const c = depCfg(r), ahora = reloj();
      const hay = toquesDe(j, r);
      let dep = { toques: hay, desde: hay >= r.capacidad ? ahora : j.desde + (hay - j.toques) * r.cadaMs };
      if (extra > 0) dep = D.meter(dep, extra, ahora, c).estado;
      return gastados > 0 ? D.gastar(dep, gastados, ahora, c).estado : dep;
    }
    // un pop en cada casilla de la lista; los trozos que cambian (reventadas o tocadas) toman la versión nueva. Devuelve las reventadas de verdad.
    function revienta(r, celdas) {
      const v = sigVersion();
      const res = DOB.aplica(r.tablero, r.tocadas, DOB.zonas(r.semilla, cfg.dobles.cada), celdas);
      for (const n of new Set([...res.reventadas, ...res.tocadas].map(([x, y]) => T.trozoDe(x, y)))) { r.versiones[n] = v; r.vivas[n] = T.contarTrozo(r.tablero, n); }
      return res.reventadas;
    }
    // el jefe, YA con los pops de la tanda hechos (un toque que lo hace bajar y un martillazo en la misma tanda valen): los martillazos que entren
    // en el tope (5 de vida cada uno) y luego los golpes, sin pasar de la vida que le queda. Sin jefe, los martillazos se saltan con 'sin_jefe'.
    function alJefe(r, usados, martillos, golpes) {
      if (!jefeActivo(r, suma(r.vivas))) return { ng: 0, mazazos: 0, n: 0, no: martillos.map(o => [o, 'sin_jefe']) };
      const ad = O.admite(usados, martillos, cfg.objetos.tope);
      const queda = r.jefeVida - r.jefeGolpes;
      const mazazos = Math.min(queda, ad.si.length * cfg.objetos.martilloJefe);
      return { ng: Math.min(golpes, queda - mazazos), mazazos, n: ad.si.length, no: ad.no };
    }
    // un objeto que no entra (tope, o martillazo sin jefe) se salta solo y va en `rechazados`; el resto de la tanda vale igual
    function jugarRpc(u, a) {
      const r = de(u, a.p_raid);
      const golpes = a.p_golpes ?? 0, objetos = lista(a.p_objetos);
      if (acabada(r)) falla('raid_acabada');
      validaTanda(r, a.p_toques, golpes, objetos);
      const j = jugador(r, u);
      const tab = O.admite(j.objetos, objetos.filter(o => !O.alJefe(o)), cfg.objetos.tope);
      const usa = O.cuenta(tab.si.map(o => o[0])), extra = usa.toques3 * cfg.objetos.toques3;
      cabenToques(j, r, extra, a.p_toques.length + golpes);
      const acciones = [...a.p_toques.map(([x, y]) => ({ k: 'toque', x, y })), ...tab.si.filter(o => o.length === 3).map(([k, x, y]) => ({ k, x, y }))];
      const rotas = revienta(r, acciones.flatMap(q => O.celdas(q, cfg.objetos)));
      const jefe = alJefe(r, O.suma(j.objetos, usa), objetos.filter(O.alJefe), golpes);
      const danno = jefe.ng + jefe.mazazos;
      const dep = depositoTras(j, r, extra, a.p_toques.length + jefe.ng);
      r.jefeGolpes += danno;
      if (danno > 0 && r.jefeGolpes >= r.jefeVida) r.vaciada = reloj();
      Object.assign(j, dep, { burbujas: j.burbujas + rotas.length, golpes: j.golpes + danno, objetos: O.suma(j.objetos, { ...usa, martillo: usa.martillo + jefe.n }) });
      const no = [...tab.no, ...jefe.no].map(([objeto, motivo]) => ({ objeto, motivo }));
      return { ...foto(r, j, lista(a.p_trozos), lista(a.p_versiones)), reventadas: rotas, golpes: danno, ...(no.length ? { rechazados: no } : {}) };
    }
    const tocarRpc = (u, a) => jugarRpc(u, { ...a, p_objetos: [] });   // la de antes de los objetos: la misma, sin ellos
    function cobrarRpc(u, a) {
      if (!u) falla('sin_sesion');
      if (a.p_raid === null || a.p_raid === undefined) falla('raid_no_existe');
      const r = de(u, a.p_raid);
      if (!acabada(r)) falla('raid_sin_acabar');
      if (reloj() >= r.fin + 7 * DIA_MS) falla('cobro_caducado');
      const j = r.jugadores[u];
      if (!j || j.burbujas + j.golpes === 0) falla('nada_que_cobrar');
      const premio = PP_RAID_PREMIOS.premioFinal(j.burbujas + j.golpes, r.vaciada !== null, cfg);
      const ya = j.cobrado !== null;
      if (!ya) j.cobrado = reloj();
      return { raid: r.id, ya, premio };
    }
    function pruebaRpc(u) {
      if (!u) falla('sin_sesion');
      if (!alfa(u)) falla('sin_rol_alfa');
      estado.raids.prueba = creaPrueba();
      return estadoRpc(u, { p_raid: 'prueba' });
    }
    const FUNCIONES = { pop_raid_estado: estadoRpc, pop_raid_tocar: tocarRpc, pop_raid_jugar: jugarRpc, pop_raid_cobrar: cobrarRpc, pop_raid_prueba: pruebaRpc };

    function llama(nombre, args, usuario) {
      const f = FUNCIONES[nombre] || falla('rpc_desconocida');
      return f(usuario, args || {});
    }
    async function rpc(nombre, args, usuario) { return llama(nombre, args, usuario); }

    // ---- guardar y recuperar el estado (para compartirlo entre pestañas) ----
    function exporta() {
      const raids = {};
      for (const [id, r] of Object.entries(estado.raids)) raids[id] = { ...r, tablero: T.aBase64(r.tablero), tocadas: T.aBase64(r.tocadas) };
      return { version: estado.version, raids };
    }
    // una raid guardada, de vuelta a la memoria (lo guardado antes de las dobles y los objetos no los trae: nacen vacíos)
    function raidDe(r) {
      const jugadores = {};
      for (const [u, j] of Object.entries(r.jugadores)) jugadores[u] = { ...j, objetos: j.objetos || O.cero() };
      return { ...r, tablero: T.deBase64(r.tablero), tocadas: r.tocadas ? T.deBase64(r.tocadas) : DOB.crear(), jugadores };
    }
    function importa(obj) {
      const raids = {};
      for (const [id, r] of Object.entries(obj.raids)) raids[id] = raidDe(r);
      estado = { version: obj.version, raids };
    }
    return Object.freeze({ rpc, llama, exporta, importa });
  }
  return Object.freeze({ crea });
})();
if (typeof module !== 'undefined') module.exports = PP_RAID_SERVIDOR_LOCAL;

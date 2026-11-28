// Fans of Pop · RAID, el servidor de mentira (adaptador, tarea 448, ADR 243): cumple el MISMO contrato que servidor/205-pop-raid.sql (las cuatro
// funciones, los mismos motivos de error y la misma forma de respuesta: versión por trozo, depósito, jefe con barra de vida al 5 %, cobro una
// sola vez), pero EN MEMORIA y hecho con el dominio (tablero, depósito, premios). Sirve para el modo `?raid=local` y para los tests. Cambios a
// propósito respecto al SQL real: no hay monedero (el cobro devuelve las perlas del escalón sin moverlas), la semana se cuenta con el lunes de
// Madrid pero su inicio se toma en UTC, y las raids viejas no se borran. Si el SQL cambia de contrato, este archivo cambia con él.
// · crea({ reloj, cfg, semilla, alfa, jefeVida }) → { rpc, llama, exporta, importa }. reloj() en ms; cfg = PP_CFG.raid; semilla de los cofres;
//   alfa(usuario) dice quién tiene rol alfa (todos, por defecto); jefeVida (3000 como el SQL).
// · rpc(nombre, args, usuario): async, igual que CUENTA.rpc pero diciendo quién llama (sin usuario: sin_sesion). Los fallos LANZAN Error(motivo),
//   como el servidor. `llama` es lo mismo pero síncrono (lo usa servidor-local-pestanas.js). exporta()/importa(obj): el estado como JSON.
// Depende de PP_RAID_TABLERO, PP_RAID_DEPOSITO, PP_RAID_PREMIOS y PP_RAID_SEMANA.
'use strict';
const PP_RAID_SERVIDOR_LOCAL = (() => {
  const T = PP_RAID_TABLERO;
  const D = PP_RAID_DEPOSITO;
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

  function crea({ reloj, cfg, semilla = 1, alfa = () => true, jefeVida = 3000 }) {
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
        jefeGolpes: 0, vaciada: null, creada: ahora, tablero: tab, vivas: T.vivasPorTrozo(tab), versiones: new Array(T.TROZOS).fill(v), jugadores: {},
      };
    }
    function creaSemanal(id) {
      const inicio = Date.parse(id + 'T00:00:00Z');
      return nuevaRaid(id, reloj(), { inicio, fin: inicio + 7 * DIA_MS, semilla, capacidad: cfg.deposito.capacidad, cadaMs: cfg.deposito.cadaMs, jefeVida });
    }
    // la raid 'prueba' (como pop_raid_prueba): el bloque vivo de cfg.prueba, depósito de 200 con 1 cada 2 s, jefe de 100 y 3 días
    function creaPrueba() {
      const z = cfg.prueba?.cofres?.zona || { x: 232, y: 232, lado: 48 };
      return nuevaRaid('prueba', reloj(), { inicio: reloj(), fin: reloj() + 3 * DIA_MS, semilla, capacidad: 200, cadaMs: 2000, jefeVida: 100, zona: z });
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
      if (!r.jugadores[u]) r.jugadores[u] = { burbujas: 0, golpes: 0, toques: r.capacidad, desde: reloj(), cobrado: null };
      return r.jugadores[u];
    }
    const depCfg = r => ({ capacidad: r.capacidad, cadaMs: r.cadaMs });
    const vivasDe = r => (r.vaciada === null ? suma(r.vivas) : 0);
    const acabada = r => r.vaciada !== null || reloj() >= r.fin;
    const jefeActivo = (r, vivas) => r.vaciada === null && reloj() < r.fin && T.faseFinal(vivas, r.total, cfg.faseFinal) && r.jefeGolpes < r.jefeVida;
    const toquesDe = (j, r) => D.toquesAhora({ toques: j.toques, desde: j.desde }, reloj(), depCfg(r));

    // los trozos pedidos cuya versión no es la del móvil (ordenados; ninguno si la raid ya está vaciada)
    function trozosNuevos(r, ids, vers) {
      if (!Array.isArray(ids) || !Array.isArray(vers) || ids.length > T.TROZOS || ids.length !== vers.length) falla('trozos_no_valen');
      if (r.vaciada !== null) return [];
      const salen = ids.map((n, i) => ({ n, v: r.versiones[n], p: vers[i] })).filter(t => t.v !== undefined && t.v !== t.p);
      return salen.sort((a, b) => a.n - b.n).map(t => ({ n: t.n, v: t.v, bits: T.trozoABase64(r.tablero, t.n) }));
    }
    function foto(r, j, ids, vers) {
      const vivas = vivasDe(r);
      const trozos = trozosNuevos(r, ids, vers);
      return {
        id: r.id, inicio: r.inicio, fin: r.fin, ahora: reloj(), semilla: r.semilla, total: r.total, vivas,
        deposito: { capacidad: r.capacidad, cadaMs: r.cadaMs },
        jefe: { activo: jefeActivo(r, vivas), vida: r.jefeVida, golpes: r.jefeGolpes },
        vaciada: r.vaciada !== null, acabada: acabada(r),
        yo: { burbujas: j.burbujas, golpes: j.golpes, toques: toquesDe(j, r), desde: j.desde, cobrado: j.cobrado !== null }, trozos,
      };
    }
    const lista = v => (v === undefined || v === null ? [] : v);

    function estadoRpc(u, a) {
      const r = de(u, a.p_raid);
      return foto(r, jugador(r, u), lista(a.p_trozos), lista(a.p_versiones));
    }
    // una tanda bien formada: toques [[x, y], ...] y golpes, sin pasar de la capacidad
    function validaTanda(r, toques, golpes) {
      if (!Array.isArray(toques) || !toques.every(toqueValido) || !Number.isInteger(golpes)) falla('toques_no_valen');
      if (toques.length > r.capacidad || golpes < 0 || golpes > r.capacidad || toques.length + golpes === 0) falla('toques_no_valen');
    }
    // revienta los toques (cada uno en cruz); los trozos que cambian toman la versión nueva. Devuelve las que reventó de verdad.
    function revienta(r, toques) {
      const v = sigVersion();
      const rotas = [];
      for (const [x, y] of toques) rotas.push(...T.toque(r.tablero, x, y).reventadas);
      for (const n of new Set(rotas.map(([x, y]) => T.trozoDe(x, y)))) { r.versiones[n] = v; r.vivas[n] = T.contarTrozo(r.tablero, n); }
      return rotas;
    }
    // los golpes que valen: solo con el jefe en el tablero y sin pasar de su vida
    function golpesQueValen(r, golpes) {
      if (golpes < 1 || !jefeActivo(r, suma(r.vivas))) return 0;
      return Math.min(golpes, r.jefeVida - r.jefeGolpes);
    }
    function tocarRpc(u, a) {
      const r = de(u, a.p_raid);
      const golpes = a.p_golpes ?? 0;
      if (acabada(r)) falla('raid_acabada');
      validaTanda(r, a.p_toques, golpes);
      const j = jugador(r, u);
      const ng = golpesQueValen(r, golpes);
      const hay = toquesDe(j, r);
      const gastados = a.p_toques.length + ng;
      if (gastados > hay) falla('sin_toques');
      const rotas = revienta(r, a.p_toques);
      r.jefeGolpes += ng;
      if (ng > 0 && r.jefeGolpes >= r.jefeVida) r.vaciada = reloj();
      const g = gastados ? D.gastar({ toques: j.toques, desde: j.desde }, gastados, reloj(), depCfg(r)).estado
        : { toques: hay, desde: hay >= r.capacidad ? reloj() : j.desde + (hay - j.toques) * r.cadaMs };
      Object.assign(j, g, { burbujas: j.burbujas + rotas.length, golpes: j.golpes + ng });
      return { ...foto(r, j, lista(a.p_trozos), lista(a.p_versiones)), reventadas: rotas, golpes: ng };
    }
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
    const FUNCIONES = { pop_raid_estado: estadoRpc, pop_raid_tocar: tocarRpc, pop_raid_cobrar: cobrarRpc, pop_raid_prueba: pruebaRpc };

    function llama(nombre, args, usuario) {
      const f = FUNCIONES[nombre] || falla('rpc_desconocida');
      return f(usuario, args || {});
    }
    async function rpc(nombre, args, usuario) { return llama(nombre, args, usuario); }

    // ---- guardar y recuperar el estado (para compartirlo entre pestañas) ----
    function exporta() {
      const raids = {};
      for (const [id, r] of Object.entries(estado.raids)) raids[id] = { ...r, tablero: T.aBase64(r.tablero) };
      return { version: estado.version, raids };
    }
    function importa(obj) {
      const raids = {};
      for (const [id, r] of Object.entries(obj.raids)) raids[id] = { ...r, tablero: T.deBase64(r.tablero) };
      estado = { version: obj.version, raids };
    }
    return Object.freeze({ rpc, llama, exporta, importa });
  }
  return Object.freeze({ crea });
})();
if (typeof module !== 'undefined') module.exports = PP_RAID_SERVIDOR_LOCAL;

// Fans of Pop · RAID, la sincronía (aplicación, tarea 448, ADR 243): lo que une el tablero compartido del servidor con la pantalla de este móvil.
// Guarda una COPIA LOCAL del tablero (PP_RAID_TABLERO) y la versión de cada trozo, y hace tres cosas:
//  · SONDEO: cada `cfg.red.sondeoMs` pregunta al servidor SOLO por los trozos que la pantalla tiene a la vista (mirar) y aplica los que cambiaron.
//    Si la pantalla no se ve (visible() falso) no pregunta; si la raid acabó, se para. Sin Realtime (plan gratis). Cada arranca() abre un bucle
//    nuevo (contador de generación): un sondeo que vuelve después de para() o de un arranca() nuevo ya no reprograma nada.
//  · TOQUES: tocar(x, y) y golpe() se aplican YA en la copia local (para que se vea al momento) si quedan toques en el depósito local, y se juntan
//    en una TANDA DE TOQUES que sale a los `tandaMs` o al juntar `tandaMax` (toques y golpes JUNTOS, nunca más que la capacidad del depósito).
//    Solo hay una petición en vuelo; el resto espera. Manda el servidor: al volver la respuesta, sus trozos y su depósito sustituyen a lo local
//    (lo aún no enviado se vuelve a aplicar encima, descontando lo que otro ya había reventado).
//  · SI UNA TANDA FALLA (sin_toques, sin_red, toques_no_valen, raid_acabada...) NO se reenvía a ciegas: el servidor pudo haberla aplicado y se
//    cobraría dos veces el depósito. En su lugar se pide de nuevo el estado de los trozos que tocaba (forzado, con versión 0) y del depósito, y lo
//    local se corrige con lo que diga el servidor.
//  · AVISOS: escucha(fn) con fn(nombre, datos): 'estado' (resumen: vivas, jefe, depósito, acabada...), 'ajenas' (lista [[x, y], ...] de burbujas que
//    llegan reventadas en un trozo del servidor y que aquí seguían vivas: la pantalla las hace explotar), 'propias' (lista de las que el servidor
//    confirmó de esta tanda) y 'error' (el motivo).
// Puertos (nada de Date.now ni setTimeout aquí): red (PP_RAID_RED), reloj() en ms, programa(fn, ms) → una función que lo cancela (o un objeto con
// cancel()), visible(). `raid` null = la de esta semana (se fija en la primera respuesta). `cfg` = PP_CFG.raid (red, deposito, faseFinal).
// Depende de PP_RAID_TABLERO y PP_RAID_DEPOSITO (se cargan antes).
'use strict';
const PP_RAID_SINCRONIA = (() => {
  const T = PP_RAID_TABLERO;
  const D = PP_RAID_DEPOSITO;
  const VECINAS = Object.freeze([[0, 0], [0, -1], [0, 1], [-1, 0], [1, 0]]);   // el toque en cruz (como en el tablero)
  const cancela = h => { if (typeof h === 'function') h(); else if (h && h.cancel) h.cancel(); };

  // las burbujas que estaban vivas en `viejo` y no en `nuevo` (dos versiones de los 128 bytes del trozo n): [[x, y], ...]
  function muertas(viejo, nuevo, n) {
    const salen = [];
    const bx = (n % T.TROZOS_LADO) * T.TROZO, by = Math.floor(n / T.TROZOS_LADO) * T.TROZO;
    for (let j = 0; j < T.BYTES_TROZO; j++) {
      const m = viejo[j] & ~nuevo[j] & 255;
      if (m) for (let k = 0; k < 8; k++) if (m & (1 << k)) salen.push([bx + ((j * 8 + k) & 31), by + ((j * 8 + k) >> 5)]);
    }
    return salen;
  }
  // los trozos que tocan estos toques (la casilla y sus vecinas pueden caer en un trozo de al lado)
  function trozosDe(toques) {
    const ids = new Set();
    for (const t of toques) for (const [dx, dy] of VECINAS) if (T.dentro(t.x + dx, t.y + dy)) ids.add(T.trozoDe(t.x + dx, t.y + dy));
    return ids;
  }

  function crea({ red, raid = null, cfg, reloj, programa, visible }) {
    const tablero = T.crear();
    const versiones = new Array(T.TROZOS).fill(0);
    const oyentes = new Set();
    // lote: los toques aún sin enviar { x, y, celdas } (celdas = las [x, y] que reventó de verdad en local)
    const e = {
      id: raid, s: null, dep: null, cfgDep: cfg.deposito, desfase: 0,
      vista: new Set(), forzar: new Set(),
      lote: [], pendG: 0, enviando: null, vuelo: false, promesa: Promise.resolve(), quiereEnviar: false, sondeoPend: false, ultimoError: null,
      timerTanda: null, timerSondeo: null, corre: false, gen: 0, acabada: false,
    };
    const ahoraSrv = () => reloj() + e.desfase;
    const pendB = () => e.lote.reduce((a, t) => a + t.celdas.length, 0);
    const maxTanda = () => Math.min(cfg.red.tandaMax, e.cfgDep.capacidad);
    const emit = (nombre, datos) => { for (const f of [...oyentes]) f(nombre, datos); };
    const jefeActivo = () => !e.acabada && !e.s.vaciada && e.s.jefe.golpes < e.s.jefe.vida && T.faseFinal(e.s.vivas, e.s.total, cfg.faseFinal);
    const paraSondeo = () => { cancela(e.timerSondeo); e.timerSondeo = null; };

    function resumen() {
      if (!e.s) return null;
      const ahora = ahoraSrv();
      const deposito = { toques: D.toquesAhora(e.dep, ahora, e.cfgDep), capacidad: e.cfgDep.capacidad, cadaMs: e.cfgDep.cadaMs, faltaMs: D.faltaMs(e.dep, ahora, e.cfgDep) };
      return {
        id: e.id, inicio: e.s.inicio, fin: e.s.fin, semilla: e.s.semilla, total: e.s.total, vivas: e.s.vivas, vaciada: e.s.vaciada, acabada: e.acabada,
        jefe: { activo: jefeActivo(), vida: e.s.jefe.vida, golpes: e.s.jefe.golpes }, deposito, yo: { ...e.s.yo },
      };
    }

    // ---- lo que llega del servidor ----
    // vuelve a reventar en local lo aún sin enviar; de cada toque se quitan las celdas que ya llegan muertas del servidor (las reventó otro antes:
    // el servidor ya las descuenta de sus vivas y no serán nuestras), para que vivas y yo.burbujas no se descuenten dos veces
    function reponPendiente(puestos) {
      for (const q of e.lote) {
        q.celdas = q.celdas.filter(([x, y]) => !puestos.has(T.trozoDe(x, y)) || T.viva(tablero, x, y));
        for (const [x, y] of q.celdas) T.reventar(tablero, x, y);
      }
    }
    // pone los trozos nuevos; devuelve las burbujas que han reventado otros (solo en trozos que ya teníamos: la primera carga no cuenta)
    function aplicaTrozos(lista) {
      const ajenas = [];
      const puestos = new Set();
      for (const t of lista) {
        const bytes = T.deBase64(t.bits);
        if (!bytes || bytes.length !== T.BYTES_TROZO) continue;
        if (versiones[t.n] > 0) ajenas.push(...muertas(T.bytesTrozo(tablero, t.n), bytes, t.n));
        T.ponerTrozo(tablero, t.n, bytes);
        versiones[t.n] = t.v;
        puestos.add(t.n);
      }
      reponPendiente(puestos);
      return ajenas;
    }
    // el depósito local desde el del servidor: lo que ya ganó, menos lo que aún no hemos enviado
    function depositoDe(r) {
      const resto = r.yo.toques >= r.deposito.capacidad ? 0 : (r.ahora - r.yo.desde) % r.deposito.cadaMs;
      const base = { toques: r.yo.toques, desde: r.ahora - resto };
      const pend = e.lote.length + e.pendG;
      if (!pend) return base;
      const g = D.gastar(base, pend, r.ahora, r.deposito);
      return g.ok ? g.estado : { toques: 0, desde: base.desde };
    }
    function estadoDe(r) {
      const pb = pendB();
      return {
        inicio: r.inicio, fin: r.fin, semilla: r.semilla, total: r.total, vivas: Math.max(0, r.vivas - pb), vaciada: r.vaciada,
        jefe: { vida: r.jefe.vida, golpes: Math.min(r.jefe.vida, r.jefe.golpes + e.pendG) },
        yo: { burbujas: r.yo.burbujas + pb, golpes: r.yo.golpes + e.pendG, cobrado: r.yo.cobrado },
      };
    }
    function recibe(r) {
      if (Number.isFinite(r.ahora)) e.desfase = r.ahora - reloj();
      if (e.id === null) e.id = r.id;
      const ajenas = aplicaTrozos(r.trozos || []);
      e.cfgDep = r.deposito;
      e.dep = depositoDe(r);
      e.s = estadoDe(r);
      if (r.acabada) { e.acabada = true; paraSondeo(); }
      if (ajenas.length) emit('ajenas', ajenas);
      emit('estado', resumen());
    }

    // ---- sondeo ----
    function pideTrozos() {
      const ids = [...new Set([...e.vista, ...e.forzar])].sort((a, b) => a - b);
      return [ids, ids.map(n => (e.forzar.has(n) ? 0 : versiones[n]))];
    }
    function siguiente() {
      if (e.sondeoPend) { e.sondeoPend = false; return sondea(); }
      if (e.quiereEnviar) { e.quiereEnviar = false; return envia(); }
      if (e.lote.length || e.pendG) programaTanda();
      return Promise.resolve();
    }
    async function pregunta() {
      const [ids, vers] = pideTrozos();
      const r = await red.estado(e.id, ids, vers);
      e.vuelo = false;
      if (r.ok) { e.forzar.clear(); recibe(r.datos); } else emit('error', r.error);
      await siguiente();
    }
    function sondea() {
      if (e.vuelo) { e.sondeoPend = true; return Promise.resolve(); }
      if (e.acabada && !e.forzar.size) return Promise.resolve();
      e.vuelo = true;
      e.promesa = pregunta();
      return e.promesa;
    }
    async function tick(gen) {
      if (gen !== e.gen) return;
      e.timerSondeo = null;
      if (!e.corre || e.acabada) { e.corre = false; return; }
      if (visible()) await sondea();
      if (gen === e.gen && e.corre && !e.acabada) e.timerSondeo = programa(() => tick(gen), cfg.red.sondeoMs);
    }
    function arranca() {
      if (e.corre) return Promise.resolve();
      e.corre = true;
      e.gen++;
      return tick(e.gen);
    }
    function para() { e.corre = false; e.gen++; paraSondeo(); }
    function mirar(trozos) {
      e.vista = new Set((trozos || []).filter(n => Number.isInteger(n) && n >= 0 && n < T.TROZOS));
      const faltan = [...e.vista].some(n => versiones[n] === 0);
      return faltan && e.corre ? sondea() : Promise.resolve();
    }

    // ---- toques y golpes ----
    function programaTanda() {
      if (e.lote.length + e.pendG >= maxTanda()) { envia(); return; }
      if (!e.timerTanda) e.timerTanda = programa(() => { e.timerTanda = null; return envia(); }, cfg.red.tandaMs);
    }
    // toques y golpes JUNTOS, como mucho maxTanda()
    function tomaTanda() {
      const max = maxTanda();
      const toques = e.lote.splice(0, max);
      const golpes = Math.min(e.pendG, max - toques.length);
      e.pendG -= golpes;
      return toques.length || golpes ? { toques, golpes } : null;
    }
    function envia() {
      cancela(e.timerTanda);
      e.timerTanda = null;
      if (e.vuelo) { e.quiereEnviar = true; return Promise.resolve(); }
      const t = tomaTanda();
      if (!t) return Promise.resolve();
      e.vuelo = true;
      e.enviando = t;
      e.promesa = manda(t);
      return e.promesa;
    }
    async function manda(t) {
      const [ids, vers] = pideTrozos();
      const r = await red.tocar(e.id, t.toques.map(q => [q.x, q.y]), t.golpes, ids, vers);
      e.vuelo = false;
      e.enviando = null;
      resuelve(r, t);
      await siguiente();
    }
    // qué hacer con la respuesta de una tanda: si falla, por el motivo que sea, no se reenvía; se vuelve a pedir lo que tocaba
    function resuelve(r, t) {
      if (r.ok) {
        recibe(r.datos);
        if ((r.datos.reventadas || []).length) emit('propias', r.datos.reventadas);
        return;
      }
      e.ultimoError = r.error;
      emit('error', r.error);
      for (const n of trozosDe(t.toques)) e.forzar.add(n);
      e.sondeoPend = true;
      if (r.error === 'raid_acabada') { e.acabada = true; paraSondeo(); emit('estado', resumen()); }
    }
    const noPuede = () => (!e.s || !e.dep ? 'sin_estado' : e.acabada ? 'acabada' : null);
    // gasta un toque del depósito local; true si lo había
    function gasta() {
      const g = D.gastar(e.dep, 1, ahoraSrv(), e.cfgDep);
      if (g.ok) e.dep = g.estado;
      return g.ok;
    }
    function tocar(x, y) {
      const mal = noPuede();
      if (mal) return { ok: false, motivo: mal };
      if (!T.dentro(x, y)) return { ok: false, motivo: 'fuera' };
      if (!gasta()) return { ok: false, motivo: 'sin_toques' };
      const { reventadas } = T.toque(tablero, x, y);
      e.lote.push({ x, y, celdas: reventadas });
      e.s.vivas = Math.max(0, e.s.vivas - reventadas.length);
      e.s.yo.burbujas += reventadas.length;
      programaTanda();
      emit('estado', resumen());
      return { ok: true, reventadas };
    }
    function golpe() {
      const mal = noPuede();
      if (mal) return { ok: false, motivo: mal };
      if (!jefeActivo()) return { ok: false, motivo: 'sin_jefe' };
      if (!gasta()) return { ok: false, motivo: 'sin_toques' };
      e.pendG++;
      e.s.jefe.golpes++;
      e.s.yo.golpes++;
      programaTanda();
      emit('estado', resumen());
      return { ok: true };
    }
    // para el sondeo y manda tandas seguidas hasta que no queda nada pendiente ni en vuelo; { ok: true } o { ok: false, error } si una falla
    async function cierra() {
      para();
      e.ultimoError = null;
      while (e.vuelo || e.lote.length || e.pendG) {
        if (e.vuelo) await e.promesa; else await envia();
        if (e.ultimoError) return { ok: false, error: e.ultimoError };
      }
      return { ok: true };
    }
    function escucha(fn) { oyentes.add(fn); return () => oyentes.delete(fn); }

    return Object.freeze({
      escucha, arranca, para, cierra, mirar, sondea, envia, tocar, golpe,
      estado: resumen, tablero: () => tablero, viva: (x, y) => T.viva(tablero, x, y), version: n => versiones[n],
    });
  }
  return Object.freeze({ crea, muertas });
})();
if (typeof module !== 'undefined') module.exports = PP_RAID_SINCRONIA;

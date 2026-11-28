// Fans of Pop · RAID, la sincronía (aplicación, tarea 448, ADR 243): lo que une el tablero compartido del servidor con la pantalla de este móvil.
// Guarda una COPIA LOCAL del tablero (PP_RAID_TABLERO), de las burbujas dobles ya tocadas (PP_RAID_DOBLES) y la versión de cada trozo, y hace:
//  · SONDEO: cada `cfg.red.sondeoMs` pregunta al servidor SOLO por los trozos que la pantalla tiene a la vista (mirar) y aplica los que cambiaron.
//    Si la pantalla no se ve (visible() falso) no pregunta; si la raid acabó, se para. Sin Realtime (plan gratis). Cada arranca() abre un bucle
//    nuevo (contador de generación): un sondeo que vuelve después de para() o de un arranca() nuevo ya no reprograma nada.
//  · TOQUES: tocar(x, y) y golpe() se aplican YA en la copia local (para que se vea al momento) si quedan toques en el depósito local, y se juntan
//    en una TANDA DE TOQUES que sale a los `tandaMs` o al juntar `tandaMax` (toques y golpes JUNTOS, nunca más que la capacidad del depósito).
//    Solo hay una petición en vuelo; el resto espera. Manda el servidor: al volver la respuesta, sus trozos y su depósito sustituyen a lo local
//    (lo aún no enviado se vuelve a aplicar encima, descontando lo que otro ya había reventado).
//  · OBJETOS (nodo n8): usar(k, x, y) con k = 'toques3' (mete toques en el depósito), 'bomba' o 'martillo' (un pop en su cuadrado o su fila, sin
//    gastar toque; el martillo sin casilla va contra el jefe). También se ven YA en local y viajan en la misma tanda. Aquí no se sabe cuántos
//    tiene el jugador (eso es del móvil: lo mira quien llama); solo se respeta el tope por raid. Cada estado del servidor (tanda o sondeo) avisa
//    con 'objetos' de cuántos ha contado EN TOTAL en esta raid, y quien escucha descuenta del inventario lo que aún no había descontado: así una
//    respuesta perdida no regala objetos. Los de una tanda que falló sin respuesta cuentan como pendientes hasta el siguiente estado.
//  · Un objeto que el servidor no admite (tope, martillazo sin jefe) se salta solo: la respuesta lo trae en 'rechazados', se avisa con 'error'
//    y se vuelve a pedir el estado de los trozos de los objetos de esa tanda.
//  · SI UNA TANDA FALLA (sin_toques, sin_red, toques_no_valen, raid_acabada...) NO se reenvía a ciegas: el servidor pudo
//    haberla aplicado y se cobraría dos veces. En su lugar se pide de nuevo el estado de los trozos que tocaba (forzado, con versión 0) y del
//    depósito, y lo local se corrige con lo que diga el servidor.
//  · AVISOS: escucha(fn) con fn(nombre, datos): 'estado' (resumen: vivas, jefe, depósito, acabada, 'ahora' = la hora del servidor...), 'ajenas' (lista [[x, y], ...] de burbujas que
//    llegan reventadas en un trozo del servidor y que aquí seguían vivas: la pantalla las hace explotar), 'propias' (lista de las que el servidor
//    confirmó de esta tanda), 'objetos' ({ toques3, bomba, martillo } que el servidor cuenta en total en esta raid), 'yo' ({ burbujas, golpes }
//    tuyos que el servidor ya ha contado) y 'error' (el motivo).
// Puertos (nada de Date.now ni setTimeout aquí): red (PP_RAID_RED), reloj() en ms, programa(fn, ms) → una función que lo cancela (o un objeto con
// cancel()), visible(). `raid` null = la de esta semana (se fija en la primera respuesta). `cfg` = PP_CFG.raid (red, deposito, faseFinal, objetos, dobles).
// Depende de PP_RAID_TABLERO, PP_RAID_DEPOSITO, PP_RAID_DOBLES y PP_RAID_OBJETOS (se cargan antes).
'use strict';
const PP_RAID_SINCRONIA = (() => {
  const T = PP_RAID_TABLERO;
  const D = PP_RAID_DEPOSITO;
  const DOB = PP_RAID_DOBLES;
  const O = PP_RAID_OBJETOS;
  const cancela = h => { if (typeof h === 'function') h(); else if (h && h.cancel) h.cancel(); };
  const repite = (o, n) => Array.from({ length: n }, () => o);

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
  // una tanda tal y como viaja: los toques [[x, y], ...] y los objetos (los del tablero y los sueltos)
  function aRed(t) {
    return {
      toques: t.acciones.filter(q => q.k === 'toque').map(q => [q.x, q.y]),
      objetos: [...t.acciones.filter(q => q.k !== 'toque').map(q => [q.k, q.x, q.y]), ...repite(['toques3'], t.sueltos.toques3), ...repite(['martillo'], t.sueltos.martillo)],
    };
  }
  // cuántos objetos de cada tipo lleva una tanda
  const objetosDe = t => O.suma(O.cuenta(t.acciones.map(q => q.k)), t.sueltos);

  function crea({ red, raid = null, cfg, reloj, programa, visible }) {
    const tablero = T.crear();
    const tocadas = DOB.crear();
    const versiones = new Array(T.TROZOS).fill(0);
    const oyentes = new Set();
    // lote: lo hecho en el tablero y aún sin enviar { k: 'toque' | 'bomba' | 'martillo', x, y, celdas } (celdas = las [x, y] que reventó de verdad
    // en local); sueltos: los objetos sin casilla aún sin enviar (toques3 y martillazos al jefe)
    const e = {
      id: raid, s: null, dep: null, cfgDep: cfg.deposito, desfase: 0, semilla: null, zonas: DOB.sinZonas(),
      vista: new Set(), forzar: new Set(),
      lote: [], pendG: 0, sueltos: O.cero(), dudosos: O.cero(), enviando: null, vuelo: false, promesa: Promise.resolve(), quiereEnviar: false, sondeoPend: false, ultimoError: null,
      timerTanda: null, timerSondeo: null, corre: false, gen: 0, acabada: false,
    };
    const ahoraSrv = () => reloj() + e.desfase;
    const forma = q => O.celdas(q, cfg.objetos);
    const pendB = () => e.lote.reduce((a, t) => a + t.celdas.length, 0);
    const pendToques = () => e.lote.filter(q => q.k === 'toque').length;
    const pendMazazos = () => e.sueltos.martillo * cfg.objetos.martilloJefe;
    const hayPendiente = () => e.lote.length > 0 || e.pendG > 0 || O.hay(e.sueltos);
    const sinEnviar = () => objetosDe({ acciones: e.lote, sueltos: e.sueltos });
    const maxTanda = () => Math.min(cfg.red.tandaMax, e.cfgDep.capacidad);
    const emit = (nombre, datos) => { for (const f of [...oyentes]) f(nombre, datos); };
    const jefeActivo = () => !e.acabada && !e.s.vaciada && e.s.jefe.golpes < e.s.jefe.vida && T.faseFinal(e.s.vivas, e.s.total, cfg.faseFinal);
    const paraSondeo = () => { cancela(e.timerSondeo); e.timerSondeo = null; };

    function resumen() {
      if (!e.s) return null;
      const ahora = ahoraSrv();
      const deposito = { toques: D.toquesAhora(e.dep, ahora, e.cfgDep), capacidad: e.cfgDep.capacidad, cadaMs: e.cfgDep.cadaMs, faltaMs: D.faltaMs(e.dep, ahora, e.cfgDep) };
      return {
        id: e.id, ahora, inicio: e.s.inicio, fin: e.s.fin, semilla: e.s.semilla, total: e.s.total, vivas: e.s.vivas, vaciada: e.s.vaciada, acabada: e.acabada,
        jefe: { activo: jefeActivo(), vida: e.s.jefe.vida, golpes: e.s.jefe.golpes }, deposito, yo: { ...e.s.yo, objetos: { ...e.s.yo.objetos } },
      };
    }

    // ---- lo que llega del servidor ----
    // vuelve a hacer en local lo aún sin enviar, sobre los trozos que acaban de llegar: cada acción da otra vez sus pops ahí, así que lo que otro
    // ya había reventado (el servidor ya lo descuenta de sus vivas y no será nuestro) no se cuenta dos veces
    function reponPendiente(puestos) {
      const aqui = ([x, y]) => puestos.has(T.trozoDe(x, y));
      for (const q of e.lote) {
        const fuera = q.celdas.filter(c => !aqui(c));
        q.celdas = [...fuera, ...DOB.aplica(tablero, tocadas, e.zonas, forma(q).filter(aqui)).reventadas];
      }
    }
    // pone un trozo del servidor (vivas y tocadas); devuelve las burbujas que han reventado otros (nada en la primera carga), o null si no vale
    function ponTrozo(t) {
      const bytes = T.deBase64(t.bits);
      if (!bytes || bytes.length !== T.BYTES_TROZO) return null;
      const ajenas = versiones[t.n] > 0 ? muertas(T.bytesTrozo(tablero, t.n), bytes, t.n) : [];
      const toc = t.tocadas ? T.deBase64(t.tocadas) : null;
      T.ponerTrozo(tablero, t.n, bytes);
      T.ponerTrozo(tocadas, t.n, toc && toc.length === T.BYTES_TROZO ? toc : new Uint8Array(T.BYTES_TROZO));
      versiones[t.n] = t.v;
      return ajenas;
    }
    function aplicaTrozos(lista) {
      const ajenas = [];
      const puestos = new Set();
      for (const t of lista) {
        const suyas = ponTrozo(t);
        if (!suyas) continue;
        ajenas.push(...suyas);
        puestos.add(t.n);
      }
      reponPendiente(puestos);
      return ajenas;
    }
    // el depósito local desde el del servidor: lo que ya ganó, más los «+3 toques» y menos los toques y golpes que aún no hemos enviado
    function depositoDe(r) {
      const resto = r.yo.toques >= r.deposito.capacidad ? 0 : (r.ahora - r.yo.desde) % r.deposito.cadaMs;
      let dep = { toques: r.yo.toques, desde: r.ahora - resto };
      const extra = e.sueltos.toques3 * cfg.objetos.toques3, pend = pendToques() + e.pendG;
      if (extra) dep = D.meter(dep, extra, r.ahora, r.deposito).estado;
      if (!pend) return dep;
      const g = D.gastar(dep, pend, r.ahora, r.deposito);
      return g.ok ? g.estado : { toques: 0, desde: dep.desde };
    }
    function estadoDe(r) {
      const pb = pendB(), golpes = e.pendG + pendMazazos();
      return {
        inicio: r.inicio, fin: r.fin, semilla: r.semilla, total: r.total, vivas: Math.max(0, r.vivas - pb), vaciada: r.vaciada,
        jefe: { vida: r.jefe.vida, golpes: Math.min(r.jefe.vida, r.jefe.golpes + golpes) },
        yo: { burbujas: r.yo.burbujas + pb, golpes: r.yo.golpes + Math.min(golpes, Math.max(0, r.jefe.vida - r.jefe.golpes)), cobrado: r.yo.cobrado, objetos: O.suma({ ...O.cero(), ...r.yo.objetos }, sinEnviar()) },
      };
    }
    function recibe(r) {
      if (Number.isFinite(r.ahora)) e.desfase = r.ahora - reloj();
      if (e.id === null) e.id = r.id;
      if (r.semilla !== e.semilla) { e.semilla = r.semilla; e.zonas = DOB.zonas(r.semilla, cfg.dobles.cada); }   // las zonas dobles salen de la semilla
      const ajenas = aplicaTrozos(r.trozos || []);
      e.cfgDep = r.deposito;
      e.dep = depositoDe(r);
      e.s = estadoDe(r);
      if (r.acabada) { e.acabada = true; paraSondeo(); }
      e.dudosos = O.cero();   // este estado ya cuenta lo que hiciera una tanda sin respuesta
      if (ajenas.length) emit('ajenas', ajenas);
      emit('estado', resumen());
      if (r.yo.objetos) emit('objetos', { ...O.cero(), ...r.yo.objetos });   // lo que el servidor cuenta en total: quien escucha descuenta lo que falte
      emit('yo', { burbujas: r.yo.burbujas, golpes: r.yo.golpes });   // lo tuyo que el servidor ya ha contado (sin lo que va de camino): los premios del juego
    }

    // ---- sondeo ----
    function pideTrozos() {
      const ids = [...new Set([...e.vista, ...e.forzar])].sort((a, b) => a - b);
      return [ids, ids.map(n => (e.forzar.has(n) ? 0 : versiones[n]))];
    }
    function siguiente() {
      if (e.sondeoPend) { e.sondeoPend = false; return sondea(); }
      if (e.quiereEnviar) { e.quiereEnviar = false; return envia(); }
      if (hayPendiente()) programaTanda();
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

    // ---- las tandas ----
    function programaTanda() {
      if (e.lote.length + e.pendG >= maxTanda()) { envia(); return; }
      if (!e.timerTanda) e.timerTanda = programa(() => { e.timerTanda = null; return envia(); }, cfg.red.tandaMs);
    }
    // los objetos sueltos que caben en esta tanda (el servidor no admite más objetos que la capacidad); el resto espera a la siguiente
    function tomaSueltos(cupo) {
      const toques3 = Math.min(e.sueltos.toques3, cupo), martillo = Math.min(e.sueltos.martillo, cupo - toques3);
      e.sueltos = { ...e.sueltos, toques3: e.sueltos.toques3 - toques3, martillo: e.sueltos.martillo - martillo };
      return { ...O.cero(), toques3, martillo };
    }
    // lo del tablero (toques y objetos) y los golpes JUNTOS, como mucho maxTanda(); y los objetos sueltos que quepan
    function tomaTanda() {
      const max = maxTanda();
      const acciones = e.lote.splice(0, max);
      const golpes = Math.min(e.pendG, max - acciones.length);
      e.pendG -= golpes;
      const sueltos = tomaSueltos(max - acciones.filter(q => q.k !== 'toque').length);
      return acciones.length || golpes || O.hay(sueltos) ? { acciones, golpes, sueltos } : null;
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
    // sin objetos va por la función de siempre (pop_raid_tocar); con ellos, por la nueva (pop_raid_jugar)
    async function manda(t) {
      const [ids, vers] = pideTrozos();
      const { toques, objetos } = aRed(t);
      const r = objetos.length ? await red.jugar(e.id, toques, t.golpes, objetos, ids, vers) : await red.tocar(e.id, toques, t.golpes, ids, vers);
      e.vuelo = false;
      e.enviando = null;
      resuelve(r, t);
      await siguiente();
    }
    // vuelve a pedir el estado de los trozos de esas acciones (forzado, con versión 0)
    function fuerza(acciones) {
      for (const q of acciones) for (const [x, y] of forma(q)) e.forzar.add(T.trozoDe(x, y));
      e.sondeoPend = true;
    }
    // qué hacer con la respuesta de una tanda: si falla, por el motivo que sea, no se reenvía; se vuelve a pedir lo que tocaba. Sus objetos
    // quedan como dudosos (el servidor pudo haberlos contado) hasta el siguiente estado, que dirá cuántos cuenta de verdad
    function resuelve(r, t) {
      if (r.ok) { confirma(r.datos, t); return; }
      e.ultimoError = r.error;
      e.dudosos = O.suma(e.dudosos, objetosDe(t));
      emit('error', r.error);
      fuerza(t.acciones);
      if (r.error === 'raid_acabada') { e.acabada = true; paraSondeo(); emit('estado', resumen()); }
    }
    // la tanda valió; si el servidor se saltó algún objeto (tope, martillazo sin jefe), se avisa y se piden de nuevo los trozos de sus objetos
    function confirma(datos, t) {
      recibe(datos);
      if ((datos.reventadas || []).length) emit('propias', datos.reventadas);
      const no = datos.rechazados || [];
      if (!no.length) return;
      emit('error', no[0].motivo);
      fuerza(t.acciones.filter(q => q.k !== 'toque'));
    }

    // ---- toques, golpes y objetos ----
    const noPuede = () => (!e.s || !e.dep ? 'sin_estado' : e.acabada ? 'acabada' : null);
    // gasta un toque del depósito local; true si lo había
    function gasta() {
      const g = D.gastar(e.dep, 1, ahoraSrv(), e.cfgDep);
      if (g.ok) e.dep = g.estado;
      return g.ok;
    }
    // hace en local una acción del tablero y la apunta en el lote; devuelve lo que reventó y lo que dejó tocado
    function hace(k, x, y) {
      const q = { k, x, y, celdas: [] };
      const res = DOB.aplica(tablero, tocadas, e.zonas, forma(q));
      q.celdas = res.reventadas;
      e.lote.push(q);
      e.s.vivas = Math.max(0, e.s.vivas - res.reventadas.length);
      e.s.yo.burbujas += res.reventadas.length;
      return { ok: true, reventadas: res.reventadas, tocadas: res.tocadas };
    }
    function tocar(x, y) {
      const mal = noPuede();
      if (mal) return { ok: false, motivo: mal };
      if (!T.dentro(x, y)) return { ok: false, motivo: 'fuera' };
      if (!gasta()) return { ok: false, motivo: 'sin_toques' };
      const res = hace('toque', x, y);
      programaTanda();
      emit('estado', resumen());
      return res;
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
    // «+3 toques»: entran ya en el depósito local
    function usaToques3() {
      e.sueltos.toques3++;
      e.dep = D.meter(e.dep, cfg.objetos.toques3, ahoraSrv(), e.cfgDep).estado;
      return { ok: true, toques: cfg.objetos.toques3 };
    }
    // el martillo contra el jefe: le quita su vida (sin pasar de la que le queda)
    function mazazo() {
      if (!jefeActivo()) return { ok: false, motivo: 'sin_jefe' };
      const golpes = Math.min(cfg.objetos.martilloJefe, e.s.jefe.vida - e.s.jefe.golpes);
      e.sueltos.martillo++;
      e.s.jefe.golpes += golpes;
      e.s.yo.golpes += golpes;
      return { ok: true, golpes };
    }
    // el objeto k donde toca: los toques3 no llevan casilla; la bomba, siempre; el martillo sin casilla va contra el jefe
    function usaDonde(k, x, y) {
      if (k === 'toques3') return usaToques3();
      if (k === 'martillo' && x === undefined) return mazazo();
      return T.dentro(x, y) ? hace(k, x, y) : { ok: false, motivo: 'fuera' };
    }
    // usa un objeto (no mira el inventario: eso es del móvil); { ok: true, ... } o { ok: false, motivo } ('tope_objetos', 'sin_jefe', 'fuera'...)
    function usar(k, x, y) {
      const mal = noPuede();
      if (mal) return { ok: false, motivo: mal };
      if (!O.TIPOS.includes(k)) return { ok: false, motivo: 'objeto_desconocido' };
      const cabe = O.cabe(e.s.yo.objetos, O.cuenta([k]), cfg.objetos.tope);
      if (!cabe.ok) return cabe;
      const res = usaDonde(k, x, y);
      if (!res.ok) return res;
      e.s.yo.objetos[k]++;
      programaTanda();
      emit('estado', resumen());
      return res;
    }
    // los objetos usados que el servidor aún no ha contado (sin enviar, en vuelo y los de una tanda sin respuesta): aún no se han descontado del inventario
    const pendientes = () => O.suma(O.suma(sinEnviar(), e.dudosos), e.enviando ? objetosDe(e.enviando) : O.cero());
    // para el sondeo y manda tandas seguidas hasta que no queda nada pendiente ni en vuelo; { ok: true } o { ok: false, error } si una falla
    async function cierra() {
      para();
      e.ultimoError = null;
      while (e.vuelo || hayPendiente()) {
        if (e.vuelo) await e.promesa; else await envia();
        if (e.ultimoError) return { ok: false, error: e.ultimoError };
      }
      return { ok: true };
    }
    function escucha(fn) { oyentes.add(fn); return () => oyentes.delete(fn); }

    return Object.freeze({
      escucha, arranca, para, cierra, mirar, sondea, envia, tocar, golpe, usar, pendientes,
      estado: resumen, tablero: () => tablero, viva: (x, y) => T.viva(tablero, x, y), version: n => versiones[n],
      aguante: (x, y) => DOB.aguante(tablero, tocadas, e.zonas, x, y),
    });
  }
  return Object.freeze({ crea, muertas });
})();
if (typeof module !== 'undefined') module.exports = PP_RAID_SINCRONIA;

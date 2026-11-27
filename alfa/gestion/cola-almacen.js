// Fans Of · /gestion · COLA: dónde guarda la pestaña Cola lo que ya leyó de GitHub (runs, historial, duraciones, recursos, foto…). Va en IndexedDB, no en localStorage:
// localStorage tiene unos 5 MB por web y lo comparten todos los juegos de fansof.games; la caché de la Cola llegó a llenarlo y Pop ya no podía guardar la partida de la
// nube (tarea 433, ADR 241). Al abrir, lo que aún quede en localStorage se muda a IndexedDB y se borra de allí.
// Se lee de memoria (todo se carga al abrir) y cada guardado se escribe por detrás. Sin IndexedDB (navegador que no lo deja) se trabaja solo en memoria y se recalcula
// en cada visita: nunca vuelve a localStorage. Sin DOM ni globales dentro: la base y el localStorage entran por puertos (COLA_ALMACEN.crea), así que se prueba en Node
// (tests/gestion/cola-almacen.test.mjs). Abajo, deIndexedDB: el adaptador a IndexedDB del navegador.
'use strict';
const COLA_ALMACEN = (() => {
  /**
   * claves: las de COLA_DATOS.K. base: { todo() → Promise<[clave, valor][]>, poner(k, v) → Promise, quitar(k) → Promise } o null si no hay IndexedDB.
   * local: el localStorage (o null), de donde se muda lo de antes. consola: donde se avisa de un fallo al escribir.
   */
  function crea({ claves, base, local, consola = console }) {
    const datos = new Map(), lista = Object.values(claves);
    let modo = 'sin_abrir';   // 'indexeddb' · 'memoria' (sin IndexedDB o falló al abrir)
    const escribe = (p, que) => p.catch(e => consola.warn('Cola: no se pudo ' + que + ' en IndexedDB', e));
    // lo de localStorage pasa a la base (lo que ya hay en la base manda: es más nuevo) y se quita de localStorage, para dejar sitio a los juegos
    function mudar() {
      if (!local) return [];
      const movidas = [];
      for (const k of lista) {
        let texto = null;
        try { texto = local.getItem(k); } catch (e) { consola.warn('Cola: no se puede leer ' + k + ' de localStorage', e); }
        if (texto == null) continue;
        if (!datos.has(k)) { try { datos.set(k, JSON.parse(texto)); } catch (e) { consola.warn('Cola: ' + k + ' no era JSON; se descarta', e); } }
        if (modo === 'indexeddb' && datos.has(k)) movidas.push(k);
        try { local.removeItem(k); } catch (e) { consola.warn('Cola: no se puede borrar ' + k + ' de localStorage', e); }
      }
      return movidas;
    }
    /** Carga todo en memoria y muda lo de localStorage. Devuelve el modo con que trabaja: 'indexeddb' o 'memoria'. */
    async function abrir() {
      if (modo !== 'sin_abrir') return modo;
      modo = 'memoria';
      if (base) {
        try { (await base.todo()).forEach(([k, v]) => { if (lista.includes(k)) datos.set(k, v); }); modo = 'indexeddb'; }
        catch (e) { consola.warn('Cola: IndexedDB no abre; lo guardado vale solo para esta visita', e); }
      }
      await Promise.all(mudar().map(k => escribe(base.poner(k, datos.get(k)), 'mudar ' + k)));
      return modo;
    }
    const leer = (k, def) => (datos.has(k) && datos.get(k) != null ? datos.get(k) : def);
    function guardar(k, v) {
      datos.set(k, v);
      if (modo === 'indexeddb') escribe(base.poner(k, v), 'guardar ' + k);
    }
    function borrar() {
      lista.forEach(k => datos.delete(k));
      if (modo === 'indexeddb') lista.forEach(k => escribe(base.quitar(k), 'borrar ' + k));
    }
    return { abrir, leer, guardar, borrar, modo: () => modo };
  }

  // IndexedDB del navegador: una base «fansof-gestion» con un almacén «cola» de clave → valor. null si el navegador no tiene IndexedDB.
  function deIndexedDB(idb, nombre = 'fansof-gestion', almacen = 'cola') {
    if (!idb) return null;
    const pide = r => new Promise((bien, mal) => { r.onsuccess = () => bien(r.result); r.onerror = () => mal(r.error); });
    let db = null;
    const abre = () => db || (db = new Promise((bien, mal) => {
      const r = idb.open(nombre, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(almacen);
      r.onsuccess = () => bien(r.result); r.onerror = () => mal(r.error); r.onblocked = () => mal(new Error('IndexedDB bloqueada'));
    }));
    const tienda = async modo => (await abre()).transaction(almacen, modo).objectStore(almacen);
    return {
      async todo() { const t = await tienda('readonly'); const [ks, vs] = await Promise.all([pide(t.getAllKeys()), pide(t.getAll())]); return ks.map((k, i) => [k, vs[i]]); },
      async poner(k, v) { await pide((await tienda('readwrite')).put(v, k)); },
      async quitar(k) { await pide((await tienda('readwrite')).delete(k)); },
    };
  }
  return { crea, deIndexedDB };
})();

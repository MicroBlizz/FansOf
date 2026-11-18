// Fans of Spy · DOMINIO · La planta: convierte el mapa de texto de una planta (js/plantas.js) en un objeto congelado que contesta
// qué hay en cada casilla: si tapa la vista, si la pisa el agente, si la pisa un guardia y si es algo sólido contra lo que golpear.
// Leyenda del mapa: # pared · . suelo · C coche · X cochazo del CEO (secreto) · P pilar · = barrera (corta el paso, no la vista)
// · G garita (solo entran guardias) · K poste de cámara · M meta (la puerta) · S salida (donde empieza el agente).
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
(function (S) {
  const OPACAS = '#CXP', AGENTE = '.SM', GUARDIA = '.SG', SOLIDAS = '#CXP=GK';
  const memoria = new WeakMap();

  function busca(filas, letra) {
    const lista = [];
    filas.forEach((fila, y) => { for (let x = 0; x < fila.length; x++) if (fila[x] === letra) lista.push({ x, y }); });
    return lista;
  }

  // Comprueba los datos de la planta antes de darla por buena: mapa rectangular, una salida, una meta y los vigías en su sitio.
  function fallo(datos) {
    const filas = datos.mapa;
    if (!Array.isArray(filas) || !filas.length || filas.some((f) => f.length !== filas[0].length)) return 'mapa-torcido';
    if (busca(filas, 'S').length !== 1) return 'sin-salida';
    if (busca(filas, 'M').length !== 1) return 'sin-meta';
    const pisa = (p) => GUARDIA.includes((filas[p.y] || '')[p.x] || '#');
    for (const g of datos.guardias || []) {
      if (!pisa(g)) return 'guardia-fuera';
      if ((g.ruta || []).some((r) => !pisa({ x: r[0], y: r[1] }))) return 'ruta-fuera';
    }
    if ((datos.camaras || []).some((c) => ((filas[c.y] || '')[c.x] || '#') !== 'K')) return 'camara-fuera';
    return null;
  }

  function crea(id, datos) {
    const mal = fallo(datos);
    if (mal) return S.error(mal);
    const filas = datos.mapa, ancho = filas[0].length, alto = filas.length;
    const tipo = (x, y) => (x < 0 || y < 0 || x >= ancho || y >= alto ? '#' : filas[y][x]);
    return S.ok(Object.freeze({
      id, nombre: datos.nombre, par: datos.par, ancho, alto, datos, tipo,
      salida: Object.freeze(busca(filas, 'S')[0]), meta: Object.freeze(busca(filas, 'M')[0]),
      secretos: S.congela(busca(filas, 'X')),
      opaca: (x, y) => OPACAS.includes(tipo(x, y)),
      pisaAgente: (x, y) => AGENTE.includes(tipo(x, y)),
      pisaGuardia: (x, y) => GUARDIA.includes(tipo(x, y)),
      solida: (x, y) => SOLIDAS.includes(tipo(x, y)),
    }));
  }

  // La planta ya hecha de un nivel (se hace una vez por cada datos de planta). Si los datos están mal, salta: es un fallo de programación.
  function de(plantas, id) {
    const datos = plantas[id];
    if (!datos) throw new Error('Spy: no existe la planta ' + id);
    if (!memoria.has(datos)) {
      const r = crea(id, datos);
      if (!r.ok) throw new Error('Spy: la planta ' + id + ' está mal: ' + r.codigo);
      memoria.set(datos, r.valor);
    }
    return memoria.get(datos);
  }

  S.planta = Object.freeze({ crea, de });
})(SPY);

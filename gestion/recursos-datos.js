// Fans Of · /gestion, pestaña RECURSOS: las reglas (dominio, sin red, reloj ni DOM). De la lista de archivos de `salida/` de la rama `recursos`, qué es de
// cada juego, de qué tipo es cada cosa y cómo se agrupa para revisarlo por etapas: las propuestas (<nombre>-propuesta-<k>) juntas, cada encargo
// (s-<hash>-<nombre>-cadena.json) con sus salidas, las tiras de lonchas con su json y lo demás suelto. Son las mismas reglas que la galería local
// (herramientas/galeria/galeria.py: nombre, marcas, es_del_juego, es_tira, pareja_json, encargo); si cambian allí, cambian aquí. Guía: docs/guia/herramientas/galeria.md
// Nombres: los viejos s-<hash>-<nombre>-<n>.<ext> y, desde la tarea #334, s-<hash>-t<tarea>-r<run>-<nombre>-p<paso>-<archivo>.<ext> (cada trozo solo si lo hay).
'use strict';
const RECURSOS_DATOS = (() => {
  const TIPOS = { png: 'imagen', jpg: 'imagen', jpeg: 'imagen', webp: 'imagen', gif: 'imagen', mp3: 'audio', wav: 'audio', ogg: 'audio', flac: 'audio', mp4: 'video', webm: 'video', glb: '3d', gltf: '3d' };
  const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', flac: 'audio/flac', mp4: 'video/mp4', webm: 'video/webm', glb: 'model/gltf-binary', gltf: 'model/gltf+json', json: 'application/json' };
  const PREFIJO = /^[iavs]-[0-9a-f]{6,}-(?:t\d+-)?(?:r\d+-)?/, NUMERO = /-\d+$/, PROPUESTA = /^(.+)-propuesta-(\d+)(?:-\d+)?$/;
  const MARCA = /^[iavs]-[0-9a-f]{6,}-(?:t(\d+)-)?(?:r(\d+)-)?/, PASO = /-p(\d+)-(?!.*-p\d+-)/;
  const TIRA = '-lonchas', CADENA = '-cadena';
  const ETAPAS = { modelo: 'Modelo 3D', lonchas: 'Lonchas', vistas: 'Lonchas (4 vistas)' };
  // el orden de la lista: lo que se aprueba por etapas primero
  const ORDEN = ['encargo', 'propuestas', 'lonchas', '3d', 'imagen', 'video', 'audio'];

  const ext = ruta => { const b = base(ruta), i = b.lastIndexOf('.'); return i > 0 ? b.slice(i + 1).toLowerCase() : ''; };
  const base = ruta => ruta.slice(ruta.lastIndexOf('/') + 1);
  const carpeta = ruta => ruta.slice(0, Math.max(0, ruta.lastIndexOf('/')));
  const tipo = ruta => TIPOS[ext(ruta)] || 'otro';
  const mime = ruta => MIME[ext(ruta)] || 'application/octet-stream';

  /** El nombre del encargo, sin el hash de la cola ni el número de salida: salida/s-1a2b3c-pets-hoja-cb-2.png → pets-hoja-cb */
  function nombre(ruta) {
    const sin = crudo(ruta);
    return sin !== sinExt(ruta) ? sin.replace(NUMERO, '') : sin;
  }
  const sinExt = ruta => { const b = base(ruta); return b.lastIndexOf('.') > 0 ? b.slice(0, b.lastIndexOf('.')) : b; };
  // sin la extensión ni el hash de la cola, con el número de salida: s-1a2b3c-pets-propuesta-2-1.png → pets-propuesta-2-1
  const crudo = ruta => sinExt(ruta).replace(PREFIJO, '');
  const entero = t => (t == null ? null : Number(t));
  /** La tarea, el run y el paso que lleva en el nombre (null lo que no lleva; los nombres viejos, todo null) */
  function marcas(ruta) {
    const b = sinExt(ruta), m = MARCA.exec(b);
    if (!m) return { tarea: null, run: null, paso: null };
    const p = PASO.exec(b.slice(m[0].length - 1) + '-');
    return { tarea: entero(m[1]), run: entero(m[2]), paso: p ? Number(p[1]) : null };
  }
  /** Es del juego si su nombre empieza por el juego o si está en una carpeta suya (salida/pets-3d/) */
  function esDelJuego(ruta, juego) {
    const partes = ruta.split('/').slice(1, -1);
    return nombre(ruta).startsWith(juego + '-') || partes.some(p => p === juego || p.startsWith(juego + '-'));
  }
  const esTira = ruta => ext(ruta) === 'png' && nombre(ruta).endsWith(TIRA);
  const esCadena = ruta => ext(ruta) === 'json' && nombre(ruta).endsWith(CADENA);
  /** El lonchas.json de una tira: el de la misma carpeta y el mismo nombre; null si no hay (sin fechas: el primero por orden) */
  function parejaJson(tira, rutas) {
    const n = nombre(tira), c = carpeta(tira);
    return rutas.filter(r => ext(r) === 'json' && carpeta(r) === c && nombre(r) === n).sort()[0] || null;
  }
  /** Los juegos que salen en la lista, con cuántos archivos tiene cada uno (la primera palabra del nombre o de su carpeta), los de más primero */
  function juegos(rutas) {
    const cuenta = {};
    for (const r of rutas) {
      const p = r.split('/'), j = (p.length > 2 ? p[1] : nombre(r)).split('-')[0];
      if (/^[a-z0-9]+$/.test(j)) cuenta[j] = (cuenta[j] || 0) + 1;
    }
    return Object.entries(cuenta).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).map(([id, n]) => ({ id, n }));
  }

  /** null si la ficha de una cadena se puede enseñar; si no, el nombre del error (como valida_cadena de galeria.py) */
  function validaCadena(c) {
    if (!c || typeof c !== 'object' || !Array.isArray(c.pasos)) return 'cadena-ilegible';
    if (!c.pasos.every(p => p && typeof p === 'object' && Array.isArray(p.salidas || []))) return 'cadena-con-pasos-raros';
    return null;
  }
  // la hoja de ángulos si la hay; si no, la primera imagen que no sea una tira
  function miniatura(salidas) {
    const imagenes = salidas.filter(r => tipo(r) === 'imagen' && !esTira(r));
    return imagenes.find(r => nombre(r).endsWith('-hoja')) || imagenes[0] || null;
  }
  /** Un encargo: sus salidas (rutas de la lista, sin los json), las que no llegaron, los pasos que fallaron, su etapa y su miniatura */
  // la tarea o el run de un encargo: lo que diga su -cadena.json (si es un entero) o lo de su nombre
  const deCadena = (c, clave, porNombre) => (Number.isInteger(c[clave]) ? c[clave] : porNombre);
  function encargo(ruta, cadena, rutas) {
    const f = { ruta, tipo: 'encargo', nombre: nombre(ruta).slice(0, -CADENA.length), etapa: 'Encargo', salidas: [], faltan: [], fallos: [], miniatura: null, pasos: 0, ...marcas(ruta) };
    const error = validaCadena(cadena);
    if (error) return { ...f, error };
    const porNombre = new Map(rutas.map(r => [base(r), r]));
    const nombres = cadena.pasos.flatMap(p => (p.salidas || []).filter(s => typeof s === 'string'));
    const salidas = nombres.filter(s => porNombre.has(s) && !s.toLowerCase().endsWith('.json')).map(s => porNombre.get(s));
    return { ...f, nombre: String(cadena.nombre || f.nombre), cadena: String(cadena.cadena || ''), etapa: ETAPAS[cadena.cadena] || 'Encargo', salidas,
      tarea: deCadena(cadena, 'tarea', f.tarea), run: deCadena(cadena, 'run', f.run),
      pasos: cadena.pasos.length, conImagen: cadena.pasos.some(p => p.tipo === 'imagen'), faltan: nombres.filter(s => !porNombre.has(s)), miniatura: miniatura(salidas),
      fallos: cadena.pasos.map((p, n) => ({ i: p.i || n + 1, tipo: String(p.tipo || ''), ok: p.ok })).filter(p => p.ok === false).map(({ i, tipo: t }) => ({ i, tipo: t })) };
  }
  /** Lo que dice la ficha de un encargo en una línea: qué paso falló y qué salidas faltan ('' si todo bien) */
  function problemas(f) {
    if (f.error) return `no se pudo leer la cadena (${f.error})`;
    if (!f.fallos || !f.faltan) return '';   // un grupo de propuestas no tiene cadena
    const fallo = f.fallos.length ? 'falló ' + f.fallos.map(p => `el paso ${p.i} (${p.tipo})`).join(', ') : '';
    const faltan = f.faltan.length === 1 ? 'falta 1 salida' : f.faltan.length ? `faltan ${f.faltan.length} salidas` : '';
    return [fallo, faltan].filter(Boolean).join(' · ');
  }
  // las propuestas de un mismo nombre, juntas, por su número
  function propuestas(rutas) {
    const grupos = new Map();
    for (const r of rutas) {
      const m = tipo(r) === 'imagen' && PROPUESTA.exec(crudo(r));   // con el número de salida: el de la propuesta podría quitarse con él
      if (m) grupos.set(m[1], [...(grupos.get(m[1]) || []), [Number(m[2]), r]]);
    }
    return [...grupos].map(([n, l]) => {
      const salidas = l.sort((a, b) => a[0] - b[0] || (a[1] < b[1] ? -1 : 1)).map(x => x[1]);
      return { ruta: 'propuestas:' + n, tipo: 'propuestas', etapa: 'Propuestas', nombre: n, salidas, miniatura: salidas[0], ...marcas(salidas[0]) };
    });
  }
  const suelta = (r, extra = {}) => ({ ruta: r, tipo: tipo(r), nombre: nombre(r), etapa: '', ...marcas(r), ...extra });
  /** Las tareas que salen en las fichas, de menor a mayor, sin repetir (para el filtro) */
  const tareas = fichas => [...new Set(fichas.map(f => f.tarea).filter(t => t != null))].sort((a, b) => a - b);
  /** ¿Pasa la ficha el filtro de tarea? '' = todas, 'sin' = las que no llevan tarea, '334' = las de esa tarea */
  const deTarea = (f, filtro) => !filtro || (filtro === 'sin' ? f.tarea == null : String(f.tarea) === String(filtro));
  /** La tarea, el run y el paso en una línea para la ficha ('' si no lleva ninguno): «tarea 334 · run 4644 · paso 2» */
  const origen = f => [f.tarea != null ? 'tarea ' + f.tarea : '', f.run != null ? 'run ' + f.run : '', f.paso != null ? 'paso ' + f.paso : ''].filter(Boolean).join(' · ');
  const orden = (a, b) => ORDEN.indexOf(a.tipo) - ORDEN.indexOf(b.tipo) || (a.nombre < b.nombre ? -1 : a.nombre > b.nombre ? 1 : 0);

  /** Las fichas del juego: encargos, grupos de propuestas, tiras de lonchas (con su json) y lo demás suelto que se puede ver. Lo que ya va dentro
   *  de un encargo o de un grupo no sale suelto, ni los json. cadenas: { ruta del -cadena.json: lo que dice, o null si no se pudo leer } */
  function inventario(rutas, juego, cadenas = {}) {
    const del = rutas.filter(r => esDelJuego(r, juego));
    const encargos = del.filter(esCadena).map(r => encargo(r, cadenas[r], del));
    const grupos = propuestas(del);
    const dentro = new Set([...encargos, ...grupos].flatMap(f => f.salidas));
    const sueltas = del.filter(r => !dentro.has(r) && tipo(r) !== 'otro').map(r => {
      const json = esTira(r) && parejaJson(r, del);
      return json ? suelta(r, { tipo: 'lonchas', etapa: 'Lonchas', json }) : suelta(r);
    });
    return [...encargos, ...grupos, ...sueltas].sort(orden);
  }
  /** La etapa de lo que sale en una ficha, como la guarda el servidor: propuestas, modelo (cadena «modelo» o un .glb suelto), lonchas (de un modelo
   *  ya hecho, sin paso de imagen, o una tira suelta) o todo (la cadena entera de lonchas, de la figura al corte, o lo que no es de ninguna etapa) */
  function etapa(f) {
    if (f.tipo === 'propuestas') return 'propuestas';
    if (f.tipo === 'encargo') return f.cadena === 'modelo' ? 'modelo' : f.cadena === 'lonchas' && !f.conImagen ? 'lonchas' : 'todo';
    return f.tipo === 'lonchas' ? 'lonchas' : f.tipo === '3d' ? 'modelo' : 'todo';
  }
  /** Cómo se abre cada salida en su panel: una tira con json en el visor de lonchas, un .glb en el visor GLB, lo demás tal cual */
  function panel(ruta, rutas) {
    const json = esTira(ruta) && parejaJson(ruta, rutas);
    return json ? { ruta, tipo: 'lonchas', nombre: nombre(ruta), json, ...marcas(ruta) } : { ruta, tipo: tipo(ruta), nombre: nombre(ruta), ...marcas(ruta) };
  }
  return { tipo, mime, nombre, marcas, tareas, deTarea, origen, etapa, esDelJuego, esTira, esCadena, parejaJson, juegos, validaCadena, encargo, problemas, propuestas, inventario, panel };
})();
if (typeof module !== 'undefined') module.exports = RECURSOS_DATOS;   // en node (tests/gestion/recursos-datos.test.mjs) solo se carga

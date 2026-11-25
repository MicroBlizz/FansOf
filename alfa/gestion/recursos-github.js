// Fans Of · /gestion, pestaña RECURSOS: lo que se lee de GitHub (adaptador), y la fecha de cada archivo por GraphQL (fechas, tarea 388). La lista de `salida/` de la rama `recursos` de FansOf-dev sin bajar la rama
// (la rama es grande: nada de árbol recursivo entero): el árbol de la carpeta (git/trees/recursos:salida) y, de sus subcarpetas, solo las del juego; y cada
// archivo por su sha (git/blobs, en base64) como Blob para enseñarlo con una dirección blob:. Solo lee: con el token de la pestaña Cola, que para esto
// necesita Contents en solo lectura. fetch se pasa (en los tests, uno de mentira). Guía: docs/guia/herramientas/galeria.md
'use strict';
const RECURSOS_GITHUB = (() => {
  const REPO = 'MicroBlizz/FansOf-dev', API = 'https://api.github.com/repos/' + REPO, RAMA = 'recursos', CARPETA = 'salida';
  const PERMISO = 'El token de la pestaña Cola no puede leer la rama recursos: en GitHub › Settings › Developer settings › Fine-grained tokens, añádele el permiso Contents (solo lectura) del repo ' + REPO + '.';

  const NO_ESTA = 'No encuentro la rama recursos o su carpeta salida/ (o el token no ve el repo: entonces le falta Contents de solo lectura).';
  // un error de GitHub con su código; sin permiso (401, 403) lleva sinPermiso y el texto de qué añadir. Un 404 puede ser las dos cosas (un repo privado
  // sin permiso también da 404): se dice que falta la rama o la carpeta, o el permiso
  function error(ruta, status) {
    const e = new Error(ruta.split('?')[0] + ' → ' + status);
    e.status = status; e.sinPermiso = [401, 403, 404].includes(status);
    if (e.sinPermiso) e.consejo = status === 404 ? NO_ESTA : PERMISO;
    return e;
  }
  async function pide(f, token, ruta) {
    const r = await f(API + ruta, { headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } });
    if (!r.ok) throw error(ruta, r.status);
    return r.json();
  }
  const blobs = (lista, prefijo) => lista.filter(e => e.type === 'blob').map(e => ({ ruta: prefijo + e.path, sha: e.sha, tam: e.size || 0 }));
  /** Lo que hay directamente en `salida/`: los archivos [{ ruta: salida/<archivo>, sha, tam }], las subcarpetas [{ nombre, sha }] y si GitHub cortó la lista */
  async function raiz(f, token) {
    const d = await pide(f, token, `/git/trees/${RAMA}:${CARPETA}`), lista = d.tree || [];
    return { archivos: blobs(lista, CARPETA + '/'), carpetas: lista.filter(e => e.type === 'tree').map(e => ({ nombre: e.path, sha: e.sha })), cortada: !!d.truncated };
  }
  /** Las subcarpetas que son del juego (salida/pets-3d/ para pets) */
  const carpetasDe = (carpetas, juego) => carpetas.filter(c => c.nombre === juego || c.nombre.startsWith(juego + '-'));
  /** Todo lo de una subcarpeta (es pequeña: con su árbol recursivo) como salida/<carpeta>/<archivo> */
  async function carpeta(f, token, c) {
    const d = await pide(f, token, `/git/trees/${c.sha}?recursive=1`);
    return { archivos: blobs(d.tree || [], `${CARPETA}/${c.nombre}/`), cortada: !!d.truncated };
  }
  // base64 (con saltos de línea, como lo da GitHub) a bytes
  function bytes(b64) {
    const bin = atob(String(b64).replace(/\s/g, '')), u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u;
  }
  /** Un archivo por su sha como Blob del tipo dado */
  async function blob(f, token, sha, tipo) {
    const d = await pide(f, token, '/git/blobs/' + sha);
    return new Blob([bytes(d.content || '')], { type: tipo });
  }
  /** Un json por su sha, ya leído (lanza si no es JSON) */
  async function json(f, token, sha) {
    const d = await pide(f, token, '/git/blobs/' + sha);
    return JSON.parse(new TextDecoder().decode(bytes(d.content || '')));
  }
  // ---- las fechas (tarea 388): la del último commit que tocó cada archivo en la rama, con GraphQL (50 archivos por consulta, cada uno con su alias;
  // probado: 100 tardan ~7 s y gastan 1 punto de cuota). Contents en solo lectura basta
  const LOTE = 50, A_LA_VEZ = 4;   // 100 por consulta tardaba ~7 s, cerca del tope de 10 s de GitHub: 50 deja margen
  const [DUENO, NOMBRE] = REPO.split('/');
  function consulta(rutas) {
    const campos = rutas.map((r, i) => `a${i}: history(first: 1, path: ${JSON.stringify(r)}) { nodes { committedDate } }`).join(' ');
    return `query { repository(owner: "${DUENO}", name: "${NOMBRE}") { object(expression: "${RAMA}") { ... on Commit { ${campos} } } } }`;
  }
  async function lote(f, token, rutas) {
    const r = await f('https://api.github.com/graphql', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ query: consulta(rutas) }) });
    if (!r.ok) throw new Error(`GitHub no dio las fechas (${r.status})`);   // la rama sí se leyó: no es el aviso de permiso de la lista
    const d = await r.json(), obj = d && d.data && d.data.repository && d.data.repository.object;
    if (!obj) throw new Error('GitHub no dio las fechas' + (d && d.errors && d.errors[0] ? ': ' + d.errors[0].message : ''));
    const out = {};
    rutas.forEach((ruta, i) => { const n = obj['a' + i] && obj['a' + i].nodes; out[ruta] = (n && n[0] && n[0].committedDate) || null; });
    return out;
  }
  /** La fecha (ISO, o null si no la hay) de cada ruta: { fechas: { ruta: iso }, error }. avance(hechas, total) se llama al acabar cada lote. Si seguir() da
   *  false o falla un lote, no se empiezan más y se devuelve lo leído (error: el primer fallo, o null) */
  async function fechas(f, token, rutas, avance = () => {}, seguir = () => true) {
    const lotes = [];
    for (let i = 0; i < rutas.length; i += LOTE) lotes.push(rutas.slice(i, i + LOTE));
    const out = {};
    let hechas = 0, siguiente = 0, error = null;
    const obrero = async () => {
      while (siguiente < lotes.length && !error && seguir()) {
        const l = lotes[siguiente++];
        try { Object.assign(out, await lote(f, token, l)); } catch (err) { error = error || err; return; }
        hechas += l.length; avance(hechas, rutas.length);
      }
    };
    await Promise.all(Array.from({ length: Math.min(A_LA_VEZ, lotes.length) }, obrero));
    return { fechas: out, error };
  }
  return { REPO, PERMISO, raiz, carpetasDe, carpeta, blob, json, bytes, fechas };
})();
if (typeof module !== 'undefined') module.exports = RECURSOS_GITHUB;   // en node (tests/gestion/recursos-github.test.mjs) solo se carga

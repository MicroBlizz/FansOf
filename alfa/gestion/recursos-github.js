// Fans Of · /gestion, pestaña RECURSOS: lo que se lee de GitHub (adaptador). La lista de `salida/` de la rama `recursos` de FansOf-dev sin bajar la rama
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
  return { REPO, PERMISO, raiz, carpetasDe, carpeta, blob, json, bytes };
})();
if (typeof module !== 'undefined') module.exports = RECURSOS_GITHUB;   // en node (tests/gestion/recursos-github.test.mjs) solo se carga

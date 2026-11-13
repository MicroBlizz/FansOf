// Fans Of · /gestion → SQL: los SQL NUEVOS DE MAIN (ADR 110). Lee la carpeta servidor/ del repo con el token de GitHub que el admin ya pegó en la pestaña Cola
// (necesita además el permiso Contents en solo lectura) y deja en la lista de espera los ficheros que aún no están apuntados en la base ni propuestos con ese mismo
// texto: así lo que se aprueba es exactamente el fichero de main, sin pegar nada a mano y sin pasar por el conector. La nota en llano sale de la cabecera del fichero.
// Solo mira los ficheros desde el 129 (los anteriores son de antes del registro). Datos: gestion_sql_proponer (servidor/132). Lo usa sql.js; no pinta nada.
'use strict';
const GESTION_SQL_MAIN = (() => {
  const REPO = 'MicroBlizz/FansOf-dev', API = 'https://api.github.com/repos/' + REPO + '/contents/servidor', CLAVE = 'fansof.gestion.githubToken';
  const DESDE = 129, NOMBRE = /^(\d+)-[a-z0-9._-]{1,70}\.sql$/, FIJOS = ['aprobado', 'aplicando', 'aplicado'];
  const token = () => { try { return localStorage.getItem(CLAVE) || ''; } catch (e) { return ''; } };
  const normaliza = t => String(t).replace(/\r\n?/g, '\n');
  async function huella(texto) {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normaliza(texto)));
    return Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, '0')).join('');
  }
  // lo que cuenta la cabecera del fichero (sus primeras líneas de comentario), para quien aprueba
  function nota(texto) {
    const L = [];
    for (const l of normaliza(texto).split('\n')) { if (!l.startsWith('--')) break; L.push(l.replace(/^--\s*/, '')); }
    return L.join(' ').slice(0, 600) || null;
  }
  const envuelto = (nombre, texto) => texto.includes(`public._sql_empieza('${nombre}')`) && texto.includes(`public._sql_apunta('${nombre}'`);
  function candidatos(nombres, d) {
    const apuntados = new Set(d.apuntados || []);
    return nombres.filter(n => { const m = NOMBRE.exec(n); return m && Number(m[1]) >= DESDE && !apuntados.has(n); }).sort();
  }
  async function pedir(ruta, crudo) {
    const r = await fetch(API + ruta, { headers: { Authorization: 'Bearer ' + token(), Accept: crudo ? 'application/vnd.github.raw+json' : 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } });
    if (!r.ok) throw new Error('github ' + r.status);
    return crudo ? r.text() : r.json();
  }
  // ¿hay que proponerlo? No si ya está en la cola con este mismo texto, ni si lo que hay está aprobado o aplicándose (eso no se pisa)
  function toca(nombre, h, d) {
    const fila = (d.cola || []).find(c => c.fichero === nombre);
    return !fila || (fila.huella !== h && !FIJOS.includes(fila.estado));
  }
  // Devuelve { propuestos: [nombres], aviso: texto o '' }. `d` es la respuesta de gestion_sql_pendientes.
  async function sincronizar(d) {
    if (!d.apuntados) return { propuestos: [], aviso: '' };   // servidor sin el SQL 132: la lista de espera sigue funcionando sin esto
    if (!token()) return { propuestos: [], aviso: 'Para ver aquí los SQL nuevos de main hace falta el token de GitHub: pégalo en Cola → Configuración.' };
    const propuestos = [], saltados = [];
    try {
      const nombres = (await pedir('?ref=main', false)).map(f => f.name);
      for (const n of candidatos(nombres, d)) {
        const texto = await pedir('/' + n + '?ref=main', true);
        if (!envuelto(n, texto)) { saltados.push(n); continue; }
        if (!toca(n, await huella(texto), d)) continue;
        await rpc('gestion_sql_proponer', { p_token: leerToken(), p_fichero: n, p_texto: normaliza(texto), p_nota: nota(texto) });
        propuestos.push(n);
      }
    } catch (e) {
      const sinPermiso = /github (401|403|404)/.test(String(e.message));
      return { propuestos, aviso: sinPermiso ? 'No puedo leer servidor/ de main: al token de GitHub le falta el permiso Contents en solo lectura (GitHub › Settings › Developer settings › Fine-grained tokens).' : 'No pude leer los SQL de main: ' + textoError(e) };
    }
    return { propuestos, aviso: saltados.length ? 'En main hay SQL sin la envoltura del registro y no se proponen: ' + saltados.join(', ') : '' };
  }
  return { sincronizar, candidatos, nota, huella, toca, envuelto };
})();

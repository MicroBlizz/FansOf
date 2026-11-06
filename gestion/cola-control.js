// Fans Of · /gestion, pestaña COLA: los mandos. Poner en pausa los runners de generar recursos (una variable de Actions que leen los runners, herramientas/runner/pausa.sh)
// y reiniciar las ejecuciones fallidas (relanza solo sus jobs fallidos). Habla con la API de GitHub desde el navegador con el token de la pestaña, que para esto necesita
// los permisos Variables y Actions en lectura y escritura. Solo pinta y llama a la API: los botones los atiende cola.js (mismos id). Guía: docs/guia/herramientas/cola-actions.md.
'use strict';
const COLA_CONTROL = (() => {
  const REPO = 'MicroBlizz/FansOf-dev', API = 'https://api.github.com/repos/' + REPO;
  const VARIABLE = 'PAUSA_RUNNERS_GENERAR_RECURSO';   // misma que RUNNER_PAUSA_VARIABLE de docker-compose.yml
  const CARRIL = 'yoshi-generar-recurso';   // el carril (etiqueta del runner) que afecta la pausa
  const MAX_FALLIDAS = 30, HORAS = 48, MAX_PAGINAS_COLA = 10;
  const FALLO = new Set(['failure', 'timed_out', 'startup_failure']);
  const ENTRE_TRABAJOS_MS = 3 * 60e3;   // lo que tarda un runner efímero en darse de baja y registrarse otra vez (con margen por si se actualiza)

  const cabeceras = (token, cuerpo) => ({ Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(cuerpo ? { 'Content-Type': 'application/json' } : {}) });
  async function llamar(f, token, metodo, ruta, cuerpo) {
    const r = await f(API + ruta, { method: metodo, headers: cabeceras(token, cuerpo), body: cuerpo ? JSON.stringify(cuerpo) : undefined });
    if (!r.ok) { const e = new Error(metodo + ' ' + ruta + ' → ' + r.status); e.status = r.status; throw e; }
    return r.status === 204 ? null : r.json().catch(() => null);
  }

  /** true si los runners están en pausa, false si no (también si la variable no existe aún). Otro error de GitHub se lanza. */
  async function leerPausa(f, token) {
    try { return (await llamar(f, token, 'GET', '/actions/variables/' + VARIABLE)).value === '1'; }
    catch (e) { if (e.status === 404) return false; throw e; }
  }
  /** Pone o quita la pausa. Si la variable no existe, la crea. */
  async function fijarPausa(f, token, pausar) {
    const cuerpo = { name: VARIABLE, value: pausar ? '1' : '0' };
    try { await llamar(f, token, 'PATCH', '/actions/variables/' + VARIABLE, cuerpo); }
    catch (e) { if (e.status !== 404) throw e; await llamar(f, token, 'POST', '/actions/variables', cuerpo); }
  }
  /** Cancela un run en cola o en marcha. */
  const cancelar = (f, token, id) => llamar(f, token, 'POST', '/actions/runs/' + id + '/cancel');
  const CANCELABLE_DIAS = 3;
  /** El botón «Cancelar» de un trabajo de la cola: solo si lleva más de 3 días (atascado); si no, vacío. */
  function botonCancelar(t, ahora, ocupado) {
    if (!(t.creado > 0) || ahora - t.creado < CANCELABLE_DIAS * 864e5) return '';
    return `<button type="button" data-cancela="${t.id}"${ocupado ? ' disabled' : ''} title="Lleva más de ${CANCELABLE_DIAS} días en la cola">Cancelar</button>`;
  }
  /** Relanza solo los jobs fallidos del run. */
  const reiniciar = (f, token, id) => llamar(f, token, 'POST', '/actions/runs/' + id + '/rerun-failed-jobs');

  /** Relanza cada run de la lista sin parar en el primer error. Devuelve { hechos, errores, mensaje } (mensaje vacío si todo fue bien). */
  async function reiniciarTodas(f, token, lista) {
    const errores = []; let hechos = 0;
    for (const r of lista) { try { await reiniciar(f, token, r.id); hechos++; } catch (e) { errores.push(e.message); } }
    const mensaje = errores.length ? `Reiniciadas ${hechos} de ${lista.length}. Fallo: ${errores[0]}.` : '';
    return { hechos, errores, mensaje };
  }
  /** De los runs terminados (más nuevos primero), los fallidos de las últimas 48 h, ya en el formato que pinta la lista. */
  function fallidas(hechos, ahora) {
    const desde = ahora - HORAS * 36e5;
    return hechos.filter(r => FALLO.has(r.conclusion) && Date.parse(r.updated_at) >= desde).slice(0, MAX_FALLIDAS)
      .map(r => ({ id: r.id, workflow: r.name, titulo: r.display_title, fin: Date.parse(r.updated_at), intento: r.run_attempt || 1 }));
  }

  /** Todos los runs no terminados, para no contarlos como fallidos aunque su último intento fallara (un reinicio los vuelve a poner en cola con el mismo id).
   *  `gh(ruta)` llama a la API. Pide cada estado por separado (in_progress, queued, waiting, requested, pending) y la cola entera, sin quedarse en la primera página. */
  async function sinTerminar(gh) {
    const todos = [];
    for (const estado of ['in_progress', 'queued', 'waiting', 'requested', 'pending']) {
      for (let p = 1; p <= MAX_PAGINAS_COLA; p++) {
        const d = (await gh('/actions/runs?status=' + estado + '&per_page=100&page=' + p)).workflow_runs || [];
        todos.push(...d);
        if (d.length < 100) break;
      }
    }
    return todos;
  }

  /** ¿Está encendido el carril? Los runners son efímeros: tras cada trabajo se dan de baja y se registran de nuevo, y en ese hueco GitHub no lista
   *  ninguno con la etiqueta. Por eso cuenta como encendido si hay uno en línea, si tiene un trabajo en curso o si acabó uno hace menos de ENTRE_TRABAJOS_MS.
   *  `c`: { enLinea (true|false|null si el token no ve los runners), enCurso, ultimoFin (ms o 0) }. null = no se sabe. */
  function encendido(c, ahora) {
    if (c.enLinea === null) return null;
    return c.enLinea || c.enCurso || (c.ultimoFin > 0 && ahora - c.ultimoFin < ENTRE_TRABAJOS_MS);
  }

  /** La barra de la pausa (se ve en todas las vistas menos Configuración). `e`: { pausa (true|false|null si no se sabe), ocupado, esc(texto), fallo }. */
  function htmlPausa(e) {
    const pausado = e.pausa === true;
    const estado = e.pausa === null ? 'Estado desconocido' : pausado ? 'En pausa' : 'En marcha';
    return `<section class="caja cl-control"><div class="cl-bar"><b>Runners de generar recursos: ${estado}</b>`
      + `<button type="button" id="cl-pausa"${e.ocupado || e.pausa === null ? ' disabled' : ''}>${pausado ? 'Reanudar' : 'Pausar'}</button></div>`
      + `<p class="meta">En pausa, el pedido en marcha termina y no entra ninguno más hasta reanudar (esperan en la cola de GitHub, hasta 24 h). Tarda hasta ~15 s en notarse. No afecta a los demás runners.</p>`
      + (e.fallo ? `<p class="aviso">${e.esc(e.fallo)}</p>` : '') + '</section>';
  }
  /** La vista «Fallidas». `e`: { ocupado, fallidas, fecha(ms), esc(texto) }. */
  function htmlFallidas(e) {
    const lista = e.fallidas.length
      ? e.fallidas.map(r => `<div class="cl-fila"><span><a href="https://github.com/${REPO}/actions/runs/${r.id}" target="_blank" rel="noopener">${e.esc(r.workflow)}</a> · ${e.esc(r.titulo)}</span>`
        + `<span class="meta">${e.fecha(r.fin)}${r.intento > 1 ? ' · intento ' + r.intento : ''}</span><button type="button" data-reinicia="${r.id}"${e.ocupado ? ' disabled' : ''}>Reiniciar</button></div>`).join('')
      : '<div class="meta">Ninguna en las últimas ' + HORAS + ' h.</div>';
    return `<section class="caja cl-control"><h3>Ejecuciones fallidas (${e.fallidas.length})</h3>${lista}`
      + (e.fallidas.length > 1 ? `<div class="cl-bar"><button type="button" id="cl-reinicia-todas"${e.ocupado ? ' disabled' : ''}>Reiniciar todas</button></div>` : '') + '</section>';
  }
  return { VARIABLE, CARRIL, leerPausa, fijarPausa, cancelar, botonCancelar, reiniciar, reiniciarTodas, fallidas, sinTerminar, encendido, htmlPausa, htmlFallidas };
})();

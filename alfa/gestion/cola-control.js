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
  const CADUCA_MIN_H = 23.5, CADUCA_MAX_H = 24.5;   // GitHub cancela lo que espera runner 24 h: sale «cancelled» con 24 h 0 m 5 s entre created_at y updated_at (medido el 6-11-2026 en 82 runs de Generar)
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
  const fijarPausa = (f, token, pausar) => fijarVariable(f, token, VARIABLE, pausar ? '1' : '0');
  /** Pone el valor de una variable de Actions del repo; si no existe, la crea. */
  async function fijarVariable(f, token, nombre, valor) {
    const cuerpo = { name: nombre, value: valor };
    try { await llamar(f, token, 'PATCH', '/actions/variables/' + nombre, cuerpo); }
    catch (e) { if (e.status !== 404) throw e; await llamar(f, token, 'POST', '/actions/variables', cuerpo); }
  }
  /** Las variables de Actions del repo como { NOMBRE: valor }. */
  async function leerVariables(f, token) {
    const d = await llamar(f, token, 'GET', '/actions/variables?per_page=30');
    return Object.fromEntries(((d && d.variables) || []).map(v => [v.name, v.value]));
  }
  /** Cancela un run en cola o en marcha. */
  const cancelar = (f, token, id) => llamar(f, token, 'POST', '/actions/runs/' + id + '/cancel');
  const CANCELABLE_DIAS = 3;
  /** El botón «Cancelar» de un trabajo de la cola: solo si lleva más de 3 días (atascado); si no, vacío. */
  function botonCancelar(t, ahora, ocupado, sinMandos) {
    if (sinMandos || !(t.creado > 0) || ahora - t.creado < CANCELABLE_DIAS * 864e5) return '';
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
  /** ¿Un run cancelado por llevar 24 h esperando runner (y no a mano)? Una cancelación a propósito no suele durar justo 24 h entre created_at y updated_at. */
  function caducada(r) {
    if (r.conclusion !== 'cancelled') return false;
    const h = (Date.parse(r.updated_at) - Date.parse(r.created_at)) / 36e5;
    return h >= CADUCA_MIN_H && h <= CADUCA_MAX_H;
  }
  /** Un run terminado, en el formato que pinta la lista. */
  const fila = r => ({ id: r.id, workflow: r.name, titulo: r.display_title, fin: Date.parse(r.updated_at), intento: r.run_attempt || 1 });
  /** De los runs terminados (más nuevos primero), los que cumplen `cuando` y acabaron en las últimas 48 h. */
  const recientes = (hechos, ahora, cuando) => hechos.filter(r => cuando(r) && Date.parse(r.updated_at) >= ahora - HORAS * 36e5).slice(0, MAX_FALLIDAS).map(fila);
  /** Los fallidos de las últimas 48 h (sin las caducadas en cola, que tienen su propia lista). */
  const fallidas = (hechos, ahora) => recientes(hechos, ahora, r => FALLO.has(r.conclusion));
  /** Las caducadas en cola de las últimas 48 h. */
  const caducadas = (hechos, ahora) => recientes(hechos, ahora, caducada);
  /** Las pestañas «Fallidas» y «Caducadas», con su cuenta. */
  const pestanas = snap => [['f', 'Fallidas (' + (snap.fallidas || []).length + ')'], ['x', 'Caducadas (' + (snap.caducadas || []).length + ')']];

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
    if (e.sinMandos) return '';   // token de solo lectura (sin permiso de Variables): el panel funciona, sin el mando de pausa
    const pausado = e.pausa === true;
    const estado = e.pausa === null ? 'Estado desconocido' : pausado ? 'En pausa' : 'En marcha';
    return `<section class="caja cl-control"><div class="cl-bar"><b>Runners de generar recursos: ${estado}</b>`
      + `<button type="button" id="cl-pausa"${e.ocupado || e.pausa === null ? ' disabled' : ''}>${pausado ? 'Reanudar' : 'Pausar'}</button></div>`
      + `<p class="meta">En pausa, el pedido en marcha termina y no entra ninguno más hasta reanudar (esperan en la cola de GitHub, hasta 24 h). Tarda hasta ~15 s en notarse. No afecta a los demás runners.</p>`
      + (e.fallo ? `<p class="aviso">${e.esc(e.fallo)}</p>` : '') + '</section>';
  }
  /** La vista «Fallidas» (`vista` 'f') o «Caducadas» (`vista` 'x'). `e`: { ocupado, fecha(ms), esc(texto) }; la lista sale de `snap`. */
  function htmlLista(vista, snap, e) {
    const x = vista === 'x', lista = (x ? snap.caducadas : snap.fallidas) || [];
    const filas = lista.length
      ? lista.map(r => `<div class="cl-fila"><span><a href="https://github.com/${REPO}/actions/runs/${r.id}" target="_blank" rel="noopener">${e.esc(r.workflow)}</a> · ${e.esc(r.titulo)}</span>`
        + `<span class="meta">${e.fecha(r.fin)}${r.intento > 1 ? ' · intento ' + r.intento : ''}</span>${e.sinMandos ? '' : `<button type="button" data-reinicia="${r.id}"${e.ocupado ? ' disabled' : ''}>Reiniciar</button>`}</div>`).join('')
      : '<div class="meta">Ninguna en las últimas ' + HORAS + ' h.</div>';
    const pie = x ? '<p class="meta">GitHub cancela lo que espera runner más de 24 h: no falló, no llegó a ejecutarse. Reiniciar le da otras 24 h de espera.</p>' : '';
    return `<section class="caja cl-control"><h3>${x ? 'Caducadas en cola' : 'Ejecuciones fallidas'} (${lista.length})</h3>${pie}${filas}`
      + (lista.length > 1 && !e.sinMandos ? `<div class="cl-bar"><button type="button" id="cl-reinicia-todas"${e.ocupado ? ' disabled' : ''}>Reiniciar todas</button></div>` : '') + '</section>';
  }
  return { VARIABLE, CARRIL, leerPausa, fijarPausa, fijarVariable, leerVariables, cancelar, botonCancelar, reiniciar, reiniciarTodas, fallidas, caducada, caducadas, pestanas, sinTerminar, encendido, htmlPausa, htmlLista };
})();

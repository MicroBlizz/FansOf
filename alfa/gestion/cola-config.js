// Fans Of · /gestion, pestaña COLA: la vista «Configuración». Cómo poner en marcha la pestaña y el mod de Claude cola-actions (token de GitHub, instalar y
// actualizar el mod, clave de la cola) y los ajustes: límite semanal, historial compartido (releer todo, borrar lo guardado) y las claves del mod.
// Solo pinta: los botones los atiende cola.js (mismos id). Guía: docs/guia/herramientas/cola-actions.md.
'use strict';
const COLA_CONFIG = (() => {
  const REPO = 'MicroBlizz/FansOf-dev';
  // comandos del mod, cada uno con su botón de copiar
  const cmd = c => `<div class="cl-cmd"><code>${esc(c)}</code><button type="button" class="enlace" data-copia="${esc(c)}">Copiar</button></div>`;
  const ACTUALIZAR = ['/plugin marketplace update fansof', '/plugin update cola-actions', '/reload-plugins'];

  /** La vista entera. `e`: { limite, snap, claves, claveNueva, revocando, confirmaBorrar, fecha(ms) }. */
  function html(e) {
    const s = e.snap;
    const estado = !s ? 'Aún no se ha leído la cola.'
      : `Datos de ${e.fecha(s.actualizado)} · ${s.guardados || 0} runs terminados guardados en este navegador${s.historialCompleto ? '' : ' (bajando el historial)'} · `
        + (s.compartido ? 'historial compartido con Supabase al día.' : 'el historial compartido no se pudo usar en el último refresco (el aviso de arriba dice por qué).');
    const filas = (e.claves || []).map(c => `<tr><td>${esc(c.nombre)}</td><td>${esc(c.creador)}</td><td>${c.ultimo_uso ? e.fecha(Date.parse(c.ultimo_uso)) : 'nunca'}</td>`
      + `<td>${c.revocada ? 'revocada' : `<button type="button" class="enlace" data-revoca="${c.id}">${e.revocando === c.id ? 'Sí, revocar' : 'Revocar'}</button>`}</td></tr>`).join('');

    return COLA_VARIABLES.html({ valores: e.variables, ocupado: e.ocupado, sinMandos: e.sinMandos }) + `<section class="caja cl-cfg"><h3>Esta pestaña</h3>
      <p><b>Token de GitHub:</b> guardado en este navegador. Es un token fino del repo ${REPO} con los permisos <b>Actions</b> y <b>Variables</b> en lectura y escritura (para pausar los runners y reiniciar ejecuciones fallidas) y <b>Administration</b> en solo lectura (para saber si yoshi está encendido). Si caduca o lo revocas en GitHub, olvídalo aquí y pega el nuevo.</p>
      <div class="cl-bar"><button type="button" id="cl-olvida">Olvidar token</button></div>
      <p><label class="cl-op">Límite semanal de referencia (tokens) <input type="number" id="cl-lim" min="0" step="1000" value="${e.limite || ''}" style="width:9em"></label></p>
      <p class="meta">Con él sale la columna «Semanal» del resumen. Esta pestaña no puede leer tu límite de Claude; por defecto 1 250 000. Vacío, no se enseña el porcentaje.</p>
    </section>

    <section class="caja cl-cfg"><h3>Historial compartido</h3>
      <p>Los runs terminados se guardan en este navegador y en Supabase, para que Pepins y Arkioner vean lo mismo y no se pierda lo que GitHub borra a los 90 días. Cada refresco baja lo que han subido los demás y sube lo nuevo. El token de GitHub no sale de este navegador.</p>
      <p class="meta">${esc(estado)}</p>
      <div class="cl-bar"><button type="button" id="cl-todo">Releer todo</button><button type="button" id="cl-borra">Borrar lo guardado</button></div>
      <p class="meta"><b>Releer todo</b>: vuelve a leer GitHub entero y sobreescribe por id, sin borrar lo demás (para cuando algo parezca mal; hace muchas llamadas). <b>Borrar lo guardado</b>: borra la copia de este navegador y empieza de cero; lo de Supabase se queda y se vuelve a bajar.</p>
      ${e.confirmaBorrar ? `<p class="aviso">¿Borrar todo lo guardado de la cola en este navegador (runs, medias, recursos y la última foto)? El token, el límite y lo de Supabase se quedan. <button type="button" class="fuerte" id="cl-borra-si">Sí, borrar</button> <button type="button" id="cl-borra-no">No</button></p>` : ''}
    </section>

    <section class="caja cl-cfg"><h3>Mod de Claude (cola-actions)</h3>
      <p>El mismo panel, junto al chat de Claude Code. Cada persona, una vez:</p>
      <ol>
        <li><b>Token de GitHub</b>: en GitHub › Settings › Developer settings › Fine-grained tokens, uno solo para ${REPO} con <b>Actions</b> en solo lectura (el mod no escribe) y <b>Administration</b> en solo lectura (puede ser el mismo de esta pestaña, que además lleva escritura en Actions y Variables).</li>
        <li><b>Instalar el mod</b> en el prompt de una sesión de Claude Code, con tu cuenta de GitHub con acceso al repo. Acepta el marketplace y elige el ámbito de usuario; al terminar pide el token del paso 1.${cmd('/plugin install cola-actions --marketplace ' + REPO)}</li>
        <li><b>Clave de la cola</b>: crea una abajo con tu nombre, cópiala (solo se enseña una vez) y pégala en <code>/config</code>, en la opción «Clave de la cola» del mod. Sin ella el mod funciona igual, pero no comparte el historial.</li>
      </ol>
      <p><b>Actualizar</b> cuando alguien suba cambios del mod:</p>${ACTUALIZAR.map(cmd).join('')}
      <p class="meta">Para probarlo sin instalar: <code>claude --plugin-dir &lt;ruta del repo&gt;/herramientas/cola-actions</code>. Más en docs/guia/herramientas/cola-actions.md.</p>
    </section>

    <section class="caja cl-cfg"><h3>Claves para el mod de Claude</h3>
      <p class="meta">Una por persona. Solo sirven para leer y guardar la cola; revócala si pierdes el equipo o ya no la usas.</p>
      ${e.claveNueva ? `<p class="aviso">Copia la clave ahora: no se vuelve a enseñar.</p>${cmd(e.claveNueva)}` : ''}
      <form class="cl-bar" id="cl-clave-nueva"><input id="cl-clave-nombre" maxlength="60" placeholder="Nombre (p. ej. mod de Pepins)"><button type="submit">Crear clave</button></form>
      ${e.claves === null ? '<p class="meta">Cargando…</p>' : e.claves.length ? `<table class="tabla"><thead><tr><th>Nombre</th><th>Creada por</th><th>Último uso</th><th></th></tr></thead><tbody>${filas}</tbody></table>` : '<p class="meta">Aún no hay claves.</p>'}
    </section>`;
  }

  const css = `.cl-cfg{margin-bottom:12px}.cl-cfg h3{margin:0 0 8px}.cl-cfg p{margin:6px 0}.cl-var{margin:10px 0}.cl-cfg ol{margin:6px 0;padding-left:1.4em}.cl-cfg li{margin:6px 0}
    .cl-cmd{display:flex;gap:8px;align-items:center;margin:4px 0}.cl-cmd code{flex:1;font:13px var(--mono);background:var(--bg);border:1px solid var(--linea);border-radius:4px;padding:4px 8px;overflow-x:auto;white-space:nowrap}`;

  return { html, css };
})();

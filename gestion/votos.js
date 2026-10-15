// Fans Of · /gestion: la pestaña COMENTARIOS. Los votos SÍ/NO son un simple contador; lo importante son las notas: cada una guarda la versión del juego
// que estaba desplegada cuando se escribió, y aquí se marca si está pendiente, resuelta (con la versión que la arregló) o descartada.
// Datos: gestion_votos(token) y gestion_voto_marcar(...), servidor/30 y 31. Usa lo de gestion/index.html: rpc(), leerToken(), esc(), fmt(), fecha(), textoError() y $().
'use strict';
(() => {
  let V = null, F = null;
  const actuales = {};   // juego → versión desplegada ahora (se lee del index.html del juego en esta misma web)
  const num = v => String(v || '').split('.').map(n => parseInt(n, 10) || 0);
  const mayor = (a, b) => { const x = num(a), y = num(b); for (let i = 0; i < 4; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); } return false; };
  async function versionDe(juego) {
    if (juego in actuales) return actuales[juego];
    actuales[juego] = '';
    for (const dir of ['../games/', '../demos/']) {
      try {
        const r = await fetch(dir + encodeURIComponent(juego) + '/index.html', { cache: 'no-cache' }); if (!r.ok) continue;
        const m = /nucleo\.js\?v=([\d.]+)/.exec(await r.text()); if (m) { actuales[juego] = m[1]; return m[1]; }
        const n = await fetch(dir + encodeURIComponent(juego) + '/js/novedades.js', { cache: 'no-cache' });   // las demos sin nucleo.js: la primera entrada de novedades
        const k = n.ok && /v:\s*'([\d.]+)'/.exec(await n.text()); if (k) { actuales[juego] = k[1]; return k[1]; }
      } catch (e) { /* sin esa carpeta */ }
    }
    return '';
  }
  const ESTADOS = { pendiente: 'pendiente', resuelto: 'resuelto', descartado: 'descartado' };
  function tarjeta(v) {
    const act = actuales[v.juego] || '', nueva = act && v.version && mayor(act, v.version);
    const estado = `<span class="estado${v.estado === 'pendiente' ? ' si' : ''}">${ESTADOS[v.estado] || v.estado}${v.estado === 'resuelto' && v.resuelto_version ? ' en ' + esc(v.resuelto_version) : ''}</span>`;
    const pista = v.estado === 'pendiente' && nueva ? `<div class="meta">Ya hay una versión posterior desplegada (${esc(act)}): puede que ya esté resuelto.</div>` : '';
    const hecho = v.gestionado ? `<div class="meta">${esc(v.gestionado_por || '')} · ${fecha(v.gestionado)}${v.gestion_nota ? ' · ' + esc(v.gestion_nota) : ''}</div>` : '';
    return `<article class="cuenta${v.estado === 'pendiente' ? '' : ' marcada'}" data-id="${v.id}" data-o="${v.origen}"><div class="cab"><span class="codigo">${esc(v.juego)}</span>${estado}`
      + `<span class="meta">${v.origen === 'juego' ? 'desde el juego · ' + esc(v.tipo) : v.voto > 0 ? 'biblioteca · SÍ lo recomienda' : 'biblioteca · NO lo recomienda'} · escrito en la versión <b>${esc(v.version || '?')}</b> · ${fecha(v.creado)}${act ? ' · ahora ' + esc(act) : ''}</span></div>`
      + respuestas(v)
      + `<p style="margin:6px 0;white-space:pre-wrap;overflow-wrap:anywhere">${esc(v.nota)}</p><div class="meta">${v.origen === 'juego' ? (v.contacto ? 'Acepta que le escribamos: ' + esc(v.email || '(sin email)') : 'Sin permiso para contactar · cuenta ' + esc(v.corto)) : esc(v.email || 'cuenta ' + v.corto)}</div>${pista}${hecho}`
      + `<div class="accion"><input type="text" class="g-ver" placeholder="Versión que lo resuelve" maxlength="24" value="${esc(v.resuelto_version || act)}" aria-label="Versión que lo resuelve">`
      + `<input type="text" class="g-nota" placeholder="Nota del equipo (opcional)" maxlength="300" value="${esc(v.gestion_nota || '')}" aria-label="Nota del equipo"></div>`
      + `<div class="accion">${v.estado !== 'resuelto' ? '<button data-e="resuelto">Resuelto</button>' : ''}${v.estado !== 'descartado' ? '<button data-e="descartado">Descartar</button>' : ''}${v.estado !== 'pendiente' ? '<button data-e="pendiente">Reabrir</button>' : ''}</div></article>`;
  }
  // las respuestas a las preguntas del feedback ({id_de_pregunta: respuesta}); el texto libre sale debajo, como siempre
  const respuestas = v => (v.respuestas && Object.keys(v.respuestas).length
    ? '<div class="meta" style="margin:6px 0">' + Object.entries(v.respuestas).map(([k, r]) => `<div><b>${esc(k)}</b>: ${esc(r)}</div>`).join('') + '</div>' : '');
  // los comentarios de la biblioteca (votos con nota) y el feedback que mandan desde los juegos, juntos y por fecha
  const todos = () => [...V.votos.filter(v => v.nota).map(v => Object.assign({ origen: 'biblioteca' }, v)),
    ...((F && F.feedback) || []).map(f => Object.assign({ origen: 'juego', nota: f.texto }, f))].sort((a, b) => (a.creado < b.creado ? 1 : -1));
  function pinta() {
    if (!V) return;
    const juego = $('v-juego').value, ver = $('v-estado').value;
    $('v-juego').innerHTML = '<option value="">todos los juegos</option>' + [...new Set([...V.juegos.map(j => j.juego), ...((F && F.feedback) || []).map(f => f.juego)])].sort().map(j => `<option value="${esc(j)}"${j === juego ? ' selected' : ''}>${esc(j)}</option>`).join('');
    const fb = (F && F.feedback) || [];
    $('v-resumen').innerHTML = `<div><b>Desde los juegos</b><span>${fmt(fb.length)} comentarios · ${fmt(fb.filter(f => f.estado === 'pendiente').length)} pendientes · ${fmt(fb.filter(f => f.contacto).length)} aceptan contacto</span></div>` + (V.juegos.length ? V.juegos.map(j => `<div><b>${esc(j.juego)}</b><span>SÍ ${fmt(j.arriba)} · NO ${fmt(j.abajo)} · ${fmt(j.pendientes)} comentarios pendientes de ${fmt(j.notas)}</span></div>`).join('') : '<div><b>Sin votos todavía</b></div>');
    const L = todos().filter(v => (!juego || v.juego === juego) && (ver === 'todos' || ver === v.estado));
    $('v-lista').innerHTML = L.length ? L.map(tarjeta).join('') : '<div class="vacio"><b>Nada con ese filtro</b></div>';
    for (const j of new Set(L.map(v => v.juego))) if (!(j in actuales)) versionDe(j).then(() => pinta());
  }
  async function cargar() {
    try {
      V = await rpc('gestion_votos', { p_token: leerToken() });
      F = await rpc('gestion_feedback', { p_token: leerToken() }).catch(() => null);   // si la función aún no está, solo salen los de la biblioteca
      $('v-aviso').textContent = ''; pinta();
    }
    catch (e) { $('v-aviso').textContent = /Could not find the function|PGRST202/.test(String(e.message)) ? 'La función del servidor aún no está aplicada.' : textoError(e); }
  }
  $('v-lista').onclick = async ev => {
    const b = ev.target.closest('button[data-e]'); if (!b) return;
    const a = b.closest('article'); b.disabled = true; $('v-aviso').textContent = '';
    try {
      await rpc(a.dataset.o === 'juego' ? 'gestion_feedback_marcar' : 'gestion_voto_marcar', { p_token: leerToken(), p_id: Number(a.dataset.id), p_estado: b.dataset.e, p_version: a.querySelector('.g-ver').value, p_nota: a.querySelector('.g-nota').value });
      await cargar();
    } catch (e) { $('v-aviso').textContent = textoError(e); b.disabled = false; }
  };
  function pestana(votos) {
    $('pan-cuentas').hidden = votos; $('pan-votos').hidden = !votos;
    $('t-cuentas').classList.toggle('activa', !votos); $('t-votos').classList.toggle('activa', votos);
    if (votos) cargar();
  }
  $('t-cuentas').onclick = () => pestana(false); $('t-votos').onclick = () => pestana(true);
  $('v-juego').onchange = $('v-estado').onchange = pinta; $('v-recargar').onclick = cargar;
  $('salir').addEventListener('click', () => { V = F = null; pestana(false); });
})();

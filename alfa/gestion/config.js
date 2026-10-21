// Fans Of · /gestion: la pestaña CONFIG. La configuración del servidor (tabla config_servidor, servidor/70): valores que SIEMPRE se aplican, a todas las plataformas (hoy, las monedas de cada juego).
// No son flags: no abren ni cierran nada y no van por plataforma. Aquí solo se CAMBIA el valor de una clave que ya existe (el JSON); crear una clave nueva es cosa de desarrollo.
// Datos: gestion_config(token) y gestion_config_poner(token, clave, juego, valor), servidor/70-config-y-flags-por-plataforma.sql. Usa lo de gestion/index.html: rpc(), leerToken(), esc(), textoError() y $().
'use strict';
(() => {
  let L = [];
  const sinFuncion = e => /does not exist|PGRST202|404/.test(String(e.message));
  function pinta() {
    $('cf-lista').innerHTML = L.length ? L.map((c, i) => `<article class="cuenta"><div class="cab"><span class="codigo">${esc(c.clave)}</span><span class="estado">${esc(c.juego === '*' ? 'todos los juegos' : c.juego)}</span></div>
      <textarea id="cf-v-${i}" rows="${Math.min(10, JSON.stringify(c.valor, null, 2).split('\\n').length + 1)}" spellcheck="false" aria-label="Valor de ${esc(c.clave)} (${esc(c.juego)})" style="width:100%;font-family:monospace">${esc(JSON.stringify(c.valor, null, 2))}</textarea>
      <div class="accion"><button type="button" class="fuerte" data-i="${i}">Guardar</button><span class="meta" id="cf-m-${i}"></span></div></article>`).join('')
      : '<div class="vacio"><b>No hay configuración en el servidor</b>La crea desarrollo cuando una función necesita valores que se puedan cambiar sin desplegar.</div>';
  }
  async function cargar() {
    $('cf-aviso').textContent = '';
    try { L = (await rpc('gestion_config', { p_token: leerToken() })).config || []; pinta(); }
    catch (e) { $('cf-aviso').textContent = sinFuncion(e) ? 'La configuración aún no está en el panel (servidor/70-config-y-flags-por-plataforma.sql).' : textoError(e); }
  }
  const tabs = () => [...document.querySelectorAll('#tabs button')].map(b => b.id).filter(id => id !== 't-config');
  function mostrar(si) {
    $('pan-config').hidden = !si; $('t-config').classList.toggle('activa', si);
    if (si) { document.querySelectorAll('#vista-panel > div[id^="pan-"]').forEach(p => { if (p.id !== 'pan-config') p.hidden = true; }); tabs().forEach(t => $(t).classList.remove('activa')); cargar(); }
  }
  $('t-config').onclick = () => mostrar(true);
  tabs().forEach(t => $(t).addEventListener('click', () => { $('pan-config').hidden = true; $('t-config').classList.remove('activa'); }));
  $('menu').addEventListener('click', () => { $('pan-config').hidden = true; $('t-config').classList.remove('activa'); });
  $('salir').addEventListener('click', () => mostrar(false));
  $('cf-lista').onclick = async ev => {
    const b = ev.target.closest('button[data-i]'); if (!b) return;
    const i = +b.dataset.i, c = L[i]; $('cf-aviso').textContent = '';
    let valor; try { valor = JSON.parse($('cf-v-' + i).value); } catch (e) { $('cf-aviso').textContent = 'Eso no es un JSON válido: ' + e.message; return; }
    b.disabled = true;
    try { await rpc('gestion_config_poner', { p_token: leerToken(), p_clave: c.clave, p_juego: c.juego, p_valor: valor }); c.valor = valor; $('cf-m-' + i).textContent = 'Guardado. Los juegos lo leen al arrancar y cada 5 minutos.'; }
    catch (e) { $('cf-aviso').textContent = /config_no_existe/.test(String(e.message)) ? 'Esa configuración ya no existe: la habrá borrado desarrollo.' : sinFuncion(e) ? 'Guardar aún no está activado en el servidor (servidor/70-config-y-flags-por-plataforma.sql).' : textoError(e); }
    b.disabled = false;
  };
})();

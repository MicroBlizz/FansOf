// Fans Of · /gestion: la pestaña FLAGS. Solo ABRIR y CERRAR los flags remotos que ya existen en la tabla flags (servidor/22-flags.sql). Crearlos y borrarlos es cosa de desarrollo.
// Datos: gestion_flags(token) y gestion_flag_valor(token, nombre, juego, plataforma, valor), servidor/69-gestion-flags.sql. Usa lo de gestion/index.html: rpc(), leerToken(), esc(), textoError() y $().
// Solo sale lo que hay en la tabla: cuando desarrollo borra un flag (ya es normal para todos), desaparece de aquí.
'use strict';
(() => {
  let L = [];
  const otras = ['t-cuentas', 't-votos', 't-roles', 't-reportes', 't-rend'];
  const sinFuncion = e => /does not exist|PGRST202|404/.test(String(e.message));
  function pinta() {
    $('fl-lista').innerHTML = L.length ? L.map((f, i) => `<article class="cuenta"><div class="cab"><span class="codigo">${esc(f.nombre)}</span><span class="estado">${esc(f.juego)} · ${esc(f.plataforma)}</span><span class="estado">${f.valor ? 'ABIERTO' : 'CERRADO'}${f.porcentaje < 100 ? ' · ' + f.porcentaje + ' %' : ''}</span></div>
      ${f.mensaje || f.dato ? `<div class="meta">${f.mensaje ? 'Mensaje: ' + esc(f.mensaje) : ''}${f.dato ? ' · Dato: ' + esc(f.dato) : ''}</div>` : ''}
      <div class="accion"><button data-i="${i}" class="${f.valor ? 'peligro' : 'fuerte'}">${f.valor ? 'Cerrar' : 'Abrir'}</button></div></article>`).join('')
      : '<div class="vacio"><b>No hay flags en el servidor</b>Los crea desarrollo cuando introduce una función nueva tras un flag.</div>';
  }
  async function cargar() {
    $('fl-aviso').textContent = '';
    try { L = (await rpc('gestion_flags', { p_token: leerToken() })).flags || []; pinta(); }
    catch (e) { $('fl-aviso').textContent = sinFuncion(e) ? 'Los flags aún no están en el panel (servidor/69-gestion-flags.sql).' : textoError(e); }
  }
  function mostrar(si) {
    $('pan-flags').hidden = !si; $('t-flags').classList.toggle('activa', si);
    if (si) { document.querySelectorAll('#vista-panel > div[id^="pan-"]').forEach(p => { if (p.id !== 'pan-flags') p.hidden = true; }); otras.forEach(t => $(t).classList.remove('activa')); cargar(); }
  }
  $('t-flags').onclick = () => mostrar(true);
  otras.forEach(t => $(t).addEventListener('click', () => { $('pan-flags').hidden = true; $('t-flags').classList.remove('activa'); }));
  $('menu').addEventListener('click', () => { $('pan-flags').hidden = true; $('t-flags').classList.remove('activa'); });
  $('salir').addEventListener('click', () => mostrar(false));
  $('fl-lista').onclick = async ev => {
    const b = ev.target.closest('button[data-i]'); if (!b) return;
    const f = L[+b.dataset.i]; $('fl-aviso').textContent = ''; b.disabled = true;
    try { await rpc('gestion_flag_valor', { p_token: leerToken(), p_nombre: f.nombre, p_juego: f.juego, p_plataforma: f.plataforma, p_valor: !f.valor }); await cargar(); }
    catch (e) { $('fl-aviso').textContent = /flag_no_existe/.test(String(e.message)) ? 'Ese flag ya no existe: lo habrá borrado desarrollo.' : sinFuncion(e) ? 'Abrir y cerrar aún no está activado en el servidor (servidor/69-gestion-flags.sql).' : textoError(e); b.disabled = false; await cargar(); }
  };
})();

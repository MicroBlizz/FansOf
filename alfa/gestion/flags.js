// Fans Of · /gestion: la pestaña FLAGS. Abrir y cerrar los flags remotos (tabla flags, servidor/22-flags.sql) sin entrar en Supabase: valor, porcentaje, mensaje, crear y borrar.
// Datos: gestion_flags(token), gestion_flag_poner(...) y gestion_flag_borrar(...), servidor/69-gestion-flags.sql. Usa lo de gestion/index.html: rpc(), leerToken(), esc(), textoError() y $().
// Solo sale lo que hay en la tabla: al borrar un flag (cuando se limpia del código) desaparece de aquí.
'use strict';
(() => {
  let L = [];
  const otras = ['t-cuentas', 't-votos', 't-roles', 't-reportes', 't-rend'];
  const clave = f => `${f.nombre}|${f.juego}|${f.plataforma}`;
  const sinFuncion = e => /does not exist|PGRST202|404/.test(String(e.message));
  function pinta() {
    $('fl-lista').innerHTML = L.length ? L.map((f, i) => `<article class="cuenta"><div class="cab"><span class="codigo">${esc(f.nombre)}</span><span class="estado">${esc(f.juego)} · ${esc(f.plataforma)}</span><span class="estado">${f.valor ? 'ABIERTO' : 'CERRADO'}${f.porcentaje < 100 ? ' · ' + f.porcentaje + ' %' : ''}</span></div>
      ${f.mensaje || f.dato ? `<div class="meta">${f.mensaje ? 'Mensaje: ' + esc(f.mensaje) : ''}${f.dato ? ' · Dato: ' + esc(f.dato) : ''}</div>` : ''}
      <div class="accion"><button data-i="${i}" data-a="${f.valor ? 'cerrar' : 'abrir'}" class="${f.valor ? 'peligro' : 'fuerte'}">${f.valor ? 'Cerrar' : 'Abrir'}</button> <button data-i="${i}" data-a="editar">Editar</button> <button data-i="${i}" data-a="borrar" class="peligro">Borrar</button></div></article>`).join('')
      : '<div class="vacio"><b>No hay flags en el servidor</b>Crea uno con el formulario de arriba (el nombre es el del código: por ejemplo decks-telemetria, para el juego decks).</div>';
  }
  async function cargar() {
    $('fl-aviso').textContent = '';
    try { L = (await rpc('gestion_flags', { p_token: leerToken() })).flags || []; pinta(); }
    catch (e) { $('fl-aviso').textContent = sinFuncion(e) ? 'Los flags aún no están en el panel (servidor/69-gestion-flags.sql).' : textoError(e); }
  }
  async function poner(f, cambios) {
    const x = Object.assign({ mensaje: '', mensaje_en: '', dato: '' }, f, cambios);
    await rpc('gestion_flag_poner', { p_token: leerToken(), p_nombre: x.nombre, p_juego: x.juego, p_plataforma: x.plataforma, p_valor: !!x.valor, p_porcentaje: +x.porcentaje, p_mensaje: x.mensaje || '', p_mensaje_en: x.mensaje_en || '', p_dato: x.dato || '' });
    await cargar();
  }
  function mostrar(si) {
    $('pan-flags').hidden = !si; $('t-flags').classList.toggle('activa', si);
    if (si) { document.querySelectorAll('#vista-panel > div[id^="pan-"]').forEach(p => { if (p.id !== 'pan-flags') p.hidden = true; }); otras.forEach(t => $(t).classList.remove('activa')); cargar(); }
  }
  $('t-flags').onclick = () => mostrar(true);
  otras.forEach(t => $(t).addEventListener('click', () => { $('pan-flags').hidden = true; $('t-flags').classList.remove('activa'); }));
  $('menu').addEventListener('click', () => { $('pan-flags').hidden = true; $('t-flags').classList.remove('activa'); });
  $('salir').addEventListener('click', () => mostrar(false));
  $('fl-form').onsubmit = async ev => {
    ev.preventDefault(); $('fl-aviso').textContent = '';
    try {
      await poner({ nombre: $('fl-nombre').value.trim(), juego: $('fl-juego').value.trim() || '*', plataforma: $('fl-plat').value }, { valor: $('fl-valor').value === '1', porcentaje: $('fl-pct').value || 100, mensaje: $('fl-msg').value, mensaje_en: $('fl-msg-en').value, dato: $('fl-dato').value });
      $('fl-nombre').value = ''; $('fl-msg').value = ''; $('fl-msg-en').value = ''; $('fl-dato').value = '';
    } catch (e) { $('fl-aviso').textContent = /nombre_no_vale/.test(String(e.message)) ? 'El nombre solo lleva minúsculas, números y guiones.' : /juego_no_vale/.test(String(e.message)) ? 'El juego es * (todos) o el nombre de su carpeta (decks, rumble…).' : sinFuncion(e) ? 'Los flags aún no están en el panel (servidor/69-gestion-flags.sql).' : textoError(e); }
  };
  $('fl-lista').onclick = async ev => {
    const b = ev.target.closest('button[data-a]'); if (!b) return;
    const f = L[+b.dataset.i], a = b.dataset.a; $('fl-aviso').textContent = '';
    try {
      if (a === 'abrir' || a === 'cerrar') { b.disabled = true; await poner(f, { valor: a === 'abrir' }); }
      else if (a === 'borrar') {
        if (!confirm(`¿Borrar el flag «${f.nombre}» (${f.juego}, ${f.plataforma})? El código vuelve a valer lo que diga él.`)) return;
        b.disabled = true; await rpc('gestion_flag_borrar', { p_token: leerToken(), p_nombre: f.nombre, p_juego: f.juego, p_plataforma: f.plataforma }); await cargar();
      } else {   // editar: se vuelca en el formulario (misma clave = actualiza la fila)
        $('fl-nombre').value = f.nombre; $('fl-juego').value = f.juego; $('fl-plat').value = f.plataforma; $('fl-valor').value = f.valor ? '1' : '0'; $('fl-pct').value = f.porcentaje;
        $('fl-msg').value = f.mensaje || ''; $('fl-msg-en').value = f.mensaje_en || ''; $('fl-dato').value = f.dato || ''; $('fl-form').scrollIntoView({ behavior: 'smooth' });
      }
    } catch (e) { $('fl-aviso').textContent = sinFuncion(e) ? 'Los flags aún no están en el panel (servidor/69-gestion-flags.sql).' : textoError(e); b.disabled = false; }
  };
})();

// Fans Of · /gestion: la pestaña ROLES (dar y quitar roles de cuenta por correo: alfa, beta, admin).
// Datos: gestion_roles(token), gestion_rol_dar(token, correo, rol) y gestion_rol_quitar(...), servidor/34-alfa-roles.sql. Usa lo de gestion/index.html: rpc(), leerToken(), esc(), fecha(), textoError() y $().
// El rol alfa va separado del dinero real (ADR 146, servidor/163 y 164): no se da a una cuenta con compras pagadas, y quitarlo borra todo lo guardado de la cuenta (se pide confirmación).
'use strict';
(() => {
  const SIN_COMPRAS = 'Esa cuenta tiene compras pagadas: el rol alfa no se da a una cuenta con dinero real (las reembolsadas no cuentan). Para probar la alfa, usa otra cuenta.';
  const avisoReseteo = correo => `¿Quitar el rol alfa a ${correo}?\n\nSe BORRA todo lo guardado de esa cuenta en TODOS los juegos: monedas, objetos, progreso, marcas y puntos y ligas PvP. No se puede deshacer.\n\nSe quedan el acceso, el nombre y los demás roles.`;
  function tarjeta(r, pendiente) {
    return `<article class="cuenta"><div class="cab"><span class="codigo">${esc(r.email || r.corto)}</span><span class="estado">${esc(r.rol)}${pendiente ? ' · invitación' : ''}</span><span class="meta">${pendiente ? 'invitado' : 'desde'} ${fecha(r.otorgado)}</span></div>
      <div class="accion"><button class="peligro" data-correo="${esc(r.email || '')}" data-rol="${esc(r.rol)}"${pendiente ? ' data-pendiente="1"' : ''}>${pendiente ? 'Cancelar invitación' : 'Quitar'}</button></div></article>`;
  }
  function pinta(L, P) {
    const todo = P.map(r => tarjeta(r, true)).concat(L.map(r => tarjeta(r, false)));
    $('r-lista').innerHTML = todo.length ? todo.join('') : '<div class="vacio"><b>Nadie tiene roles</b>Da el primero con el formulario de arriba.</div>';
  }
  async function cargar() {
    $('r-aviso').textContent = '';
    try { const d = await rpc('gestion_roles', { p_token: leerToken() }); pinta(d.roles || [], d.pendientes || []); } catch (e) { $('r-aviso').textContent = textoError(e); }
  }
  // al abrir la pestaña se pide también el buzón de solicitudes de beta (solicitudes-beta.js, cargado antes), y al aceptar una se vuelve a pedir esta lista
  GESTION_NAV.seccion({ id: 'roles', pan: 'pan-roles', etiqueta: 'Roles', orden: 3, cargar: () => Promise.all([GESTION_SOLICITUDES_BETA.cargar(), cargar()]) });
  GESTION_SOLICITUDES_BETA.alAceptar(cargar);
  $('r-form').onsubmit = async ev => {
    ev.preventDefault(); $('r-aviso').textContent = '';
    try {
      const r = await rpc('gestion_rol_dar', { p_token: leerToken(), p_correo: $('r-correo').value, p_rol: $('r-rol').value });
      $('r-correo').value = ''; await cargar();
      if (r && r.pendiente) $('r-aviso').textContent = 'Invitación guardada: el rol se activa solo cuando esa persona entre con ese correo (con Google o con el enlace que le llega al correo).';
    } catch (e) { $('r-aviso').textContent = /tiene_compras/.test(String(e.message)) ? SIN_COMPRAS : /cuenta_no_existe/.test(String(e.message)) ? 'El servidor aún no admite invitaciones (falta aplicar servidor/122).' : textoError(e); }
  };
  $('r-lista').onclick = async ev => {
    const b = ev.target.closest('button[data-rol]'); if (!b) return;
    // quitar el rol alfa de una cuenta resetea la cuenta entera en el servidor; cancelar una invitación no borra nada
    if (b.dataset.rol === 'alfa' && !b.dataset.pendiente && !confirm(avisoReseteo(b.dataset.correo))) return;
    b.disabled = true;
    try { await rpc('gestion_rol_quitar', { p_token: leerToken(), p_correo: b.dataset.correo, p_rol: b.dataset.rol }); await cargar(); }
    catch (e) { $('r-aviso').textContent = /tiene_compras/.test(String(e.message)) ? 'Esa cuenta tiene una compra pagada con dinero real: no se le quita el rol alfa (borraría lo que pagó). Hay que mirarlo a mano.' : /does not exist|PGRST202|404/.test(String(e.message)) ? 'Quitar roles aún no está activado en el servidor.' : textoError(e); b.disabled = false; }
  };
})();

// Fans Of · /gestion: la pestaña ROLES (dar y quitar roles de cuenta por correo: alfa, beta, admin).
// Datos: gestion_roles(token), gestion_rol_dar(token, correo, rol) y gestion_rol_quitar(...), servidor/34-alfa-roles.sql. Usa lo de gestion/index.html: rpc(), leerToken(), esc(), fecha(), textoError() y $().
'use strict';
(() => {
  function pinta(L) {
    $('r-lista').innerHTML = L.length ? L.map(r => `<article class="cuenta"><div class="cab"><span class="codigo">${esc(r.email || r.corto)}</span><span class="estado">${esc(r.rol)}</span><span class="meta">desde ${fecha(r.otorgado)}</span></div>
      <div class="accion"><button class="peligro" data-correo="${esc(r.email || '')}" data-rol="${esc(r.rol)}">Quitar</button></div></article>`).join('')
      : '<div class="vacio"><b>Nadie tiene roles</b>Da el primero con el formulario de arriba.</div>';
  }
  async function cargar() {
    $('r-aviso').textContent = '';
    try { pinta((await rpc('gestion_roles', { p_token: leerToken() })).roles || []); } catch (e) { $('r-aviso').textContent = textoError(e); }
  }
  GESTION_NAV.seccion({ id: 'roles', pan: 'pan-roles', etiqueta: 'Roles', orden: 3, cargar });
  $('r-form').onsubmit = async ev => {
    ev.preventDefault(); $('r-aviso').textContent = '';
    try {
      await rpc('gestion_rol_dar', { p_token: leerToken(), p_correo: $('r-correo').value, p_rol: $('r-rol').value });
      $('r-correo').value = ''; await cargar();
    } catch (e) { $('r-aviso').textContent = /cuenta_no_existe/.test(String(e.message)) ? 'Esa cuenta aún no ha entrado con Google.' : textoError(e); }
  };
  $('r-lista').onclick = async ev => {
    const b = ev.target.closest('button[data-rol]'); if (!b) return;
    b.disabled = true;
    try { await rpc('gestion_rol_quitar', { p_token: leerToken(), p_correo: b.dataset.correo, p_rol: b.dataset.rol }); await cargar(); }
    catch (e) { $('r-aviso').textContent = /does not exist|PGRST202|404/.test(String(e.message)) ? 'Quitar roles aún no está activado en el servidor.' : textoError(e); b.disabled = false; }
  };
})();

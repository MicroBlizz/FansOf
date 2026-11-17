// Fans Of · /gestion → Roles: el BUZÓN DE SOLICITUDES DE BETA (ADR 106). Quien pide ser beta tester desde el feedback de un juego sale aquí, con cuántos
// comentarios ha mandado; aceptar le da el rol beta con un toque y rechazar cierra la solicitud. La pestaña Roles lleva el contador de pendientes.
// Datos: gestion_solicitudes_beta(token) y gestion_solicitud_beta_resolver(token, usuario, aceptar), servidor/127. Usa lo de gestion/index.html:
// rpc(), leerToken(), esc(), fecha(), textoError() y $(). roles.js (que se carga después) lo pide al abrir la pestaña y se apunta con alAceptar() para refrescar su lista.
'use strict';
const GESTION_SOLICITUDES_BETA = (() => {
  let trasAceptar = null;
  const etiqueta = n => 'Roles' + (n > 0 ? ' (' + n + ')' : '');
  const comentarios = n => (n === 1 ? '1 comentario enviado' : (n || 0) + ' comentarios enviados');
  function tarjeta(s) {
    return `<article class="cuenta"><div class="cab"><span class="codigo">${esc(s.email || 'cuenta ' + s.corto)}</span><span class="estado si">quiere ser beta</span>`
      + `<span class="meta">pedido el ${fecha(s.creado)} · ${comentarios(s.feedback)}</span></div>`
      + `<div class="accion"><button class="fuerte" data-beta="si" data-usuario="${esc(s.usuario)}">Aceptar: dar rol beta</button><button data-beta="no" data-usuario="${esc(s.usuario)}">Rechazar</button></div></article>`;
  }
  const lista = L => (L.length ? '<div class="caja ayuda"><b>Solicitudes de beta.</b> Lo han pedido desde el feedback de un juego. Aceptar da el rol beta al momento.</div>' + L.map(tarjeta).join('') : '');
  // un servidor sin el SQL 127 no tiene la función: el buzón se queda vacío y callado, y Roles sigue funcionando
  const sinFuncion = e => /Could not find the function|PGRST202|does not exist/.test(String(e && e.message));
  async function cargar() {
    try {
      const d = await rpc('gestion_solicitudes_beta', { p_token: leerToken() });
      $('r-solicitudes').innerHTML = lista(d.solicitudes || []);
      GESTION_NAV.etiqueta('roles', etiqueta(d.pendientes || 0));
    } catch (e) { $('r-solicitudes').innerHTML = ''; if (!sinFuncion(e)) $('r-aviso').textContent = textoError(e); }
  }
  async function resolver(usuario, aceptar) {
    await rpc('gestion_solicitud_beta_resolver', { p_token: leerToken(), p_usuario: usuario, p_aceptar: aceptar });
    await cargar();
    if (aceptar && trasAceptar) await trasAceptar();
  }
  $('r-solicitudes').onclick = async ev => {
    const b = ev.target.closest('button[data-beta]'); if (!b) return;
    b.disabled = true; $('r-aviso').textContent = '';
    try { await resolver(b.dataset.usuario, b.dataset.beta === 'si'); }
    catch (e) { $('r-aviso').textContent = /sin_solicitud/.test(String(e.message)) ? 'Esa solicitud ya estaba resuelta.' : textoError(e); b.disabled = false; if (/sin_solicitud/.test(String(e.message))) await cargar(); }
  };
  document.addEventListener('gestion-abierta', cargar);   // al entrar en /gestion: el contador sale sin abrir la pestaña
  if (!$('vista-panel').hidden) cargar();                  // la sesión se abrió antes de que llegara este archivo: el aviso ya pasó
  return { cargar, etiqueta, tarjeta, lista, alAceptar: f => { trasAceptar = f; } };
})();

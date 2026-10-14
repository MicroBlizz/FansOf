// Fans Of · la CUENTA en la web de la librería (index.html de la raíz): entrar con Google o con un enlace al email, ver con qué cuenta estás y salir.
// Es la misma cuenta que usan los juegos (core/js/sistema/cuenta.js: el mismo navegador comparte la sesión), así que entrar aquí es entrar en todos.
// Sin contraseña. Un invitado (sin email) puede mirarlo todo; la cuenta hace falta para guardar favoritos en la nube y para votar (biblioteca/votos.js).
// Expone window.abrirCuenta(motivo) y window.conCuenta(); avisa con el evento 'cuenta-cambio' cuando se entra o se sale.
// Usa lo que define index.html y novedades/ventana.js: t(), esc(), CUENTA.
'use strict';
(() => {
  const base = location.pathname.replace(/[^/]*$/, '');
  const conCuenta = () => !!(CUENTA.activa && !CUENTA.invitado && CUENTA.email);
  window.conCuenta = conCuenta;

  // aviso corto abajo: lo usan también los favoritos y los votos
  let reloj = 0;
  window.avisar = (texto, bien) => {
    let a = document.getElementById('aviso-web');
    if (!a) { a = document.createElement('div'); a.id = 'aviso-web'; a.setAttribute('role', 'status'); document.body.appendChild(a); }
    a.textContent = texto; a.className = 'on' + (bien ? ' bien' : ''); clearTimeout(reloj); reloj = setTimeout(() => { a.className = ''; }, 4500);
  };
  window.toast = (m, bien) => window.avisar(m, bien);   // cuenta.js avisa con toast() al volver del enlace del email

  const menu = document.getElementById('m-cuenta');
  function pintarMenu() {
    menu.textContent = conCuenta() ? t('Mi cuenta') : t('Entrar');
    menu.classList.toggle('dentro', conCuenta());
  }
  const modal = document.createElement('div');
  modal.className = 'cuenta-fondo'; modal.hidden = true;
  modal.innerHTML = '<div class="cuenta-caja" role="dialog" aria-modal="true" aria-labelledby="cuenta-titulo"><button type="button" class="nov-x ol" aria-label="Cerrar" data-x>✕</button><div id="cuenta-cuerpo"></div></div>';
  document.body.appendChild(modal);
  const cuerpo = modal.querySelector('#cuenta-cuerpo');
  const cerrar = () => { modal.hidden = true; if (!document.getElementById('ficha') || document.getElementById('ficha').hidden) document.body.style.overflow = ''; };
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('[data-x]')) cerrar(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) { cerrar(); e.stopImmediatePropagation(); } }, true);

  const fallo = e => window.avisar(t('No ha salido bien: {m}', { m: (e && e.message) || '?' }));
  const leyes = () => `<small class="cuenta-leyes"><a href="${base}privacidad/?lang=${IDIOMA.actual}" target="_blank" rel="noopener">${esc(t('Privacidad'))}</a> · <a href="${base}condiciones/?lang=${IDIOMA.actual}" target="_blank" rel="noopener">${esc(t('Condiciones de uso'))}</a></small>`;
  const boton = (texto, clase, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = clase; b.textContent = texto; b.onclick = fn; return b; };
  let google = false;

  function pintar(motivo) {
    cuerpo.innerHTML = '';
    if (conCuenta()) {
      cuerpo.innerHTML = `<h3 class="ol" id="cuenta-titulo">${esc(t('TU CUENTA'))}</h3><p>${t('Has entrado con {e}. Es la misma cuenta en todos los juegos.', { e: '<b>' + esc(CUENTA.email) + '</b>' })}</p>`;
      const fila = document.createElement('div'); fila.className = 'cuenta-botones';
      fila.append(boton(t('CERRAR SESIÓN'), 'boton sec', () => CUENTA.cerrarSesion().then(() => { window.avisar(t('Sesión cerrada'), true); pintarMenu(); document.dispatchEvent(new CustomEvent('cuenta-cambio')); cerrar(); }, fallo)));
      cuerpo.append(fila); cuerpo.insertAdjacentHTML('beforeend', leyes());
      return;
    }
    cuerpo.innerHTML = `<h3 class="ol" id="cuenta-titulo">${esc(t('ENTRAR'))}</h3>`
      + `<p>${esc(motivo || t('Entra con tu cuenta para marcar tus juegos favoritos y votar. Sin contraseña.'))}</p>`
      + (CUENTA.emailPendiente ? `<p class="cuenta-pendiente">${t('Te hemos enviado un enlace a {e}. Ábrelo en este aparato para terminar.', { e: '<b>' + esc(CUENTA.emailPendiente) + '</b>' })}</p>` : '')
      + `<input id="cuenta-email-web" type="email" autocomplete="email" inputmode="email" placeholder="tu@email.com" aria-label="Email">`;
    const fila = document.createElement('div'); fila.className = 'cuenta-botones';
    // un solo botón para el email: si ya hay cuenta con él, entra; si no, la crea (guardando también lo del invitado de este navegador)
    fila.append(boton(t('ENVIARME UN ENLACE'), 'boton ol', async () => {
      const v = (document.getElementById('cuenta-email-web').value || '').trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { window.avisar(t('Ese email no parece bien escrito')); return; }
      try {
        try { await CUENTA.entrarConEmail(v); } catch (err) {
          if (!/signups? not allowed|not found/i.test(err.message)) throw err;
          await CUENTA.guardarConEmail(v);
        }
        window.avisar(t('Mira tu correo y abre el enlace'), true); pintar(motivo);
      } catch (err) { fallo(err); }
    }));
    if (google) fila.append(boton(t('ENTRAR CON GOOGLE'), 'boton sec', () => CUENTA.entrarConGoogle()));
    cuerpo.append(fila);
    cuerpo.insertAdjacentHTML('beforeend', `<small class="cuenta-edad">${esc(t('Para guardar tu cuenta tienes que tener 14 años o más. Si eres menor, pide a tu padre, madre o tutor que lo haga contigo.'))}</small>` + leyes());
  }
  window.abrirCuenta = motivo => {
    pintar(motivo); modal.hidden = false; document.body.style.overflow = 'hidden';
    const i = document.getElementById('cuenta-email-web'); if (i) setTimeout(() => i.focus(), 50);
  };
  menu.onclick = e => { e.preventDefault(); window.abrirCuenta(); };
  pintarMenu();
  if (CUENTA.activa) CUENTA.googleListo().then(v => { google = v; });
  // al volver del enlace del email la sesión llega en la dirección: cuenta.js la lee al cargar la página, un momento después
  window.addEventListener('load', () => setTimeout(() => { pintarMenu(); document.dispatchEvent(new CustomEvent('cuenta-cambio')); }, 1500));
})();

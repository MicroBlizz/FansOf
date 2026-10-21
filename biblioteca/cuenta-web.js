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
    if (conCuenta() && CUENTA.foto) {   // la foto del perfil público de Google, si entraste con Google (sin referrer: Google no sabe de qué página viene)
      const im = document.createElement('img'); im.className = 'm-foto'; im.alt = ''; im.referrerPolicy = 'no-referrer'; im.src = CUENTA.foto; im.onerror = () => im.remove();
      menu.prepend(im);
    }
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

  // cambia el nombre de la cuenta, el mismo en todos los juegos (perfil global, servidor/36-perfil.sql); sin esa función en la base de datos avisa sin romper nada
  async function cambiarNombre() {
    const v = (document.getElementById('cuenta-nombre-web').value || '').replace(/[^\p{L}\p{N} _.\-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 14);
    if (v.length < 3) { window.avisar(t('Tiene que tener al menos 3 letras o números.')); return; }
    try {
      const r = await CUENTA.ponNombre(v);
      window.avisar(t('Ahora te llamas {n}', { n: (r && r.nombre) || v }), true);
    } catch (err) {
      const m = String((err && err.message) || '');
      window.avisar(/nombre_no_vale/.test(m) ? t('Ese nombre no está permitido. Prueba con otro.') : /nombre_corto/.test(m) ? t('Tiene que tener al menos 3 letras o números.') : /perfil_nombre|404|PGRST/.test(m) ? t('Esto todavía no está disponible. Vuelve a probar en un rato.') : t('No ha salido bien: {m}', { m: m || '?' }));
    }
  }
  // enlaces directos para quien tiene el rol: «alfa» → la copia de pruebas, «admin» → el panel /gestion (sin rol, sin función o sin red no se enseña nada)
  async function rolEnlaces(donde) {
    const tiene = async rol => { try { return !!(await CUENTA.rpc('tiene_rol', { p_rol: rol })); } catch (e) { return false; } };
    const [alfa, admin] = await Promise.all([NUCLEO.alfa ? false : tiene('alfa'), tiene('admin')]);
    if (!donde.isConnected || donde.querySelector('.cuenta-roles') || !(alfa || admin)) return;
    const fila = document.createElement('div'); fila.className = 'cuenta-botones cuenta-roles';
    const enlace = (txt, href) => { const a = document.createElement('a'); a.className = 'boton sec'; a.href = href; a.textContent = txt; fila.append(a); };
    if (alfa) enlace(t('IR A LA ALFA'), base + 'alfa/');
    if (admin) enlace(t('IR A GESTIÓN'), base + 'gestion/');
    const leyesEl = donde.querySelector('.cuenta-leyes'); leyesEl ? leyesEl.before(fila) : donde.append(fila);
  }

  function pintar(motivo) {
    cuerpo.innerHTML = '';
    if (conCuenta()) {
      cuerpo.innerHTML = `<h3 class="ol" id="cuenta-titulo">${esc(t('TU CUENTA'))}</h3><p>${t('Has entrado con {e}. Es la misma cuenta en todos los juegos.', { e: '<b>' + esc(CUENTA.email) + '</b>' })}</p>`;
      const fila = document.createElement('div'); fila.className = 'cuenta-botones';
      fila.append(boton(t('CERRAR SESIÓN'), 'boton sec', () => CUENTA.cerrarSesion().then(() => { window.avisar(t('Sesión cerrada'), true); pintarMenu(); document.dispatchEvent(new CustomEvent('cuenta-cambio')); cerrar(); }, fallo)));
      cuerpo.append(fila);
      cuerpo.insertAdjacentHTML('beforeend', `<h4 class="cuenta-sub ol">${esc(t('TU NOMBRE'))}</h4><p>${esc(t('Es el que ven los demás en las clasificaciones y las partidas. Se cambia en todos tus juegos.'))}</p><input id="cuenta-nombre-web" type="text" maxlength="14" autocomplete="nickname" placeholder="${esc(t('Tu nombre'))}" aria-label="${esc(t('Tu nombre'))}">`);
      const fn = document.createElement('div'); fn.className = 'cuenta-botones';
      fn.append(boton(t('CAMBIAR NOMBRE'), 'boton ol', cambiarNombre));
      cuerpo.append(fn);
      // estado del caos primordial ilimitado: es de la cuenta y vale en todos los juegos (la función pide un juego, pero el pase no depende de él)
      const pase = document.createElement('p'); pase.className = 'cuenta-pase'; cuerpo.append(pase);
      CUENTA.rpc('pvp_energia', { p_juego: 'rumble' }).then(e => {
        if (!e || !pase.isConnected) return;
        const vivo = e.pase_hasta && new Date(e.pase_hasta) > new Date();
        if (!vivo && !e.activa) return;
        const f = vivo ? new Date(e.pase_hasta).toLocaleDateString(IDIOMA.actual === 'en' ? 'en-GB' : 'es-ES') : '';
        pase.innerHTML = '<b>' + esc(t('CAOS PRIMORDIAL ILIMITADO')) + '</b>: ' + esc(vivo ? t('activo hasta el {f}. Vale en todos los juegos.', { f }) : t('sin activar. Se usa la energía de cada juego.'));
      }).catch(() => { /* sin red o sin la función: no se enseña nada */ });
      CUENTA.perfil().then(p => { const i = document.getElementById('cuenta-nombre-web'); if (p && p.nombre && i && !i.value) i.value = p.nombre; });
      rolEnlaces(cuerpo);
      cuerpo.insertAdjacentHTML('beforeend', leyes());
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

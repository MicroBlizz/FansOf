// Fans Of · CUENTA en la pantalla de Opciones: una fila que pone core en cualquier juego (encima de «Tu progreso»).
// Invitado: guardar con email o entrar en una cuenta que ya existe. Con cuenta: cerrar sesión o borrarla. La lógica está en cuenta.js.
'use strict';
(() => {
  if (!CUENTA.activa) return;
  const ancla = document.getElementById('btn-export'), lista = ancla && ancla.closest('.opt-list');
  if (!lista) return;
  const fila = document.createElement('div'); fila.className = 'opt-row col'; fila.id = 'opt-cuenta';
  lista.insertBefore(fila, ancla.closest('.opt-row'));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const boton = (texto, fn, peligro) => { const b = document.createElement('button'); b.className = 'btn-ghost ol' + (peligro ? ' danger' : ''); b.textContent = texto; b.onclick = () => { play('select'); fn(); }; return b; };
  const fallo = e => toast(tr('No ha salido bien: {m}', { m: (e && e.message) || '?' }));

  // pide un email en la ventana de confirmación; ok recibe lo escrito
  function pedirEmail(titulo, texto, ok) {
    confirmBox(titulo, texto + '<br><br><input id="cuenta-email" type="email" autocomplete="email" inputmode="email" placeholder="tu@email.com" style="width:100%;font-size:18px;padding:8px;border-radius:10px">', tr('ENVIAR'), () => {
      const v = (document.getElementById('cuenta-email').value || '').trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { toast(tr('Ese email no parece bien escrito')); return; }
      ok(v);
    });
    setTimeout(() => { const i = document.getElementById('cuenta-email'); if (i) i.focus(); }, 50);
  }
  const edad = () => tr('Para guardar tu cuenta tienes que tener 14 años o más. Si eres menor, pide a tu padre, madre o tutor que lo haga contigo.');

  const ponen = (...b) => b.filter(Boolean), base = location.pathname.replace(/games\/[^/]*\/.*$/, '');
  let google = false;   // se sabe al preguntar al servidor; hasta entonces no hay botón
  function pintar() {
    fila.innerHTML = ''; const span = document.createElement('span'), fila2 = document.createElement('div'); fila2.className = 'row';
    if (CUENTA.invitado) {
      span.innerHTML = '<b>' + tr('Cuenta') + '</b><br>' + (CUENTA.emailPendiente
        ? tr('Te hemos enviado un enlace a {e}. Ábrelo en este aparato para terminar.', { e: '<b>' + esc(CUENTA.emailPendiente) + '</b>' })
        : tr('Tu progreso se guarda como invitado, solo en este navegador. Guárdalo con tu email para no perderlo y jugar en otros aparatos.'));
      fila2.append(...ponen(
        google && boton(tr('GUARDAR CON GOOGLE'), () => confirmBox(tr('GUARDAR TU PROGRESO'), tr('Entrarás con tu cuenta de Google y tu progreso quedará guardado en ella.') + '<small>' + edad() + '</small>', tr('CONTINUAR'), () => CUENTA.guardarConGoogle().catch(fallo))),
        boton(tr('GUARDAR CON EMAIL'), () => pedirEmail(tr('GUARDAR TU PROGRESO'), tr('Te mandaremos un enlace, sin contraseña. Al abrirlo, tu progreso queda guardado en tu cuenta.') + '<small>' + edad() + '</small>',
          e => CUENTA.guardarConEmail(e).then(() => { toast(tr('Mira tu correo y abre el enlace'), true); pintar(); }, fallo))),
        google && boton(tr('ENTRAR CON GOOGLE'), () => CUENTA.entrarConGoogle()),
        boton(tr('YA TENGO CUENTA'), () => pedirEmail(tr('ENTRAR EN TU CUENTA'), tr('Te mandaremos un enlace para entrar. Si aquí también has jugado, después te preguntaremos con qué partida sigues.'),
          e => CUENTA.entrarConEmail(e).then(() => toast(tr('Mira tu correo y abre el enlace'), true), err => (/signups? not allowed|not found/i.test(err.message) ? toast(tr('No hay ninguna cuenta con ese email')) : fallo(err)))))));
    } else {
      span.innerHTML = '<b>' + tr('Cuenta') + '</b><br>' + tr('Tu progreso se guarda en tu cuenta {e}: puedes jugar en cualquier aparato.', { e: '<b>' + esc(CUENTA.email) + '</b>' });
      fila2.append(
        boton(tr('CERRAR SESIÓN'), () => confirmBox(tr('¿CERRAR SESIÓN?'), tr('Tu progreso sigue en tu cuenta y en este aparato. Para recuperarlo en otro, usa «Ya tengo cuenta».'), tr('CERRAR SESIÓN'), () => CUENTA.cerrarSesion().then(() => { toast(tr('Sesión cerrada'), true); pintar(); }))),
        boton(tr('BORRAR CUENTA'), () => confirmBox(tr('¿BORRAR TU CUENTA?'), tr('Se borran tu cuenta y tus partidas en la nube, de todos los juegos. Lo que hay en este aparato se queda.') + '<small>' + tr('No se puede deshacer.') + '</small>', tr('BORRAR'), () => CUENTA.borrarCuenta().then(() => { toast(tr('Cuenta borrada'), true); pintar(); }, fallo)), true));
    }
    const leyes = document.createElement('small'); leyes.innerHTML = '<a href="' + base + 'privacidad/?lang=' + IDIOMA.actual + '" target="_blank" rel="noopener">' + tr('Privacidad') + '</a> · <a href="' + base + 'condiciones/?lang=' + IDIOMA.actual + '" target="_blank" rel="noopener">' + tr('Condiciones de uso') + '</a>';
    fila.append(span, fila2, leyes);
  }
  pintar();
  CUENTA.googleListo().then(v => { if (v) { google = true; pintar(); } });
  hook('cuenta', pintar);
})();

// Fans Of · la CUENTA en la web de la librería (index.html de la raíz): entrar con Google o con un enlace al email y, dentro, la ventana MI CUENTA (tarea #299).
// Es la misma cuenta que usan los juegos (core/js/sistema/cuenta.js: el mismo navegador comparte la sesión), así que entrar aquí es entrar en todos.
// Sin contraseña. Un invitado (sin email) puede mirarlo todo; la cuenta hace falta para guardar favoritos en la nube y para votar (biblioteca/votos.js).
// MI CUENTA: arriba tu cara (88 px), tu nombre y tu email; debajo tres pestañas, PERFIL y MIS JUEGOS (biblioteca/cuenta-pestanas.js) y AJUSTES
// (biblioteca/cuenta-ajustes.js). Las reglas son CUENTA_PERFIL (cuenta-perfil.js) y los casos de uso CUENTA_WEB_CASOS (cuenta-casos.js); aquí se juntan
// con CUENTA de core (los puertos) y se pinta el marco. Tu cara también sale en el menú (menu.js, pintaMenuCuenta) y se recuerda en este navegador
// ('fansof-cuenta-cara') para que el menú de las demás páginas la pinte sin preguntar al servidor.
// Expone window.abrirCuenta(motivo), window.conCuenta(), window.avisar() y CUENTA_WEB.juegoFavorito() (el juego favorito del perfil);
// avisa con 'cuenta-cambio' cuando se entra o se sale y con 'cuenta-perfil' cuando llega o cambia el perfil.
// Usa lo que define index.html, novedades/ventana.js y tienda.js: t(), esc(), CUENTA, TARJETAS y datosDe().
'use strict';
const CUENTA_WEB = (() => {
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

  // los casos de uso con CUENTA de core como puertos
  const casos = CUENTA_WEB_CASOS.crear({ caras: CARAS_CUENTA, reglas: CUENTA_PERFIL, servidor: {
    leer: () => CUENTA.rpc('perfil_leer', {}),
    ponerCara: id => CUENTA.rpc('perfil_poner_cara', { p_cara: id }),
    ponerJuego: id => CUENTA.rpc('perfil_poner_juego', { p_juego: id }),
    ponerNombre: n => CUENTA.ponNombre(n),
    misDatos: () => CUENTA.rpc('mis_datos', {}),
    cambiarEmail: e => CUENTA.guardarConEmail(e),   // PUT /auth/v1/user con el email: Supabase manda el enlace de confirmación al nuevo
    cerrar: alcance => CUENTA.cerrarSesion(alcance),
    borrar: () => CUENTA.borrarCuenta(),
  } });
  let lista = null;   // los juegos que se pueden elegir como favorito: las tarjetas de la biblioteca (tienda.js)
  const juegos = () => lista || (lista = CUENTA_PERFIL.juegosDeBiblioteca(TARJETAS.map(s => { const d = datosDe(s); return { tarjeta: s.id, nombre: d.nombre, jugar: d.jugar }; })));
  const aviso = r => t(CUENTA_PERFIL.aviso(r.motivo), { m: r.mensaje || '?' });

  // ---------- la cara del menú, recordada en este navegador para las demás páginas ----------
  const CARA_GUARDADA = 'fansof-cuenta-cara';
  let perfilListo = false;
  function caraGuardada() {
    try { const c = JSON.parse(localStorage.getItem(CARA_GUARDADA) || 'null'); return c && c.usuario === CUENTA.usuario ? c.src : ''; } catch (e) { return ''; }
  }
  function recordarCara(vista) {
    try {
      if (vista.tipo === 'cara') localStorage.setItem(CARA_GUARDADA, JSON.stringify({ usuario: CUENTA.usuario, src: CARAS_CUENTA.ruta(vista.id) }));
      else localStorage.removeItem(CARA_GUARDADA);
    } catch (e) { /* sin almacenamiento: el menú de las demás páginas enseña la foto de Google, como antes */ }
  }
  const caraVisible = () => CUENTA_PERFIL.caraVisible({ cara: casos.perfil().cara, foto: CUENTA.foto }, CARAS_CUENTA, '');
  function pintarMenu() {
    const con = conCuenta(), vista = caraVisible();
    const imagen = !con ? '' : (perfilListo ? (vista.tipo === 'defecto' ? '' : vista.src) : (caraGuardada() || CUENTA.foto));
    window.pintaMenuCuenta(con, imagen, con ? t('Mi cuenta') : t('Entrar'));
  }
  // el perfil ha llegado o ha cambiado: el menú, lo recordado y quien escuche (la franja de la portada)
  function alCambiarPerfil() {
    perfilListo = true; recordarCara(caraVisible()); pintarMenu(); pintarCabecera();
    document.dispatchEvent(new CustomEvent('cuenta-perfil'));
  }
  async function cargarPerfil() {
    if (!conCuenta()) { casos.olvidar(); perfilListo = false; pintarMenu(); document.dispatchEvent(new CustomEvent('cuenta-perfil')); return; }
    const r = await casos.cargar();
    if (r.ok) alCambiarPerfil();   // sin red se queda lo de antes (el menú con la cara recordada)
  }

  // ---------- la ventana ----------
  const menu = document.getElementById('m-cuenta');
  const modal = document.createElement('div');
  modal.className = 'cuenta-fondo'; modal.hidden = true;
  modal.innerHTML = '<div class="cuenta-caja" role="dialog" aria-modal="true" aria-labelledby="cuenta-titulo"><button type="button" class="nov-x ol" aria-label="Cerrar" data-x>✕</button><div id="cuenta-cuerpo"></div></div>';
  document.body.appendChild(modal);
  const caja = modal.querySelector('.cuenta-caja'), cuerpo = modal.querySelector('#cuenta-cuerpo');
  const cerrar = () => { modal.hidden = true; if (!document.getElementById('ficha') || document.getElementById('ficha').hidden) document.body.style.overflow = ''; };
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('[data-x]')) cerrar(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) { cerrar(); e.stopImmediatePropagation(); } }, true);

  const fallo = e => window.avisar(e && e.prueba ? e.message : t('No ha salido bien: {m}', { m: (e && e.message) || '?' }));   // el invitado de prueba del panel DEV (ADR 227) lo dice tal cual
  const leyes = () => `<small class="cuenta-leyes"><a href="${base}privacidad/?idioma=${IDIOMA.actual}" target="_blank" rel="noopener">${esc(t('Privacidad'))}</a> · <a href="${base}condiciones/?idioma=${IDIOMA.actual}" target="_blank" rel="noopener">${esc(t('Condiciones de uso'))}</a></small>`;
  const boton = (texto, clase, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = clase; b.textContent = texto; b.onclick = fn; return b; };
  let google = false, pestana = 'perfil';

  // tras salir o borrar la cuenta: todo vuelve a «Entrar»
  function salir(texto) {
    window.avisar(texto, true); casos.olvidar(); perfilListo = false; recordarCara({ tipo: 'defecto' });
    pintarMenu(); document.dispatchEvent(new CustomEvent('cuenta-cambio')); document.dispatchEvent(new CustomEvent('cuenta-perfil')); cerrar();
  }
  // lo que reciben las pestañas
  const ctx = { casos, juegos, base, aviso, fallo, boton, leyes, alCambiarPerfil, salir };

  function pintarCabecera() {
    const cab = cuerpo.querySelector('.cu-cab'); if (!cab) return;
    const p = casos.perfil(), vista = caraVisible();
    const img = cab.querySelector('.cu-cara');
    img.src = vista.src; img.referrerPolicy = vista.tipo === 'foto' ? 'no-referrer' : '';
    img.alt = vista.tipo === 'cara' ? CUENTA_PERFIL.nombrePersonaje(vista.id, CARAS_CUENTA) : '';
    cab.querySelector('h3').textContent = p.nombre || t('Aún sin nombre');
  }
  function pintarPestana(cual) {
    pestana = CUENTA_PERFIL.pestana(cual);
    cuerpo.querySelectorAll('.cu-pestanas button').forEach(b => { const on = b.dataset.pestana === pestana; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    const panel = cuerpo.querySelector('.cu-panel'); panel.innerHTML = '';
    ({ perfil: CUENTA_PESTANAS.perfil, juegos: CUENTA_PESTANAS.juegos, ajustes: CUENTA_AJUSTES.pintar })[pestana](panel, ctx);
  }
  const NOMBRES = { perfil: 'PERFIL', juegos: 'MIS JUEGOS', ajustes: 'AJUSTES' };
  function pintarDentro() {
    caja.classList.add('cuenta-dentro');
    cuerpo.innerHTML = `<div class="cu-cab"><img class="cu-cara" width="88" height="88" alt=""><div class="cu-quien"><h3 class="ol" id="cuenta-titulo"></h3><p class="cu-email">${esc(CUENTA.email)}</p></div></div>
      <div class="cu-pestanas" role="tablist">${CUENTA_PERFIL.PESTANAS.map(p => `<button type="button" role="tab" data-pestana="${p}">${esc(t(NOMBRES[p]))}</button>`).join('')}</div>
      <div class="cu-panel" role="tabpanel"></div>`;
    cuerpo.querySelector('.cu-cara').onerror = e => { const d = CARAS_CUENTA.ruta(CUENTA_PERFIL.CARA_POR_DEFECTO); if (!e.target.src.endsWith(d)) e.target.src = d; };   // la foto de Google que no carga
    cuerpo.querySelector('.cu-pestanas').onclick = e => { const b = e.target.closest('[data-pestana]'); if (b) pintarPestana(b.dataset.pestana); };
    pintarCabecera(); pintarPestana(pestana);
  }

  function pintarFuera(motivo) {
    caja.classList.remove('cuenta-dentro');
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
        window.avisar(t('Mira tu correo y abre el enlace'), true); pintarFuera(motivo);
      } catch (err) { fallo(err); }
    }));
    if (google) fila.append(boton(t('ENTRAR CON GOOGLE'), 'boton sec', () => CUENTA.entrarConGoogle().catch(fallo)));
    cuerpo.append(fila);
    cuerpo.insertAdjacentHTML('beforeend', `<small class="cuenta-edad">${esc(t('Para guardar tu cuenta tienes que tener 14 años o más. Si eres menor, pide a tu padre, madre o tutor que lo haga contigo.'))}</small>` + leyes());
  }

  window.abrirCuenta = motivo => {
    if (conCuenta()) { pestana = 'perfil'; pintarDentro(); cargarPerfil(); } else pintarFuera(motivo);
    modal.hidden = false; document.body.style.overflow = 'hidden';
    const i = document.getElementById('cuenta-email-web'); if (i) setTimeout(() => i.focus(), 50);
  };
  menu.onclick = e => { e.preventDefault(); window.abrirCuenta(); };
  pintarMenu();
  if (location.hash === '#cuenta') { history.replaceState(null, '', location.pathname + location.search); setTimeout(() => window.abrirCuenta(), 300); }   // venías de otra página de la web con «Entrar»
  if (CUENTA.activa) CUENTA.googleListo().then(v => { google = v; });
  cargarPerfil();
  document.addEventListener('cuenta-cambio', () => { if (conCuenta() !== perfilListo) cargarPerfil(); });
  // al volver del enlace del email la sesión llega en la dirección: cuenta.js la lee al cargar la página, un momento después
  window.addEventListener('load', () => setTimeout(() => { pintarMenu(); document.dispatchEvent(new CustomEvent('cuenta-cambio')); }, 1500));

  // el juego favorito de la cuenta si hay cuenta, perfil y el juego sigue en la biblioteca; si no, null
  const juegoFavorito = () => (conCuenta() && perfilListo ? CUENTA_PERFIL.juegoElegido(casos.perfil(), juegos()) : null);
  return Object.freeze({ juegoFavorito });
})();

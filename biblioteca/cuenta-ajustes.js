// Fans Of · MI CUENTA de la web · la pestaña AJUSTES (pantalla, tarea #299). La abre biblioteca/cuenta-web.js con su ctx.
//   · TU EMAIL: cambiarlo (llega un enlace al nuevo; hasta abrirlo sigue el de antes).
//   · TUS DATOS: DESCARGAR MIS DATOS, todo lo que la base guarda de tu cuenta (mis_datos(), servidor/182) en «fansof-mis-datos-AAAA-MM-DD.json».
//   · SESIÓN: CERRAR SESIÓN (este navegador) y CERRAR SESIÓN EN TODOS LOS APARATOS.
//   · los enlaces por rol (alfa, gestión, beta en Android), BORRAR MI CUENTA en rojo (hay que escribir BORRAR) y Privacidad · Condiciones.
// Usa t(), esc(), CUENTA, NUCLEO, CUENTA_PERFIL y avisar().
'use strict';
const CUENTA_AJUSTES = (() => {
  const sub = (texto, clase = '') => `<h4 class="cuenta-sub ol${clase}">${esc(t(texto))}</h4>`;
  const fila = (...botones) => { const f = document.createElement('div'); f.className = 'cuenta-botones'; f.append(...botones); return f; };

  function seccionEmail(caja, ctx) {
    caja.insertAdjacentHTML('beforeend', sub('TU EMAIL') + `<p>${t('Ahora entras con {e}.', { e: '<b>' + esc(CUENTA.email) + '</b>' })}</p>`
      + (CUENTA.emailPendiente ? `<p class="cuenta-pendiente">${t('Te hemos enviado un enlace a {e}. Ábrelo para terminar el cambio.', { e: '<b>' + esc(CUENTA.emailPendiente) + '</b>' })}</p>` : '')
      + `<input id="cu-email-nuevo" type="email" autocomplete="email" inputmode="email" placeholder="${esc(t('Tu email nuevo'))}" aria-label="${esc(t('Tu email nuevo'))}">`);
    caja.append(fila(ctx.boton(t('CAMBIAR EMAIL'), 'boton sec', async () => {
      const r = await ctx.casos.cambiarEmail(caja.querySelector('#cu-email-nuevo').value, CUENTA.email);
      if (!r.ok) { window.avisar(ctx.aviso(r)); return; }
      window.avisar(t('Mira el correo de {e} y abre el enlace para terminar.', { e: r.email }), true);
      caja.innerHTML = ''; pintar(caja, ctx);   // sale el aviso de «te hemos enviado un enlace»
    })));
  }

  // el archivo lo guarda el navegador (sin pasar por ningún servidor nuestro)
  function guardarArchivo(nombre, texto) {
    const url = URL.createObjectURL(new Blob([texto], { type: 'application/json' })), a = document.createElement('a');
    a.href = url; a.download = nombre; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function seccionDatos(caja, ctx) {
    caja.insertAdjacentHTML('beforeend', sub('TUS DATOS') + `<p>${esc(t('Todo lo que guardamos de tu cuenta, en un archivo.'))}</p>`);
    const b = ctx.boton(t('DESCARGAR MIS DATOS'), 'boton sec', async () => {
      b.disabled = true;
      const hoy = new Date(), r = await ctx.casos.descargarDatos({ año: hoy.getFullYear(), mes: hoy.getMonth() + 1, dia: hoy.getDate() });
      b.disabled = false;
      if (!r.ok) { window.avisar(ctx.aviso(r)); return; }
      guardarArchivo(r.archivo, r.texto); window.avisar(t('Descargado: {a}', { a: r.archivo }), true);
    });
    caja.append(fila(b));
  }

  function seccionSesion(caja, ctx) {
    caja.insertAdjacentHTML('beforeend', sub('SESIÓN'));
    const cierra = (enTodos, hecho) => async () => {
      const r = await ctx.casos.cerrarSesion(enTodos);
      if (r.ok) ctx.salir(t(hecho)); else window.avisar(ctx.aviso(r));
    };
    caja.append(fila(ctx.boton(t('CERRAR SESIÓN'), 'boton sec', cierra(false, 'Sesión cerrada')),
      ctx.boton(t('CERRAR SESIÓN EN TODOS LOS APARATOS'), 'boton sec', cierra(true, 'Sesión cerrada en todos tus aparatos'))));
  }

  // enlaces directos para quien tiene el rol: «alfa» → la copia de pruebas, «admin» → el panel /gestion, «alfa», «beta» o «admin» → la beta de Android en Play (sin rol, sin función o sin red no se enseña nada)
  async function rolEnlaces(caja, base) {
    await CUENTA.roles.refrescar(['alfa', 'admin', 'beta']);   // una sola pregunta al servidor; sin red vale lo recordado
    const [alfa, admin, beta] = [!NUCLEO.alfa && CUENTA.roles.tiene('alfa'), CUENTA.roles.tiene('admin'), CUENTA.roles.tiene('beta')];
    if (!caja.isConnected || caja.querySelector('.cuenta-roles') || !(alfa || admin || beta)) return;
    const f = document.createElement('div'); f.className = 'cuenta-botones cuenta-roles';
    const enlace = (txt, href) => { const a = document.createElement('a'); a.className = 'boton sec'; a.href = href; a.textContent = txt; f.append(a); };
    if (alfa) enlace(t('IR A LA ALFA'), base + 'alfa/');
    if (admin) enlace(t('IR A GESTIÓN'), base + 'gestion/?seccion=tablero');   // directo al tablero; /gestion entra sola con esta misma sesión (tarea #146)
    if (alfa || beta || admin) { enlace(t('BETA EN ANDROID'), 'https://play.google.com/apps/internaltest/4699431656758562735'); f.lastChild.target = '_blank'; f.lastChild.rel = 'noopener'; }   // Prueba interna de Play: solo la ven los de la lista de testers
    caja.querySelector('.cu-borrar-sub').before(f);
  }

  // BORRAR MI CUENTA: el botón rojo abre la confirmación; hay que escribir la palabra (BORRAR, o su traducción) y pulsar otra vez
  function seccionBorrar(caja, ctx) {
    const palabra = t(CUENTA_PERFIL.PALABRA_BORRAR);
    caja.insertAdjacentHTML('beforeend', sub('BORRAR MI CUENTA', ' cu-borrar-sub') + `<p>${esc(t('Se borran tu cuenta y tus partidas en la nube, en todos los juegos. No se puede deshacer.'))}</p>`
      + `<div class="cu-confirma" hidden><p>${esc(t('Escribe {p} para confirmar.', { p: palabra }))}</p><input id="cu-borrar" type="text" autocomplete="off" aria-label="${esc(t('Escribe {p} para confirmar.', { p: palabra }))}"></div>`);
    const confirma = caja.querySelector('.cu-confirma');
    const b = ctx.boton(t('BORRAR MI CUENTA'), 'boton cu-rojo', async () => {
      if (confirma.hidden) { confirma.hidden = false; caja.querySelector('#cu-borrar').focus(); return; }
      const r = await ctx.casos.borrarCuenta(caja.querySelector('#cu-borrar').value, palabra);
      if (r.ok) ctx.salir(t('Cuenta borrada')); else window.avisar(r.motivo === 'sin_confirmar' ? t('Escribe {p} para confirmar.', { p: palabra }) : ctx.aviso(r));
    });
    caja.append(fila(b));
  }

  function pintar(caja, ctx) {
    seccionEmail(caja, ctx); seccionDatos(caja, ctx); seccionSesion(caja, ctx); seccionBorrar(caja, ctx);
    caja.insertAdjacentHTML('beforeend', ctx.leyes());
    rolEnlaces(caja, ctx.base).catch(() => { /* sin red: sin enlaces por rol */ });
  }
  return Object.freeze({ pintar });
})();

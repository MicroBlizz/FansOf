// Fans Of · REPORTE DE PRUEBA: un botón «!» para mandarnos una situación mientras se juega, en CUALQUIER juego.
//
// Quién lo ve: solo las cuentas con el rol «admin» (tabla roles), en todos los juegos y en cualquier copia (release, alfa o desarrollo).
// El servidor lo vuelve a comprobar al recibir el reporte (servidor/102-reportes-prueba-solo-admin.sql).
// Qué manda: la nota del probador, una captura pequeña, los últimos 60 s de recorrido (una muestra por segundo) y lo que el juego
// quiera contar (dónde está, qué pasa…), más el aparato (pantalla, núcleos, gráfica). Va con su cuenta; no es telemetría, pero
// igualmente solo sale si tiene encendido «Datos de partida anónimos» (DATOS.activo()).
// Servidor: enviar_reporte_prueba (servidor/98-reportes-prueba.sql). Se lee y se comenta en /gestion → <juego> → Reportes de prueba.
//
// Para los juegos (todo opcional; sin nada, el botón sale solo y manda captura del lienzo y fps):
//   REPORTE.activar({ datos: () => ({ x, z, zona… }), captura: () => 'data:image/jpeg;base64,…' | null })
//   REPORTE.traza({ … }) una vez por segundo, con lo que interese seguir (si no, se apuntan los fps).
'use strict';
const REPORTE = (() => {
  const tr_ = typeof tr === 'function' ? tr : s => s;
  const MUESTRAS = 60;
  const ANCHO_CAPTURA = 720;

  let juego = {};            // lo que aporta el juego: { datos, captura }
  let boton = null, ventana = null;
  const trazaJuego = [], trazaFps = [];

  // --- cuándo y dónde
  const hayCuenta = () => typeof CUENTA !== 'undefined' && CUENTA.activa;
  const datosPermitidos = () => typeof DATOS === 'undefined' || DATOS.activo();
  function plataforma() {
    if (window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform()) return 'app';
    return /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) ? 'movil' : 'pc';
  }
  const idJuego = () => (typeof AJUSTES !== 'undefined' && AJUSTES.id) || location.pathname.split('/').filter(Boolean).pop() || 'desconocido';

  // --- lo que se mide sin ayuda del juego
  let gpuNombre;
  function gpu() {   // qué gráfica usa el navegador (en un PC con integrada y dedicada, a veces la integrada)
    if (gpuNombre !== undefined) return gpuNombre;
    try {
      const g = document.createElement('canvas').getContext('webgl'), ext = g && g.getExtension('WEBGL_debug_renderer_info');
      gpuNombre = g ? String(ext ? g.getParameter(ext.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER)).slice(0, 120) : null;
    } catch (e) { gpuNombre = null; }
    return gpuNombre;
  }
  function aparato() {
    return { ua: navigator.userAgent.slice(0, 160), ancho: innerWidth, alto: innerHeight, dpr: devicePixelRatio || 1,
      nucleos: navigator.hardwareConcurrency || null, memoria: navigator.deviceMemory || null, idioma: navigator.language, gpu: gpu() };
  }
  // fps por segundo, siempre (sirve a cualquier juego)
  function midiendoFps() {
    let fotos = 0, inicio = performance.now();
    const paso = ahora => {
      fotos++;
      if (ahora - inicio >= 1000) {
        guarda(trazaFps, { t: Math.round(ahora / 1000), fps: Math.round((fotos * 1000) / (ahora - inicio)) });
        fotos = 0; inicio = ahora;
      }
      requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  }
  function guarda(lista, muestra) { lista.push(muestra); if (lista.length > MUESTRAS) lista.shift(); }
  // la captura por defecto: el lienzo más grande de la página, reducido (un lienzo WebGL sin preserveDrawingBuffer puede salir negro:
  // esos juegos pasan su propia captura)
  function capturaLienzo() {
    const lienzos = [...document.querySelectorAll('canvas')].filter(c => c.width > 0 && c.height > 0);
    if (!lienzos.length) return null;
    const mayor = lienzos.reduce((a, b) => (a.width * a.height >= b.width * b.height ? a : b));
    const escala = Math.min(1, ANCHO_CAPTURA / mayor.width), c = document.createElement('canvas');
    c.width = Math.round(mayor.width * escala); c.height = Math.round(mayor.height * escala);
    c.getContext('2d').drawImage(mayor, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.6);
  }
  function captura() {
    try { return juego.captura ? juego.captura() : capturaLienzo(); } catch (e) { return null; }
  }

  // --- la ventana
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function aviso() {
    if (!hayCuenta()) return tr_('Para reportar, inicia sesión.');
    if (!datosPermitidos()) return tr_('Para reportar, activa «Datos de partida anónimos» en Opciones.');
    return '';
  }
  function abre() {
    if (ventana) return;
    const imagen = captura(), bloqueo = aviso();
    ventana = document.createElement('div'); ventana.id = 'rp-fondo';
    ventana.innerHTML = `<div id="rp-caja" role="dialog">
      <h3>${esc(tr_('Reportar una situación'))}</h3>
      ${imagen ? `<img src="${imagen}" alt="">` : ''}
      <textarea id="rp-texto" maxlength="1000" placeholder="${esc(tr_('Qué pasa aquí: qué esperabas y qué ves'))}"></textarea>
      <small>${esc(tr_('Se manda con tu nota: dónde estás, cómo va el juego, los últimos 60 s de recorrido y la captura.'))}</small>
      ${bloqueo ? `<div class="rp-aviso">${esc(bloqueo)}</div>` : ''}
      <div class="rp-fila">
        <button type="button" id="rp-no">${esc(tr_('Cancelar'))}</button>
        <button type="button" id="rp-si" class="rp-ok" ${bloqueo ? 'disabled' : ''}>${esc(tr_('Enviar'))}</button>
      </div></div>`;
    document.body.appendChild(ventana);
    for (const ev of ['keydown', 'keyup', 'keypress']) ventana.addEventListener(ev, e => e.stopPropagation());   // lo que se teclea no llega al juego
    ventana.querySelector('#rp-no').onclick = cierra;
    ventana.querySelector('#rp-si').onclick = () => envia(ventana.querySelector('#rp-texto').value, imagen);
    // en pantallas táctiles no se enfoca solo: el teclado taparía media ventana antes de ver la captura
    if (!matchMedia('(pointer: coarse)').matches) setTimeout(() => { const t = ventana && ventana.querySelector('#rp-texto'); if (t) t.focus(); }, 50);
  }
  function cierra() { if (ventana) { ventana.remove(); ventana = null; } }
  function cuerpo(texto, imagen) {
    let datos = {};
    try { datos = (juego.datos && juego.datos()) || {}; } catch (e) { datos = { error: String(e && e.message) }; }
    datos.traza = (trazaJuego.length ? trazaJuego : trazaFps).slice(-MUESTRAS);
    datos.aparato = aparato();
    return { juego: idJuego(), version: String(NUCLEO.version || '').slice(0, 32), alfa: !!NUCLEO.alfa, plataforma: plataforma(),
      nombre: null, texto: String(texto || '').trim() || '(sin nota)', datos, captura: imagen };
  }
  async function envia(texto, imagen) {
    const b = ventana.querySelector('#rp-si'); b.disabled = true; b.textContent = '…';
    let r;
    try { r = await CUENTA.rpc('enviar_reporte_prueba', { p_datos: cuerpo(texto, imagen) }); } catch (e) { r = { ok: false, motivo: String(e && e.message) }; }
    if (r && r.ok) { cierra(); avisoBreve(tr_('Reporte enviado. ¡Gracias!')); return; }
    b.disabled = false; b.textContent = tr_('Enviar');
    let m = ventana.querySelector('.rp-aviso');
    if (!m) { m = document.createElement('div'); m.className = 'rp-aviso'; b.parentNode.before(m); }
    m.textContent = tr_('No se ha podido enviar') + (r && r.motivo ? ' (' + r.motivo + ')' : '');
  }
  function avisoBreve(texto) {
    const d = document.createElement('div'); d.className = 'rp-breve'; d.textContent = texto;
    document.body.appendChild(d); setTimeout(() => d.remove(), 2200);
  }
  function estilo() {
    if (document.getElementById('rp-estilo')) return;
    const s = document.createElement('style'); s.id = 'rp-estilo';
    s.textContent = `#rp-boton{position:fixed;left:8px;top:50%;transform:translateY(-50%);z-index:99990;width:38px;height:38px;border-radius:50%;border:3px solid #20102c;background:#ffcb3d;color:#20102c;font:800 22px/1 "Baloo 2",sans-serif;box-shadow:0 3px 0 #20102c;cursor:pointer;opacity:.85}
#rp-boton:active{transform:translateY(calc(-50% + 2px));box-shadow:0 1px 0 #20102c}
#rp-fondo{position:fixed;inset:0;z-index:99991;background:rgba(10,8,28,.6);display:grid;place-items:center;padding:16px;overflow:auto}
#rp-caja{width:min(480px,100%);background:#fff6ea;color:#20102c;border:3px solid #20102c;border-radius:14px;box-shadow:0 5px 0 #20102c;padding:14px 16px;display:grid;gap:10px;font:600 15px "Baloo 2",sans-serif;box-sizing:border-box;max-height:calc(100dvh - 32px);overflow-y:auto}
#rp-caja h3{margin:0;font-size:20px}#rp-caja textarea{width:100%;min-height:90px;box-sizing:border-box;border:2px solid #20102c;border-radius:8px;padding:8px;font:inherit;resize:vertical;background:#fff;color:#20102c}
#rp-caja img{width:100%;max-height:34vh;object-fit:contain;background:#20102c;border-radius:8px;border:2px solid #20102c}#rp-caja .rp-fila{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}
#rp-caja button{border:3px solid #20102c;border-radius:10px;padding:6px 14px;font:800 15px "Baloo 2",sans-serif;background:#cdb9ea;color:#20102c;box-shadow:0 3px 0 #20102c;cursor:pointer}
#rp-caja button.rp-ok{background:#7ee04a}#rp-caja small{color:#5b5668}#rp-caja .rp-aviso{color:#b8202c}
@media (orientation:landscape) and (max-height:520px){#rp-fondo{padding:8px}#rp-caja{width:min(760px,100%);max-height:calc(100dvh - 16px);grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-content:start;padding:10px 12px;gap:8px}#rp-caja h3{grid-column:1/-1;font-size:17px}#rp-caja img{grid-column:1;grid-row:2/span 4;max-height:calc(100dvh - 90px);align-self:start}#rp-caja>:not(h3):not(img){grid-column:2}#rp-caja textarea{min-height:70px}}
.rp-breve{position:fixed;left:50%;top:14%;transform:translateX(-50%);z-index:99992;background:#7ee04a;color:#20102c;border:3px solid #20102c;border-radius:12px;padding:8px 16px;font:800 18px "Baloo 2",sans-serif;box-shadow:0 3px 0 #20102c}`;
    document.head.appendChild(s);
  }
  // --- quién: se pregunta al servidor si la cuenta es admin al arrancar y cada vez que cambia la cuenta (entrar, salir)
  let esAdmin = false, parado = false;
  async function compruebaAdmin() {
    let admin = false;
    if (hayCuenta() && !CUENTA.invitado) { try { admin = (await CUENTA.rpc('tiene_rol', { p_rol: 'admin' })) === true; } catch (e) { admin = false; } }
    esAdmin = admin;
    if (esAdmin) ponBoton(); else quitaBoton();
  }

  function ponBoton() {
    if (boton || !esAdmin || parado) return;
    estilo();
    boton = document.createElement('button');
    Object.assign(boton, { id: 'rp-boton', type: 'button', textContent: '!', title: tr_('Reportar una situación'), onclick: abre });
    boton.setAttribute('aria-label', tr_('Reportar una situación'));
    document.body.appendChild(boton);
    midiendoFps();
  }

  // --- para los juegos
  function activar(opciones) { juego = opciones || {}; parado = false; ponBoton(); }
  function quitaBoton() { if (boton) { boton.remove(); boton = null; } cierra(); }
  function parar() { parado = true; quitaBoton(); }
  function traza(muestra) { guarda(trazaJuego, muestra); }

  // sin que el juego haga nada, el botón sale solo (si la cuenta es admin) al terminar de cargar y al cambiar de cuenta
  if (typeof hook === 'function') hook('cuenta', () => { compruebaAdmin(); });
  if (typeof window !== 'undefined') window.addEventListener('load', () => setTimeout(compruebaAdmin, 1500));

  return { activar, parar, traza };
})();

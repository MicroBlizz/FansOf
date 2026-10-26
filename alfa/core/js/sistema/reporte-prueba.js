// Fans Of · REPORTE DE PRUEBA: un botón pequeño «!» en pantalla, solo para probadores (en /alfa/ o en localhost), para mandarnos una
// situación mientras se juega: una nota, dónde estaba el jugador y cómo iba (lo que el juego quiera contar), los últimos 60 s de
// recorrido y una captura de pantalla pequeña. Lo manda el probador a propósito, con su cuenta: no es telemetría, pero igualmente
// solo sale si tiene encendido «Datos de partida anónimos» (DATOS.activo()). Servidor: enviar_reporte_prueba (servidor/98-reportes-prueba.sql);
// se lee en /gestion → Reportes de prueba. Un juego lo activa con REPORTE.activar({ datos: () => ({...}), captura: () => dataUrlJpeg|null, nombre: () => 'quien' }):
// `datos` se llama al enviar y devuelve lo que quiera guardar (posición, zona, fps…); además el juego puede llamar a REPORTE.traza({...}) una vez
// por segundo con lo que quiera apuntar, y se mandan los últimos 60. Tiene su propio estilo (no depende del CSS de cada juego).
'use strict';
const REPORTE = (() => {
  const T = typeof tr === 'function' ? tr : s => s;
  let op = null, boton = null, ventana = null, traza = [];
  const probador = () => (typeof NUCLEO !== 'undefined' && NUCLEO.alfa) || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  const plataforma = () => (window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform()) ? 'app' : /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) ? 'movil' : 'pc';
  // qué gráfica usa el navegador (en un PC con integrada y dedicada, a veces la integrada)
  let gpuNombre;
  function gpu() {
    if (gpuNombre !== undefined) return gpuNombre;
    try { const g = document.createElement('canvas').getContext('webgl'), ext = g && g.getExtension('WEBGL_debug_renderer_info'); gpuNombre = g ? String(ext ? g.getParameter(ext.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER)).slice(0, 120) : null; } catch (e) { gpuNombre = null; }
    return gpuNombre;
  }
  function estilo() {
    if (document.getElementById('rp-estilo')) return;
    const s = document.createElement('style'); s.id = 'rp-estilo';
    s.textContent = `#rp-boton{position:fixed;left:8px;top:50%;transform:translateY(-50%);z-index:99990;width:38px;height:38px;border-radius:50%;border:3px solid #20102c;background:#ffcb3d;color:#20102c;font:800 22px/1 "Baloo 2",sans-serif;box-shadow:0 3px 0 #20102c;cursor:pointer;opacity:.85}
#rp-boton:active{transform:translateY(calc(-50% + 2px));box-shadow:0 1px 0 #20102c}
#rp-fondo{position:fixed;inset:0;z-index:99991;background:rgba(10,8,28,.6);display:grid;place-items:center;padding:16px}
#rp-caja{width:min(480px,100%);background:#fff6ea;color:#20102c;border:3px solid #20102c;border-radius:14px;box-shadow:0 5px 0 #20102c;padding:14px 16px;display:grid;gap:10px;font:600 15px "Baloo 2",sans-serif}
#rp-caja h3{margin:0;font-size:20px}#rp-caja textarea{width:100%;min-height:90px;box-sizing:border-box;border:2px solid #20102c;border-radius:8px;padding:8px;font:inherit;resize:vertical;background:#fff;color:#20102c}
#rp-caja img{width:100%;border-radius:8px;border:2px solid #20102c}#rp-caja .rp-fila{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}
#rp-caja button{border:3px solid #20102c;border-radius:10px;padding:6px 14px;font:800 15px "Baloo 2",sans-serif;background:#cdb9ea;color:#20102c;box-shadow:0 3px 0 #20102c;cursor:pointer}
#rp-caja button.rp-ok{background:#7ee04a}#rp-caja small{color:#5b5668}#rp-caja .rp-aviso{color:#b8202c}`;
    document.head.appendChild(s);
  }
  function abre() {
    if (ventana) return;
    const datosOk = typeof DATOS === 'undefined' || DATOS.activo();
    let captura = null; try { captura = op.captura ? op.captura() : null; } catch (e) { captura = null; }
    ventana = document.createElement('div'); ventana.id = 'rp-fondo';
    ventana.innerHTML = `<div id="rp-caja" role="dialog"><h3>${esc(T('Reportar una situación'))}</h3>
      ${captura ? `<img src="${captura}" alt="">` : ''}
      <textarea id="rp-texto" maxlength="1000" placeholder="${esc(T('Qué pasa aquí: qué esperabas y qué ves'))}"></textarea>
      <small>${esc(T('Se manda con tu nota: dónde estás, cómo va el juego, los últimos 60 s de recorrido y la captura.'))}</small>
      ${datosOk ? '' : `<div class="rp-aviso">${esc(T('Para reportar, activa «Datos de partida anónimos» en Opciones.'))}</div>`}
      <div class="rp-fila"><button type="button" id="rp-no">${esc(T('Cancelar'))}</button><button type="button" id="rp-si" class="rp-ok" ${datosOk ? '' : 'disabled'}>${esc(T('Enviar'))}</button></div></div>`;
    document.body.appendChild(ventana);
    for (const ev of ['keydown', 'keyup', 'keypress']) ventana.addEventListener(ev, e => e.stopPropagation());   // lo que se teclea aquí no llega al juego
    ventana.querySelector('#rp-no').onclick = cierra;
    ventana.querySelector('#rp-si').onclick = () => envia(ventana.querySelector('#rp-texto').value, captura);
    setTimeout(() => { const t = ventana && ventana.querySelector('#rp-texto'); if (t) t.focus(); }, 50);
  }
  function cierra() { if (ventana) { ventana.remove(); ventana = null; } }
  async function envia(texto, captura) {
    texto = String(texto || '').trim(); if (!texto) texto = '(sin nota)';
    const b = ventana.querySelector('#rp-si'); b.disabled = true; b.textContent = '…';
    let datos = {}; try { datos = op.datos ? op.datos() || {} : {}; } catch (e) { datos = { error: String(e && e.message) }; }
    datos.traza = traza.slice(-60); datos.aparato = { ua: navigator.userAgent.slice(0, 160), ancho: innerWidth, alto: innerHeight, dpr: devicePixelRatio || 1, nucleos: navigator.hardwareConcurrency || null, memoria: navigator.deviceMemory || null, idioma: navigator.language, gpu: gpu() };
    let nombre = null; try { nombre = op.nombre ? op.nombre() : null; } catch (e) { nombre = null; }
    const cuerpo = { juego: (typeof AJUSTES !== 'undefined' && AJUSTES.id) || 'desconocido', version: String(typeof NUCLEO !== 'undefined' ? NUCLEO.version || '' : '').slice(0, 32), alfa: !!(typeof NUCLEO !== 'undefined' && NUCLEO.alfa), plataforma: plataforma(), nombre, texto, datos, captura };
    let r = null;
    try { r = await CUENTA.rpc('enviar_reporte_prueba', { p_datos: cuerpo }); } catch (e) { r = { ok: false, motivo: String(e && e.message) }; }
    if (r && r.ok) { cierra(); aviso(T('Reporte enviado. ¡Gracias!')); }
    else { b.disabled = false; b.textContent = T('Enviar'); let m = ventana.querySelector('.rp-aviso'); if (!m) { m = document.createElement('div'); m.className = 'rp-aviso'; b.parentNode.before(m); } m.textContent = T('No se ha podido enviar') + (r && r.motivo ? ' (' + r.motivo + ')' : ''); }
  }
  function aviso(texto) { const d = document.createElement('div'); d.textContent = texto; d.style.cssText = 'position:fixed;left:50%;top:14%;transform:translateX(-50%);z-index:99992;background:#7ee04a;color:#20102c;border:3px solid #20102c;border-radius:12px;padding:8px 16px;font:800 18px "Baloo 2",sans-serif;box-shadow:0 3px 0 #20102c'; document.body.appendChild(d); setTimeout(() => d.remove(), 2200); }
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // el juego: lo activa al empezar la partida
  function activar(opciones) {
    op = opciones || {};
    if (!probador() || typeof CUENTA === 'undefined' || !CUENTA.activa || boton) return;
    estilo();
    boton = document.createElement('button'); boton.id = 'rp-boton'; boton.type = 'button'; boton.textContent = '!'; boton.title = T('Reportar una situación'); boton.setAttribute('aria-label', T('Reportar una situación'));
    boton.onclick = abre; document.body.appendChild(boton);
  }
  function parar() { if (boton) { boton.remove(); boton = null; } cierra(); }
  return { activar, parar, traza: p => { traza.push(p); if (traza.length > 60) traza.shift(); } };
})();

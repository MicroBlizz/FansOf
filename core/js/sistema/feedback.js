// Fans Of · FEEDBACK en cualquier juego: una pestaña pequeña en el borde izquierdo (solo fuera de partida) que abre una ventana para mandarnos
// una idea, un fallo o una opinión. Va con la versión del juego y, si el jugador marca la casilla, con permiso para escribirle por email.
// Servidor: enviar_feedback (servidor/32-feedback.sql); se lee en /gestion. Sin la cuenta de core (CUENTA.activa) no sale: no hay a dónde mandarlo.
// El permiso de contacto solo vale con una cuenta con email: un invitado no tiene correo, así que ahí la casilla pide entrar primero (window.pedirCuenta).
// Preguntas concretas (solo con «OPINIÓN»): las de core (lo que más te gusta, lo que te molesta), la del cambio reciente (sale sola de NEWS[0] de js/novedades.js,
// con un botón para leer qué cambió) y las que añada el juego en AJUSTES.feedbackPreguntas = [{ id: 'mapa', texto: '¿Qué te parece el mapa?', opciones: ['Me gusta', 'Me da igual', 'No me gusta'] }]
// (id estable en minúsculas; sin «opciones» es una respuesta corta escrita). Se guardan como jsonb {id: respuesta} (servidor/39-feedback-preguntas.sql).
// Un juego puede quitarla con AJUSTES.sinFeedback = true. Tiene su propio estilo (no depende del CSS de cada juego).
'use strict';
(() => {
  if (typeof CUENTA === 'undefined' || !CUENTA.activa || (typeof AJUSTES !== 'undefined' && AJUSTES.sinFeedback)) return;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const TIPOS = [['idea', 'IDEA'], ['fallo', 'FALLO'], ['opinion', 'OPINIÓN']];
  let tipo = 'opinion', enviando = false, estrellas = 0, resp = {};   // estrellas: la nota de 1 a 5 (obligatoria en «OPINIÓN»); resp: lo contestado con botones (lo escrito se lee de los campos)
  const OPCIONES = ['Me gusta', 'Me da igual', 'No me gusta'];
  const BASE = [{ id: 'gusta', texto: '¿Qué es lo que más te gusta?' }, { id: 'molesta', texto: '¿Qué es lo que más te molesta?' }];
  const ultima = () => (typeof NEWS !== 'undefined' && NEWS && NEWS.length ? NEWS[0] : null);
  // primero lo que cambió, luego las del juego y al final las de core
  function preguntas() {
    const n = ultima(), cambio = n ? [{ id: 'cambio-' + String(n.v).replace(/[^a-z0-9._-]/gi, '').toLowerCase(), texto: '¿Qué te parece lo nuevo de la versión {v}?', opciones: OPCIONES, cambio: n }] : [];
    const propias = typeof AJUSTES !== 'undefined' && Array.isArray(AJUSTES.feedbackPreguntas) ? AJUSTES.feedbackPreguntas : [];
    return cambio.concat(propias, BASE).filter(q => q && /^[a-z0-9._-]{1,40}$/.test(q.id)).slice(0, 6);
  }
  const titulo = q => tr(q.texto, { v: q.cambio ? q.cambio.v : '' });
  const cambioHtml = n => (typeof newsHtml === 'function' ? newsHtml([n]) : '');

  const css = document.createElement('style');
  css.textContent = `
  #fb-pestana { position: fixed; left: 0; bottom: 30%; z-index: 40; width: 30px; height: 46px; padding: 0; cursor: pointer; border: 3px solid #20102c; border-left: 0; border-radius: 0 12px 12px 0;
    background: rgba(62, 35, 99, .88); color: #fff6ea; opacity: .72; display: flex; align-items: center; justify-content: center; }
  #fb-pestana:hover, #fb-pestana:focus-visible { opacity: 1; }
  #fb-pestana svg { width: 20px; height: 20px; display: block; }
  #fb-fondo { position: fixed; inset: 0; z-index: 90; background: rgba(12, 6, 20, .82); display: flex; align-items: center; justify-content: center; padding: 14px; box-sizing: border-box; touch-action: auto; user-select: text; -webkit-user-select: text; }
  #fb-fondo[hidden] { display: none; }
  #fb-caja { position: relative; width: 100%; max-width: 420px; max-height: 100%; overflow-y: auto; box-sizing: border-box; padding: 16px 16px 12px; text-align: left; color: #fff6ea; font-family: "Baloo 2", "Trebuchet MS", system-ui, sans-serif;
    border: 4px solid #20102c; border-radius: 20px; background: linear-gradient(170deg, #3e2363 0%, #26143c 45%, #150b21 100%); box-shadow: 0 6px 0 #20102c; }
  #fb-caja h3 { font-family: "Luckiest Guy", "Arial Black", Impact, sans-serif; font-weight: 400; font-size: 26px; color: #ffcb3d; margin: 0 38px 6px 0; text-shadow: 2px 2px 0 #20102c; }
  #fb-caja p, #fb-caja label, #fb-caja small { font-size: 14px; font-weight: 700; line-height: 1.35; }
  #fb-caja small { display: block; margin-top: 8px; font-size: 12px; font-weight: 600; color: #cdb9ea; }
  #fb-caja small a { color: #cdb9ea; }
  #fb-x { position: absolute; top: 10px; right: 10px; width: 34px; height: 34px; border-radius: 10px; border: 3px solid #20102c; background: #26143c; color: #fff6ea; font-size: 16px; cursor: pointer; }
  #fb-tipos { display: flex; gap: 6px; margin: 8px 0; }
  #fb-tipos button { flex: 1; cursor: pointer; font: 800 13px "Baloo 2", system-ui, sans-serif; padding: 7px 4px; border-radius: 10px; border: 3px solid #20102c; background: #26143c; color: #cdb9ea; }
  #fb-tipos button[aria-pressed="true"] { background: linear-gradient(to bottom, #ffb347, #ff7a1a); color: #fff6ea; }
  #fb-preguntas { margin: 6px 0 8px; } #fb-preguntas[hidden] { display: none; }
  .fb-p { margin: 8px 0; } .fb-p label { display: block; margin-bottom: 4px; }
  .fb-p input[type=text] { width: 100%; box-sizing: border-box; font: 600 15px "Baloo 2", system-ui, sans-serif; padding: 7px 10px; border-radius: 10px; border: 3px solid #20102c; background: #fff6ea; color: #26143c; }
  .fb-estrellas { display: flex; gap: 2px; } .fb-estrellas button { background: none; border: 0; padding: 2px; cursor: pointer; line-height: 0; }
  .fb-estrellas svg { width: 34px; height: 34px; } .fb-estrellas path { fill: #26143c; stroke: #20102c; stroke-width: 2.4; stroke-linejoin: round; } .fb-estrellas button[data-on] path { fill: #ffcb3d; }
  .fb-ops { display: flex; gap: 6px; flex-wrap: wrap; }
  .fb-ops button, .fb-nov { cursor: pointer; font: 800 13px "Baloo 2", system-ui, sans-serif; padding: 6px 10px; border-radius: 10px; border: 3px solid #20102c; background: #26143c; color: #cdb9ea; }
  .fb-ops button[aria-pressed="true"] { background: linear-gradient(to bottom, #ffb347, #ff7a1a); color: #fff6ea; }
  .fb-nov { margin-top: 6px; color: #fff6ea; } #fb-novedades { margin-top: 6px; padding: 8px 10px; border-radius: 10px; background: rgba(255,255,255,.07); font-size: 13px; max-height: 160px; overflow-y: auto; }
  #fb-novedades h4 { margin: 6px 0 2px; font-size: 13px; color: #ffcb3d; } #fb-novedades ul { margin: 2px 0 4px 16px; padding: 0; }
  #fb-texto { width: 100%; box-sizing: border-box; min-height: 110px; resize: vertical; font: 600 15px "Baloo 2", system-ui, sans-serif; padding: 9px 10px; border-radius: 10px; border: 3px solid #20102c; background: #fff6ea; color: #20102c; }
  #fb-contacto { display: flex; gap: 8px; align-items: flex-start; margin-top: 10px; padding: 8px 10px; border-radius: 10px; background: rgba(255,255,255,.07); }
  #fb-contacto input { width: 20px; height: 20px; margin: 2px 0 0; flex: none; accent-color: #ff7a1a; }
  #fb-contacto button { margin-top: 6px; cursor: pointer; font: 800 13px "Baloo 2", system-ui, sans-serif; padding: 6px 12px; border-radius: 10px; border: 3px solid #20102c; background: #26143c; color: #fff6ea; }
  #fb-enviar { margin-top: 12px; width: 100%; cursor: pointer; font-family: "Luckiest Guy", "Arial Black", Impact, sans-serif; font-size: 22px; padding: 10px 0 6px; border-radius: 14px; border: 3px solid #20102c; background: linear-gradient(to bottom, #ffb347, #ff7a1a); color: #fff6ea; box-shadow: 0 3px 0 #20102c; text-shadow: 2px 2px 0 #20102c; }
  #fb-enviar:disabled { opacity: .55; cursor: default; }
  #fb-ver { position: fixed; left: 0; z-index: 39; width: 30px; display: flex; justify-content: center; pointer-events: none; font: 700 10px/1 system-ui, sans-serif; color: rgba(255, 246, 234, .5); text-shadow: 0 1px 2px #20102c, 0 0 3px #20102c; }
  #fb-ver[hidden] { display: none; }
  #fb-ver span { writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; }
  #fb-aviso { margin-top: 8px; font-size: 13px; font-weight: 800; color: #ffb347; min-height: 1em; }`;
  document.head.appendChild(css);

  const pestana = document.createElement('button');
  pestana.id = 'fb-pestana'; pestana.type = 'button'; pestana.hidden = true;
  pestana.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v12H11l-5 4v-4H4z" fill="#ffcb3d" stroke="#20102c" stroke-width="2.2" stroke-linejoin="round"/></svg>';
  // la versión, sombreada, bajo la pestaña (y completa en el cuadro): la release «0.9.133»; la alfa «b12» (build) con su hash. Es la misma que se manda con el comentario.
  const partes = String(NUCLEO.version || '0').split('-a'), alfaB = partes[1] ? partes[1].split('.') : null;
  const verCorta = alfaB ? 'ALFA b' + alfaB[0] : partes[0];
  const verLarga = () => tr('versión') + ' ' + partes[0] + (alfaB ? ' · ' + tr('copia de pruebas') + ' (alfa) · build ' + alfaB[0] + ' · ' + (alfaB[1] || '') : '');
  const ver = document.createElement('div'); ver.id = 'fb-ver'; ver.hidden = true; ver.innerHTML = '<span></span>'; ver.firstChild.textContent = verCorta;
  const fondo = document.createElement('div');
  fondo.id = 'fb-fondo'; fondo.hidden = true;
  fondo.innerHTML = '<div id="fb-caja" role="dialog" aria-modal="true" aria-labelledby="fb-titulo"><button type="button" id="fb-x" aria-label="X">✕</button><div id="fb-cuerpo"></div></div>';
  const mostrar = () => { pestana.hidden = !!(typeof enPartida === 'function' && enPartida()); ver.hidden = pestana.hidden; };
  const ponerEtiqueta = () => { const t = tr('Enviar comentarios'); pestana.title = t + ' · ' + verLarga(); pestana.setAttribute('aria-label', t); };
  const colocar = () => { const st = document.getElementById('stage'); const x = st ? Math.max(0, st.getBoundingClientRect().left) + 'px' : '0'; pestana.style.left = ver.style.left = x; ver.style.bottom = 'calc(30% - ' + (verCorta.length * 6 + 6) + 'px)'; };
  function iniciar() {
    document.body.append(pestana, ver, fondo); ponerEtiqueta(); colocar(); mostrar();
    window.addEventListener('resize', colocar); setInterval(() => { mostrar(); colocar(); }, 1500);
  }
  const cerrar = () => { fondo.hidden = true; };
  fondo.addEventListener('click', e => { if (e.target === fondo || e.target.id === 'fb-x') cerrar(); });
  // las teclas escritas aquí no son del juego (atajos, pausa…): no salen de la ventana
  for (const ev of ['keydown', 'keyup', 'keypress']) fondo.addEventListener(ev, e => { e.stopPropagation(); if (ev === 'keydown' && e.key === 'Escape') cerrar(); });
  const conEmail = () => !CUENTA.invitado && !!CUENTA.email;

  function leerEscritas() { for (const q of preguntas()) { const i = document.getElementById('fb-q-' + q.id); if (i) resp[q.id] = i.value; } }
  function preguntasHtml() {
    const estrella = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.3 1.3-6.6L2.5 9.5l6.6-.8z"/></svg>';
    return `<div id="fb-preguntas"${tipo === 'opinion' ? '' : ' hidden'}><div class="fb-p"><label>${esc(tr('¿Qué nota le das al juego?'))}</label><div class="fb-estrellas" role="group" aria-label="${esc(tr('Nota de 1 a 5 estrellas'))}">`
      + [1, 2, 3, 4, 5].map(n => `<button type="button" data-e="${n}"${n <= estrellas ? ' data-on' : ''} aria-label="${n}" aria-pressed="${n === estrellas}">${estrella}</button>`).join('') + '</div></div>' + preguntas().map(q => {
      const campo = q.opciones ? `<div class="fb-ops">${q.opciones.map((o, i) => `<button type="button" data-q="${q.id}" data-o="${i}" aria-pressed="${resp[q.id] === o}">${esc(tr(o))}</button>`).join('')}</div>`
        + (q.cambio ? `<button type="button" class="fb-nov" id="fb-ver-nov">${esc(tr('Ver qué ha cambiado'))}</button><div id="fb-novedades" hidden>${cambioHtml(q.cambio)}</div>` : '')
        : `<input type="text" id="fb-q-${q.id}" maxlength="300" aria-label="${esc(titulo(q))}">`;
      return `<div class="fb-p"><label>${esc(titulo(q))}</label>${campo}</div>`;
    }).join('') + '</div>';
  }
  function pintar(aviso) {
    leerEscritas();
    const c = document.getElementById('fb-cuerpo'), texto = (document.getElementById('fb-texto') || {}).value || '', marcado = !!(document.getElementById('fb-check') || {}).checked;
    const base = location.pathname.replace(/(games|demos)\/[^/]*\/.*$/, '').replace(/[^/]*$/, '');
    c.innerHTML = `<h3 id="fb-titulo">${esc(tr('TU OPINIÓN'))}</h3><p>${esc(tr('Cuéntanos una idea, un fallo o lo que te parezca. Lo leemos nosotros.'))}</p>`
      + `<div id="fb-tipos">${TIPOS.map(([k, n]) => `<button type="button" data-t="${k}" aria-pressed="${k === tipo}">${esc(tr(n))}</button>`).join('')}</div>`
      + preguntasHtml()
      + `<div class="fb-p"><label for="fb-texto">${esc(tr('Cuéntanos lo que quieras'))}</label><textarea id="fb-texto" maxlength="1000" placeholder="${esc(tr('Escribe aquí'))}"></textarea></div>`
      + `<div id="fb-contacto"><input type="checkbox" id="fb-check"${conEmail() ? '' : ' disabled'}><div><label for="fb-check">${esc(tr('Podéis escribirme por email para preguntarme por este comentario, hablar del juego o pedirme opinión.'))}</label>`
      + (conEmail() ? `<small style="margin-top:2px">${esc(tr('Usaremos {e}.', { e: CUENTA.email }))}</small>`
        : `<small style="margin-top:2px">${esc(tr('Para eso necesitamos tu email: entra con tu cuenta.'))}</small>${typeof pedirCuenta === 'function' ? `<button type="button" id="fb-entrar">${esc(tr('ENTRAR CON MI CUENTA'))}</button>` : ''}`)
      + `</div></div><button type="button" id="fb-enviar">${esc(tr('ENVIAR'))}</button><div id="fb-aviso" role="status">${esc(aviso || '')}</div>`
      + `<small style="opacity:.7">${esc(verLarga())}</small>`
      + `<small>${esc(tr('Tu email solo lo usamos si marcas la casilla.'))} <a href="${base}privacidad/?lang=${typeof IDIOMA !== 'undefined' ? IDIOMA.actual : 'es'}" target="_blank" rel="noopener">${esc(tr('Privacidad'))}</a></small>`;
    for (const q of preguntas()) { const i = document.getElementById('fb-q-' + q.id); if (i && resp[q.id]) i.value = resp[q.id]; }
    document.getElementById('fb-texto').value = texto; if (marcado && conEmail()) document.getElementById('fb-check').checked = true;
  }
  function abrir() { resp = {}; estrellas = 0; pintar(''); fondo.hidden = false; setTimeout(() => { const t = document.getElementById('fb-texto'); if (t) t.focus(); }, 50); }
  async function enviar() {
    if (enviando) return;
    const texto = document.getElementById('fb-texto').value.trim(), aviso = document.getElementById('fb-aviso');
    leerEscritas();
    const respuestas = {}, textos = {};   // solo cuentan si el jugador está en «OPINIÓN» (donde se ven las preguntas)
    if (tipo === 'opinion') respuestas.estrellas = String(estrellas || '');
    if (tipo === 'opinion') for (const q of preguntas()) { const v = String(resp[q.id] || '').trim(); if (v) { respuestas[q.id] = v.slice(0, 300); textos[q.id] = titulo(q) + ' ' + v; } }
    if (tipo === 'opinion' && !estrellas) { aviso.textContent = tr('Pon una nota de 1 a 5 estrellas.'); return; }
    if (!respuestas.estrellas) delete respuestas.estrellas; else textos.estrellas = tr('Nota') + ': ' + estrellas + '/5';
    const hay = Object.keys(respuestas).length;
    if (texto.length < 3 && !hay) { aviso.textContent = tr('Escribe algo primero.'); return; }
    enviando = true; document.getElementById('fb-enviar').disabled = true; aviso.textContent = '';
    const datos = { p_juego: AJUSTES.id, p_version: String(NUCLEO.version || ''), p_tipo: tipo, p_texto: texto.length < 3 ? '' : texto, p_contacto: !!document.getElementById('fb-check').checked && conEmail() };
    try {
      let r;
      try { r = await CUENTA.rpc('enviar_feedback_v2', Object.assign({ p_respuestas: hay ? respuestas : null }, datos)); }
      catch (e) {   // el servidor aún no tiene las preguntas: se manda como antes, con las respuestas dentro del texto
        if (!/Could not find the function|PGRST202|HTTP 404/.test(String(e && e.message))) throw e;
        r = await CUENTA.rpc('enviar_feedback', Object.assign(datos, { p_texto: (Object.values(textos).join('\n') + (datos.p_texto ? '\n' + datos.p_texto : '')).slice(0, 1000) }));
      }
      if (r && r.ok) {
        document.getElementById('fb-cuerpo').innerHTML = `<h3 id="fb-titulo">${esc(tr('¡GRACIAS!'))}</h3><p>${esc(tr('Lo hemos recibido. Lo leeremos con cariño.'))}</p><button type="button" id="fb-enviar" data-ok>${esc(tr('CERRAR'))}</button>`;
      } else { aviso.textContent = r && r.motivo === 'tope' ? tr('Hoy has mandado muchos comentarios. Vuelve mañana.') : tr('No se ha podido enviar. Prueba otra vez.'); document.getElementById('fb-enviar').disabled = false; }
    } catch (e) { aviso.textContent = tr('No se ha podido enviar. Prueba otra vez.'); const b = document.getElementById('fb-enviar'); if (b) b.disabled = false; }
    enviando = false;
  }
  fondo.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.t) { tipo = b.dataset.t; fondo.querySelectorAll('#fb-tipos button').forEach(x => x.setAttribute('aria-pressed', x === b)); const pq = document.getElementById('fb-preguntas'); if (pq) pq.hidden = tipo !== 'opinion'; }
    else if (b.dataset.e) { estrellas = estrellas === +b.dataset.e ? 0 : +b.dataset.e; b.parentNode.querySelectorAll('button').forEach(x => { const on = +x.dataset.e <= estrellas; x.toggleAttribute('data-on', on); x.setAttribute('aria-pressed', +x.dataset.e === estrellas); }); }
    else if (b.dataset.q) { const q = preguntas().find(x => x.id === b.dataset.q), o = q && q.opciones[+b.dataset.o]; if (o) { resp[q.id] = resp[q.id] === o ? '' : o; b.parentNode.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', resp[q.id] === q.opciones[+x.dataset.o])); } }
    else if (b.id === 'fb-ver-nov') { const n = document.getElementById('fb-novedades'); n.hidden = !n.hidden; }
    else if (b.id === 'fb-enviar') { if (b.hasAttribute('data-ok')) cerrar(); else enviar(); }
    else if (b.id === 'fb-entrar') { cerrar(); window.pedirCuenta('Entra con tu cuenta para que podamos escribirte si hace falta.'); }
  });
  pestana.onclick = abrir;
  if (document.body) iniciar(); else window.addEventListener('DOMContentLoaded', iniciar);
})();

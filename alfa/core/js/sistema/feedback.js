// Fans Of · FEEDBACK en cualquier juego: una pestaña pequeña en el borde izquierdo (solo fuera de partida) que abre una ventana para mandarnos
// una idea, un fallo o una opinión. Va con la versión del juego y, si el jugador marca la casilla, con permiso para escribirle por email.
// Servidor: enviar_feedback (servidor/32-feedback.sql); se lee en /gestion. Sin la cuenta de core (CUENTA.activa) no sale: no hay a dónde mandarlo.
// El permiso de contacto solo vale con una cuenta con email: un invitado no tiene correo, así que ahí la casilla pide entrar primero (window.pedirCuenta).
// Un juego puede quitarla con AJUSTES.sinFeedback = true. Tiene su propio estilo (no depende del CSS de cada juego).
'use strict';
(() => {
  if (typeof CUENTA === 'undefined' || !CUENTA.activa || (typeof AJUSTES !== 'undefined' && AJUSTES.sinFeedback)) return;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const TIPOS = [['idea', 'IDEA'], ['fallo', 'FALLO'], ['opinion', 'OPINIÓN']];
  let tipo = 'idea', enviando = false;

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

  function pintar(aviso) {
    const c = document.getElementById('fb-cuerpo'), texto = (document.getElementById('fb-texto') || {}).value || '', marcado = !!(document.getElementById('fb-check') || {}).checked;
    const base = location.pathname.replace(/(games|demos)\/[^/]*\/.*$/, '').replace(/[^/]*$/, '');
    c.innerHTML = `<h3 id="fb-titulo">${esc(tr('TU OPINIÓN'))}</h3><p>${esc(tr('Cuéntanos una idea, un fallo o lo que te parezca. Lo leemos nosotros.'))}</p>`
      + `<div id="fb-tipos">${TIPOS.map(([k, n]) => `<button type="button" data-t="${k}" aria-pressed="${k === tipo}">${esc(tr(n))}</button>`).join('')}</div>`
      + `<textarea id="fb-texto" maxlength="1000" placeholder="${esc(tr('Escribe aquí'))}" aria-label="${esc(tr('Tu comentario'))}"></textarea>`
      + `<div id="fb-contacto"><input type="checkbox" id="fb-check"${conEmail() ? '' : ' disabled'}><div><label for="fb-check">${esc(tr('Podéis escribirme por email para preguntarme por este comentario, hablar del juego o pedirme opinión.'))}</label>`
      + (conEmail() ? `<small style="margin-top:2px">${esc(tr('Usaremos {e}.', { e: CUENTA.email }))}</small>`
        : `<small style="margin-top:2px">${esc(tr('Para eso necesitamos tu email: entra con tu cuenta.'))}</small>${typeof pedirCuenta === 'function' ? `<button type="button" id="fb-entrar">${esc(tr('ENTRAR CON MI CUENTA'))}</button>` : ''}`)
      + `</div></div><button type="button" id="fb-enviar">${esc(tr('ENVIAR'))}</button><div id="fb-aviso" role="status">${esc(aviso || '')}</div>`
      + `<small style="opacity:.7">${esc(verLarga())}</small>`
      + `<small>${esc(tr('Tu email solo lo usamos si marcas la casilla.'))} <a href="${base}privacidad/?lang=${typeof IDIOMA !== 'undefined' ? IDIOMA.actual : 'es'}" target="_blank" rel="noopener">${esc(tr('Privacidad'))}</a></small>`;
    document.getElementById('fb-texto').value = texto; if (marcado && conEmail()) document.getElementById('fb-check').checked = true;
  }
  function abrir() { pintar(''); fondo.hidden = false; setTimeout(() => { const t = document.getElementById('fb-texto'); if (t) t.focus(); }, 50); }
  async function enviar() {
    if (enviando) return;
    const texto = document.getElementById('fb-texto').value.trim(), aviso = document.getElementById('fb-aviso');
    if (texto.length < 3) { aviso.textContent = tr('Escribe algo primero.'); return; }
    enviando = true; document.getElementById('fb-enviar').disabled = true; aviso.textContent = '';
    try {
      const r = await CUENTA.rpc('enviar_feedback', { p_juego: AJUSTES.id, p_version: String(NUCLEO.version || ''), p_tipo: tipo, p_texto: texto, p_contacto: !!document.getElementById('fb-check').checked && conEmail() });
      if (r && r.ok) {
        document.getElementById('fb-cuerpo').innerHTML = `<h3 id="fb-titulo">${esc(tr('¡GRACIAS!'))}</h3><p>${esc(tr('Lo hemos recibido. Lo leeremos con cariño.'))}</p><button type="button" id="fb-enviar" data-ok>${esc(tr('CERRAR'))}</button>`;
      } else { aviso.textContent = r && r.motivo === 'tope' ? tr('Hoy has mandado muchos comentarios. Vuelve mañana.') : tr('No se ha podido enviar. Prueba otra vez.'); document.getElementById('fb-enviar').disabled = false; }
    } catch (e) { aviso.textContent = tr('No se ha podido enviar. Prueba otra vez.'); const b = document.getElementById('fb-enviar'); if (b) b.disabled = false; }
    enviando = false;
  }
  fondo.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.t) { tipo = b.dataset.t; fondo.querySelectorAll('#fb-tipos button').forEach(x => x.setAttribute('aria-pressed', x === b)); }
    else if (b.id === 'fb-enviar') { if (b.hasAttribute('data-ok')) cerrar(); else enviar(); }
    else if (b.id === 'fb-entrar') { cerrar(); window.pedirCuenta('Entra con tu cuenta para que podamos escribirte si hace falta.'); }
  });
  pestana.onclick = abrir;
  if (document.body) iniciar(); else window.addEventListener('DOMContentLoaded', iniciar);
})();

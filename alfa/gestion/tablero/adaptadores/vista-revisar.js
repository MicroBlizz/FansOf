// Fans Of · /gestion · TABLERO · adaptador · VISTA DE REVISAR (tarea #161, ADR 160): el HTML para revisar en un toque. El botón «Probar» que abre el juego
// en la alfa, los textos con enlaces pulsables, la bandeja «Te toca» de arriba, los botones «Dar por buena» y «Pedir cambios» (en la tarjeta y abajo del
// detalle) y la hoja para escribir qué cambiar. Funciones puras (reciben `esc`) que usan vista.js, vista-detalle.js y el controlador; se prueban en Node.
'use strict';
TABLERO.vistaRevisar = (() => {
  const triangulo = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5l9 5.5-9 5.5z" fill="currentColor"/></svg>';
  // Un texto con sus direcciones https pulsables (se abren en otra pestaña); el resto, escapado tal cual
  const enlazado = (texto, esc) => TABLERO.trozosConEnlaces(texto)
    .map(p => (p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.url)}</a>` : esc(p.texto))).join('');
  // «Probar» (tarjeta) o «Probar <juego> en la alfa» (detalle): solo si la tarea es de un juego con página
  const probar = (t, esc, grande = false) => {
    const url = TABLERO.enlaceAlfa(t.juego);
    if (!url) return '';
    return `<a class="tb-probar${grande ? ' grande' : ''}" href="${esc(url)}" target="_blank" rel="noopener" data-probar>${triangulo}${grande ? 'Probar ' + esc(t.juego.charAt(0).toUpperCase() + t.juego.slice(1)) + ' en la alfa' : 'Probar'}</a>`;
  };
  const buena = t => `<button type="button" class="tb-buena" data-buena="${t.id}">Dar por buena</button>`;
  // Debajo de la tarjeta: «Probar» si hay juego y «Dar por buena» si es tuya y está en revisión. Nada si no hay ninguno
  const tarjeta = (t, yo, esc) => {
    const botones = (t.estado === 'en_revision' ? probar(t, esc) : '') + (TABLERO.puedoRevisar(t, yo) ? buena(t) : '');
    return botones ? `<div class="tb-revisar">${botones}</div>` : '';
  };
  // La bandeja «Te toca» (arriba del tablero): una caja por tipo con su cifra; la elegida sale marcada y otro toque la quita
  const caja = (b, elegida, esc) => `<button type="button" class="tb-caja${b.id === elegida ? ' activo' : ''}" data-bandeja="${b.id}" style="--tono:${b.tono}" aria-pressed="${b.id === elegida}"><b>${b.cuantas}</b>${esc(b.titulo)}</button>`;
  const bandeja = (cajas, yo, elegida, esc) => (cajas.length
    ? `<div class="tb-bandeja"><div class="tb-bandeja-titulo">Te toca, ${esc(TABLERO.nombreDe(yo))}${elegida ? ' <button type="button" class="fuerte" data-bandeja="">Ver todo</button>' : ''}</div><div class="tb-cajas">${cajas.map(b => caja(b, elegida, esc)).join('')}</div></div>` : '');
  // Abajo del detalle, fija: «Pedir cambios» y «Dar por buena». Solo si la tarea es tuya y está en revisión
  const barra = (t, yo) => (TABLERO.puedoRevisar(t, yo) ? `<div class="tb-barra-revisar"><button type="button" class="tb-cambios" data-pedir-cambios="${t.id}">Pedir cambios</button>${buena(t)}</div>` : '');
  // La hoja de «Pedir cambios»: una frase (obligatoria) con tres atajos que la empiezan; al enviarla la tarea vuelve a En curso con esa nota
  const ATAJOS = Object.freeze(['Se ve mal en el móvil', 'No funciona', 'Falta algo']);
  const hoja = (t, esc) => `<form class="tb-form tb-hoja" data-cambios="${t.id}"><div class="cab"><b>¿Qué hay que cambiar?</b><button type="button" data-no-cambios>Cancelar</button></div>
    <div class="meta">Vuelve a «En curso» con tu frase. Claude la ve al abrir la tarea.</div>
    <label>Tu comentario<textarea name="nota" maxlength="480" rows="5" required></textarea></label>
    <div class="tb-atajos">${ATAJOS.map(a => `<button type="button" data-atajo="${esc(a)}">${esc(a)}</button>`).join('')}</div>
    <button type="submit" class="tb-enviar">Enviar y devolver a En curso</button></form>`;

  // «Qué mirar»: los pasos que deja Claude al subir (uno por línea), con una casilla para ir marcando (solo en esta pantalla, no se guarda)
  const pasos = texto => String(texto || '').split('\n').map(l => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim()).filter(Boolean);
  const queMirar = (t, esc) => (pasos(t.que_mirar).length ? `<div class="tb-que-mirar"><b>Qué mirar</b>${pasos(t.que_mirar)
    .map(p => `<label class="tb-paso"><input type="checkbox">${enlazado(p, esc)}</label>`).join('')}</div>` : '');

  const ESTILO = '.tb-revisar{display:flex;gap:8px;margin-top:6px}.tb-revisar>*{flex:1;white-space:nowrap}'
    + '.tb-probar{display:flex;align-items:center;justify-content:center;gap:8px;min-height:44px;border-radius:10px;background:#f5b14c;color:#1c1204;font-weight:800;text-decoration:none;padding:0 12px}.tb-probar:hover{background:#ffc66b;color:#1c1204}.tb-probar.grande{min-height:56px;font-size:18px;border-radius:14px}'
    + '.tb-buena{min-height:44px;border-radius:10px;border:0;background:#3dbe8b;color:#062016;font-weight:800}.tb-buena.listo{background:#f2c94c;color:#2a1f00}'
    + '.tb-cambios{min-height:44px;border-radius:10px;border:2px solid #f2994a;background:transparent;color:#f2994a;font-weight:800}'
    + '.tb-barra-revisar{position:sticky;bottom:-8px;display:flex;gap:10px;padding:10px 0;background:var(--panel);border-top:1px solid var(--linea)}.tb-barra-revisar>*{flex:1;min-height:54px;font-size:16px;border-radius:14px}.tb-barra-revisar .tb-buena{flex:1.3}'
    + '.tb-bandeja{margin-bottom:10px;padding:12px;border-radius:14px;border:2px solid #56ccf2;background:color-mix(in srgb,#56ccf2 14%,var(--panel));display:grid;gap:8px}.tb-bandeja-titulo{font-size:13px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;display:flex;align-items:center;gap:8px}.tb-bandeja-titulo button{margin-left:auto;text-transform:none}'
    + '.tb-cajas{display:flex;gap:10px}.tb-caja{flex:1;display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-height:64px;border:2px solid var(--tono);border-radius:12px;background:var(--panel);color:var(--texto);font-weight:700;padding:8px 12px;text-align:left}.tb-caja b{font-size:24px;line-height:1}.tb-caja.activo{background:var(--tono);color:#10202b}'
    + '.tb-que-mirar{border:2px solid #56ccf2;border-radius:12px;padding:10px 12px;display:grid;gap:6px}.tb-que-mirar b{font-size:12px;letter-spacing:.04em;text-transform:uppercase}.tb-paso{display:flex;gap:10px;align-items:flex-start;font-size:15px;line-height:1.35}.tb-paso input{width:22px;height:22px;margin:0;flex:none;accent-color:#3dbe8b}.tb-mas>summary{cursor:pointer;font-weight:700;min-height:44px;display:flex;align-items:center}.tb-mas{display:grid;gap:8px;border:1px solid var(--linea);border-radius:12px;padding:0 12px 8px}.tb-mas>summary::after{content:"+";margin-left:auto;font-size:20px;color:var(--acento)}.tb-mas[open]>summary::after{content:"−"}.tb-como>summary{cursor:pointer;min-height:32px}'
    + '.tb-hoja textarea{font-size:16px;border:2px solid #f2994a}.tb-atajos{display:flex;flex-wrap:wrap;gap:8px}.tb-atajos button{min-height:40px;border-radius:20px;border:2px solid #f2c94c;background:transparent;color:var(--texto);font-weight:700;padding:0 14px}.tb-enviar{min-height:54px;border-radius:14px;border:0;background:#f2994a;color:#2a1200;font-weight:800;font-size:16px}'
    + '@media(max-width:700px){.tb-cajas{gap:8px}.tb-caja{padding:8px 10px;font-size:13px}.tb-panel{width:100%}}';
  return { enlazado, probar, tarjeta, bandeja, barra, hoja, queMirar, ESTILO };
})();

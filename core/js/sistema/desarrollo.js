// Fans Of · DESARROLLO: un botón «DEV» con utilidades para quien trabaja en el juego. Solo existe en modo desarrollo (NUCLEO.desarrollo:
// localhost, o ?dev=1 en la dirección; ?dev=0 lo apaga). En la web publicada nunca se carga. Es común: los dos juegos lo tienen igual.
// Para añadir una utilidad, apúntala en UTILIDADES: { titulo, pinta(caja) } y pinta lo suyo dentro de `caja`.
'use strict';
(() => {
  const CLAVE_DEPURA = 'fansof-idioma-depura';
  const guardado = () => { try { return localStorage.getItem(typeof AJUSTES !== 'undefined' && AJUSTES.guardado); } catch (e) { return null; } };
  const el = (tag, props = {}, ...hijos) => { const e = Object.assign(document.createElement(tag), props); for (const h of hijos) e.append(h); return e; };
  const boton = (txt, fn, props = {}) => el('button', Object.assign({ textContent: txt, onclick: fn }, props));
  const aviso = txt => { const t = document.getElementById('dev-aviso'); if (t) { t.textContent = txt; clearTimeout(aviso.t); aviso.t = setTimeout(() => { t.textContent = ''; }, 3500); } };
  const copiar = async txt => { try { await navigator.clipboard.writeText(txt); aviso('Copiado al portapapeles'); } catch (e) { aviso('No se ha podido copiar: usa el recuadro'); } };

  const UTILIDADES = [
    { titulo: 'Este juego', pinta(c) {
      const filas = [['Juego', (typeof AJUSTES !== 'undefined' && AJUSTES.nombre) || document.title], ['Versión', typeof VERSION !== 'undefined' ? VERSION : '?'], ['Idioma', NUCLEO.idioma],
        ['Navegador', (navigator.languages || [navigator.language]).join(', ')], ['Partida guardada en', (typeof AJUSTES !== 'undefined' && AJUSTES.guardado) || '?']];
      c.append(el('table', {}, ...filas.map(([a, b]) => el('tr', {}, el('td', { textContent: a }), el('td', { textContent: b })))));
    } },
    { titulo: 'Idioma', pinta(c) {
      const fila = el('div', { className: 'fila' });
      for (const [i, txt] of [['', 'AUTO'], ['es', 'ESPAÑOL'], ['en', 'ENGLISH']]) fila.append(boton(txt, () => NUCLEO.elegirIdioma(i)));
      c.append(fila);
    } },
    { titulo: 'Textos sin traducir', pinta(c) {
      let on = false; try { on = localStorage.getItem(CLAVE_DEPURA) === '1'; } catch (e) { /* sin guardar */ }
      const caja = el('textarea', { readOnly: true, rows: 6, placeholder: 'Aquí salen los textos que han salido en español (en inglés).' });
      c.append(el('p', { textContent: on ? 'Apuntando: juega y vuelve a abrir esto para ver la lista.' : 'Apagado: actívalo para apuntar los textos que salgan en español.' }));
      c.append(el('div', { className: 'fila' },
        boton(on ? 'Dejar de apuntar' : 'Empezar a apuntar', () => { try { localStorage.setItem(CLAVE_DEPURA, on ? '0' : '1'); } catch (e) { /* sin guardar */ } location.reload(); }),
        boton('Ver la lista', () => { const l = typeof IDIOMA !== 'undefined' && IDIOMA.pendientes ? IDIOMA.pendientes() : []; caja.value = l.join('\n'); aviso(l.length + ' textos'); }),
        boton('Copiar', () => copiar(caja.value))));
      c.append(caja);
    } },
    { titulo: 'Partida', pinta(c) {
      const caja = el('textarea', { rows: 4, placeholder: 'La partida, en JSON. Pega aquí una para cargarla.' });
      c.append(el('div', { className: 'fila' },
        boton('Ver / copiar la partida', () => { caja.value = guardado() || ''; copiar(caja.value); }),
        boton('Cargar la que hay en el recuadro', () => { try { JSON.parse(caja.value); localStorage.setItem(AJUSTES.guardado, caja.value); location.reload(); } catch (e) { aviso('No es un JSON válido'); } }),
        boton('Borrar la partida', () => { if (confirm('¿Borrar la partida de este juego?')) { try { localStorage.removeItem(AJUSTES.guardado); } catch (e) { /* sin guardar */ } location.reload(); } }, { className: 'peligro' })));
      c.append(caja);
    } },
    { titulo: 'Recursos en la nube (sombra)', pinta(c) {
      const caja = el('textarea', { rows: 3, readOnly: true });
      const ver = () => { caja.value = typeof ECO_SOMBRA !== 'undefined' ? ECO_SOMBRA.informe() : 'Sin modo sombra'; };
      c.append(el('div', { className: 'fila' },
        boton('Mandar y comparar', async () => { if (typeof ECO_SOMBRA !== 'undefined') await ECO_SOMBRA.enviar(); ver(); }),
        boton('Ver', ver)));
      c.append(caja); ver();
    } },
    { titulo: 'Caché y modo sin conexión', pinta(c) {
      c.append(el('div', { className: 'fila' },
        boton('Borrar la caché y recargar', async () => {
          try { for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister(); } catch (e) { /* sin sw */ }
          try { for (const k of await caches.keys()) await caches.delete(k); } catch (e) { /* sin caché */ }
          location.reload();
        }),
        boton('Recargar', () => location.reload())));
    } },
    { titulo: 'Modo desarrollo', pinta(c) {
      c.append(el('p', { textContent: 'Se activa solo en localhost, o con ?dev=1 en la dirección (se recuerda en este navegador).' }));
      c.append(el('div', { className: 'fila' }, boton('Apagarlo en este navegador', () => { try { localStorage.setItem('fansof-dev', '0'); } catch (e) { /* sin guardar */ } location.reload(); })));
    } },
  ];

  const estilo = el('style', { textContent: `
    #dev-boton { position: fixed; left: 6px; bottom: 6px; z-index: 99998; font: 800 11px/1 system-ui, sans-serif; letter-spacing: 1px; padding: 6px 8px; border-radius: 8px; border: 2px solid #20102c; background: #ffcb3d; color: #20102c; opacity: 0.55; cursor: pointer; }
    #dev-boton:hover, #dev-boton:focus-visible { opacity: 1; }
    #dev-panel { position: fixed; inset: 0; z-index: 99999; background: rgba(10, 4, 18, .86); display: flex; align-items: flex-start; justify-content: center; overflow: auto; padding: 16px; box-sizing: border-box; font: 14px/1.4 system-ui, sans-serif; color: #f3ecff; }
    #dev-panel[hidden] { display: none; }
    #dev-panel .caja { width: 100%; max-width: 520px; background: #2a1840; border: 3px solid #20102c; border-radius: 14px; padding: 14px 16px 16px; }
    #dev-panel h2 { margin: 0 0 8px; font-size: 18px; color: #ffcb3d; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    #dev-panel h3 { margin: 14px 0 6px; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; color: #ffcb3d; }
    #dev-panel p { margin: 4px 0; color: #cdb9ea; }
    #dev-panel table { border-collapse: collapse; } #dev-panel td { padding: 2px 10px 2px 0; vertical-align: top; } #dev-panel td:first-child { color: #cdb9ea; }
    #dev-panel .fila { display: flex; flex-wrap: wrap; gap: 6px; margin: 4px 0; }
    #dev-panel button { font: 700 13px system-ui, sans-serif; padding: 7px 10px; border-radius: 8px; border: 2px solid #20102c; background: #cdb9ea; color: #20102c; cursor: pointer; }
    #dev-panel button.peligro { background: #ff8a8a; }
    #dev-panel textarea { width: 100%; box-sizing: border-box; margin-top: 4px; background: #150b21; color: #f3ecff; border: 2px solid #20102c; border-radius: 8px; font: 12px/1.3 ui-monospace, monospace; }
    #dev-aviso { min-height: 18px; color: #9ef07a; font-weight: 700; }
  ` });
  const panel = el('div', { id: 'dev-panel', hidden: true });
  panel.setAttribute('translate', 'no');
  const caja = el('div', { className: 'caja' });
  const cierra = () => { panel.hidden = true; };
  caja.append(el('h2', {}, 'Desarrollo', boton('CERRAR', cierra)), el('div', { id: 'dev-aviso' }));
  for (const u of UTILIDADES) { caja.append(el('h3', { textContent: u.titulo })); const c = el('div'); try { u.pinta(c); } catch (e) { c.textContent = 'Error: ' + e.message; } caja.append(c); }
  panel.append(caja); panel.addEventListener('click', e => { if (e.target === panel) cierra(); });
  const abre = el('button', { id: 'dev-boton', textContent: 'DEV', title: 'Utilidades de desarrollo', onclick: () => { panel.hidden = !panel.hidden; } });
  abre.setAttribute('translate', 'no');
  document.head.append(estilo); document.body.append(abre, panel);
  if (new URLSearchParams(location.search).get('devabrir')) panel.hidden = false;
})();

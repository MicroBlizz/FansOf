// Fans Of · DESARROLLO: un botón «DEV» con utilidades para quien trabaja en el juego. Existe en la alfa y en modo desarrollo (NUCLEO.desarrollo:
// localhost, o ?dev=1 en la dirección; ?dev=0 lo apaga) y, en la web publicada y la app, solo con el rol «alfa» (ADR 096): ahí sin los flags ni el
// modo desarrollo, que no actúan fuera de él. Es común: los dos juegos lo tienen igual.
// Para añadir una utilidad, apúntala en UTILIDADES: { titulo, pinta(caja), soloDesarrollo? } y pinta lo suyo dentro de `caja`.
// La de «Probador» (cuentas con rol alfa, ADR 146) solo pinta: lo que hace está en probador.js (PROBADOR).
// Las de un solo juego van en ese juego: que defina UTILIDADES_JUEGO (una lista igual) y salen aquí, detrás de «Este juego».
'use strict';
(() => {
  let pintaFlags = () => {}, pintaProbador = () => {};
  const CLAVE_DEPURA = 'fansof-idioma-depura';
  const guardado = () => { try { return localStorage.getItem(typeof AJUSTES !== 'undefined' && AJUSTES.guardado); } catch (e) { return null; } };
  const el = (tag, props = {}, ...hijos) => { const e = Object.assign(document.createElement(tag), props); for (const h of hijos) e.append(h); return e; };
  const boton = (txt, fn, props = {}) => el('button', Object.assign({ textContent: txt, onclick: fn }, props));
  const aviso = txt => { const t = document.getElementById('dev-aviso'); if (t) { t.textContent = txt; clearTimeout(aviso.t); aviso.t = setTimeout(() => { t.textContent = ''; }, 3500); } };
  const copiar = async txt => { try { await navigator.clipboard.writeText(txt); aviso('Copiado al portapapeles'); } catch (e) { aviso('No se ha podido copiar: usa el recuadro'); } };

  // el contador de fps (#rend-fps de core y #medidor de Taxi) se puede ocultar desde aquí; lo recuerda este navegador. Solo existe en la alfa y en localhost.
  const CLAVE_FPS = 'fansof-fps-oculto';
  const fpsVisibles = () => { try { return localStorage.getItem(CLAVE_FPS) !== '1'; } catch (e) { return true; } };
  function poneFps(visible) {
    try { localStorage.setItem(CLAVE_FPS, visible ? '0' : '1'); } catch (e) { /* sin guardar */ }
    let st = document.getElementById('dev-fps-estilo');
    if (!st) { st = el('style', { id: 'dev-fps-estilo' }); document.head.appendChild(st); }
    st.textContent = visible ? '' : '#rend-fps,#medidor{display:none !important}';
  }
  poneFps(fpsVisibles());
  const UTILIDADES = [
    { titulo: 'Este juego', pinta(c) {
      const filas = [['Juego', (typeof AJUSTES !== 'undefined' && AJUSTES.nombre) || document.title], ['Versión', typeof VERSION !== 'undefined' ? VERSION : '?'], ['Idioma', NUCLEO.idioma],
        ['Navegador', (navigator.languages || [navigator.language]).join(', ')], ['Partida guardada en', (typeof AJUSTES !== 'undefined' && AJUSTES.guardado) || '?']];
      c.append(el('table', {}, ...filas.map(([a, b]) => el('tr', {}, el('td', { textContent: a }), el('td', { textContent: b })))));
      c.append(el('div', { className: 'fila' }, boton('Copiar', () => copiar(filas.map(([a, b]) => a + ': ' + b).join('\n')))));
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
    { titulo: 'Hora del juego', pinta(c) {   // ADR 047: la hora puesta a mano (HORA.pon) dura lo que la pestaña; se recarga para que el juego la tome
      if (typeof HORA === 'undefined') { c.append(el('p', { textContent: 'Este juego no carga la hora de core.' })); return; }
      const texto = () => new Date(HORA.ahora()).toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      const recarga = () => { const u = new URL(location.href); u.searchParams.delete('hora'); location.replace(u.toString()); };
      const hora = el('input', { type: 'time', value: '10:00' }), dias = el('input', { type: 'number', value: '0', min: '0', max: '365', style: 'width:4em' });
      c.append(el('p', { textContent: (HORA.manual ? 'Puesta a mano: ' : 'Real: ') + texto(), style: HORA.manual ? 'color:#ff8a3d;font-weight:700' : '' }));
      c.append(el('div', { className: 'fila' }, hora, el('span', { textContent: '+ días' }), dias,
        boton('Poner esta hora', () => { if (HORA.pon(hora.value, +dias.value || 0)) recarga(); else aviso('No es una hora válida'); }),
        boton('Hora real', () => { HORA.suelta(); recarga(); })));
    } },
    { titulo: 'Partida', pinta(c) {
      const caja = el('textarea', { rows: 4, placeholder: 'La partida, en JSON. Pega aquí una para cargarla.' });
      c.append(el('div', { className: 'fila' },
        boton('Ver / copiar la partida', () => { caja.value = guardado() || ''; copiar(caja.value); }),
        boton('Cargar la que hay en el recuadro', () => { try { JSON.parse(caja.value); localStorage.setItem(AJUSTES.guardado, caja.value); location.reload(); } catch (e) { aviso('No es un JSON válido'); } }),
        boton('Borrar la partida', () => { if (confirm('¿Borrar la partida de este juego?')) { try { localStorage.removeItem(AJUSTES.guardado); } catch (e) { /* sin guardar */ } location.reload(); } }, { className: 'peligro' })));
      c.append(caja);
    } },
    // la cuenta de probador (rol alfa, ADR 146; core/js/sistema/probador.js): solo sale con ese rol y en un juego con id. Se repinta al abrir el panel,
    // porque el rol llega de fondo. Los botones de moneda, solo si el juego declara moneda comprada (AJUSTES.monedas) o engancha 'probador-regalo'
    { titulo: 'Probador', pinta(c) {
      const conMoneda = () => (typeof MONEDAS !== 'undefined' && MONEDAS.activo()) || (typeof HOOKS !== 'undefined' && (HOOKS['probador-regalo'] || []).length > 0);
      const dice = txt => { panel.hidden = false; aviso(txt); };
      // toda petición acaba en un aviso: lo que dice el servidor, o que el juego ha fallado al aplicarlo (nunca se queda en «Pidiendo…»)
      const seguro = async (hazlo, di) => { try { await hazlo(); } catch (e) { console.error('Panel DEV · Probador', e); di(PROBADOR.texto('entrega')); } };
      const trasRegalo = (r, n, moneda) => (!r.ok ? PROBADOR.texto(r.error)
        : r.sinMostrar ? 'El servidor ha sumado ' + n + ' de ' + moneda + ', pero este juego no lo enseña todavía: ' + r.sinMostrar : '+' + n + ' ' + moneda);
      const regala = (n, moneda) => { aviso('Pidiendo al servidor…'); return seguro(async () => aviso(trasRegalo(await PROBADOR.regalo(n), n, moneda)), aviso); };
      function resetea(que) {   // la confirmación es la ventana del juego (queda debajo del panel: se cierra); sin ella, la del navegador
        const a = PROBADOR.avisoReseteo(que), hazlo = () => seguro(async () => { const r = await PROBADOR.resetea(que); if (!r.ok) dice(PROBADOR.texto(r.error)); }, dice);
        if (typeof confirmBox === 'function') { cierra(); confirmBox(a.titulo, a.texto, a.boton, hazlo); } else if (confirm(a.texto)) hazlo();
      }
      // el nombre de la moneda: el de MONEDAS si el juego declara AJUSTES.monedas; si solo engancha 'probador-regalo', el de AJUSTES.probador.moneda
      const nombreMoneda = () => (typeof MONEDAS !== 'undefined' && MONEDAS.activo() ? MONEDAS.nombre('comprada') : (typeof AJUSTES !== 'undefined' && AJUSTES.probador && AJUSTES.probador.moneda) || 'moneda de pago');
      pintaProbador = () => {
        const sale = typeof PROBADOR !== 'undefined' && !!PROBADOR.puede && PROBADOR.puede();
        c.textContent = ''; c.hidden = !sale; if (c.previousElementSibling) c.previousElementSibling.hidden = !sale;
        if (!sale) return;
        if (conMoneda()) {
          const moneda = nombreMoneda();
          c.append(el('p', { textContent: 'Suma ' + moneda + ' desde el servidor: vale también en la web publicada.' }));
          c.append(el('div', { className: 'fila' }, ...[100, 1000, 10000].map(n => boton('+' + n + ' ' + moneda, () => regala(n, moneda)))));
        }
        c.append(el('p', { textContent: 'Resetear la cuenta en este juego, en el servidor y en este navegador. No se puede deshacer.' }));
        c.append(el('div', { className: 'fila' }, ...[['recursos', 'Recursos'], ['progreso', 'Progreso'], ['todo', 'Todo']].map(([que, txt]) => boton(txt, () => resetea(que), { className: 'peligro' }))));
      };
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
    { titulo: 'Flags de desarrollo', soloDesarrollo: true, pinta(c) {
      pintaFlags = () => {
        c.textContent = '';
        const nombres = Object.keys(NUCLEO.flagsDev);
        if (!nombres.length) { c.append(el('p', { textContent: 'Ningún flag registrado todavía (se registran al usarse con NUCLEO.flag). Aquí mandan tus interruptores; en la web publicada manda la tabla flags.' })); return; }
        for (const n of nombres) {
          const on = NUCLEO.flag(n, NUCLEO.flagsDev[n]);
          c.append(el('div', { className: 'fila' }, boton((on ? 'ON  ' : 'OFF ') + n, () => { try { localStorage.setItem('fansof-flag-' + n, on ? '0' : '1'); } catch (e) { /* sin guardar */ } location.reload(); }), el('span', { textContent: `${NUCLEO.flagsDev[n]} · base de datos: ${NUCLEO.flagRemoto(n) ? (NUCLEO.flagRemoto(n).valor ? 'true' : 'false') + (NUCLEO.flagRemoto(n).porcentaje < 100 ? ' al ' + NUCLEO.flagRemoto(n).porcentaje + ' %' : '') : 'sin fila'}` })));
        }
      };
      pintaFlags();
      c.append(el('div', { className: 'fila' }, boton('Leer la base de datos ahora', async () => { await NUCLEO.leerFlags(); pintaFlags(); })));
    } },
    { titulo: 'Contador de fps', pinta(c) {
      c.append(el('p', { textContent: 'Muestra u oculta los fps en pantalla (el de core y el medidor de Taxi). Visible por defecto; se recuerda en este navegador.' }));
      const b = boton('', () => { poneFps(!fpsVisibles()); pintaB(); });
      const pintaB = () => { b.textContent = fpsVisibles() ? 'Ocultar los fps' : 'Mostrar los fps'; };
      pintaB(); c.append(el('div', { className: 'fila' }, b));
    } },
    { titulo: 'Botones flotantes', soloDesarrollo: true, pinta(c) {   // solo en la alfa y en local, como FLOTANTES (ADR 217)
      c.append(el('p', { textContent: 'DEV, comentarios y PROTOTIPO se arrastran a cualquier borde. La versión de la alfa y los fps no reciben toques: se mueven desde aquí. Todo se recuerda en este navegador.' }));
      const BORDES = [['izq', 'izquierda'], ['der', 'derecha'], ['arriba', 'arriba'], ['abajo', 'abajo']];
      for (const [id, nombre] of [['alfa', 'Versión'], ['fps', 'fps']]) c.append(el('div', { className: 'fila' }, ...BORDES.map(([b, t]) => boton(nombre + ': ' + t, () => avisa(FLOTANTES.mueve(id, b), nombre + ' a ' + t)))));
      c.append(el('div', { className: 'fila' }, boton('Devolverlos a su sitio de serie', () => avisa(FLOTANTES.reinicia(), 'Todos a su sitio de serie'))));
      function avisa(r, txt) { aviso(txt + (r.guardado ? '' : ' (sin guardar: vale hasta recargar)')); }   // sin almacenamiento, vale hasta recargar
    } },
    { titulo: 'Ahorro de batería', pinta(c) {
      if (typeof AHORRO === 'undefined') { c.append(el('p', { textContent: 'Este juego no carga el ahorro de core.' })); return; }
      c.append(el('p', { textContent: 'El mismo interruptor que en Opciones (ADR 218): se cambia en caliente, en mitad de la partida. Mira el contador de fps al cambiarlo.' }));
      const b = boton('', () => { AHORRO.cambia(); pintaB(); });
      const pintaB = () => { b.textContent = AHORRO.activo() ? 'Apagar el ahorro' : 'Encender el ahorro'; };
      pintaB(); c.append(el('div', { className: 'fila' }, b));
    } },
    { titulo: 'Modo desarrollo', soloDesarrollo: true, pinta(c) {
      c.append(el('p', { textContent: 'Se activa solo en localhost, o con ?dev=1 en la dirección (se recuerda en este navegador).' }));
      c.append(el('div', { className: 'fila' }, boton('Apagarlo en este navegador', () => { try { localStorage.setItem('fansof-dev', '0'); } catch (e) { /* sin guardar */ } location.reload(); })));
    } },
  ];
  if (typeof UTILIDADES_JUEGO !== 'undefined') UTILIDADES.splice(1, 0, ...UTILIDADES_JUEGO.map(u => Object.assign({ soloDesarrollo: true }, u)));   // las propias del juego (ver arriba): escriben su partida, así que solo salen donde hay modo desarrollo o alfa; una puede salir en todas con soloDesarrollo: false

  const estilo = el('style', { textContent: `
    #dev-boton { position: fixed; left: 6px; bottom: 6px; z-index: 99998; font: 800 11px/1 system-ui, sans-serif; letter-spacing: 1px; padding: 6px 8px; border-radius: 8px; border: 2px solid #20102c; background: #ffcb3d; color: #20102c; opacity: 0.55; cursor: pointer; }
    #dev-boton:hover, #dev-boton:focus-visible { opacity: 1; }
    #dev-panel { position: fixed; inset: 0; z-index: 99999; background: rgba(10, 4, 18, .86); display: flex; align-items: flex-start; justify-content: center; overflow: auto; padding: 16px; box-sizing: border-box; font: 14px/1.4 system-ui, sans-serif; color: #f3ecff; }
    #dev-panel[hidden] { display: none; }
    #dev-panel .caja { width: 100%; max-width: 520px; background: #2a1840; border: 3px solid #20102c; border-radius: 14px; padding: 14px 16px 16px; }
    #dev-panel h2 { margin: 0 0 8px; font-size: 18px; color: #ffcb3d; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    #dev-panel h3 { margin: 14px 0 6px; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; color: #ffcb3d; }
    #dev-panel p { margin: 4px 0; color: #cdb9ea; }
    #dev-panel table { border-collapse: collapse; user-select: text; -webkit-user-select: text; } #dev-panel td { padding: 2px 10px 2px 0; vertical-align: top; } #dev-panel td:first-child { color: #cdb9ea; }
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
  // con el rol «alfa» en la release (sin modo desarrollo ni alfa) se quitan las que solo actúan en el modo desarrollo
  const enRelease = !NUCLEO.desarrollo && !NUCLEO.alfa;
  for (const u of UTILIDADES.filter(x => !(enRelease && x.soloDesarrollo))) { caja.append(el('h3', { textContent: u.titulo })); const c = el('div'); try { u.pinta(c); } catch (e) { c.textContent = 'Error: ' + e.message; } caja.append(c); }
  panel.append(caja); panel.addEventListener('click', e => { if (e.target === panel) cierra(); });
  const abre = el('button', { id: 'dev-boton', textContent: 'DEV', title: 'Utilidades de desarrollo', onclick: () => { panel.hidden = !panel.hidden; if (!panel.hidden) { pintaFlags(); pintaProbador(); } } });
  abre.setAttribute('translate', 'no');
  document.head.append(estilo); document.body.append(abre, panel);
  FLOTANTES.movible(abre, { id: 'dev', borde: 'abajo', a: 0 });   // en la alfa y en local se arrastra a cualquier borde; de serie, abajo a la izquierda como siempre (ADR 217)
  pintaProbador();   // ya con su título puesto: sin cuenta de probador, el bloque no se ve
  if (new URLSearchParams(location.search).get('devabrir')) panel.hidden = false;
})();

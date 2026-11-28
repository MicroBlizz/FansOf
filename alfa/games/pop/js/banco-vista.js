// Fans of Pop · PRUEBA DE RENDIMIENTO, lo que se ve al volver (tarea 404; adaptador): si hay una tanda guardada por js/banco-juego.js,
// enseña una ventana cerrable con la lectura (js/banco-reglas.js): por escenario, fps medio y del 1 % peor con todo, si va bien y qué
// variante gana más fps; y, si había una tanda anterior, qué ha empeorado. Luego avisa a quien quiera
// enviarla: PP_BANCO_VISTA.alVolver(tanda) dispara hook('pop-banco', tanda) (el envío al servidor se engancha ahí, nunca aquí) y quien envía
// cuenta en la ventana qué pasó con PP_BANCO_VISTA.envio(texto) y, con un final, PP_BANCO_VISTA.termina(tanda) la guarda como «anterior».
// Si la ventana falla, la tanda se envía igual.
'use strict';
const PP_BANCO_VISTA = (() => {
  const K = PP_BANCO_URL.CLAVES;
  const leer = clave => { try { return JSON.parse(localStorage.getItem(clave)); } catch (e) { console.error('banco: no se pudo leer ' + clave, e); return null; } };
  const quitar = clave => { try { localStorage.removeItem(clave); } catch (e) { console.error('banco: no se pudo borrar ' + clave, e); } };
  const poner = (clave, v) => { try { localStorage.setItem(clave, JSON.stringify(v)); } catch (e) { console.error('banco: no se pudo guardar ' + clave, e); } };
  const valida = t => !!t && t.v === 1 && Array.isArray(t.pasos);
  // los nombres que se leen: cada frase entera, para que lleve su inglés
  const ESCENARIOS = () => ({ lado4: tr('Nivel de 4'), lado5: tr('Nivel de 5'), lado6: tr('Nivel de 6'), equipo: tr('Equipo explosivo'), victoria: tr('Victoria'), derrota: tr('Derrota'), duelo: tr('Duelo'), memoria: tr('Memoria') });
  const VARIANTES = () => ({
    ahorro: tr('Ahorro de batería'), 'sin-fondo': tr('Sin fondo'), 'sin-bandeja': tr('Sin bandeja'), 'sin-burbujas': tr('Sin burbujas'),
    'sin-marcador': tr('Sin marcador'), 'sin-efectos': tr('Sin efectos'), 'sin-desenfoque': tr('Sin desenfoque'),
  });
  const nombre = (tabla, id) => tabla[id] || id;
  const celda = (tag, texto, estilo = '') => { const c = document.createElement(tag); c.textContent = texto; c.style.cssText = 'padding:3px 6px;text-align:left;' + estilo; return c; };
  const fila = celdas => { const f = document.createElement('tr'); f.append(...celdas); return f; };
  function filaLectura(l, esc, vars) {
    if (!l.todo) return fila([celda('td', nombre(esc, l.escenario)), celda('td', tr('Sin medida'), 'color:#f88;'), celda('td', ''), celda('td', ''), celda('td', '')]);
    const g = l.ganan[0], mejor = g && g.gana > 0 ? `${nombre(vars, g.variante)} +${g.gana} fps` : '—';
    return fila([celda('td', nombre(esc, l.escenario)), celda('td', String(l.todo.fps)), celda('td', String(l.todo.p1)),
      celda('td', l.bien ? tr('Sí') : tr('No'), l.bien ? 'color:#7ddc8b;' : 'color:#f88;'), celda('td', mejor)]);
  }
  function tabla(lectura) {
    const esc = ESCENARIOS(), vars = VARIANTES(), t = document.createElement('table');
    t.style.cssText = 'border-collapse:collapse;font:12px/1.4 sans-serif;width:100%';
    t.append(fila([tr('Escenario'), tr('fps medio'), tr('fps 1 % peor'), tr('Va bien'), tr('Lo que más gana')].map(x => celda('th', x))));
    lectura.forEach(l => t.append(filaLectura(l, esc, vars)));
    return t;
  }
  function textoEmpeora(peores) {
    const esc = ESCENARIOS(), vars = VARIANTES(), p = document.createElement('p');
    p.style.cssText = 'font:12px/1.5 sans-serif;margin:8px 0 0';
    if (!peores) { p.textContent = tr('Sin tanda anterior con la que comparar.'); return p; }
    if (!peores.length) { p.textContent = tr('Nada ha empeorado respecto a la tanda anterior.'); return p; }
    p.textContent = tr('Ha empeorado respecto a la tanda anterior:') + ' ' + peores.slice(0, 5).map(x => `${nombre(esc, x.escenario)} · ${x.variante === 'todo' ? tr('Todo') : nombre(vars, x.variante)} ${x.antes} → ${x.ahora} fps`).join('; ');
    return p;
  }
  // la línea que dice qué pasó con el envío: la rellena quien envía (js/banco-envio.js) con PP_BANCO_VISTA.envio(texto)
  const estado = document.createElement('p');
  const envio = texto => { estado.textContent = tr('Envío al servidor:') + ' ' + texto; };
  // qué ha empeorado; una «anterior» que no se puede comparar (de otra versión) cuenta como que no hay anterior
  function comparaCon(anterior, tanda) {
    if (!valida(anterior)) return null;
    try { return PP_BANCO_REGLAS.empeora(anterior, tanda); } catch (e) { console.error('banco: la tanda anterior no se puede comparar', e); return null; }
  }
  // la ventana: una capa por encima de todo con su título, lo que se le pase y su botón de cerrar
  function capaCon(...partes) {
    const capa = document.createElement('div'), caja = document.createElement('div'), titulo = document.createElement('h2'), cerrar = document.createElement('button');
    capa.style.cssText = 'position:fixed;inset:0;z-index:99998;display:flex;align-items:center;justify-content:center;background:rgba(10,5,25,.6);padding:12px';
    caja.style.cssText = 'max-width:560px;width:100%;max-height:90vh;overflow:auto;background:#241446;color:#fff;border-radius:14px;padding:14px;box-sizing:border-box';
    titulo.textContent = tr('Prueba de rendimiento'); titulo.style.cssText = 'font:bold 16px sans-serif;margin:0 0 8px';
    cerrar.textContent = tr('Cerrar'); cerrar.style.cssText = 'margin-top:10px;padding:6px 14px;font:bold 13px sans-serif;border-radius:10px;border:0;background:#ff6ec7;color:#fff';
    cerrar.onclick = () => capa.remove();
    caja.append(titulo, ...partes, cerrar);
    capa.append(caja); document.body.append(capa);
    return capa;
  }
  function muestra(tanda, anterior) {
    const peores = comparaCon(anterior, tanda);
    estado.textContent = tr('Envío al servidor: no se ha intentado'); estado.style.cssText = 'font:12px/1.5 sans-serif;margin:8px 0 0;opacity:.85';
    return capaCon(tabla(PP_BANCO_REGLAS.lectura(tanda)), textoEmpeora(peores), estado);
  }
  // la prueba se rompió entera: el aviso con el motivo (corto) para poder contarlo
  function muestraFallo(motivo) {
    const p = document.createElement('p'), m = document.createElement('p');
    p.textContent = tr('La prueba de rendimiento ha fallado y no hay tanda.'); p.style.cssText = 'font:13px/1.5 sans-serif;margin:0';
    m.textContent = motivo.split('\n')[0].slice(0, 160); m.style.cssText = 'font:11px/1.4 monospace;margin:8px 0 0;opacity:.8;word-break:break-word';
    return capaCon(p, m);
  }
  // el punto donde se engancha el envío de la tanda al servidor (el nodo que lo haga: hook('pop-banco', fn))
  const alVolver = tanda => { if (typeof fire === 'function') fire('pop-banco', tanda); };
  // la tanda ya tiene su final (enviada, o un no que no cambia al reintentar): pasa a ser la «anterior» y deja de estar pendiente. Lo llama quien envía;
  // hasta entonces sigue guardada, y si la página se va antes (p. ej. core recarga para traer la partida de la nube), se enseña y se envía al volver
  function termina(tanda) { poner(K.anterior, tanda); quitar(K.resultado); }
  // la prueba se rompió entera (js/banco-juego.js apunta el motivo): se dice y se apunta en ERRORES para encontrarlo después
  function miraFallo() {
    const f = leer(K.fallo);
    if (!f) return;
    quitar(K.fallo);
    const motivo = String(f.motivo || '?');
    if (typeof ERRORES !== 'undefined') ERRORES.registrar('js', 'banco/prueba', motivo);
    muestraFallo(motivo);
  }
  // al llegar a la dirección normal: si hay tanda guardada, se enseña y se avisa a quien la envía
  function mira() {
    miraFallo();
    const tanda = leer(K.resultado);
    if (!valida(tanda)) { if (tanda) quitar(K.resultado); return; }
    const anterior = leer(K.anterior);
    // si la ventana falla (p. ej. una «anterior» de otra versión), se apunta y la tanda se envía igual
    try { muestra(tanda, anterior); } catch (e) { console.error('banco: no se pudo enseñar la tanda', e); if (typeof ERRORES !== 'undefined') ERRORES.registrar('js', 'banco/muestra', e && e.message); }
    alVolver(tanda);
  }
  // la portada tarda en salir (splash de core): se espera a verla
  function alLlegar() { const m = () => { if (PP_ESCENARIO.style.visibility === '') mira(); else setTimeout(m, 300); }; m(); }
  return Object.freeze({ alLlegar, alVolver, muestra, envio, termina });
})();

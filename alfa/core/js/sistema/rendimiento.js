// Fans Of · RENDIMIENTO: contador de fps en pantalla y envío anónimo de cómo va el juego (fps medio, caídas, aparato) al servidor.
// Un juego lo activa con RENDIMIENTO.activar() al empezar la partida y RENDIMIENTO.parar() al acabar o salir (ahí se manda el resumen).
// Datos solo técnicos y sin cuenta: nada de nombre, email ni identificador. Servidor: enviar_rendimiento (servidor/38-rendimiento.sql).
// Sin la cuenta de core (CUENTA.activa) o sin que el servidor tenga la función, no se manda nada y el juego sigue igual.
'use strict';
const RENDIMIENTO = (() => {
  const CUBOS = [8, 12, 16.7, 20, 25, 33, 50, 100];   // ms por fotograma: 120, 83, 60, 50, 40, 30, 20 y 10 fps
  const MIN_SEG = 8;                                   // una sesión más corta no vale
  let raf = 0, ult = 0, ses = null, el = null, mostrar = false, vent = { t: 0, n: 0 }, fps = 0;
  const nueva = () => ({ t0: performance.now(), frames: 0, suma: 0, peor: 0, hist: new Array(CUBOS.length + 1).fill(0), extra: {} });
  function tick(ahora) {
    raf = requestAnimationFrame(tick);
    const dt = ahora - ult; ult = ahora;
    if (!ses || dt <= 0 || dt > 1000 || document.hidden) return;   // pausas y pestañas ocultas no cuentan
    ses.frames++; ses.suma += dt; if (dt > ses.peor) ses.peor = dt;
    let i = 0; while (i < CUBOS.length && dt > CUBOS[i]) i++; ses.hist[i]++;
    vent.t += dt; vent.n++;
    if (vent.t >= 500) { fps = Math.round(vent.n * 1000 / vent.t); vent.t = 0; vent.n = 0; pinta(); }
  }
  function pinta() {
    if (!mostrar) { if (el) el.style.display = 'none'; return; }
    if (!el) { el = document.createElement('div'); el.id = 'rend-fps'; el.style.cssText = 'position:fixed;left:50%;bottom:3px;transform:translateX(-50%);z-index:99999;font:800 12px "Baloo 2",monospace;padding:1px 7px;border-radius:8px;background:rgba(10,8,28,.7);pointer-events:none'; document.body.appendChild(el); }
    el.style.display = ''; el.textContent = fps + ' fps'; el.style.color = fps >= 50 ? '#7dff9b' : fps >= 30 ? '#ffd93d' : '#ff6b6b';
  }
  function resumen() {
    if (!ses || ses.frames < 60 || (performance.now() - ses.t0) / 1000 < MIN_SEG) return null;
    // el 1 % peor: el fotograma por debajo del cual está el 99 % (cota superior del cubo)
    let acum = 0, i = 0; const corte = ses.frames * 0.99; while (i < ses.hist.length - 1 && acum + ses.hist[i] < corte) { acum += ses.hist[i]; i++; }
    const ms = i < CUBOS.length ? CUBOS[i] : Math.max(100, ses.peor), r2 = x => Math.round(x * 100) / 100;
    return {
      juego: (typeof AJUSTES !== 'undefined' && AJUSTES.id) || 'desconocido', version: String(NUCLEO.version || '').slice(0, 24), alfa: !!NUCLEO.alfa,
      plataforma: /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) ? 'movil' : 'pc',
      ancho: innerWidth, alto: innerHeight, dpr: r2(devicePixelRatio || 1), nucleos: navigator.hardwareConcurrency || null, memoria: navigator.deviceMemory || null,
      fps_medio: r2(ses.frames * 1000 / ses.suma), fps_p1: r2(1000 / ms), fps_min: r2(1000 / ses.peor), frames: ses.frames, segundos: Math.round(ses.suma / 1000), hist: ses.hist, extra: Object.assign({}, ses.extra, window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform() ? { app: 1 } : {})   // app: viene de la app de Android
    };
  }
  async function manda(r) {
    if (!r || typeof CUENTA === 'undefined' || !CUENTA.activa || (typeof DATOS !== 'undefined' && !DATOS.activo())) return;   // el jugador puede apagarlo en Opciones (datos-partida.js)
    try { await CUENTA.rpc('enviar_rendimiento', { p_datos: r }); } catch (e) { /* sin la función en el servidor: no pasa nada */ }
  }
  function activar(op) {
    mostrar = !op || op.mostrar !== false; ses = nueva(); vent = { t: 0, n: 0 };
    if (!raf) { ult = performance.now(); raf = requestAnimationFrame(tick); }
    pinta();
  }
  function parar() {
    const r = resumen(); ses = null; if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (el) el.style.display = 'none';
    manda(r);
  }
  // datos del juego que ayudan a leer los fps (el máximo que alcanza cada uno): RENDIMIENTO.dato('enemigos', 120)
  function dato(clave, valor) { if (ses && typeof valor === 'number' && isFinite(valor) && (ses.extra[clave] == null || valor > ses.extra[clave])) ses.extra[clave] = Math.round(valor); }
  document.addEventListener('visibilitychange', () => { if (document.hidden && ses) { manda(resumen()); ses = nueva(); } });   // al cerrar o cambiar de pestaña se manda lo que haya
  return { activar, parar, dato, contador: v => { mostrar = !!v; pinta(); }, get fps() { return fps; } };
})();

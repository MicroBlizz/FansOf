// Fans Of · FLAGS: abrir o cerrar cosas de los juegos desde la base de datos (tabla `flags`, servidor/22-flags.sql), sin desplegar.
// Lo nuevo o a medias se esconde tras NUCLEO.desarrollo (sin más) o, si hace falta un flag propio, tras NUCLEO.flag('nombre', 'qué hace', valorEnWeb).
// · En desarrollo vale true salvo que se apague en el panel DEV (así se prueba todo).
// · En la web publicada manda la tabla: se lee al arrancar y cada 5 minutos, y se guarda el último valor por si no hay red. Sin fila ni valor guardado vale
//   `valorEnWeb` (false si no se pone; true para algo ya abierto que se quiere poder cerrar de golpe).
// · Cada fila vale para un juego o para todos ('*') y para una plataforma ('web', 'android') o todas ('*'); manda la más concreta. `porcentaje` abre el flag solo a ese % de jugadores.
// · Se pregunta cada vez que se necesita (no se guarda en una constante) para que un cambio llegue sin recargar; NUCLEO.alCambiarFlags(fn) avisa de los cambios.
// · Dos nombres tienen efecto propio, sin escribir código: 'mantenimiento' (valor true: sale una franja con el mensaje) y 'version-minima' (dato = '0.9.110': a quien tenga una
//   versión anterior le sale un aviso para recargar).
// Cada flag queda registrado en el panel DEV. Al terminar la tarea, el flag se quita del código y su fila de la tabla (ver CLAUDE.md). El cliente solo oculta: lo que protege algo se comprueba también en el servidor.
'use strict';
(() => {
  const GUARDADOS = 'fansof-flags-remotos';
  const juegoActual = (location.pathname.match(/\/games\/([^/]+)/) || [])[1] || '';
  const plataforma = NUCLEO.nativa ? 'android' : 'web';
  const flagsDev = {};      // nombre → descripción de los flags usados en esta página
  const oyentes = [];
  let remotos = {}, ultimaLectura = 0;   // nombre → { valor, porcentaje, mensaje, dato }
  try { const g = JSON.parse(localStorage.getItem(GUARDADOS) || 'null'); if (g && g.r) remotos = g.r; } catch (e) { /* sin guardar */ }
  // el «cubo» de este navegador (0-99): fijo, para que un 10 % sean siempre los mismos jugadores
  const cubo = (() => {
    try { let c = localStorage.getItem('fansof-cubo'); if (c === null) { c = String(Math.floor(Math.random() * 100)); localStorage.setItem('fansof-cubo', c); } return +c; } catch (e) { return Math.floor(Math.random() * 100); }
  })();
  const flag = (nombre, descripcion = '', enProduccion = false) => {
    flagsDev[nombre] = descripcion;
    if (NUCLEO.desarrollo) { try { return localStorage.getItem('fansof-flag-' + nombre) !== '0'; } catch (e) { return true; } }
    const r = remotos[nombre];
    return r ? !!r.valor && cubo < r.porcentaje : enProduccion;
  };
  const flagRemoto = nombre => remotos[nombre];
  const flagMensaje = nombre => { const r = remotos[nombre]; return r ? ((NUCLEO.idioma === 'en' && r.mensaje_en) || r.mensaje || '') : ''; };
  const alCambiarFlags = fn => { oyentes.push(fn); };
  const comparaVersion = (a, b) => { const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number); for (let i = 0; i < Math.max(x.length, y.length); i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d; } return 0; };

  // la franja de arriba: mantenimiento o versión vieja
  let franja = null;
  function avisos() {
    const m = remotos.mantenimiento, v = remotos['version-minima'];
    const t = m && m.valor ? (flagMensaje('mantenimiento') || 'Estamos de mantenimiento: puede que algo no funcione.')
      : v && v.dato && comparaVersion(NUCLEO.version, v.dato) < 0 ? 'Hay una versión nueva del juego: recarga para seguir.' : '';
    if (!t) { if (franja) { franja.remove(); franja = null; } return; }
    const traduce = typeof tr === 'function' && !(m && m.valor && flagMensaje('mantenimiento')) ? tr : x => x;
    if (!franja) {
      franja = document.createElement('div'); franja.id = 'franja-flags'; franja.setAttribute('role', 'status');
      franja.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99990;background:#ffcb3d;color:#20102c;font:700 14px/1.3 system-ui,sans-serif;padding:8px 12px;text-align:center;border-bottom:3px solid #20102c';
      document.body.append(franja);
    }
    franja.textContent = traduce(t) + ' ';
    if (!(m && m.valor)) {
      const b = document.createElement('button'); b.textContent = typeof tr === 'function' ? tr('RECARGAR') : 'RECARGAR';
      b.style.cssText = 'font:800 13px system-ui,sans-serif;padding:4px 10px;border-radius:8px;border:2px solid #20102c;background:#fff;color:#20102c;cursor:pointer';
      b.onclick = async () => {
        try { for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister(); } catch (e) { /* sin sw */ }
        try { for (const k of await caches.keys()) await caches.delete(k); } catch (e) { /* sin caché */ }
        location.reload();
      };
      franja.append(b);
    }
  }

  async function leerFlags() {
    if (!/^https?:$/.test(location.protocol) || ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) return;
    try {
      const r = await fetch('https://awivkedbmumwnkqlfixm.supabase.co/rest/v1/flags?select=nombre,juego,plataforma,valor,porcentaje,mensaje,mensaje_en,dato', { cache: 'no-store', headers: { apikey: 'sb_publishable_iQ9OrvJmMx87u_uUMQ_uNw_UdBz78gn' } });
      if (!r.ok) return;
      const v = {}, puntos = {};
      for (const f of await r.json()) {   // de las filas que valen aquí, gana la más concreta (juego pesa más que plataforma)
        if (!(f.juego === '*' || f.juego === juegoActual) || !(f.plataforma === '*' || f.plataforma === plataforma)) continue;
        const p = (f.juego === '*' ? 0 : 2) + (f.plataforma === '*' ? 0 : 1);
        if (!(f.nombre in puntos) || p > puntos[f.nombre]) { puntos[f.nombre] = p; v[f.nombre] = { valor: f.valor, porcentaje: f.porcentaje, mensaje: f.mensaje, mensaje_en: f.mensaje_en, dato: f.dato }; }
      }
      const cambio = JSON.stringify(v) !== JSON.stringify(remotos);
      remotos = v; ultimaLectura = Date.now();
      try { localStorage.setItem(GUARDADOS, JSON.stringify({ r: v })); } catch (e) { /* sin guardar */ }
      avisos();
      if (cambio) oyentes.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
    } catch (e) { /* sin red: se queda el último valor */ }
  }

  Object.assign(NUCLEO, { flag, flagRemoto, flagMensaje, alCambiarFlags, flagsDev, leerFlags });
  if (!/[?&]sinflags\b/.test(location.search)) {   // el comparador de partidas lo apaga para no depender de la red
    window.addEventListener('load', () => { avisos(); leerFlags(); });
    setInterval(leerFlags, 5 * 60 * 1000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && Date.now() - ultimaLectura > 5 * 60 * 1000) leerFlags(); });
  }
})();

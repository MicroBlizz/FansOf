// Fans Of · PRÓXIMAMENTE: en la release (la web de siempre y la app) solo se juegan los juegos de ABIERTOS; el resto conserva su tarjeta y su ficha
// en la biblioteca, pero al abrirlo (por la librería o por su dirección) sale esta pantalla en vez del juego. En la alfa (/alfa/) y en desarrollo
// (localhost o ?dev=1) se juega todo, y también con una cuenta con el rol «beta» (se da en /gestion > Roles): el botón pasa a «JUGAR BETA». Para abrir un juego en la release: apúntalo en ABIERTOS y publica.
// Va aparte y sin depender de nada porque lo cargan la portada, nucleo.js (los juegos) y las demos que no usan nucleo.js. Los textos llevan su inglés aquí mismo.
'use strict';
window.PROXIMAMENTE = (() => {
  const ABIERTOS = ['rouflage'];
  const alfa = /\/alfa\//.test(location.pathname);
  const desarrollo = (() => {   // la misma regla que NUCLEO.desarrollo (core/js/nucleo.js)
    try {
      const v = localStorage.getItem('fansof-dev'); if (v) return v === '1';
    } catch (e) { /* sin guardar */ }
    if (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()) return false;
    return ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  })();
  // el rol «beta»: el veredicto se recuerda 6 horas en este navegador (como el de la alfa, core/js/sistema/alfa.js) y se vuelve a comprobar de fondo en cada carga
  const CLAVE = 'fansof-beta', HORAS = 6;
  const beta = () => { try { const v = JSON.parse(localStorage.getItem(CLAVE) || 'null'); return !!(v && v.hasta > Date.now()); } catch (e) { return false; } };
  const usadoBeta = beta();   // con lo que se ha pintado esta página
  const jugable = id => alfa || desarrollo || ABIERTOS.includes(id) || usadoBeta;
  const enBeta = id => usadoBeta && !alfa && !desarrollo && !ABIERTOS.includes(id);   // se juega solo por ser beta tester
  async function verificar() {   // lo llaman la librería y cada juego cuando ya hay cuenta; si el veredicto cambia, se recarga para pintar lo que toca
    if (alfa || desarrollo || typeof CUENTA === 'undefined' || !CUENTA.activa) return;
    let tiene = false;
    try { tiene = !CUENTA.invitado && !!(await CUENTA.rpc('tiene_rol', { p_rol: 'beta' })); } catch (e) { return; }   // sin red o sin la función: se queda como estaba
    try { if (tiene) localStorage.setItem(CLAVE, JSON.stringify({ hasta: Date.now() + HORAS * 3600e3 })); else localStorage.removeItem(CLAVE); } catch (e) { /* sin guardar */ }
    if (tiene !== usadoBeta) location.reload();
  }
  const m = location.pathname.match(/^(.*?)\/(?:games|demos)\/([^/]+)/);   // la página en la que estamos, si es un juego o una demo
  const base = m ? m[1] + '/' : '', id = m ? m[2] : '';
  const cerrado = !!m && !jugable(id);

  if (cerrado) {
    let en = false; try { const i = localStorage.getItem('fansof-idioma'); en = i ? i === 'en' : !/^es/i.test(navigator.language || 'es'); } catch (e) { /* sin guardar */ }
    const nombre = 'FANS OF ' + id.replace(/-/g, ' ').toUpperCase();
    document.documentElement.innerHTML = '<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' + nombre + '</title></head>' +
      '<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#20102c;color:#fff;font:600 16px/1.4 system-ui,sans-serif;text-align:center;padding:24px;box-sizing:border-box">' +
      '<div style="max-width:420px"><p style="margin:0 0 6px;color:#ffd24a;font-weight:800">' + nombre + '</p>' +
      '<h1 style="font:900 34px system-ui,sans-serif;margin:0 0 12px">' + (en ? 'COMING SOON' : 'PRÓXIMAMENTE') + '</h1>' +
      '<p>' + (en ? 'This game is not open yet. For now you can only play Fans Of Rouflage.' : 'Este juego aún no está abierto. Por ahora solo se puede jugar a Fans Of Rouflage.') + '</p>' +
      '<p style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:18px">' +
      '<a href="' + base + 'games/rouflage/" style="font:800 15px system-ui,sans-serif;padding:10px 16px;border-radius:10px;background:#7a2cff;color:#fff;text-decoration:none">' + (en ? 'PLAY ROUFLAGE' : 'JUGAR A ROUFLAGE') + '</a>' +
      '<a href="' + base + '" style="font:800 15px system-ui,sans-serif;padding:10px 16px;border-radius:10px;background:#3a2a4a;color:#fff;text-decoration:none">' + (en ? 'BACK TO THE LIBRARY' : 'VOLVER A LA LIBRERÍA') + '</a></p></div></body>';
    window.stop();   // el resto de la página (y sus scripts) no llega a ejecutarse
  }
  return { jugable, enBeta, verificar, cerrado, ABIERTOS };
})();

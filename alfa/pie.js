// Fans Of · PIE de las páginas de la web (inicio, privacidad, condiciones, lore, energía, android, gestión): los enlaces a las REDES (X y Discord), el © y la ETIQUETA DE BUILD, para saber qué versión se está viendo.
// La etiqueta sale de build.json, que escribe quien despliega: la alfa (herramientas/alfa.py: «alfa b<nº> · <commit>») y la release (herramientas/publicar.py: «release · <commit>»).
// En local (sin build.json) pone «build local». Si la página ya trae su línea de ©, con id="pie-fansof", solo le añade la etiqueta; si no, crea la línea.
// Se carga con <script src="…/pie.js" defer></script> desde cada página; no depende de nada más (core no se carga en estas páginas).
'use strict';
(() => {
  const base = (() => { try { return new URL('.', document.currentScript.src).href; } catch (e) { return ''; } })();
  let idioma = ''; try { idioma = localStorage.getItem('fansof-idioma') || ''; } catch (e) { /* sin guardar */ }
  const en = (idioma || new URLSearchParams(location.search).get('lang') || navigator.language || 'es').slice(0, 2) === 'en';
  const derechos = 'Fans Of™ · © 2026 ' + (en ? 'Arkioner and Pepins · MicroBlizz · All rights reserved' : 'Arkioner y Pepins · MicroBlizz · Todos los derechos reservados');
  const HUECO = '56px', FONDO = '#0b0613';   // FONDO: casi negro, más oscuro que los dos lilas de las bandas y que el menú, para que contraste siempre
  // REDES de Fans Of: una línea de enlaces encima del ©. Son los mismos que los botones de la portada (index.html, .redes): si cambian, en los dos sitios.
  const REDES = [['X', 'https://x.com/Fans_Of_'], ['Discord', 'https://discord.gg/PztHQhm9c']];
  const redes = el => {
    if (document.getElementById('pie-redes')) return;
    const p = document.createElement('p'); p.id = 'pie-redes';
    p.style.cssText = 'text-align:center;margin:28px 0 0;padding:0 16px;font:700 14px/1.5 var(--font-ui, "Baloo 2", system-ui, sans-serif);color:var(--ink-dim, #cdb9ea);background:' + FONDO + ';box-shadow:0 0 0 100vmax ' + FONDO + ';clip-path:inset(0 -100vmax);max-width:none';
    p.append(en ? 'Follow us: ' : 'Síguenos: ');
    REDES.forEach(([nombre, url], i) => {
      if (i) p.append(' · ');
      const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = nombre;
      a.style.cssText = 'color:var(--gold, #ffcf3f);text-decoration:none'; p.appendChild(a);
    });
    el.parentNode.insertBefore(p, el);
    el.style.marginTop = '0'; el.style.paddingTop = '8px';
  };
  const poner = txt => {
    let el = document.getElementById('pie-fansof');
    if (el) { const s = document.createElement('span'); s.className = 'pie-build'; s.textContent = ' · ' + txt; el.appendChild(s); }
    else {
      // la misma letra que la línea de la portada (p.note)
      el = document.createElement('p'); el.id = 'pie-fansof'; el.style.cssText = 'text-align:center;margin:40px 0 0;font:600 13px/1.5 var(--font-ui, "Baloo 2", system-ui, sans-serif);color:var(--ink-dim, #cdb9ea)';
      el.textContent = derechos + ' · ' + txt; document.body.appendChild(el);
    }
    // el pie es una banda del color del menú, a todo el ancho; el hueco de abajo (dentro de la banda) deja libre lo que va fijo en la esquina (la franja ALFA, el botón DEV)
    el.style.background = FONDO; el.style.boxShadow = '0 0 0 100vmax ' + FONDO; el.style.clipPath = 'inset(0 -100vmax)'; el.style.padding = '22px 16px ' + HUECO; el.style.marginBottom = '0'; el.style.maxWidth = 'none';
    const m = el.closest('main'); if (m) { m.style.paddingBottom = '0'; m.style.marginBottom = '0'; }
    redes(el);
  };
  const etiqueta = b => {
    const f = b.fecha ? new Date(b.fecha).toLocaleString(en ? 'en-GB' : 'es-ES', { dateStyle: 'medium', timeStyle: 'short' }) : '';
    return (b.canal === 'alfa' ? 'alfa b' + (b.build || '?') : 'release') + (b.hash ? ' · ' + b.hash : '') + (f ? ' · ' + f : '');
  };
  const pinta = () => {
    if (['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) return poner('build local');   // en local no hay build.json: sin pedirlo, para no llenar la consola de 404
    fetch(base + 'build.json', { cache: 'no-store' }).then(r => (r.ok ? r.json() : Promise.reject())).then(b => poner('build ' + etiqueta(b)), () => poner('build local'));
  };
  if (document.body) pinta(); else document.addEventListener('DOMContentLoaded', pinta);
})();

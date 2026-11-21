// Fans Of · PIE de las páginas de la web (inicio, privacidad, condiciones, lore, energía, android, gestión): los enlaces a las REDES (X y Discord), el © y la ETIQUETA DE BUILD, para saber qué versión se está viendo.
// La etiqueta sale de build.json, que escribe quien despliega: la alfa (herramientas/alfa.py: «alfa b<nº> · <commit>») y la release (herramientas/publicar.py: «release · <commit>»).
// En local (sin build.json) pone «build local». Si la página ya trae su línea de ©, con id="pie-fansof", solo le añade la etiqueta; si no, crea la línea.
// Se carga con <script src="…/pie.js" defer></script> desde cada página, detrás de idioma-web.js (el idioma). Su aspecto, en estilo/web.css (/gestion, que no la carga, lo trae en su hoja).
'use strict';
(() => {
  const base = (() => { try { return new URL('.', document.currentScript.src).href; } catch (e) { return ''; } })();
  const en = IDIOMA_WEB.elegido() === 'en';
  const derechos = 'Fans Of™ · © 2026 ' + (en ? 'Arkioner and Pepins · MicroBlizz · All rights reserved' : 'Arkioner y Pepins · MicroBlizz · Todos los derechos reservados');
  // REDES de Fans Of: una línea de enlaces encima del ©, en las páginas que no son la portada (ella los lleva en grande en su sección COMUNIDAD, index.html). Si cambian, en los dos sitios.
  const REDES = [['X', 'https://x.com/Fans_Of_'], ['Discord', 'https://discord.gg/PztHQhm9c']];
  const redes = el => {
    if (document.getElementById('pie-redes') || document.getElementById('comunidad')) return;   // la portada ya los tiene en grande (sección COMUNIDAD)
    const p = document.createElement('p'); p.id = 'pie-redes';
    p.append(en ? 'Follow us: ' : 'Síguenos: ');
    REDES.forEach(([nombre, url], i) => {
      if (i) p.append(' · ');
      const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = nombre;
      p.appendChild(a);
    });
    el.parentNode.insertBefore(p, el);
    el.classList.add('con-redes');
  };
  const poner = txt => {
    let el = document.getElementById('pie-fansof');
    if (el) { const s = document.createElement('span'); s.className = 'pie-build'; s.textContent = ' · ' + txt; el.appendChild(s); }
    else { el = document.createElement('p'); el.id = 'pie-fansof'; el.className = 'pie-creado'; el.textContent = derechos + ' · ' + txt; document.body.appendChild(el); }
    const m = el.closest('main'); if (m) m.classList.add('con-pie');   // la banda del pie cierra la página: el main no deja hueco debajo
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

// Fans Of · PROMO de nuestros juegos: mientras no haya anuncios pagados, el anuncio de prueba enseña la miniatura de OTRO juego activo
// (al azar, nunca el actual) y al pulsarla se abre su ficha en la biblioteca de la web. Cada juego solo llama a PROMO.html() y PROMO.enlaza(raiz).
// La lista es la de los juegos publicados con tarjeta en la biblioteca (sin los «en pausa» ni las demos): uno nuevo se apunta aquí.
'use strict';
const PROMO = (() => {
  const JUEGOS = [
    ['rumble', 'Fans Of Rumble'], ['td', 'Fans Of TD'], ['rouflage', 'Fans Of Rouflage'], ['karts', 'Fans Of Karts'], ['ratkov', 'Fans Of Ratkov'],
    ['jump', 'Fans Of Jump'], ['crush', 'Fans Of Crush'], ['survivors', 'Fans Of Survivors'], ['tacticas', 'Fans Of Rumble: Tácticas'],
    ['nova', 'Fans Of Nova'], ['decks', 'Fans Of Decks'],
  ].map(([id, nombre]) => ({ id, nombre }));
  const nativa = () => !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());
  // la biblioteca está dos carpetas por encima del juego (también en /alfa/); en la app de Android, la web de verdad
  const base = () => nativa() ? 'https://fansof.games/' : '../../';
  const elige = () => { const l = JUEGOS.filter(j => j.id !== AJUSTES.id); return l[Math.floor(Math.random() * l.length)] || null; };
  const estilo = () => {
    if (document.getElementById('promo-css')) return;
    const s = document.createElement('style'); s.id = 'promo-css';
    s.textContent = '.promo-ad { display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%; max-width: 360px; margin: 0 auto; padding: 8px; box-sizing: border-box; border-radius: 14px; border: 3px solid #20102c; background: rgba(8,4,14,.55); color: #fff; text-decoration: none; cursor: pointer; }'
      + '.promo-ad img { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 9px; border: 2px solid #20102c; background: #20102c; }'
      + '.promo-ad b { font-size: 17px; line-height: 1.1; } .promo-ad span { font-size: 12px; font-weight: 800; color: #7df3ff; }';
    document.head.appendChild(s);
  };
  // el trozo de HTML del anuncio (vacío si no hay otro juego); se pide uno nuevo cada vez que sale el anuncio
  const html = () => {
    const j = elige(); if (!j) return '';
    estilo();
    // banner apaisado 16:9 (biblioteca/anuncios/<id>.jpg, con el logo y el nombre dentro); mientras no exista, la captura y el nombre en texto
    const cap = `${base()}biblioteca/capturas/${j.id}-1.jpg`;
    return `<a class="promo-ad" data-promo="${j.id}" href="${base()}#juego-${j.id}" target="_blank" rel="noopener"><img src="${base()}biblioteca/anuncios/${j.id}.jpg" alt="${j.nombre}" onerror="this.onerror=function(){this.remove()};this.src='${cap}';this.nextElementSibling.hidden=false"><b hidden>${j.nombre}</b><span>${tr('Pulsa para conocerlo')}</span></a>`;
  };
  // en la app de Android el enlace interno no sirve: se abre en el navegador externo
  const enlaza = raiz => {
    const a = raiz && raiz.querySelector('[data-promo]'); if (!a) return;
    a.onclick = e => {
      if (typeof play === 'function') play('select');
      if (!nativa()) return;
      e.preventDefault();
      const Br = window.Capacitor.Plugins && window.Capacitor.Plugins.Browser;
      if (Br && Br.open) Br.open({ url: a.href }); else window.open(a.href, '_system');
    };
  };
  return { JUEGOS, elige, html, enlaza };
})();

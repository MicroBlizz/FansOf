// Boceto 3D de Fans of Rumble · Textos: se escriben en español y aquí está su inglés.
// El idioma se elige como en los juegos: el de Opciones (`fansof-idioma`) o, si no hay, el del navegador. Para probar: ?idioma=en
'use strict';

const EN = {
  // pantalla de inicio
  'Boceto 3D': '3D sketch',
  'No es el juego de verdad: es una prueba para ver cómo quedaría Fans of Rumble en 3D.': "It's not the real game: it's a test to see how Fans of Rumble would look in 3D.",
  'Toca tu lado del campo para soltar una unidad.': 'Tap your side of the field to drop a unit.',
  'Pulsa +30 para ver si tu móvil aguanta muchos muñecos a la vez.': 'Press +30 to see if your phone can handle lots of characters at once.',
  'Sube el volumen: las unidades hablan.': 'Turn the volume up: the units talk.',
  'Toca para empezar': 'Tap to start',
  'Tu navegador no puede mostrar 3D (WebGL).': "Your browser can't show 3D (WebGL).",
  // botones y marcador
  'Cámara': 'Camera', 'Lejos': 'Far', 'Cerca': 'Close',
  'Voz': 'Voice', 'Inventada': 'Made-up', 'Del móvil': "Phone's", 'Sin voz': 'Off',
  'Calidad': 'Quality', 'Alta': 'High', 'Baja': 'Low',
  '+30 muñecos': '+30 units',
  'muñecos': 'units', 'muñeco': 'unit',
  'Muy fluido': 'Very smooth', 'Fluido': 'Smooth', 'Justo': 'Borderline', 'Lento': 'Slow',
  'Midiendo…': 'Measuring…',
  'Solo en tu lado del campo': 'Only on your side of the field',
  '¡Victoria!': 'Victory!', '¡Derrota!': 'Defeat!',
  'Otra vez en 4 s': 'Again in 4 s',
  'Líder': 'Leader', 'Común · x2': 'Common · x2',
  'Juego automático': 'Auto play',
  // lo que dicen las unidades
  '¡CAOS!': 'CHAOS!',
  '¡Zanahoria al poder!': 'Carrot power!',
  '¡Abran paso al rey!': 'Make way for the king!',
  '¡Salto, salto, SALTO!': 'Jump, jump, JUMP!',
  '¡Bellotaaas!': 'Acoooorns!',
  '¡Más rápida que un parche!': 'Faster than a patch!',
  '¡A morder tobillos!': 'Ankle-biting time!',
  'Hago horas extra gratis…': 'Unpaid overtime again…',
  '¿Esto cuenta como prácticas?': 'Does this count as an internship?',
  'Mi jefe me está mirando…': 'My boss is watching…',
  'Solo quería un café…': 'I just wanted a coffee…',
  'Por fin, vacaciones…': 'Finally, a holiday…',
  'Microblizz: «esa torre nos sobraba»': 'Microblizz: "we didn\'t need that tower anyway"',
  '¡Nuestra torre!': 'Our tower!',
};

const pedido = (() => {
  try {
    const q = new URLSearchParams(location.search).get('idioma');
    return q || localStorage.getItem('fansof-idioma') || '';
  } catch (e) { return ''; }
})();

export const IDIOMA = pedido || ((navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en');

export function tr(s) { return IDIOMA === 'es' ? s : (EN[s] ?? s); }

// traduce los textos de la página marcados con data-t (el texto de dentro es el español)
export function traducirPagina() {
  document.documentElement.lang = IDIOMA;
  for (const el of document.querySelectorAll('[data-t]')) el.textContent = tr(el.textContent.trim());
}

// lo que dice cada unidad, según el momento
export const FRASES = {
  bunny: { sale: ['¡CAOS!', '¡Zanahoria al poder!', '¡Abran paso al rey!', '¡Salto, salto, SALTO!'], salto: ['¡CAOS!'] },
  squirrel: { sale: ['¡Bellotaaas!', '¡Más rápida que un parche!', '¡A morder tobillos!'] },
  becario: { sale: ['Hago horas extra gratis…', '¿Esto cuenta como prácticas?', 'Mi jefe me está mirando…', 'Solo quería un café…'], cae: ['Por fin, vacaciones…'] },
};

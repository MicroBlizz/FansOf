// Fans of Jump · Los PAISAJES del bosque, que cambian al avanzar: primavera, otoño (desde 1.500 m), los cerezos (3.000 m), la
// noche con luna y luciérnagas (5.000 m) y el amanecer antes de llegar a la madriguera (9.500 m). Cada uno tiene su hierba, sus
// árboles y arbustos 3D y lo que vuela (pétalos, hojas o luciérnagas). El cambio es suave: se mezcla en 60 m.
'use strict';

const PAISAJES = [
  { m: 0, hierba: '#a8d66b', manchas: ['rgba(150,200,90,0.5)', 'rgba(195,230,140,0.5)'], arbol: 'arbol0', arbusto: 'arbusto0', vuela: ['#ffc4d8', '#ffffff'] },
  { m: 1500, txt: '¡Llega el otoño!', hierba: '#cdbf62', manchas: ['rgba(190,150,70,0.45)', 'rgba(240,205,120,0.5)'], arbol: 'arbol_otono', arbusto: 'arbusto_otono', vuela: ['#ff9a3c', '#e8862a', '#ffd84a'] },
  { m: 3000, txt: '¡El bosque de los cerezos!', hierba: '#b2db88', manchas: ['rgba(150,200,110,0.5)', 'rgba(255,205,225,0.55)'], arbol: 'arbol_cerezo', arbusto: 'arbusto_cerezo', vuela: ['#ffb3cf', '#ffd6ea', '#ffffff'] },
  { m: 5000, txt: '¡Se hace de noche!', hierba: '#86b070', manchas: ['rgba(80,130,90,0.5)', 'rgba(160,210,170,0.4)'], arbol: 'arbol_noche', arbusto: 'arbusto_noche', vuela: ['#fff27a'], noche: 1 },
  { m: 9500, txt: '¡Amanece!', hierba: '#b4dc72', manchas: ['rgba(150,200,90,0.5)', 'rgba(255,225,150,0.5)'], arbol: 'arbol0', arbusto: 'arbusto0', vuela: ['#ffd84a', '#ffffff', '#ffc4d8'] },
];
const CAMBIO_PAISAJE = 600;   // en medidas del mundo: 60 m
const LUCES = [];             // las luciérnagas (en la pantalla)

function indicePaisaje(wy) { let i = 0; PAISAJES.forEach((p, j) => { if (wy >= p.m * 10) i = j; }); return i; }
// los dos paisajes que se mezclan a esa altura y cuánto del nuevo (0..1)
function mezclaPaisaje(wy) {
  const i = indicePaisaje(wy);
  if (!i) return { a: PAISAJES[0], b: PAISAJES[0], k: 1 };
  return { a: PAISAJES[i - 1], b: PAISAJES[i], k: Math.min(1, (wy - PAISAJES[i].m * 10) / CAMBIO_PAISAJE) };
}
function mezclaColor(c1, c2, k) {
  const a = parseInt(c1.slice(1), 16), b = parseInt(c2.slice(1), 16), m = s => Math.round(((a >> s) & 255) * (1 - k) + ((b >> s) & 255) * k);
  return `rgb(${m(16)},${m(8)},${m(0)})`;
}
const hierbaEn = wy => { const { a, b, k } = mezclaPaisaje(wy); return mezclaColor(a.hierba, b.hierba, k); };
// lo de un paisaje (árbol, arbusto, manchas): en la mezcla, unos del viejo y otros del nuevo según su azar «h»
const delPaisaje = (que, wy, h) => { const { a, b, k } = mezclaPaisaje(wy); return (h < k ? b : a)[que]; };
const nocheEn = wy => { const { a, b, k } = mezclaPaisaje(wy); return (a.noche || 0) * (1 - k) + (b.noche || 0) * k; };
const nocheAhora = () => nocheEn(CAM.y + PAN.H * 0.5);

// el fondo de hierba de la pantalla, con el color de cada altura
function pintaHierba() {
  const W = PAN.W, H = PAN.H, g = G.createLinearGradient(0, H, 0, 0);
  for (const k of [0, 0.5, 1]) g.addColorStop(k, hierbaEn(CAM.y + H * k));
  G.fillStyle = g; G.fillRect(0, 0, W, H);
}

function avanzaPaisaje(dt) {
  const J = JUEGO, i = indicePaisaje(J.conejo ? J.conejo.wy : 0), p = PAISAJES[i];
  if (J.modo === 'juego' && i > (J.paisaje || 0)) { J.paisaje = i; bandera(tr(p.txt), PASTEL.menta); SONIDO.meta(); }
  // lo que vuela cambia de color con el paisaje
  const { a, b, k } = mezclaPaisaje(CAM.y + PAN.H * 0.5);
  BONITO.petalos.forEach((q, j) => { const pal = (j / BONITO.petalos.length < k ? b : a).vuela; q.c = pal[j % pal.length]; });
  // las luciérnagas de la noche
  const n = nocheAhora();
  while (n > 0.05 && LUCES.length < 16) LUCES.push({ x: Math.random() * PAN.W, y: Math.random() * PAN.H, f: Math.random() * 6, v: azar(4, 9) });
  for (const l of LUCES) { l.f += dt; l.x += Math.cos(l.f * 0.7) * l.v * dt; l.y += Math.sin(l.f * 0.9) * l.v * dt + 3 * dt; if (l.y > PAN.H + 5) { l.y = -5; l.x = Math.random() * PAN.W; } }
  if (n <= 0.05) LUCES.length = 0;
}

// la noche: el mundo más oscuro y azul, la luna arriba y las luciérnagas brillando (encima del mundo, debajo del marcador)
function pintaNoche(t) {
  const n = nocheAhora();
  if (n < 0.02) return;
  const W = PAN.W, H = PAN.H;
  G.save();
  G.globalCompositeOperation = 'multiply'; G.fillStyle = mezclaColor('#ffffff', '#6a74c8', n * 0.85); G.fillRect(0, 0, W, H);
  G.globalCompositeOperation = 'lighter';
  // la luna, con su halo
  const mx = W * 0.82, my = H * 0.1, halo = G.createRadialGradient(mx, my, 3, mx, my, 40);
  halo.addColorStop(0, `rgba(255,250,210,${0.5 * n})`); halo.addColorStop(1, 'rgba(255,250,210,0)');
  G.fillStyle = halo; G.fillRect(mx - 40, my - 40, 80, 80);
  for (const l of LUCES) {
    const brillo = (0.5 + 0.5 * Math.sin(l.f * 3)) * n, g = G.createRadialGradient(l.x, l.y, 0, l.x, l.y, 7);
    g.addColorStop(0, `rgba(255,245,140,${0.9 * brillo})`); g.addColorStop(1, 'rgba(255,245,140,0)');
    G.fillStyle = g; G.fillRect(l.x - 7, l.y - 7, 14, 14);
  }
  G.restore();
  G.globalAlpha = n; elipse(mx, my, 9, 9, '#fffbe0', null); elipse(mx + 3, my - 2, 2, 2, 'rgba(230,225,190,0.9)', null); elipse(mx - 3, my + 3, 1.4, 1.4, 'rgba(230,225,190,0.9)', null); G.globalAlpha = 1;
}

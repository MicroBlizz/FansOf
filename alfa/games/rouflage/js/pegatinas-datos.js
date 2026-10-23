// Fans of Rouflage · PEG_CHAT (datos, 2 de 2): las pegatinas del chat (PEG_CHAT; sustituyen al chat escrito: 23-10-2026) y sus PAQUETES, que son lo que se
// consigue: el Básico al empezar, Becarios y Colados en la tienda (250 Acciones), Fantasmas en el pase gratis y los de los conjuntos del Rumble en la
// tienda (320). Un paquete puede llevar `conj: { id, txt }`: más barato si tienes ese conjunto del Rumble (lo cobra así también el servidor,
// 83-rouflage-pegatinas-conjunto.sql); CrazyBunny y SlyFox no lo llevan porque sus conjuntos los tiene todo el mundo al empezar. En el armario salen en la pestaña «Pegatinas» (album: no se llevan puestas; las de tus paquetes salen todas en el chat).
// Cada pegatina tiene un NÚMERO fijo (n) que es lo que viaja por la red (como las frases rápidas): NUNCA se cambia ni se reutiliza el de otra. El
// servidor sabe de qué paquete es cada número (tablas_juego, «pegatinas»: herramientas/rouflage/rouflage_datos.js) y no deja mandar una que no tienes.
// pegLienzo(n, lado) da la pegatina dibujada (se dibuja una vez y se guarda); pegMias() las tuyas, por paquetes.
'use strict';
const PEG_PAQUETES = (() => {
  const g = (pose, cara, o = {}) => Object.assign({ pose, cara: cara && PEG_DIB.AYUDAS.CARAS[cara] }, o);
  const BEC = { cabeza: 'gorra', color: '#dbe9ff' };
  const BUNNY = { cabeza: 'bunny', espalda: 'capa', ojos: 'espiral', boca: 'conejo' }, FOX = { cabeza: 'orejasFox', espalda: 'colaFox', ojos: 'foxgafas' };
  return [
    { id: 'basico', n: 'Básico', r: 'comun', de: 'base', txt: 'Al empezar', peg: [
      { n: 100, tag: '¡HOLA!', g: g({ brazoD: -1.1, brazoI: 0.05 }, 'feliz'), mas: (c, p, A) => { const [x, y] = A.mano(p, 'brazoD'); A.rayitas(c, x + 2, y - 2, -0.6, 3); } },
      { n: 101, tag: '¡LISTO!', col: '#7ee04a', g: g({ brazoI: 1.0, brazoD: -0.9, piernaI: 0.15, piernaD: -0.15 }, 'feliz'), mas: (c, p, A) => { A.estrella(c, -22, -52, 4.2); A.estrella(c, 24, -56, 3.4, '#39d5e8'); A.estrella(c, 20, -36, 2.4, '#ff6fb5'); } },
      { n: 102, tag: 'JAJAJA', giro: -0.12, g: g({ brazoI: -1.3, brazoD: 1.6, dy: 1 }, 'risa'), mas: (c, p, A) => { A.otxt(c, 'JA', -22, -56, 9, '#ffcb3d'); A.otxt(c, 'JA', 23, -48, 8, '#ffcb3d'); } },
      { n: 103, tag: '¡SUERTE!', col: '#7ee04a', g: g({ brazoD: -1.4 }, null, { ojos: 'guino', boca: 'lengua' }), mas: (c, p, A) => { const [x, y] = A.mano(p, 'brazoD'); A.trebol(c, x + 1, y - 5); A.estrella(c, x + 9, y - 9, 2.2); } },
      { n: 104, tag: '¿EMPEZAMOS?', col: '#39d5e8', g: g({ brazoD: -1.3 }, 'picara'), mas: (c, p, A) => { const [x, y] = A.mano(p, 'brazoD'); A.reloj(c, x + 4, y - 6); A.signo(c, '?', -20, -56, 9); } },
      { n: 105, tag: '¡BUENA PARTIDA!', g: g({ brazoI: 1.15, brazoD: -1.05 }, 'risa', { cabeza: 'fiesta' }), mas: (c, p, A) => A.confeti(c, [[-24, -50, 0.4], [22, -60, -0.6], [-18, -30, 1.1], [26, -34, 0.2], [-8, -70, -0.3], [12, -24, 0.9]]) },
      { n: 106, tag: 'UN MOMENTO', col: '#fff6ea', g: g({ brazoI: 1.25, brazoD: 0.9 }, 'inocente'), mas: (c, p, A) => { const [x, y] = A.mano(p, 'brazoD'); A.taza(c, x + 2, y); } },
      { n: 107, tag: 'ME VOY', col: '#ff9f80', giro: 0.06, g: g({ piernaI: 0.45, piernaD: -0.45, brazoI: -0.5, brazoD: 0.5 }, 'llanto'), mas: (c, p, A) => { A.caja(c, 0, -22); A.nube(c, -22, -6, 0.9); } },
    ] },
    { id: 'becarios', n: 'Pegatinas de becario', r: 'epica', de: 'tienda', txt: 250, peg: [
      { n: 110, tag: '¡TE VEO!', col: '#7fc8ff', giro: -0.05, g: g({ brazoD: -0.2 }, 'decidido', BEC), detras: (c, p, A) => { const [x, y] = A.mano(p, 'brazoD'); A.linterna(c, x - 2, y, -0.5); }, mas: (c, p, A) => A.signo(c, '!', -18, -60, 10) },
      { n: 111, tag: '¡DESPEDIDO!', col: '#ff4b5c', g: g({ brazoD: -1.25 }, 'picara', BEC), mas: (c, p, A) => { const [x, y] = A.mano(p, 'brazoD'); A.carta(c, x + 6, y - 4, 0.35, 1.15); A.rayitas(c, x + 9, y - 10, -0.6, 3, '#ffcb3d'); } },
      { n: 112, tag: 'UPS, ERA UNA PLANTA', col: '#7ee04a', g: g({ brazoI: -1.6, brazoD: 0.1 }, 'susto', BEC), mas: (c, p, A) => { A.planta(c, 22, -9, 1.25); A.gota(c, -14, -52, 1.2); A.gota(c, -18, -44, 0.9); } },
      { n: 113, tag: '¿DÓNDE ESTÁIS?', col: '#ffcb3d', giro: 0.05, g: g({ brazoD: -0.9, piernaI: 0.2, piernaD: -0.1 }, 'picara', BEC), mas: (c, p, A) => { const [x, y] = A.mano(p, 'brazoD'); A.lupa(c, x + 2, y - 4, 0.5); A.signo(c, '?', -20, -58, 9); A.signo(c, '?', -26, -46, 7, '#7fc8ff'); } },
    ] },
    { id: 'colados', n: 'Pegatinas de colado', r: 'epica', de: 'tienda', txt: 250, peg: [
      { n: 120, tag: '¿QUIÉN, YO?', g: g({ brazoI: -1.13, brazoD: 2.07 }, 'inocente', { color: '#7fb8c9', manchas: c => { c.fillStyle = '#5c9db0'; for (let y = -70; y < 10; y += 8) c.fillRect(-30, y, 60, 3); c.fillStyle = '#e8d27a'; c.beginPath(); c.ellipse(10, -22, 6, 4, 0, 0, Math.PI * 2); c.fill(); } }), mas: (c, p, A) => { A.nota(c, -20, -54); A.nota(c, 21, -60, 0.8); } },
      { n: 121, tag: 'NI ME VES', col: '#7ee04a', especial: (c, A) => {
        const pose = { brazoI: -1.13, brazoD: 2.07, piernaI: -0.1, piernaD: 0.1 }, rayas = (y0, col) => { c.fillStyle = col; for (let y = -66; y < 2; y += 10) c.fillRect(-34, y + y0, 68, 4); };
        c.save(); c.beginPath(); c.rect(-34, -70, 68, 72); c.clip();
        A.shape(c, A.rr(-34, -70, 68, 72, 6), '#e8d27a', 0); rayas(0, '#d8bf62');
        c.beginPath(); trazaPiezas(c, pose); c.fillStyle = '#e4cd73'; c.fill(); c.save(); c.beginPath(); trazaPiezas(c, pose); c.clip(); rayas(1, '#d4bb5e'); c.restore();
        c.beginPath(); trazaPiezas(c, pose); c.setLineDash([2, 3]); c.lineWidth = 0.8; c.strokeStyle = 'rgba(32,16,44,.25)'; c.stroke(); c.setLineDash([]);
        A.CARAS.picara(c, 2, -41.5); c.restore();
        c.beginPath(); c.roundRect(-34, -70, 68, 72, 6); c.lineWidth = 3; c.strokeStyle = A.OL; c.stroke();
      } },
      { n: 122, tag: '¡CORRE!', col: '#ff4b5c', giro: 0.14, g: g({ piernaI: 0.9, piernaD: -0.9, brazoI: 0.9, brazoD: -0.9 }, 'susto'), mas: (c, p, A) => { A.nube(c, -20, -4, 1); A.nube(c, -27, -12, 0.7); for (const y of [-40, -30, -20]) A.line(c, [-30, y, -20, y], A.OL, 1.6); A.gota(c, 15, -55, 1.1); } },
      { n: 123, tag: '¡QUÉ ARTE!', col: '#ff6fb5', g: g({ brazoD: -1.2, brazoI: 0.3 }, 'feliz', { manchas: c => { for (const [x, y, r, col] of [[-6, -20, 6, '#39d5e8'], [7, -28, 5, '#ffcb3d'], [-2, -12, 4, '#7ee04a'], [9, -14, 4, '#ff6fb5'], [-9, -48, 4, '#ff4b5c']]) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, r, r * 0.8, 0.4, 0, Math.PI * 2); c.fill(); } } }), mas: (c, p, A) => { const [x, y] = A.mano(p, 'brazoD'); A.brocha(c, x + 1, y - 2, 0.5); A.estrella(c, -22, -54, 3.4); A.estrella(c, 24, -66, 2.6, '#39d5e8'); } },
    ] },
    { id: 'fantasmas', n: 'Pegatinas de fantasma', r: 'rara', de: 'gratis', txt: 'Pase gratis · nv 14', peg: [
      { n: 130, tag: 'BUUU', col: '#b6c8ff', especial: (c, A) => A.fantasma(c, c => { for (const [x, y, r] of [[-24, -58, 3], [24, -48, 2.4]]) A.shape(c, A.el(x, y, r, r * 1.3), 'rgba(182,200,255,.8)', 1.1); }) },
      { n: 131, tag: '¡VENGANZA!', col: '#ff4b5c', especial: (c, A) => A.fantasma(c, c => { A.carta(c, 20, -40, 0.5, 1.1, true); A.signo(c, '!', -22, -58, 11, '#ff4b5c'); A.rayitas(c, -18, -40, Math.PI, 3, '#ff4b5c'); }) },
      { n: 132, tag: 'NI FINIQUITO', col: '#8fe3ff', especial: (c, A) => A.fantasma(c, c => { A.gota(c, -6, -34, 1.1); A.gota(c, 10, -32, 1); A.shape(c, A.rr(14, -22, 12, 8, 1.5), '#c99a62', 1.4); A.line(c, [16, -18, 24, -18], A.OL, 1); A.signo(c, '0', 20, -30, 7, '#ffcb3d'); }) },
      { n: 133, tag: '¡ÁNIMO, VIVOS!', col: '#7ee04a', especial: (c, A) => A.fantasma(c, c => { A.confeti(c, [[-22, -56, 0.4], [24, -60, -0.5], [-26, -32, 1], [26, -30, 0.3]]); A.estrella(c, -16, -66, 3); A.estrella(c, 18, -70, 2.4, '#39d5e8'); }) },
    ] },
    { id: 'bunny', n: 'Pegatinas de CrazyBunny', r: 'epica', de: 'tienda', txt: 320, peg: [
      { n: 140, tag: '¡ZANAHORIAAA!', col: '#ff9f80', g: g({ brazoI: 0.9, brazoD: -1.1 }, null, BUNNY), mas: (c, p, A) => { const [x, y] = A.mano(p, 'brazoD'); A.zanahoria(c, x + 2, y - 6, 0.5); A.estrella(c, -22, -60, 3); } },
      { n: 141, tag: '¡LOCURAAA!', col: '#ff6fb5', giro: -0.08, g: g({ brazoI: 1.0, brazoD: -0.9, piernaI: 0.4, piernaD: -0.4 }, 'loca', { cabeza: 'bunny', espalda: 'capa' }), mas: (c, p, A) => { A.estrella(c, -24, -40, 3.4); A.estrella(c, 26, -46, 3, '#39d5e8'); A.estrella(c, 14, -70, 2.6, '#ff6fb5'); } },
      { n: 142, tag: 'JIJIJI', col: '#ffcb3d', g: g({ brazoI: -1.5, brazoD: 1.9 }, 'risa', { cabeza: 'bunny', espalda: 'capa' }), mas: (c, p, A) => { A.otxt(c, 'JI', -22, -50, 8, '#ff9f80'); A.otxt(c, 'JI', 24, -58, 8, '#ff9f80'); } },
      { n: 143, tag: '¡AL ATAQUE!', col: '#ff4b5c', giro: 0.1, g: g({ piernaI: 0.8, piernaD: -0.8, brazoD: -0.5, brazoI: 0.9 }, 'decidido', { cabeza: 'bunny', espalda: 'capa' }), mas: (c, p, A) => { const [x, y] = A.mano(p, 'brazoD'); A.zanahoria(c, x + 5, y - 1, -1.2); A.nube(c, -22, -4, 0.9); } },
    ] },
    { id: 'fox', n: 'Pegatinas de SlyFox', r: 'epica', de: 'tienda', txt: 320, peg: [
      { n: 150, tag: 'DEMASIADO LISTO', col: '#ff9f80', g: g({ brazoI: -1.13, brazoD: 1.6 }, null, FOX), mas: (c, p, A) => A.estrella(c, 20, -62, 3) },
      { n: 151, tag: 'PLAN PERFECTO', col: '#ffcb3d', g: g({ brazoI: -1.75, brazoD: 2.3 }, null, Object.assign({ boca: 'sonrisa' }, FOX)), mas: (c, p, A) => { A.estrella(c, -22, -60, 3); A.estrella(c, 22, -62, 2.6, '#39d5e8'); A.rayitas(c, 0, -20, Math.PI / 2, 3, '#ffcb3d'); } },
      { n: 152, tag: '¡TE PILLÉ!', col: '#ff4b5c', g: g({ brazoD: -0.35, piernaI: 0.2 }, null, Object.assign({ boca: 'o' }, FOX)), mas: (c, p, A) => { const [x, y] = A.mano(p, 'brazoD'); A.rayitas(c, x + 3, y, 0, 3, '#ffcb3d'); A.signo(c, '!', -20, -60, 11, '#ff4b5c'); } },
      { n: 153, tag: 'JE, JE', col: '#7ee04a', giro: -0.06, g: g({ brazoI: -1.3, brazoD: 1.5 }, 'picara', { cabeza: 'orejasFox', espalda: 'colaFox' }), mas: (c, p, A) => { A.otxt(c, 'JE', -22, -54, 8, '#7ee04a'); A.otxt(c, 'JE', 23, -60, 7, '#7ee04a'); } },
    ] },
  ];
})();
const PEG_CHAT = {};      // número → { n, tag, …, paquete }
for (const pq of PEG_PAQUETES) for (const p of pq.peg) PEG_CHAT[p.n] = Object.assign(p, { paquete: pq.id });

// la pegatina dibujada, a un tamaño (en píxeles de verdad); se guarda para no volver a dibujarla
const _pegCache = new Map();
function pegLienzo(n, lado = 240) {
  const def = PEG_CHAT[n]; if (!def) return null;
  const k = `${n}:${lado}:${IDIOMA_RF}`; let cv = _pegCache.get(k);
  if (!cv) { cv = document.createElement('canvas'); cv.width = cv.height = lado; PEG_DIB.pinta(cv, def); _pegCache.set(k, cv); }
  return cv;
}
// las letras de los carteles tardan en llegar: al llegar, se vuelven a dibujar
if (document.fonts && document.fonts.load) document.fonts.load('40px "Luckiest Guy"').then(() => _pegCache.clear()).catch(() => {});
function pegImagen(n, lado = 240) { const cv = pegLienzo(n, lado); if (!cv) return ''; try { return cv._url || (cv._url = cv.toDataURL('image/png')); } catch (_) { return ''; } }      // la imagen (para <img>), hecha una sola vez
const pegPaquete = id => PEG_PAQUETES.find(p => p.id === id);
const pegTienePaquete = pq => { const it = arItem('pegatinas', pq.id); return !!it && arTiene('pegatinas', it); };
// las tuyas, por paquetes (el Básico siempre)
function pegMias() { return PEG_PAQUETES.filter(pegTienePaquete); }
const pegTengo = n => { const p = PEG_CHAT[n]; return !!p && pegTienePaquete(pegPaquete(p.paquete)); };

// ---------- en el armario: la pestaña «Pegatinas» (cada paquete es una cosa que se consigue) ----------
(() => {
  // el icono: la primera pegatina del paquete; en grande (la vista del armario), cuatro
  const icono = pq => (c, w) => {
    const ns = pq.peg.map(p => p.n);
    if (w < 110) { const cv = pegLienzo(ns[0], 128); if (cv) c.drawImage(cv, 0, 0, w, w); return; }
    ns.slice(0, 4).forEach((n, i) => { const cv = pegLienzo(n, 160); if (cv) c.drawImage(cv, (i % 2) * w / 2, Math.floor(i / 2) * w / 2, w / 2, w / 2); });
  };
  const items = PEG_PAQUETES.map(pq => ({ id: pq.id, n: pq.n, r: pq.r, de: pq.de, txt: pq.txt, conj: pq.conj || null, x: icono(pq) }));      // conj: con ese conjunto del Rumble, a mitad de precio (arPrecio)
  CATALOGO_AR.push({ id: 'pegatinas', nombre: 'Pegatinas del chat', corto: 'Pegatinas', nota: 'Se mandan en el chat de la sala y de fantasma. Un paquete trae todas las suyas', album: true, items });
})();

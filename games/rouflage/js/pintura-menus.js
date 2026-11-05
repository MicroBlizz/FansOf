// Fans of Rouflage · LA PINTURA DE LOS MENÚS (Daniel, 5-11-2026: «más vivaz, más Rouflage», sin damero ni cartulina, «brochazos de verdad»):
// los títulos van sobre un brochazo, las pestañas son brochazos cortos, cada casilla lleva un manchón pintado del color de su rareza y por
// el fondo cruzan brochazos grandes. Nada es una forma lisa: cada brochazo se pinta con pelos de brocha a lo largo de un camino ondulado,
// con el principio y el final desiguales y goterones, y cada manchón son pasadas cortas cruzadas. Se pintan UNA vez al arrancar en lienzos
// pequeños y se dejan en variables CSS (--pm-brocha-naranja, --pm-pest-azul, --pm-manchon-rara…) que usa estilo-pintura.css; así el CSS no
// lleva imágenes y el dibujo es del juego. Las cuentas (pelos, trazosManchon) son puras y con semilla: el mismo brochazo cada vez.
'use strict';

const PINTURA = (() => {
  // colores de bote de pintura (nada de neón): los de la paleta del juego
  const COLORES = { naranja: [255, 122, 26], rojo: [229, 69, 61], amarillo: [242, 197, 61], verde: [91, 184, 72], azul: [59, 125, 221], rosa: [240, 106, 168], violeta: [160, 100, 230], cian: [57, 213, 232], gris: [120, 132, 160] };
  const RAREZA = { comun: 'gris', rara: 'cian', epica: 'violeta', legend: 'amarillo', puesto: 'verde' };
  // azar con semilla (congruencial): el mismo brochazo en cada arranque y en los tests
  const azar = sem => { let s = (sem || 1) * 7919 + 13; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; };

  // un brochazo horizontal de w x h: los pelos (cada uno su grosor, su alfa y su largo), el cuerpo sólido del medio y los goterones.
  // o: pelos (cuántos), curva (cuánto ondula, 0..1), gotas, largoGota, margen, sem
  const pelos = (w, h, o = {}) => {
    const r = azar(o.sem), n = o.pelos || 34, cur = o.curva == null ? 0.25 : o.curva, sem = o.sem || 1;
    const m = o.margen == null ? 10 : o.margen, y0 = h / 2, L = w - 2 * m, grosor = (h - 2 * m) * 0.78;
    const onda = q => Math.sin(q * Math.PI * 1.3 + sem) * grosor * cur * 0.5;
    const lista = [];
    for (let i = 0; i < n; i++) {
      const dy = ((i + 0.5) / n - 0.5) * grosor, alfa = 0.55 + r() * 0.45, ancho = 2 + r() * 3.2;
      const ini = m + r() * L * 0.06, fin = w - m - r() * L * 0.08, puntos = [];
      for (let x = ini; x <= fin; x += 4) puntos.push([x, y0 + dy + onda((x - m) / L) + (r() - 0.5) * 1.1]);
      lista.push({ alfa, ancho, puntos });
    }
    const cuerpo = [];
    for (let x = m + L * 0.04; x <= w - m - L * 0.05; x += 4) cuerpo.push([x, y0 + onda((x - m) / L)]);
    const gotas = [], ng = o.gotas == null ? 2 : o.gotas;
    for (let i = 0; i < ng; i++) gotas.push({ x: m + L * (0.2 + r() * 0.6), y: y0 + grosor * 0.35, largo: 8 + r() * (o.largoGota || 18) });
    return { pelos: lista, cuerpo, grosor, gotas };
  };
  // un manchón redondo de d px: tres tandas de pasadas cortas, cada tanda girada
  const trazosManchon = (d, sem) => {
    const r = azar(sem || 3), n = Math.round(d / 4.4), tandas = [];
    for (let k = 0; k < 3; k++) {
      const giro = k * 1.1 + r() * 0.6, trazos = [];
      for (let i = 0; i < n; i++) trazos.push({ y: (i / n - 0.5) * d * 0.62, alfa: 0.55 + r() * 0.45, ancho: (3 + r() * 3) * d / 70, x1: -d * (0.22 + r() * 0.16), x2: d * (0.22 + r() * 0.16), dy: (r() - 0.5) * 3 });
      tandas.push({ giro, trazos });
    }
    return tandas;
  };

  /* ---------- pintar en un lienzo (lo que devuelve es una imagen data: para el CSS) ---------- */
  const rgba = ([R, G, B], a) => `rgba(${R},${G},${B},${a})`;
  const lienzo = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
  const brocha = (w, h, color, o) => {
    const [c, x] = lienzo(w, h), b = pelos(w, h, o); x.lineCap = 'round';
    for (const p of b.pelos) { x.beginPath(); x.lineWidth = p.ancho; x.strokeStyle = rgba(color, p.alfa); p.puntos.forEach(([px, py], i) => i ? x.lineTo(px, py) : x.moveTo(px, py)); x.stroke(); }
    x.globalAlpha = 0.85; x.strokeStyle = rgba(color, 1); x.lineWidth = b.grosor * 0.55; x.beginPath(); b.cuerpo.forEach(([px, py], i) => i ? x.lineTo(px, py) : x.moveTo(px, py)); x.stroke(); x.globalAlpha = 1;
    x.fillStyle = rgba(color, 1);
    for (const g of b.gotas) { x.beginPath(); x.roundRect(g.x - 3, g.y, 6, g.largo, [0, 0, 4, 4]); x.fill(); x.beginPath(); x.arc(g.x, g.y + g.largo, 4, 0, 7); x.fill(); }
    return c.toDataURL();
  };
  const manchon = (d, color, sem) => {
    const [c, x] = lienzo(d, d); x.lineCap = 'round';
    for (const t of trazosManchon(d, sem)) {
      x.save(); x.translate(d / 2, d / 2); x.rotate(t.giro);
      for (const z of t.trazos) { x.strokeStyle = rgba(color, z.alfa); x.lineWidth = z.ancho; x.beginPath(); x.moveTo(z.x1, z.y); x.lineTo(z.x2, z.y + z.dy); x.stroke(); }
      x.restore();
    }
    return c.toDataURL();
  };
  // el suelo pintado a rodillo: seis brochazos cortos de colores, uno al lado del otro
  const suelo = () => {
    const [c, x] = lienzo(360, 40), cols = ['rojo', 'naranja', 'amarillo', 'verde', 'azul', 'violeta'], w = 360 / 6;
    cols.forEach((k, i) => {
      const [t, tx] = lienzo(w + 20, 40), b = pelos(w + 20, 40, { sem: 20 + i, gotas: 0, margen: 6, curva: 0.1 }); tx.lineCap = 'round';
      for (const p of b.pelos) { tx.beginPath(); tx.lineWidth = p.ancho; tx.strokeStyle = rgba(COLORES[k], p.alfa); p.puntos.forEach(([px, py], j) => j ? tx.lineTo(px, py) : tx.moveTo(px, py)); tx.stroke(); }
      tx.globalAlpha = 0.85; tx.strokeStyle = rgba(COLORES[k], 1); tx.lineWidth = b.grosor * 0.55; tx.beginPath(); b.cuerpo.forEach(([px, py], j) => j ? tx.lineTo(px, py) : tx.moveTo(px, py)); tx.stroke();
      x.drawImage(t, i * w - 10, 0);
    });
    return c.toDataURL();
  };

  // se llama una vez al arrancar: deja todas las imágenes en variables CSS del documento
  let listo = false;
  const prepara = () => {
    if (listo || typeof document === 'undefined') return; listo = true;
    const st = document.documentElement.style, pon = (n, v) => st.setProperty('--pm-' + n, `url(${v})`);
    let i = 0;
    for (const [k, col] of Object.entries(COLORES)) {
      pon('brocha-' + k, brocha(300, 96, col, { sem: 11 + i, pelos: 40, gotas: 3, largoGota: 22, margen: 14 }));
      pon('pest-' + k, brocha(160, 56, col, { sem: 3 + i, gotas: 0, margen: 6, pelos: 22 }));
      pon('manchon-' + k, manchon(70, col, 5 + i)); i++;
    }
    for (const [r, k] of Object.entries(RAREZA)) pon('manchon-' + r, manchon(r === 'puesto' ? 74 : 70, COLORES[k], 9 + i++));
    pon('pared', manchon(150, COLORES.amarillo, 4)); pon('suelo', suelo());
    [['azul', 2], ['rosa', 5], ['verde', 8]].forEach(([k, s], j) => pon('fondo-' + (j + 1), brocha(420, 110, COLORES[k], { sem: s, gotas: 1 + (j & 1), largoGota: 26 })));
  };
  // un brochazo que barre una lista al cambiar de pestaña (CSS: .pm-barrido en estilo-pintura.css); color: nombre de COLORES
  const barre = (el, color) => {
    if (!el || typeof document === 'undefined' || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    el.querySelectorAll(':scope > .pm-barrido').forEach(v => v.remove());
    const d = document.createElement('div'); d.className = 'pm-barrido'; d.style.backgroundImage = `var(--pm-brocha-${COLORES[color] ? color : 'naranja'})`;
    d.addEventListener('animationend', () => d.remove()); el.appendChild(d);
  };
  return { COLORES, RAREZA, azar, pelos, trazosManchon, brocha, manchon, prepara, barre };
})();

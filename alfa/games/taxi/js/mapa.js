// Fans Of Taxi · MAPA: el minimapa de solo calles, como un mapa de móvil: el mundo entero se dibuja una vez en un lienzo (calles por
// su anchura, túneles a rayas, río y mar, parques, manzanas) y cada fotograma se recorta la ventana alrededor del jugador, con el norte
// arriba: tú (triángulo amarillo), el destino, los pasajeros que esperan, la policía que te persigue y las salidas de los eventos.
'use strict';
const MAPA = (() => {
  const ESC = 3;   // píxeles por... al revés: metros por píxel del mapa grande
  let fondo, lienzo, g, lado = 150, metros = 320;
  function montar(canvas) {
    lienzo = canvas; g = canvas.getContext('2d'); lado = canvas.width;
    const M = CIUDAD; fondo = document.createElement('canvas'); fondo.width = Math.ceil(M.ancho / ESC); fondo.height = Math.ceil(M.largo / ESC);
    const f = fondo.getContext('2d'); f.scale(1 / ESC, 1 / ESC);
    f.fillStyle = '#1d3a6e'; f.fillRect(0, 0, M.ancho, M.largo);
    // tierra: por celdas de 16 m
    for (let x = 0; x < M.ancho; x += 16) for (let z = 0; z < M.largo; z += 16) { const t = CIUDAD.tierra(x + 8, z + 8); if (t < 0.5) continue; const h = CIUDAD.natural(x + 8, z + 8); f.fillStyle = h > M.nieve ? '#efe9f6' : h > M.roca ? '#c9bfd6' : '#e8e4da'; f.fillRect(x, z, 17, 17); }
    for (const m of CIUDAD.celdas) { f.fillStyle = m.parque ? '#bfe3a6' : '#d9d3e3'; f.fillRect(m.x0, m.z0, m.x1 - m.x0, m.z1 - m.z0); }
    f.lineCap = 'round'; f.lineJoin = 'round'; f.strokeStyle = '#5aa0e0';
    for (let i = 0; i < CIUDAD.rio.length - 1; i++) { const a = CIUDAD.rio[i], b = CIUDAD.rio[i + 1]; f.lineWidth = (a.ancho + b.ancho) / 2; f.beginPath(); f.moveTo(a.x, a.z); f.lineTo(b.x, b.z); f.stroke(); }
    const n = CIUDAD.nodos;
    const traza = (e, ancho, color, dash) => { const a = n[e.a], b = n[e.b]; f.strokeStyle = color; f.lineWidth = ancho; f.setLineDash(dash || []); f.beginPath(); f.moveTo(a.x, a.z); f.lineTo(b.x, b.z); f.stroke(); };
    for (const e of CIUDAD.aristas) if (e.tipo !== 'tunel' && e.tipo !== 'rampa') traza(e, Math.max(9, e.ancho * 1.3), '#8f86a3');
    for (const e of CIUDAD.aristas) if (e.tipo !== 'tunel' && e.tipo !== 'rampa' && e.tipo !== 'mirador') traza(e, Math.max(6, e.ancho * 1.1), e.tipo === 'avenida' || e.tipo === 'anillo' || e.tipo === 'enlace' ? '#fff6ea' : '#f4f0e8');
    for (const e of CIUDAD.aristas) if (e.tipo === 'tunel' || e.tipo === 'rampa') traza(e, 7, '#8a6fe0', [12, 10]);
    f.setLineDash([]);
    for (const m of CIUDAD.miradores) { f.fillStyle = '#ffcb3d'; f.beginPath(); f.arc(m.x, m.z, m.radio, 0, Math.PI * 2); f.fill(); }
  }
  const punto = (x, z, cx, cz, esc) => [lado / 2 + (x - cx) * esc, lado / 2 + (z - cz) * esc];
  function pinta(estado) {
    if (!fondo) return;
    const j = estado.jugador, esc = lado / metros, cx = j.x, cz = j.z;
    g.clearRect(0, 0, lado, lado);
    g.save(); g.beginPath(); g.arc(lado / 2, lado / 2, lado / 2 - 2, 0, Math.PI * 2); g.clip();
    g.fillStyle = '#1d3a6e'; g.fillRect(0, 0, lado, lado);
    const sx = (cx - metros / 2) / ESC, sz = (cz - metros / 2) / ESC, s = metros / ESC;
    g.imageSmoothingEnabled = true; g.drawImage(fondo, sx, sz, s, s, 0, 0, lado, lado);
    const dibuja = (x, z, color, r) => { const [px, pz] = punto(x, z, cx, cz, esc); g.fillStyle = color; g.strokeStyle = '#20102c'; g.lineWidth = 1.5; g.beginPath(); g.arc(px, pz, r, 0, Math.PI * 2); g.fill(); g.stroke(); };
    for (const s of estado.salidas || []) if (Math.abs(s.x - cx) < metros && Math.abs(s.z - cz) < metros) dibuja(s.x, s.z, s.tipo === 'turno' ? '#ffcb3d' : s.tipo === 'sprint' ? '#7ee04a' : '#2e8bff', 4);
    for (const p of estado.pasajeros) dibuja(p.x, p.z, '#' + p.tramo.color.toString(16).padStart(6, '0'), 3);
    for (const c of estado.conductores) if (c.tipo === 'policia' && c.persigue) dibuja(c.coche.x, c.coche.z, '#ff4b5c', 3.5);
    if (estado.destino) dibuja(estado.destino.x, estado.destino.z, '#' + (estado.destino.color || 0xffcb3d).toString(16).padStart(6, '0'), 5);
    // tú: un triángulo que mira adonde vas
    g.save(); g.translate(lado / 2, lado / 2); g.rotate(-j.ang + Math.PI); g.fillStyle = '#ffcb3d'; g.strokeStyle = '#20102c'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, -8); g.lineTo(6, 7); g.lineTo(0, 4); g.lineTo(-6, 7); g.closePath(); g.fill(); g.stroke(); g.restore();
    g.restore();
    g.strokeStyle = '#20102c'; g.lineWidth = 3; g.beginPath(); g.arc(lado / 2, lado / 2, lado / 2 - 2, 0, Math.PI * 2); g.stroke();
  }
  return { montar, pinta };
})();

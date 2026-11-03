// Fans of Karts · AMBIENTE DE CADA PISTA: lo que hace que cada una se sienta distinta al jugarla, no solo al verla.
//   fisica: agarre (menos = patina), vel (velocidad punta), gravedad (menos = saltos que flotan) y viento (empuja de lado, a rachas)
//   ambiente: lo que se ve por encima de la escena (nieve, lluvia, burbujas, ceniza, hojas, confeti…) y el tinte (oscuro, agua, calor)
// Todo se pinta en la pantalla pequeña, encima del mundo y debajo del marcador.
'use strict';

const AMBIENTE = {
  tutorial: { ambiente: [] },
  oficinas: { ambiente: ['papeles'] },
  playa: { fisica: { agarre: 0.9 }, ambiente: ['gaviotas', 'brillos'] },
  parque: { ambiente: ['confeti'] },
  centro: { fisica: { agarre: 0.9 }, ambiente: ['destellos'] },
  desierto: { fisica: { agarre: 0.85, vel: 1.05 }, ambiente: ['arena', 'calor'] },
  cementerio: { ambiente: ['luciernagas'] },
  minas: { ambiente: ['polvo', 'oscuro'] },
  estadio: { ambiente: ['flashes', 'confeti'] },
  nieve: { fisica: { agarre: 0.62 }, ambiente: ['nieve'] },
  fosa: { fisica: { gravedad: 0.42, vel: 0.95 }, ambiente: ['agua', 'burbujas'] },
  volcan: { ambiente: ['ceniza', 'calor'] },
  nube: { fisica: { gravedad: 0.8 }, ambiente: ['nubecillas'] },
  selva: { fisica: { agarre: 0.9 }, ambiente: ['hojas'] },
  hype: { fisica: { agarre: 0.8 }, ambiente: ['lluvia'] },
  castillo: { ambiente: ['petalos'] },
  torre: { fisica: { viento: 24 }, ambiente: ['viento'] },
};
for (const def of PISTAS) { const A = AMBIENTE[def.base || def.id]; if (A) { def.fisica = A.fisica; def.ambiente = A.ambiente; } }

// el viento de la azotea: sopla siempre hacia el mismo lado del mapa, con rachas
function soplaViento(k, P, fuerza, dt) {
  const s = fuerza * (0.45 + 0.55 * Math.max(0, Math.sin(CARRERA.reloj * 0.8))), nx = k.x + 0.6 * s * dt, ny = k.y + 0.8 * s * dt;
  if (!ES_MURO(supEn(P, nx, ny))) { k.x = nx; k.y = ny; }
}

// ---------- lo que se pinta encima ----------
const az1 = i => ruido(i * 7 + 3, i * 13 + 1), az2 = i => ruido(i * 11 + 5, i * 3 + 9);      // dos números fijos (0–1) para cada partícula
const giro = v => ((v % 1) + 1) % 1;
let OSCURO = null;
function capaOscura() {     // la mina: todo a oscuras salvo lo que ilumina el faro del kart (con puntitos, como el resto)
  if (OSCURO) return OSCURO;
  const [c, x] = lienzo(PW, PH), img = x.createImageData(PW, PH), px = new Uint32Array(img.data.buffer), negro = u32('#0c0810');
  for (let y = 0; y < PH; y++) for (let i = 0; i < PW; i++) {
    const dx = (i - PW / 2) / 120, dy = (y - 112) / 70, d = Math.sqrt(dx * dx + dy * dy), n = limita((d - 0.45) * 26, 0, 15);
    if (BAYER[((y & 3) << 2) | (i & 3)] < n) px[y * PW + i] = negro;
  }
  x.putImageData(img, 0, 0);
  return (OSCURO = c);
}
// el aire de cada pista (ambiente en su definición): partículas y velos que se pintan encima de todo. Cada tipo: (t = el reloj, cielo = dónde acaba el cielo, tipo)
const puntoAmb = (x, y, w, h, c) => { lx.fillStyle = c; lx.fillRect(Math.round(x), Math.round(y), w, h); };
const AIRE = {
  oscuro: (t, cielo, tipo) => { lx.globalAlpha = 0.7; lx.drawImage(capaOscura(), 0, 0); lx.globalAlpha = 1; },
  agua: (t, cielo, tipo) => { lx.fillStyle = 'rgba(40,110,200,0.16)'; lx.fillRect(0, 0, PW, PH); for (let i = 0; i < 6; i++) { const x = giro(az1(i) + t * 0.03 * (i & 1 ? 1 : -1)) * (PW + 60) - 30; lx.fillStyle = 'rgba(200,240,255,0.08)'; lx.beginPath(); lx.moveTo(x, 0); lx.lineTo(x + 10, 0); lx.lineTo(x + 40, PH); lx.lineTo(x + 24, PH); lx.fill(); } },
  calor: (t, cielo, tipo) => { lx.fillStyle = `rgba(255,110,30,${0.05 + 0.03 * Math.sin(t * 3)})`; lx.fillRect(0, 0, PW, PH); },
  nieve: (t, cielo, tipo) => { for (let i = 0; i < 70; i++) puntoAmb(giro(az1(i) + t * 0.02 + Math.sin(t + i) * 0.01) * PW, giro(az2(i) + t * (0.12 + az1(i) * 0.1)) * PH, i % 5 ? 1 : 2, i % 5 ? 1 : 2, '#ffffff'); },
  lluvia: (t, cielo, tipo) => { for (let i = 0; i < 60; i++) { const x = giro(az1(i) - t * 0.4) * PW, y = giro(az2(i) + t * 1.6) * PH; lx.fillStyle = 'rgba(180,200,255,0.55)'; lx.fillRect(Math.round(x), Math.round(y), 1, 5); } },
  burbujas: (t, cielo, tipo) => { for (let i = 0; i < 26; i++) { const x = giro(az1(i) + Math.sin(t * 2 + i) * 0.01) * PW, y = PH - giro(az2(i) + t * (0.08 + az1(i) * 0.08)) * PH; lx.strokeStyle = 'rgba(210,245,255,0.7)'; lx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, i % 3 ? 2 : 3, i % 3 ? 2 : 3); } },
  ceniza: (t, cielo, tipo) => { for (let i = 0; i < 50; i++) { if (i % 3) puntoAmb(giro(az1(i) + t * 0.03) * PW, giro(az2(i) + t * 0.1) * PH, 1, 1, '#8a7a82'); else puntoAmb(giro(az1(i) - t * 0.02) * PW, PH - giro(az2(i) + t * 0.18) * PH, 1, 1, (t * 8 + i) % 2 < 1 ? '#ffcb3d' : '#ff7a1a'); } },
  hojas: (t, cielo, tipo) => { for (let i = 0; i < 22; i++) puntoAmb(giro(az1(i) + Math.sin(t * 1.5 + i) * 0.03) * PW, giro(az2(i) + t * 0.09) * PH, 2, 1 + ((t * 4 + i) & 1), i & 1 ? '#5aa83a' : '#c08a3a'); },
  petalos: (t, cielo, tipo) => { for (let i = 0; i < 22; i++) puntoAmb(giro(az1(i) + t * 0.05 + Math.sin(t * 2 + i) * 0.02) * PW, giro(az2(i) + t * 0.08) * PH, 2, 1, i & 1 ? '#ff9ad0' : '#ffe14d'); },
  confeti: (t, cielo, tipo) => { for (let i = 0; i < 34; i++) puntoAmb(giro(az1(i) + Math.sin(t * 3 + i) * 0.015) * PW, giro(az2(i) + t * (0.1 + az1(i) * 0.08)) * cielo * 1.6, 2, 1 + ((t * 6 + i) & 1), ['#ff5c8a', '#ffe14d', '#22e3ff', '#5ef27a', '#c35cff'][i % 5]); },
  papeles: (t, cielo, tipo) => { for (let i = 0; i < 10; i++) puntoAmb(giro(az1(i) + t * 0.06) * PW, giro(az2(i) + t * 0.05 + Math.sin(t + i) * 0.02) * PH, 3, 2, '#f4f4f8'); },
  arena: (t, cielo, tipo) => { for (let i = 0; i < 40; i++) { lx.fillStyle = 'rgba(240,200,140,0.5)'; lx.fillRect(Math.round(giro(az1(i) + t * 0.7) * PW), Math.round(az2(i) * PH), 4 + (i % 4), 1); } },
  viento: (t, cielo, tipo) => { for (let i = 0; i < 18; i++) { const r = Math.max(0, Math.sin(CARRERA.reloj * 0.8)); if (r < 0.3) break; lx.fillStyle = `rgba(255,255,255,${0.25 + r * 0.35})`; lx.fillRect(Math.round(giro(az1(i) + t * 1.4) * (PW + 40) - 20), Math.round(az2(i) * PH), 10 + (i % 3) * 6, 1); } },
  polvo: (t, cielo, tipo) => { for (let i = 0; i < 24; i++) puntoAmb(giro(az1(i) + Math.sin(t * 0.5 + i) * 0.02) * PW, giro(az2(i) + t * 0.02) * PH, 1, 1, '#b8a890'); },
  luciernagas: (t, cielo, tipo) => { for (let i = 0; i < 18; i++) { if (Math.sin(t * 3 + i * 2.3) < 0.2) continue; puntoAmb(giro(az1(i) + Math.sin(t * 0.7 + i) * 0.04) * PW, cielo + giro(az2(i) + Math.cos(t * 0.6 + i) * 0.05) * (PH - cielo) * 0.7, 1, 1, '#c8ff8a'); } },
  mariposas: (t, cielo, tipo) => { for (let i = 0; i < 8; i++) { const x = giro(az1(i) + t * 0.03 + Math.sin(t + i) * 0.03) * PW, y = cielo - 8 + giro(az2(i) + Math.sin(t * 0.8 + i) * 0.06) * 60, a = (t * 10 + i) & 1; puntoAmb(x - 1 - a, y, 1, 2, ['#ffcb3d', '#ff9ad0', '#22e3ff'][i % 3]); puntoAmb(x + 1 + a, y, 1, 2, ['#ffcb3d', '#ff9ad0', '#22e3ff'][i % 3]); puntoAmb(x, y, 1, 2, '#2b2d3a'); } },
  gaviotas: (t, cielo, tipo) => { for (let i = 0; i < 4; i++) { const x = giro(az1(i) + t * 0.025) * (PW + 40) - 20, y = 10 + az2(i) * (cielo - 20) + Math.sin(t * 2 + i) * 2, a = (t * 4 + i) & 1; puntoAmb(x - 3, y + a, 3, 1, '#2a3a5a'); puntoAmb(x, y + 1, 1, 1, '#2a3a5a'); puntoAmb(x + 1, y + a, 3, 1, '#2a3a5a'); } },
  brillos: (t, cielo, tipo) => { for (let i = 0; i < 14; i++) { if (Math.sin(t * 5 + i * 1.7) < 0.75) continue; const x = az1(i + Math.floor(t * 0.5 + i) * 31) * PW, y = tipo === 'brillos' ? cielo - 12 + az2(i) * 10 : cielo + az2(i + Math.floor(t)) * (PH - cielo); puntoAmb(x, y, 1, 1, '#ffffff'); puntoAmb(x - 1, y, 3, 1, 'rgba(255,255,255,0.5)'); puntoAmb(x, y - 1, 1, 3, 'rgba(255,255,255,0.5)'); } },
  destellos: (t, cielo, tipo) => { for (let i = 0; i < 14; i++) { if (Math.sin(t * 5 + i * 1.7) < 0.75) continue; const x = az1(i + Math.floor(t * 0.5 + i) * 31) * PW, y = tipo === 'brillos' ? cielo - 12 + az2(i) * 10 : cielo + az2(i + Math.floor(t)) * (PH - cielo); puntoAmb(x, y, 1, 1, '#ffffff'); puntoAmb(x - 1, y, 3, 1, 'rgba(255,255,255,0.5)'); puntoAmb(x, y - 1, 1, 3, 'rgba(255,255,255,0.5)'); } },
  flashes: (t, cielo, tipo) => { for (let i = 0; i < 6; i++) { if (Math.sin(t * 7 + i * 3.1) < 0.9) continue; puntoAmb(az1(i + Math.floor(t * 2) * 17) * PW, cielo - 22 + az2(i + Math.floor(t * 2)) * 20, 2, 2, '#ffffff'); } },
  nubecillas: (t, cielo, tipo) => { for (let i = 0; i < 5; i++) { const x = giro(az1(i) - t * 0.25) * (PW + 120) - 60, y = cielo + 10 + az2(i) * 30; lx.fillStyle = 'rgba(255,255,255,0.35)'; lx.fillRect(Math.round(x), Math.round(y), 30, 4); lx.fillRect(Math.round(x) + 6, Math.round(y) - 3, 16, 3); } },
};
function pintaAmbiente(P, dt) {
  const A = P.def.ambiente; if (!A) return;
  for (const tipo of A) { const pinta = AIRE[tipo]; if (pinta) pinta(RELOJ, HZV, tipo); }
}

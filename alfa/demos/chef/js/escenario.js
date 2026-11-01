// Fans of Chef · ESCENARIO: pintar la sala (la escena entera de Yoshi, img/sala_N.png), lo que va encima con altura (montacargas, cofre,
// y en el futuro barriles y columnas sueltos) y la luz cálida de las antorchas. Si la imagen de la sala no carga, un suelo de piedra por
// código para que se pueda jugar igual.
'use strict';

function pintaSala(ctx, cam) {
  const d = MAPA.sala, im = IMG[d.img];
  ctx.fillStyle = '#0a0806'; ctx.fillRect(0, 0, cam.w, cam.h);
  if (im) ctx.drawImage(im, -cam.x, -cam.y);
  else {   // sin escena: el polígono del suelo en gris piedra y el resto en oscuro
    ctx.fillStyle = '#3b3430'; ctx.fillRect(-cam.x, -cam.y, d.w, d.h);
    ctx.beginPath(); d.suelo.forEach(([x, y], i) => i ? ctx.lineTo(x - cam.x, y - cam.y) : ctx.moveTo(x - cam.x, y - cam.y)); ctx.closePath(); ctx.fillStyle = '#8c7f74'; ctx.fill();
  }
  if (NUCLEO.desarrollo && ENTRADA.teclas.bloqueo && ENTRADA.teclas.ataque) {   // DEV: con J+K a la vez se ve el suelo pisable
    ctx.globalAlpha = 0.35; ctx.beginPath(); d.suelo.forEach(([x, y], i) => i ? ctx.lineTo(x - cam.x, y - cam.y) : ctx.moveTo(x - cam.x, y - cam.y)); ctx.closePath(); ctx.fillStyle = PALETA.G; ctx.fill();
    for (const b of d.bloqueos) caja(ctx, b[0] - cam.x, b[1] - cam.y, b[2] - b[0], b[3] - b[1], PALETA.R); ctx.globalAlpha = 1;
  }
}
// lo de la sala que tiene altura (montacargas, cofre): va a la lista que se ordena por los pies
function cosasConAltura(cam) {
  const lista = [], m = MAPA.montacargas, co = MAPA.cofre;
  if (m) lista.push({ y: m.y, pinta: g => pintaSpr(g, 'montacargas', m.x - cam.x, m.y - cam.y, { listo: JORNADA.objetivosHechos() }) });
  if (co && !co.abierto) lista.push({ y: co.y, pinta: g => pintaSpr(g, 'cofre', co.x - cam.x, co.y - cam.y) });
  return lista;
}
// la luz de las antorchas: oscuridad suave con halos cálidos (y uno alrededor del cocinero)
function pintaLuz(ctx, cam, W, H) {
  ctx.fillStyle = 'rgba(8,4,12,0.22)'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'lighter';
  for (const a of MAPA.antorchas) { const x = a.x - cam.x, y = a.y - cam.y; if (x < -60 || y < -60 || x > W + 60 || y > H + 60) continue; halo(ctx, x, y, 30 + Math.round(Math.sin(PAN.t * 9 + a.x)) * 2, 0.3); }
  halo(ctx, J.x - cam.x, J.y - cam.y - 14, 40, 0.16);
  ctx.globalCompositeOperation = 'source-over';
}
function halo(ctx, x, y, r, fuerza) { for (let k = 0; k < 4; k++) circulo(ctx, x, y, Math.round(r * (1 - k * 0.22)), 'rgba(150,90,20,' + (fuerza * 0.45).toFixed(2) + ')'); }
// un trozo de la primera sala como fondo (portada y cantina): la pared del fondo con sus antorchas
function pintaFondoSala(ctx, W, H, dy = 0) {
  const im = IMG.sala_1;
  if (!im) { caja(ctx, 0, 0, W, H, '#3b3430'); return; }
  const x0 = Math.max(0, Math.round((im.width - W) / 2));
  for (let y = 0; y < H; y += im.height) ctx.drawImage(im, x0, 0, Math.min(W, im.width), im.height, 0, y + dy, Math.min(W, im.width), im.height);
}

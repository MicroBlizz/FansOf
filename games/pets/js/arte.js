// Fans Of Pets · ARTE: los dibujos kawaii de las criaturas que ya existen (salen de Yoshi y se guardan en img/criaturas/) y cómo se pintan.
// Una criatura sin dibujo sigue saliendo como el blob provisional de pintar.js. La ducha se pinta tras una mampara pixelada (docs/pets/diseno.md).
'use strict';
// criatura → etapa → pose → archivo. Las poses: base, comer, beber, bano, dientes, cara y ducha
const PT_ARTE = {
  'animales:bunny': { bebe: ['base', 'comer', 'beber', 'bano', 'dientes', 'cara', 'ducha'] },
};
// el cuidado que se está viendo → la pose que lo dibuja
const PT_POSE = { comer: 'comer', beber: 'beber', banar: 'ducha', dientes: 'dientes', cara: 'cara', bano: 'bano' };
const PT_IMG = {};   // 'animales:bunny/bebe/comer' → Image (se carga la primera vez que hace falta)

function ptImagen(id, etapa, pose) {
  const poses = PT_ARTE[id] && PT_ARTE[id][etapa];
  if (!poses || !poses.includes(pose)) return null;
  const clave = id + '/' + etapa + '/' + pose;
  if (!PT_IMG[clave]) {
    const img = new Image();
    img.src = `img/criaturas/${id.replace(':', '-')}-${etapa}-${pose}.webp`;
    PT_IMG[clave] = img;
  }
  const img = PT_IMG[clave];
  return img.complete && img.naturalWidth ? img : null;
}
const ptTieneArte = (id, etapa) => !!(PT_ARTE[id] && PT_ARTE[id][etapa]);

// la mampara: se ve la pose entera (la ducha por encima) y un cristal centrado en la criatura la tapa de la ducha a los pies; el patito va delante.
// Lo que queda detrás del cristal se pinta reducido a pocos píxeles y ampliado sin suavizar: sutil, pero no se ve nada.
const PT_MAMPARA = document.createElement('canvas');
function ptPintaMampara(ctx, img, x, y0, lado) {   // y0: el borde de arriba del dibujo
  const M = PETS.mampara, iw = img.naturalWidth, ih = img.naturalHeight;
  const dx = x - lado / 2 + M.x * lado, dy = y0 + M.y * lado, dw = M.w * lado, dh = M.h * lado;
  ctx.save();
  ctx.save(); ctx.beginPath(); ctx.rect(x - lado / 2, y0, lado, lado); ctx.roundRect(dx, dy, dw, dh, 14); ctx.clip('evenodd');   // todo menos el cristal
  ctx.drawImage(img, x - lado / 2, y0, lado, lado);
  ctx.restore();
  const nx = Math.max(4, Math.round(dw / M.pixel)), ny = Math.max(4, Math.round(dh / M.pixel));
  PT_MAMPARA.width = nx; PT_MAMPARA.height = ny;
  const m = PT_MAMPARA.getContext('2d'); m.clearRect(0, 0, nx, ny);
  m.drawImage(img, M.x * iw, M.y * ih, M.w * iw, M.h * ih, 0, 0, nx, ny);
  ctx.beginPath(); ctx.roundRect(dx, dy, dw, dh, 14);
  ctx.save(); ctx.clip();   // lo de detrás del cristal solo se ve pixelado
  ctx.imageSmoothingEnabled = false; ctx.drawImage(PT_MAMPARA, dx, dy, dw, dh); ctx.imageSmoothingEnabled = true;
  ctx.fillStyle = 'rgba(200,235,255,0.22)'; ctx.fillRect(dx, dy, dw, dh);
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 5;   // dos brillos en diagonal
  for (const f of [0.25, 0.4]) { ctx.beginPath(); ctx.moveTo(dx + dw * f, dy + dh * 0.12); ctx.lineTo(dx + dw * (f - 0.15), dy + dh * 0.4); ctx.stroke(); }
  ctx.restore();
  ptTrazo(ctx, 5); ctx.beginPath(); ctx.roundRect(dx, dy, dw, dh, 14); ctx.stroke();   // el marco
  const D = M.delante;   // el patito, nítido y por delante del cristal
  ctx.drawImage(img, D.x * iw, D.y * ih, D.w * iw, D.h * ih, x - lado / 2 + D.x * lado, y0 + D.y * lado, D.w * lado, D.h * lado);
  ctx.restore();
}

// el bebé con su dibujo: respira, bota al cuidarlo y cambia de pose mientras dura el cuidado. e: { dormida, triste, anim, at }
function ptPintaBebeArte(ctx, id, x, y, r, t, e) {
  const dura = PETS.poseSegundos, a = e.anim && t - e.at < dura ? e.anim : '', p = a ? (t - e.at) / dura : 0;
  const pose = (a && PT_POSE[a]) || 'base', img = ptImagen(id, 'bebe', pose) || ptImagen(id, 'bebe', 'base');
  if (!img) return false;   // aún cargando: que pinte el blob
  const lado = r * PETS.arte.lienzo, resp = e.dormida ? Math.sin(t * 1.6) * 0.025 : Math.sin(t * 3) * 0.02;
  const salto = a && !e.dormida ? Math.abs(Math.sin(p * Math.PI * 4)) * 14 * (1 - p) : 0, suelo = y + r * 1.0;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(x, suelo, r * 0.85, r * 0.16, 0, 0, 7); ctx.fill();
  if (pose === 'ducha') ptPintaMampara(ctx, img, x, suelo - salto - lado * PETS.arte.pies, lado);
  else {
    ctx.translate(x, suelo - salto); ctx.scale(1 + resp, 1 - resp);
    if (e.dormida) ctx.filter = 'brightness(0.75)';
    ctx.drawImage(img, -lado / 2, -lado * PETS.arte.pies, lado, lado);
    ctx.filter = 'none';
  }
  ctx.restore();
  ptPintaEfecto(ctx, x, y - salto, r, t, { dormida: e.dormida, triste: e.triste }, '', p);   // las zetas y la lágrima de pintar.js
  return true;
}

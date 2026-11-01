// Fans Of Pets · adaptador · ARTE: los dibujos kawaii de las criaturas que ya existen (salen de Yoshi y se guardan en img/criaturas/) y cómo se
// pintan, en cada etapa (de bebé con sus poses; de niña, adolescente y adulta con su base; de jefa, una por rama). Una criatura sin
// dibujo sigue saliendo como el blob provisional de pintar.js. La ducha se pinta tras una mampara pixelada
// (docs/pets/diseno.md). Solo lee el estado que le pasan.
'use strict';
PT.arte = (() => {
  // criatura → etapa → poses con dibujo. Las poses: base, comer, beber, bano, dientes, cara, ducha y dormir (en su camita).
  // Una pose que falta se pinta con la base. Los bebés van sentados, como un peluche (docs/pets/evoluciones.md)
  const POSES_BEBE = ['base', 'comer', 'beber', 'bano', 'dientes', 'cara', 'ducha', 'dormir'];
  const RAMAS = PETS.ascenso.ramas;
  const ANIMALES = ['bunny', 'squirrel', 'beaver', 'fox', 'meercat', 'junkcoon', 'mechavaca', 'huron'];   // MechaVaca: de bebé es una vaca con un robot de juguete; el robot de verdad llega en el adulto
  const ARTE = Object.fromEntries(ANIMALES.map(k => ['animales:' + k, { bebe: POSES_BEBE, nino: ['base'], adolescente: ['base'], adulto: ['base'], jefe: RAMAS }]));
  // dónde está el patito en la ducha de cada criatura (x, y, ancho y alto en fracción del dibujo); si falta, el de PETS.mampara.delante
  const PATITO = {
    'animales:squirrel': [0.665, 0.76, 0.17, 0.15], 'animales:beaver': [0.662, 0.662, 0.17, 0.203], 'animales:fox': [0.676, 0.727, 0.13, 0.145],
    'animales:meercat': [0.707, 0.662, 0.155, 0.208], 'animales:junkcoon': [0.685, 0.662, 0.17, 0.212], 'animales:mechavaca': [0.715, 0.7, 0.137, 0.164],
    'animales:huron': [0.67, 0.662, 0.176, 0.22],
  };
  // el cuidado que se está viendo → la pose que lo dibuja
  const POSE = { comer: 'comer', beber: 'beber', banar: 'ducha', dientes: 'dientes', cara: 'cara', bano: 'bano' };
  const IMG = {};   // 'img/criaturas/animales-bunny-bebe-comer.webp' → Image (se carga la primera vez que hace falta)
  const LOLA = { cara: [357, 209], escala: 0.8 };   // dónde está la cara de Lola en el lienzo de 640 y cuánto se amplía
  const MAMPARA = document.createElement('canvas');

  function carga(ruta) {
    if (!IMG[ruta]) {
      const img = new Image();
      img.src = ruta;
      IMG[ruta] = img;
    }
    const img = IMG[ruta];
    return img.complete && img.naturalWidth ? img : null;
  }
  function imagen(id, etapa, pose) {
    const poses = ARTE[id] && ARTE[id][etapa];
    if (!poses || !poses.includes(pose)) return null;
    return carga(`img/criaturas/${id.replace(':', '-')}-${etapa}-${pose}.webp`);
  }
  const tiene = (id, etapa) => !!(ARTE[id] && ARTE[id][etapa]);
  const ids = () => Object.keys(ARTE);

  // la mampara: se ve la pose entera (la ducha por encima) y un cristal centrado en la criatura la tapa de la ducha a los pies; el patito va delante.
  // Lo que queda detrás del cristal se pinta reducido a pocos píxeles y ampliado sin suavizar: sutil, pero no se ve nada.
  function mampara(ctx, img, x, y0, lado, id) {   // y0: el borde de arriba del dibujo
    const M = PETS.mampara, iw = img.naturalWidth, ih = img.naturalHeight;
    const dx = x - lado / 2 + M.x * lado, dy = y0 + M.y * lado, dw = M.w * lado, dh = M.h * lado;
    ctx.save();
    ctx.save(); ctx.beginPath(); ctx.rect(x - lado / 2, y0, lado, lado); ctx.roundRect(dx, dy, dw, dh, 14); ctx.clip('evenodd');   // todo menos el cristal
    ctx.drawImage(img, x - lado / 2, y0, lado, lado);
    ctx.restore();
    cristal(ctx, img, dx, dy, dw, dh);
    PT.pintor.trazo(ctx, 5); ctx.beginPath(); ctx.roundRect(dx, dy, dw, dh, 14); ctx.stroke();   // el marco
    const P = PATITO[id], D = P ? { x: P[0], y: P[1], w: P[2], h: P[3] } : M.delante;   // el patito, nítido y por delante del cristal
    ctx.drawImage(img, D.x * iw, D.y * ih, D.w * iw, D.h * ih, x - lado / 2 + D.x * lado, y0 + D.y * lado, D.w * lado, D.h * lado);
    ctx.restore();
  }
  function cristal(ctx, img, dx, dy, dw, dh) {
    const M = PETS.mampara, iw = img.naturalWidth, ih = img.naturalHeight;
    const nx = Math.max(4, Math.round(dw / M.pixel)), ny = Math.max(4, Math.round(dh / M.pixel));
    MAMPARA.width = nx; MAMPARA.height = ny;
    const m = MAMPARA.getContext('2d'); m.clearRect(0, 0, nx, ny);
    m.drawImage(img, M.x * iw, M.y * ih, M.w * iw, M.h * ih, 0, 0, nx, ny);
    ctx.beginPath(); ctx.roundRect(dx, dy, dw, dh, 14);
    ctx.save(); ctx.clip();   // lo de detrás del cristal solo se ve pixelado
    ctx.imageSmoothingEnabled = false; ctx.drawImage(MAMPARA, dx, dy, dw, dh); ctx.imageSmoothingEnabled = true;
    ctx.fillStyle = 'rgba(200,235,255,0.22)'; ctx.fillRect(dx, dy, dw, dh);
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 5;   // dos brillos en diagonal
    for (const f of [0.25, 0.4]) { ctx.beginPath(); ctx.moveTo(dx + dw * f, dy + dh * 0.12); ctx.lineTo(dx + dw * (f - 0.15), dy + dh * 0.4); ctx.stroke(); }
    ctx.restore();
  }

  // qué pose toca en esa etapa y su imagen (o la base si falta); null si aún no hay nada cargado. Un jefe: su rama es la pose
  function poseDe(id, etapa, e, a) {
    const pose = etapa === 'jefe' ? e.rama : e.dormida ? 'dormir' : (a && POSE[a]) || 'base';
    const img = imagen(id, etapa, pose);
    if (img) return { pose, img };
    const base = imagen(id, etapa, 'base');
    return base ? { pose: 'base', img: base } : null;
  }
  // la criatura con su dibujo, en su etapa (o 'jefe' con e.rama): respira, bota al cuidarla y cambia de pose mientras dura el cuidado.
  // e: { dormida, triste, anim, at, rama }. Devuelve false si el dibujo aún se está cargando (que pinte el blob)
  function criatura(ctx, id, etapa, x, y, r, t, e) {
    const dura = PETS.poseSegundos, a = e.anim && t - e.at < dura ? e.anim : '', p = a ? (t - e.at) / dura : 0;
    const d = poseDe(id, etapa, e, a);
    if (!d) return false;
    const cama = d.pose === 'dormir';   // dormida en su camita: el dibujo ya trae su zeta
    const lado = r * PETS.arte.lienzo, resp = e.dormida ? Math.sin(t * 1.6) * 0.025 : Math.sin(t * 3) * 0.02;
    const salto = a && !e.dormida ? Math.abs(Math.sin(p * Math.PI * 4)) * 14 * (1 - p) : 0, suelo = y + r * 1.0;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(x, suelo, r * 0.85, r * 0.16, 0, 0, 7); ctx.fill();
    if (d.pose === 'ducha') mampara(ctx, d.img, x, suelo - salto - lado * PETS.arte.pies, lado, id);
    else {
      ctx.translate(x, suelo - salto); ctx.scale(1 + resp, 1 - resp);
      if (e.dormida) ctx.filter = cama ? 'brightness(0.85)' : 'brightness(0.75)';
      ctx.drawImage(d.img, -lado / 2, -lado * PETS.arte.pies, lado, lado);
      ctx.filter = 'none';
    }
    ctx.restore();
    PT.pintor.efecto(ctx, x, y - salto, r, t, { dormida: e.dormida && !cama, triste: e.triste }, '', p);   // las zetas y la lágrima de pintar.js
    return true;
  }

  // Lola con su dibujo (la de la entrevista, con la carpeta). x, y: el centro de su cara, como PT.pintor.lola; s: la escala
  function lola(ctx, x, y, s, t) {
    const img = carga('img/lola/entrevista.webp');
    if (!img) return false;
    const k = s * LOLA.escala, b = Math.sin(t * 2) * 3;
    ctx.drawImage(img, x - LOLA.cara[0] * k, y + b - LOLA.cara[1] * k, 640 * k, 640 * k);
    return true;
  }

  return { tiene, ids, criatura, lola };
})();

// Fans Of Pets · adaptador · ARTE: los dibujos kawaii de las criaturas que ya existen (salen de Yoshi y se guardan en img/criaturas/) y cómo se
// pintan, en cada etapa (de bebé con sus poses; de niña, adolescente y adulta con su base; de jefa, una por rama). Una criatura sin
// dibujo sigue saliendo como el blob provisional de pintar.js. Las criaturas sobre las plantillas (SOBRE_MOLDE) van con la cara vacía y
// se les compone la cara con las piezas de caras.js (boca y ojos) colocadas por las anclas de su plantilla. La ducha se pinta tras una
// mampara pixelada (docs/pets/diseno.md). Solo lee el estado que le pasan.
'use strict';
PT.arte = (() => {
  // criatura → etapa → poses con dibujo. Las poses: base, comer, beber, bano, dientes, cara, ducha y dormir (en su camita).
  // Una pose que falta se pinta con la base. Los bebés van sentados, como un peluche (docs/pets/evoluciones.md)
  const POSES_BEBE = ['base', 'comer', 'beber', 'bano', 'dientes', 'cara', 'ducha', 'dormir'];
  const RAMAS = PETS.ascenso.ramas;
  const ANIMALES = ['bunny', 'squirrel', 'beaver', 'fox', 'meercat', 'junkcoon', 'mechavaca', 'huron'];   // MechaVaca: de bebé es una vaca con un robot de juguete; el robot de verdad llega en el adulto
  const ARTE = Object.fromEntries(ANIMALES.map(k => ['animales:' + k, { bebe: POSES_BEBE, nino: ['base'], adolescente: ['base'], adulto: ['base'], jefe: RAMAS }]));
  ARTE['animales:bunny'] = { bebe: POSES_BEBE, nino: POSES_BEBE, adolescente: POSES_BEBE, adulto: POSES_BEBE, jefe: RAMAS };   // CrazyBunny: las 37 sobre las plantillas
  // dónde está el patito en la ducha de cada criatura (x, y, ancho y alto en fracción del dibujo); si falta, el de PETS.mampara.delante
  const PATITO = {
    'animales:squirrel': [0.665, 0.76, 0.17, 0.15], 'animales:beaver': [0.662, 0.662, 0.17, 0.203], 'animales:fox': [0.676, 0.727, 0.13, 0.145],
    'animales:meercat': [0.707, 0.662, 0.155, 0.208], 'animales:junkcoon': [0.685, 0.662, 0.17, 0.212], 'animales:mechavaca': [0.715, 0.7, 0.137, 0.164],
    'animales:huron': [0.67, 0.662, 0.176, 0.22],
    'animales:bunny': null,   // las duchas sobre las plantillas no llevan patito
  };
  // el cuidado que se está viendo → la pose que lo dibuja
  const POSE = { comer: 'comer', beber: 'beber', banar: 'ducha', dientes: 'dientes', cara: 'cara', bano: 'bano' };
  // las criaturas dibujadas sobre las plantillas lisas (docs/pets/arte.md): van con la cara vacía y la cara se compone con las piezas de
  // caras.js sobre las anclas de la plantilla (anclas.js). Las de antes de las plantillas se quedan con su dibujo quieto. Y la pose base
  // de cada una (su personalidad, una por rama de ascenso)
  const SOBRE_MOLDE = { 'animales:bunny': 'loco' };
  // las zonas de la cara que en esa pose van tapadas por el dibujo (gafas de sol, antifaz…): ahí no se pone pieza. id → pose → zonas
  const TAPADAS = { 'animales:bunny': { gamberro: ['ojos'], siesta: ['ojos'] } };
  const ANIMADORES = {};   // id → su animador (cuándo parpadea…)
  const COMPUESTA = document.createElement('canvas');   // el dibujo con su cara puesta, para pintarlo (o pixelarlo) de una pieza
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
  const animador = id => ANIMADORES[id] || (ANIMADORES[id] = PT.creaAnimador(PETS.animacion));

  // el dibujo con la cara puesta: sobre la imagen con la cara vacía, la boca y encima los ojos que tocan (caras.eleccion), cada pieza en su
  // sitio por el marco de la cara de la plantilla. Si la criatura no está sobre molde o la pose no tiene anclas (ojos cerrados o tapados),
  // la imagen tal cual. Devuelve lo que hay que pintar (la imagen o el lienzo compuesto, de 640)
  function conCara(id, etapa, pose, cara, e, img) {
    const A = SOBRE_MOLDE[id] && PT.anclas.de(etapa, pose, SOBRE_MOLDE[id]);
    if (!A) return img;
    const L = 640, [mx, my, d] = PT.anclas.marco(A), que = PT.caras.eleccion(cara, e);
    COMPUESTA.width = COMPUESTA.height = L;
    const g = COMPUESTA.getContext('2d');
    g.drawImage(img, 0, 0, L, L);
    for (const zona of ['boca', 'ojos']) {
      if (TAPADAS[id] && TAPADAS[id][pose] && TAPADAS[id][pose].includes(zona)) continue;
      const p = PT.caras.pieza(id, etapa, zona, que[zona]) || PT.caras.pieza(id, etapa, zona, 'base');
      const pieza = p && carga(p.ruta);
      if (pieza) g.drawImage(pieza, (mx + p.c[0] * d) * L, (my + p.c[1] * d) * L, p.c[2] * d * L, p.c[3] * d * L);
    }
    return COMPUESTA;
  }
  // la mampara: se ve la pose entera (la ducha por encima) y un cristal centrado en la criatura la tapa de la ducha a los pies; el patito va delante.
  // Lo que queda detrás del cristal se pinta reducido a pocos píxeles y ampliado sin suavizar: sutil, pero no se ve nada.
  // Sobre las plantillas el cristal sale de las anclas: de debajo de la boca a los pies, algo más ancho que los ojos
  function cristalDe(id, etapa) {
    const A = SOBRE_MOLDE[id] && PT.anclas.de(etapa, 'ducha', SOBRE_MOLDE[id]);
    if (!A) return PETS.mampara;
    const [i, d] = A.ojos, x = i[0] - i[2] * 3.4, y = A.boca[1] + i[3] * 1.4;
    return { x, y, w: d[0] + d[2] * 3.4 - x, h: PETS.arte.pies + 0.02 - y };
  }
  function mampara(ctx, img, x, y0, lado, id, etapa) {   // y0: el borde de arriba del dibujo
    const M = PETS.mampara, C = cristalDe(id, etapa), iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const dx = x - lado / 2 + C.x * lado, dy = y0 + C.y * lado, dw = C.w * lado, dh = C.h * lado;
    ctx.save();
    ctx.save(); ctx.beginPath(); ctx.rect(x - lado / 2, y0, lado, lado); ctx.roundRect(dx, dy, dw, dh, 14); ctx.clip('evenodd');   // todo menos el cristal
    ctx.drawImage(img, x - lado / 2, y0, lado, lado);
    ctx.restore();
    cristal(ctx, img, dx, dy, dw, dh, C);
    PT.pintor.trazo(ctx, 5); ctx.beginPath(); ctx.roundRect(dx, dy, dw, dh, 14); ctx.stroke();   // el marco
    const P = PATITO[id], D = P ? { x: P[0], y: P[1], w: P[2], h: P[3] } : M.delante;   // el patito, nítido y por delante del cristal (null: sin patito)
    if (P !== null) ctx.drawImage(img, D.x * iw, D.y * ih, D.w * iw, D.h * ih, x - lado / 2 + D.x * lado, y0 + D.y * lado, D.w * lado, D.h * lado);
    ctx.restore();
  }
  function cristal(ctx, img, dx, dy, dw, dh, C) {
    const M = PETS.mampara, iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const nx = Math.max(4, Math.round(dw / M.pixel)), ny = Math.max(4, Math.round(dh / M.pixel));
    MAMPARA.width = nx; MAMPARA.height = ny;
    const m = MAMPARA.getContext('2d'); m.clearRect(0, 0, nx, ny);
    m.drawImage(img, C.x * iw, C.y * ih, C.w * iw, C.h * ih, 0, 0, nx, ny);
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
  // e: { dormida, triste, anim, at, rama, sonolienta, pidiendo, cara (forzada) }. Devuelve false si el dibujo aún se está cargando (que pinte el blob)
  function criatura(ctx, id, etapa, x, y, r, t, e) {
    const dura = PETS.poseSegundos, a = e.anim && t - e.at < dura ? e.anim : '', p = a ? (t - e.at) / dura : 0;
    const d = poseDe(id, etapa, e, a);
    if (!d) return false;
    const cama = d.pose === 'dormir';   // dormida en su camita: el dibujo ya trae su zeta
    const lado = r * PETS.arte.lienzo, resp = e.dormida ? Math.sin(t * 1.6) * 0.025 : Math.sin(t * 3) * 0.02;
    const salto = a && !e.dormida ? Math.abs(Math.sin(p * Math.PI * 4)) * 14 * (1 - p) : 0, suelo = y + r * 1.0;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(x, suelo, r * 0.85, r * 0.16, 0, 0, 7); ctx.fill();
    const cara = animador(id).cara(t, { cara: e.cara, dormida: e.dormida, comiendo: a === 'comer' || a === 'beber', sonolienta: e.sonolienta, pidiendo: e.pidiendo, triste: e.triste });
    const img = conCara(id, etapa, d.pose, cara, e, d.img);
    if (d.pose === 'ducha') mampara(ctx, img, x, suelo - salto - lado * PETS.arte.pies, lado, id, etapa);
    else {
      ctx.translate(x, suelo - salto); ctx.scale(1 + resp, 1 - resp);
      if (e.dormida) ctx.filter = cama ? 'brightness(0.85)' : 'brightness(0.75)';
      ctx.drawImage(img, -lado / 2, -lado * PETS.arte.pies, lado, lado);
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

  return { tiene, ids, criatura, lola, sobreMolde: id => !!SOBRE_MOLDE[id] };
})();

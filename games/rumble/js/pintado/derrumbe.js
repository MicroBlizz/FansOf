// Fans of Rumble · Arte pintado: el derrumbe pintado de torres y bases (vídeo de Yoshi en fotogramas, img/pintado/derrumbe/<clave>.webp;
// datos en derrumbe-datos.js). Al caer un edificio que tiene hoja, en vez de los escombros de siempre se ve la animación encima
// de su sitio, y el último fotograma (el montón de escombros) se queda. Sin partículas dibujadas: solo temblor, fogonazo y sonido.
// Se carga después de animar.js. Solo con PINTADO.activo(); sin hoja, como antes.
'use strict';
(() => {
  const HOJA = {};    // clave del edificio -> Image de la hoja
  const DUR = 1.4;    // segundos que dura el derrumbe

  // dónde pinta arte.js el edificio vivo (aplicaSprite): de pie en (s.x, s.y), centrado y con su escala
  function rectVivo(s, key) {
    const im = V2.IMG[key], b = BOX[key]; if (!im || !b) return null;
    const e = PINTADO.edificioSuelto[key] || PINTADO.edificios[s.role] || 1, baja = e !== 1 ? PINTADO.bajarEdificios : 0;
    const [w, h, , ay0] = b.map(n => n * e), pie = Math.min(h, ay0 + 3), k = Math.min(w / im.width, pie / im.height);
    return { x: s.x - im.width * k / 2, y: s.y - (ay0 - baja) + pie - im.height * k, h: im.height * k };
  }

  const drawStructOriginal = drawStruct;
  drawStruct = function (s) {
    const key = s.skin + '_' + s.role, D = V2_DERRUMBE[key];
    if (s.alive || s.hidden || s.derrumbeT == null || !D || !HOJA[key] || !PINTADO.activo()) return drawStructOriginal(s);
    const r = rectVivo(s, key); if (!r) return drawStructOriginal(s);
    const [cw, ch] = D.celda, [bx, by, , bh] = D.caja0, k = r.h / bh;
    const col = Math.min(D.n - 1, Math.max(0, Math.floor((G.t - s.derrumbeT) / DUR * D.n)));
    ctx.drawImage(HOJA[key], col * cw, 0, cw, ch, r.x - bx * k, r.y - by * k, cw * k, ch * k);
  };

  // con hoja pintada, nada de partículas dibujadas con código (polvo, astillas, chispas, anillo, destello ni humo: Daniel,
  // 7-11-2026, «hay que sustituir todo lo vectorial»): solo el temblor, el fogonazo de pantalla y el sonido
  const structDeathFxOriginal = structDeathFx;
  structDeathFx = function (s) {
    const key = s.skin + '_' + s.role;
    if (!V2_DERRUMBE[key] || !HOJA[key] || !PINTADO.activo()) return structDeathFxOriginal(s);
    s.derrumbeT = G.t;
    screenFlash(s.role === 'base' ? 0.5 : 0.3); shake(14); play('boom');
  };

  // las hojas se bajan solo cuando el arte pintado está encendido (y una sola vez)
  let bajando = false;
  function bajaHojas() {
    if (bajando || !PINTADO.activo()) return;
    bajando = true;
    const ver = '?v=' + encodeURIComponent(NUCLEO.version || '0');
    for (const key in V2_DERRUMBE) {
      const im = new Image();
      im.onload = () => { HOJA[key] = im; };
      im.src = PINTADO.ruta() + 'derrumbe/' + key + '.webp' + ver;
    }
  }
  bajaHojas();
  NUCLEO.alCambiarFlags(bajaHojas);
})();

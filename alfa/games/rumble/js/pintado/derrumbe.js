// Fans of Rumble · Arte pintado: el derrumbe pintado de torres y bases (vídeo de Yoshi en fotogramas, img/pintado/derrumbe/<clave>.webp;
// datos en derrumbe-datos.js). Al caer un edificio que tiene hoja, en vez de los escombros de siempre se ve la animación encima
// de su sitio, y el último fotograma (el montón de escombros) se queda. Sin partículas dibujadas: solo temblor, fogonazo y sonido.
// Si el edificio tiene además humo pintado (<clave>-humo.webp, misma celda), al acabar el derrumbe se repite en bucle de ida y
// vuelta y sustituye al humo de partículas de las ruinas (ruinSmoke, 06d-unidades.js).
// Se carga después de animar.js. Solo con PINTADO.activo(); sin hoja, como antes.
'use strict';
(() => {
  const HOJA = {};    // clave del edificio -> Image de la hoja
  const HUMO = {};    // clave del edificio -> Image de la hoja del humo de sus ruinas
  const DUR = 1.4;    // segundos que dura el derrumbe
  const DUR_HUMO = 2; // segundos que dura una pasada del humo (lo que dura el vídeo de Yoshi)

  // fotograma de la hoja que toca a los t segundos de empezar el derrumbe: primero el derrumbe y, si hay humo, su bucle
  // de ida y vuelta (0..n-1..1), para que no salte al volver a empezar
  function fotograma(t, D, hayHumo) {
    if (t < DUR || !hayHumo) return { humo: false, col: Math.min(D.n - 1, Math.max(0, Math.floor(t / DUR * D.n))) };
    const m = D.humo, ciclo = 2 * m - 2, i = Math.floor((t - DUR) / DUR_HUMO * m) % Math.max(1, ciclo);
    return { humo: true, col: i < m ? i : ciclo - i };
  }

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
    const f = fotograma(G.t - s.derrumbeT, D, !!HUMO[key]);
    ctx.drawImage(f.humo ? HUMO[key] : HOJA[key], f.col * cw, 0, cw, ch, r.x - bx * k, r.y - by * k, cw * k, ch * k);
  };

  // con humo pintado, las ruinas no echan el humo de partículas (derrumbeT solo existe si cayó con su hoja de derrumbe)
  const ruinSmokeOriginal = ruinSmoke;
  ruinSmoke = function (s, dt) {
    const key = s.skin + '_' + s.role;
    if (s.derrumbeT != null && HUMO[key] && PINTADO.activo()) return;
    return ruinSmokeOriginal(s, dt);
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
    const baja = (key, nombre, destino) => {
      const im = new Image();
      im.onload = () => { destino[key] = im; };
      im.src = PINTADO.ruta() + 'derrumbe/' + nombre + '.webp' + ver;
    };
    for (const key in V2_DERRUMBE) {
      baja(key, key, HOJA);
      if (V2_DERRUMBE[key].humo) baja(key, key + '-humo', HUMO);
    }
  }
  bajaHojas();
  NUCLEO.alCambiarFlags(bajaHojas);
})();

// Fans Of Pets · adaptador · FIGURAS: pinta una criatura POR PIEZAS (la sacada de su dibujo entero con herramientas/pets/despiece.py):
// lee su carpeta img/criaturas/<facción>-<criatura>/<etapa>/ (mapa.json y una webp por pieza), la monta con los giros del gesto
// (figura.js, gestos.js) y le pone encima la cara viva del molde (caras.js) en el marco medido en su dibujo, girando con la cabeza.
// De momento solo la usa la escena DEV de animaciones (modo dev); la partida sigue con arte.js.
'use strict';
PT.figuras = (() => {
  const CON_PIEZAS = { 'animales:bunny': ['nino'], 'animales:huron': ['nino'] };   // las criaturas ya despiezadas, y en qué etapas
  const MAPAS = {};   // 'animales:bunny/nino' → el mapa (null mientras llega, false si no se pudo leer)
  const IMG = {};
  const ANIMADORES = {};
  const carpeta = (id, etapa) => `img/criaturas/${id.replace(':', '-')}/${etapa}/`;
  const tiene = (id, etapa) => !!(CON_PIEZAS[id] && CON_PIEZAS[id].includes(etapa));
  const animador = id => ANIMADORES[id] || (ANIMADORES[id] = PT.creaAnimador(PETS.animacion));

  function carga(ruta) {
    if (!IMG[ruta]) { IMG[ruta] = new Image(); IMG[ruta].src = ruta; }
    return IMG[ruta].complete && IMG[ruta].naturalWidth ? IMG[ruta] : null;
  }
  // el mapa de esa criatura y etapa; la primera vez lo pide y devuelve null hasta que llega
  function mapa(id, etapa) {
    const k = id + '/' + etapa;
    if (!(k in MAPAS)) {
      MAPAS[k] = null;
      fetch(carpeta(id, etapa) + 'mapa.json').then(r => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
        .then(m => { const v = PT.figura.valida(m); MAPAS[k] = v.ok ? m : false; if (!v.ok) console.warn('Pets: mapa de piezas no válido', k, v.error); })
        .catch(e => { MAPAS[k] = false; console.warn('Pets: sin mapa de piezas', k, e.message); });
    }
    return MAPAS[k] || null;
  }
  // las imágenes de todas las piezas, o null si falta alguna por cargar (así no se ve la criatura a medio montar)
  function imagenes(id, etapa, montaje) {
    const imgs = montaje.map(m => carga(carpeta(id, etapa) + m.archivo));
    return imgs.every(Boolean) ? imgs : null;
  }
  // la cara viva encima de la cabeza: la boca y sobre ella los ojos del molde, en el marco medido en el dibujo
  function pintaCara(ctx, id, etapa, c, que) {
    const [mx, my, d] = c.marco;
    ctx.save();
    ctx.transform(...c.matriz);
    for (const zona of ['boca', 'ojos']) {
      const p = PT.caras.pieza(id, etapa, zona, que[zona]) || PT.caras.pieza(id, etapa, zona, 'base'), img = p && carga(p.ruta);
      if (img) ctx.drawImage(img, mx + p.c[0] * d, my + p.c[1] * d, p.c[2] * d, p.c[3] * d);
    }
    ctx.restore();
  }
  // la criatura por piezas con ese gesto, de pie en (x, suelo), en un lienzo de `lado` px (el de arte.js). e: { cara, dormida, triste }.
  // Devuelve false si aún no está todo cargado (que se pinte otra cosa mientras)
  function pinta(ctx, id, etapa, x, suelo, lado, t, gesto, e = {}) {
    const m = tiene(id, etapa) && mapa(id, etapa), g = PT.gestos.giros(gesto, t), mont = m && PT.figura.montar(m, g.ok ? g.valor : {});
    const imgs = mont && mont.ok && imagenes(id, etapa, mont.valor);
    if (!imgs) return false;
    const { arriba, pies } = PT.figura.alto(m), k = PETS.figura.alto * lado / (pies - arriba), resp = Math.sin(t * 3) * 0.02;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(x, suelo, lado * 0.24, lado * 0.045, 0, 0, 7); ctx.fill();
    ctx.translate(x, suelo); ctx.scale(k * (1 + resp), k * (1 - resp)); ctx.translate(-0.5, -pies);
    mont.valor.forEach((p, i) => {
      ctx.save(); ctx.transform(...p.matriz); ctx.drawImage(imgs[i], ...p.caja); ctx.restore();
    });
    const c = PT.figura.cara(m, mont.valor);
    if (c) pintaCara(ctx, id, etapa, c, PT.caras.eleccion(animador(id).cara(t, { cara: e.cara, dormida: e.dormida, triste: e.triste }), e));
    ctx.restore();
    return true;
  }
  return { tiene, pinta, gestos: () => PT.gestos.lista() };
})();

// Fans Of Pets · adaptador · MUÑECOS: pinta en el lienzo el muñeco kawaii por código (muneco.js con su pose de muneco-poses.js, su piel
// de pieles.js y los objetos y efectos de muneco-objetos.js). Cada capa con contorno se pinta como una silueta unida: primero todos los
// contornos gruesos y luego todos los rellenos, así las juntas no se ven. Guarda el muelle de las orejas de cada criatura.
// De momento solo lo usa la escena DEV de animaciones (modo dev); la partida sigue con arte.js.
'use strict';
PT.munecos = (() => {
  const O = 9;   // grosor del contorno, en unidades del muñeco
  const MUELLES = {};   // id → { x, v, t } (el muelle de las orejas y el instante de la última vez)

  function traza(ctx, f) {
    ctx.beginPath();
    if (f.t === 'elipse') { ctx.ellipse(f.x, f.y, f.rx, f.ry, f.g || 0, 0, Math.PI * 2); return; }
    const [a, ...resto] = f.p;
    ctx.moveTo(a[0], a[1]);
    if (f.t === 'tubo' && resto.length === 2) ctx.quadraticCurveTo(resto[0][0], resto[0][1], resto[1][0], resto[1][1]);
    else resto.forEach(q => ctx.lineTo(q[0], q[1]));
    if (f.t === 'poli') ctx.closePath();
  }
  const esLinea = f => f.t === 'tubo' || f.t === 'linea';
  function contorno(ctx, f, trazo) {
    traza(ctx, f);
    ctx.strokeStyle = trazo;
    ctx.lineWidth = esLinea(f) ? f.w + 2 * O : 2 * O;
    ctx.stroke();
  }
  function relleno(ctx, f) {
    traza(ctx, f);
    ctx.globalAlpha = f.a == null ? 1 : Math.max(0, f.a);
    if (esLinea(f)) { ctx.strokeStyle = f.c; ctx.lineWidth = f.w; ctx.stroke(); } else { ctx.fillStyle = f.c; ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  function capa(ctx, c, trazo) {
    ctx.save();
    if (c.recorte) { traza(ctx, c.recorte); ctx.clip(); }
    if (c.contorno) c.formas.forEach(f => contorno(ctx, f, trazo));
    c.formas.forEach(f => relleno(ctx, f));
    ctx.restore();
  }
  // el muelle de las orejas de esa criatura, un paso hasta t (sigue a cuánto se mueve la cabeza)
  function orejas(id, pose, t) {
    const m = MUELLES[id] || (MUELLES[id] = { x: 0, v: 0, t });
    const dt = Math.min(0.1, Math.max(0, t - m.t)), objetivo = (pose.salto + pose.sentada) * 0.004 - pose.aplasta * 2 + pose.giro + pose.mira * 0.15;
    Object.assign(m, PT.muneco.muelle(m, objetivo, dt), { t });
    return m.x;
  }
  // el muñeco de esa criatura con esa pose (acción, gesto o emoción), de pie en (x, suelo), en un lienzo de `lado` px. false si la pose no existe
  function pinta(ctx, id, x, suelo, lado, t, nombre) {
    const r = PT.munecoPoses.pose(nombre, t);
    if (!r.ok) return false;
    const pose = r.valor, piel = PT.pieles.de(id, PT.criaturas.color(PT.criaturas.busca(id).fac));
    const m = PT.muneco.capas(pose, piel, orejas(id, pose, t), t), o = PT.munecoObjetos.capas(pose, m.anclas);
    const k = PETS.figura.alto * lado / PT.muneco.ALTO, sube = pose.salto + pose.sentada;
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(x, suelo, lado * 0.24 * (1 - pose.salto / 260), lado * 0.04, 0, 0, 7); ctx.fill();
    ctx.translate(x, suelo); ctx.scale(k, k);
    o.detras.forEach(c => capa(ctx, c, piel.trazo));
    ctx.translate(0, -sube); ctx.scale(1 + pose.aplasta, 1 - pose.aplasta);   // aplastar y estirar desde los pies
    [...m.cuerpo, ...o.medio, ...m.brazos.detras, ...m.cabeza, ...m.brazos.delante, ...o.mano, ...o.efectos].forEach(c => capa(ctx, c, piel.trazo));
    ctx.restore();
    return true;
  }
  return { pinta, tiene: id => PT.pieles.tiene(id) };
})();

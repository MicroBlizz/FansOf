// Fans of Vikings · LA ALDEA viva: dónde está cada edificio en el mapa, los 4 fans paseando (y yendo a su puesto cuando su
// edificio trabaja: MadSquirrel al huerto, SlyFox a la cocina, CrazyBunny a la herrería y MeerCat al almacén), los que están KO
// tumbados junto a la casa, los iconos que suben al terminar algo, los avisos y el desplazamiento del mapa con el dedo.
'use strict';
const VK_MAPA = { y0: 22, alto: 22 * 16, camY: 0 };   // el mapa: 22 filas de 16 px debajo de la barra de arriba
const VK_V = { W: VK_ANCHO, H: 420, esc: 2 };          // tamaño lógico del lienzo (lo calcula principal.js)
const VK_ALDEA = { fans: {}, flotan: [], avisos: [], panel: null, t: 0 };

// posición de un edificio en el mapa (sin el desplazamiento): esquina de arriba y los pies (centro de abajo)
function vkSitio(id) {
  const E = VK_EDIFICIOS[id], im = VK_IMG[E.dibujo];
  const w = vkLista(im) ? im.naturalWidth : 64, h = vkLista(im) ? im.naturalHeight : 64;
  const x = E.col * 16, y = E.fila * 16;
  return { x, y, w, h, pieX: x + w / 2, pieY: y + h };
}
// dónde se pone a trabajar su fan: al lado del edificio, por el lado con más sitio
function vkPuesto(id) {
  const s = vkSitio(id);
  const izq = s.pieX > VK_V.W / 2;
  return { x: izq ? s.x - 10 : s.x + s.w + 10, y: s.pieY - 2 };
}
const vkAbierto = id => SAVE.nivel >= VK_EDIFICIOS[id].nivel;
const vkCasa = () => { const s = vkSitio('casa'); return { x: s.pieX, y: s.pieY + 14 }; };

function vkIniciaFans() {
  VK_ORDEN_FANS.forEach((id, i) => {
    const c = vkCasa();
    VK_ALDEA.fans[id] = { x: c.x - 30 + i * 22, y: c.y + 30 + (i % 2) * 8, tx: null, ty: null, anim: 'reposo', t: Math.random() * 3, espera: 1 + Math.random() * 3 };
  });
}
// un sitio al azar de la hierba por donde pasear (sin meterse en el agua)
function vkSitioPaseo() { return { x: 14 + Math.random() * (VK_V.W - 28), y: 100 + Math.random() * (VK_MAPA.alto - 150) }; }

function vkAvanzaAldea(dt) {
  VK_ALDEA.t += dt;
  for (const id of VK_ORDEN_FANS) {
    const f = VK_ALDEA.fans[id]; f.t += dt;
    const ko = SAVE.fans[id].vida <= 0;
    // ¿a dónde va? KO: a la casa a descansar; si su edificio trabaja, a su puesto; si no, a pasear
    let meta = null;
    if (ko) { const c = vkCasa(); meta = { x: c.x - 24 + VK_ORDEN_FANS.indexOf(id) * 16, y: c.y + 4 }; }
    else {
      const edif = Object.keys(VK_EDIFICIOS).find(e => VK_EDIFICIOS[e].trabaja === id);
      if (edif && vkAbierto(edif) && (vkTrabajando(edif) || (edif === 'almacen' && VK_ALDEA.panel === 'almacen'))) meta = vkPuesto(edif);
    }
    if (meta) { f.tx = meta.x; f.ty = meta.y; f.trabajo = true; }
    else if (f.trabajo) { f.trabajo = false; f.tx = null; f.espera = 0.5 + Math.random(); }
    if (f.tx === null) {
      f.espera -= dt;
      if (f.espera <= 0) { const p = vkSitioPaseo(); f.tx = p.x; f.ty = p.y; }
    }
    if (f.tx !== null) {
      const dx = f.tx - f.x, dy = f.ty - f.y, d = Math.hypot(dx, dy), v = 22 * dt;
      if (d > 1) { f.x += (dx / d) * Math.min(v, d); f.y += (dy / d) * Math.min(v, d); f.anim = 'andar'; }
      else {
        f.x = f.tx; f.y = f.ty;
        if (f.trabajo) f.anim = ko ? 'ko' : 'trabajar';
        else { f.tx = null; f.espera = 2 + Math.random() * 4; f.anim = 'reposo'; }
      }
    } else f.anim = 'reposo';
    if (ko && f.tx !== null && Math.hypot(f.tx - f.x, f.ty - f.y) <= 1) f.anim = 'ko';
  }
  // lo que sube: iconos de lo hecho y avisos
  for (const o of VK_ALDEA.flotan) o.t += dt;
  VK_ALDEA.flotan = VK_ALDEA.flotan.filter(o => o.t < 1.4);
  for (const a of VK_ALDEA.avisos) a.t += dt;
  VK_ALDEA.avisos = VK_ALDEA.avisos.filter(a => a.t < 2.6);
  // cobrar lo terminado
  for (const h of vkCobra()) {
    const s = vkSitio(h.edif);
    VK_ALDEA.flotan.push({ x: s.pieX, y: s.y + 8, icono: VK_COSAS[h.cosa].icono, n: h.n, t: 0 });
    play('vkListo');
  }
  vkMiraMision();
}
function vkAviso(txt, tipo) { VK_ALDEA.avisos.push({ txt, tipo: tipo || 'info', t: 0 }); }

/* ---------- mover el mapa con el dedo ---------- */
const VK_ARRASTRE = { activo: false, y0: 0, cam0: 0, movido: false };
function vkMaxCam() { return Math.max(0, VK_MAPA.alto + VK_MAPA.y0 + 36 - VK_V.H); }
function vkEmpiezaArrastre(y) { VK_ARRASTRE.activo = true; VK_ARRASTRE.y0 = y; VK_ARRASTRE.cam0 = VK_MAPA.camY; VK_ARRASTRE.movido = false; }
function vkArrastra(y) {
  if (!VK_ARRASTRE.activo) return;
  const d = y - VK_ARRASTRE.y0;
  if (Math.abs(d) > 4) VK_ARRASTRE.movido = true;
  if (VK_ARRASTRE.movido) VK_MAPA.camY = Math.max(0, Math.min(vkMaxCam(), VK_ARRASTRE.cam0 - d));
}

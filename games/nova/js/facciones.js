// Fans of Nova · Facciones: su nave, su arma insignia, su arma secreta (campaña) y su arma especial (rango). Datos en datos-facciones.js.
// Aquí: las armas se añaden a NOVA_VARIANTES (así salen solas en cartas, estación y Arsenal), el desbloqueo se guarda en la campaña y los rasgos propios
// (rabia, hype, cadena…) se aplican con ganchos mínimos en armas.js. No toca estados ni combos: eso es de las cargas (armas.js / datos-armas.js).
'use strict';
const NV_FAC_STATS = {   // vida y velocidad de las naves nuevas (las tres de siempre mantienen las suyas en partida.js)
  nomuertos: { hp: 300, vel: 170 }, streamers: { hp: 290, vel: 230 }, heroes: { hp: 290, vel: 190 },
  memes: { hp: 210, vel: 215 }, gamer: { hp: 320, vel: 165 }, pop: { hp: 235, vel: 195 }
};
const NV_FAC_TIPO = { insignia: 'Insignia', secreta: 'Secreta', especial: 'Especial' };

// ---------- las armas, como variantes ----------
(function () {
  for (const f in NOVA_FACCIONES) for (const t of ['insignia', 'secreta', 'especial']) {
    const a = NOVA_FACCIONES[f][t]; if (!a) continue;
    const v = Object.assign({ cad: 1, alc: 1, perf: 0, n: 0 }, a, { rareza: t === 'especial' ? 'rara' : 'legendaria', faccion: f, tipoArma: t, rasgos: a.rasgos || (a.rasgo ? [a.rasgo] : []) });
    NOVA_VARIANTES.push(v); NV_VAR_ID[v.id] = v;
  }
})();
function nvFacRasgo(w, tipo) { const r = nvVar(w).rasgos; for (const x of r) if (x.tipo === tipo) return x; return null; }

// ---------- desbloqueo (se guarda en la campaña y sobrevive a las campañas nuevas) ----------
function nvFacProg(f) { const c = nvCamp(); if (!c.fac) c.fac = {}; return c.fac[f] || (c.fac[f] = { rangoMax: 0, campana: false }); }
function nvFacArmaLibre(v) {
  if (v.tipoArma === 'insignia') return false;   // la insignia solo la lleva su nave
  if (!NVP.camp) return typeof NV_FAC_TODAS !== 'undefined' && NV_FAC_TODAS;   // sin campaña (simulador) solo si se pide
  const p = nvFacProg(v.faccion);
  return v.tipoArma === 'secreta' ? !!p.campana : p.rangoMax >= v.rango;
}
function nvFacBloqueo(v) {   // por qué sigue bloqueada
  const F = NOVA_CASCOS.facciones[v.faccion].nombre;
  return tr(v.tipoArma === 'secreta' ? 'Se desbloquea al pasarte la campaña con ' + F : 'Se desbloquea al llegar al rango ' + v.rango + ' con ' + F);
}
// Al cerrar una misión: apunta el rango máximo y, si liberas el núcleo de Microblizz, la campaña pasada. Devuelve los nombres de las armas recién desbloqueadas.
function nvFacCierra(S, c) {
  if (!c.faccion) return [];
  const p = nvFacProg(c.faccion), antes = NOVA_VARIANTES.filter(v => v.faccion === c.faccion && nvFacArmaLibre(v));
  p.rangoMax = Math.max(p.rangoMax, S.nave.rango);
  const nueva = S.estado === 'victoria' && S.tipoSector === 'nucleo' && !p.campana;
  if (nueva) p.campana = true;
  const out = NOVA_VARIANTES.filter(v => v.faccion === c.faccion && nvFacArmaLibre(v) && !antes.includes(v)).map(v => v.nombre);
  if (nueva) out.push('Nave jefe: ' + NOVA_FACCIONES[c.faccion].nave.nombre);   // su última evolución (clases.js, nvJefeLibre)
  return out;
}

// ---------- las naves: las tres hechas y las seis nuevas (casco prestado y teñido hasta que llegue su arte) ----------
(function () {
  const sel = typeof NV_CASCOS !== 'undefined' ? NV_CASCOS : null;
  for (const f in NOVA_FACCIONES) {
    const N = NOVA_FACCIONES[f].nave, I = NOVA_FACCIONES[f].insignia;
    let id = N.casco;
    if (!id) {
      id = f; const B = NOVA_PIEZAS.cascos[N.base], H = JSON.parse(JSON.stringify(B));
      H.nombre = N.nombre; H.faccion = f; H.prestado = { base: N.base, matiz: N.matiz || 0 };
      NOVA_PIEZAS.cascos[id] = H;
      if (sel) sel[id] = Object.assign({ hp: 230, vel: 190 }, NV_FAC_STATS[f]);
    }
    if (N.anclajes) NOVA_PIEZAS.cascos[id].anclajes = N.anclajes;   // ranuras recolocadas por etapa (clases.js, nvHull)
    if (sel && sel[id]) sel[id].arma = [I.portador, I.carga, I.id];   // la nave sale con su arma insignia montada
  }
})();
// Arte prestado: copia las piezas del casco base con otro nombre y las tiñe. Si la facción ya tiene arte propio (ids «<facción>-casco»), no hace nada.
function nvFacArtePrestado() {
  for (const id in NOVA_PIEZAS.cascos) {
    const P = NOVA_PIEZAS.cascos[id].prestado; if (!P || NVA.meta[id + '-casco']) continue;
    for (const k of Object.keys(NVA.meta)) {
      if (k.indexOf(P.base + '-') !== 0) continue;
      const a = id + k.slice(P.base.length);
      NVA.meta[a] = Object.assign({}, NVA.meta[k], { id: a, nave: id });
      const im = NVA.img && NVA.img[k]; if (!im || !im.naturalWidth || typeof document === 'undefined') continue;
      const cv = document.createElement('canvas'); cv.width = im.naturalWidth; cv.height = im.naturalHeight;
      const c = cv.getContext('2d'); if ('filter' in c) c.filter = 'hue-rotate(' + P.matiz + 'deg)';
      c.drawImage(im, 0, 0);
      const out = new Image(); out.src = cv.toDataURL(); NVA.img[a] = out;
    }
  }
}
if (typeof NVA !== 'undefined' && NVA.meta && NVA.meta['caza-casco']) nvFacArtePrestado();   // simulador: solo las medidas, sin imágenes

// ---------- rasgos (ganchos en armas.js) ----------
// Antes de disparar: el Cañón RNG cambia de carga al azar entre las que admite su portador.
function nvRasgoPre(S, w) {
  if (!nvFacRasgo(w, 'rng')) return;
  const cs = nvCargasDe(w.portador); w.carga = cs[Math.floor(Math.random() * cs.length)];
}
// Multiplicador de daño del disparo (obj = el enemigo al que apunta).
// Cuánto multiplica cada rasgo de arma de facción el daño de un disparo (1 = nada). Algunos tiran el azar o cuentan disparos.
const NV_RASGO_MULT = {
  rabia: (S, w, obj, r) => { let k = 0; for (const e of S.enem) if (!e.muerto && !e.d.pasivo && Math.hypot(e.x - w.x, e.y - w.y) < r.radio) k++; return 1 + Math.min(r.tope, r.paso * k); },
  critico: (S, w, obj, r) => (Math.random() < r.prob ? r.mult : 1),
  rng: (S, w, obj, r) => (Math.random() < r.prob ? r.mult : 1),
  azar: (S, w, obj, r) => r.min + Math.random() * (r.max - r.min),
  precision: (S, w, obj, r) => { w.cnt = (w.cnt || 0) + 1; return w.cnt % r.cada === 0 ? r.mult : 1; },
  lejano: (S, w, obj, r) => { const alc = NOVA_ARMAS.portadores[w.portador].alcance * nvFactor(S.nave.rango) * NV_RANGO_TAM[w.tam] * nvVar(w).alc; return 1 + r.mult * Math.min(1, Math.hypot(obj.x - w.x, obj.y - w.y) / alc); },
  nostalgia: (S, w, obj, r) => 1 + r.porRango * S.nave.rango,
  jefe: (S, w, obj, r) => (obj.d.jefe ? r.mult : 1),
  secuela: (S, w, obj, r) => (w.sec ? r.mult : 1),
};
function nvRasgoMult(S, w, obj) {
  let m = 1;
  for (const r of nvVar(w).rasgos) { const f = NV_RASGO_MULT[r.tipo]; if (f) m *= f(S, w, obj, r); }
  return m;
}
// Cadencia: el Cañón de Hype acelera con cada baja seguida y se enfría si te hieren.
function nvRasgoCad(S, w) {
  const r = nvFacRasgo(w, 'hype'); if (!r) return 1;
  const m = S.stats.muertos;
  if (w.hm === undefined) { w.hm = m; w.hr = S.stats.recibido; w.hy = 0; }
  if (m > w.hm) w.hy = Math.min(r.tope / r.paso, w.hy + m - w.hm);
  w.hm = m;
  if (S.stats.recibido > w.hr) w.hy = 0;
  w.hr = S.stats.recibido;
  return 1 + r.paso * w.hy;
}
// Tras cada impacto: robo de vida, salto a otros enemigos, hackeo de escudo y explosión grande.
// Lo que hace cada rasgo de arma de facción al impactar
const NV_RASGO_IMPACTO = {
  robo: (S, w, dano, e, x, y, r) => { const n = S.nave; n.hp = Math.min(n.hpMax, n.hp + dano * r.parte); },
  hackeo: (S, w, dano, e, x, y, r) => { if (e.esc > 0 && !e.hack) { e.hack = true; e.esc *= 1 - r.parte; } },
  area: (S, w, dano, e, x, y, r) => nvExplosion(S, x, y, r.radio, dano * r.mult, w, e, true),
  cadena: (S, w, dano, e, x, y, r) => nvRasgoCadena(S, w, dano, e, r),
};
function nvRasgoImpacto(S, w, dano, e, x, y) {
  for (const r of nvVar(w).rasgos) { const f = NV_RASGO_IMPACTO[r.tipo]; if (f) f(S, w, dano, e, x, y, r); }
}
// Cadena: el golpe salta al enemigo visible más cercano al último, hasta `saltos` veces
function nvRasgoCadena(S, w, dano, e, r) {
  const ya = [e];
  for (let i = 0; i < r.saltos; i++) {
    const ult = ya[ya.length - 1];
    let t = null, mejor = r.radio * r.radio;
    for (const o of S.enem) { if (o.muerto || o.d.pasivo || ya.includes(o) || !nvEnPantalla(S, o.x, o.y, 0)) continue; const d2 = (o.x - ult.x) ** 2 + (o.y - ult.y) ** 2; if (d2 < mejor) { mejor = d2; t = o; } }
    if (!t) break;
    ya.push(t); nvGolpe(S, t, dano * r.mult, w, t.x, t.y, 1, true);
    S.fx.push({ t: 0.2, x: t.x, y: t.y, r: 14 * nvZ(S), color: NOVA_ARMAS.cargas[w.carga].color, tipo: 'flash' });
  }
}
// Después de disparar: la Secuela repite el disparo un momento más tarde.
function nvRasgoDespues(S, w, obj) {
  const r = nvFacRasgo(w, 'secuela'); if (!r || w.sec) return;
  (S.rdif || (S.rdif = [])).push({ t: r.espera, w, obj });
}
function nvRasgoPaso(S, dt) {
  if (!S.rdif || !S.rdif.length) return;
  for (let i = S.rdif.length - 1; i >= 0; i--) {
    const d = S.rdif[i]; d.t -= dt; if (d.t > 0) continue;
    S.rdif.splice(i, 1);
    if (d.obj.muerto || !S.nave.armas.includes(d.w)) continue;
    d.w.sec = true; try { nvDispara(S, d.w, NOVA_ARMAS.portadores[d.w.portador], d.obj); } finally { d.w.sec = false; }
  }
}

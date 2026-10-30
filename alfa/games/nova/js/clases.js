// Fans of Nova · Clases de nave: cada 10 rangos la nave evoluciona (caza → corbeta → destructor → acorazado) y cambia de forma, no solo de tamaño.
// Si existe el arte propio de una clase (ids «<casco>-casco-c2», «<casco>-alas-c2»… en arte/piezas.json) se usa; si no, se compone con piezas del casco base (alas más anchas y góndolas).
'use strict';
const NV_ETAPAS = [   // rango desde el que la nave es de esa clase (dato de diseño: cambiar aquí mueve todo)
  { desde: 1, nombre: 'Caza' }, { desde: 10, nombre: 'Corbeta' }, { desde: 20, nombre: 'Fragata' }, { desde: 30, nombre: 'Crucero pesado' }, { desde: 40, nombre: 'Acorazado' },
  { desde: 50, nombre: 'Nave jefe', jefe: true }   // la última solo si has ganado la campaña con la facción de esa nave (nvJefeLibre)
];
// Clase del rango; sin casco, la de la nave de la partida en curso.
function nvClase(rango, casco) {
  casco = casco || (NVP.S && NVP.S.casco);
  const tope = NV_ETAPAS.length - (casco && nvJefeLibre(casco) ? 1 : 2);
  let k = 0; while (k < tope && rango >= NV_ETAPAS[k + 1].desde) k++; return k;
}
// La nave jefe de un casco: con su arte y la campaña ganada con la facción a la que pertenece.
function nvJefeLibre(casco) {
  if (!NVP.camp || !NVA.meta[casco + '-casco-c6'] || typeof NOVA_FACCIONES === 'undefined') return false;
  for (const f in NOVA_FACCIONES) if ((NOVA_FACCIONES[f].nave.casco || f) === casco) return !!(NVP.camp.fac && NVP.camp.fac[f] && NVP.camp.fac[f].campana);
  return false;
}
function nvRangoClase(k) { return NV_ETAPAS[k].desde; }
// Rango con el que empiezas a desplegar (la campaña podrá subirlo); el menú de naves enseña la nave de ese nivel.
function nvRangoInicial() { return NVP.camp ? 1 + nvNivelCapital('academia') : 1; }
// Casco con los anclajes de la clase del rango: el arte de cada clase es más grande, así que ranuras, alas y motor se recolocan a escala (y = proporcional a lo largo del casco, x = según la envergadura de las alas).
const NV_H_CACHE = {};
function nvHull(casco, rango) {
  const B = NOVA_PIEZAS.cascos[casco], k = nvClase(rango, casco), m = NVA.meta;
  if (k && !m[casco + '-casco-c' + (k + 1)]) return B;
  const clave = casco + k; if (NV_H_CACHE[clave]) return NV_H_CACHE[clave];
  let H = B;
  if (k) {
    const h1 = m[casco + '-casco'], hk = m[casco + '-casco-c' + (k + 1)], w1 = m[casco + '-alas'], wk = m[casco + '-alas-c' + (k + 1)];
    const top1 = -h1.pivote[1] / 2, lon1 = h1.alto / 2, topk = -hk.pivote[1] / 2, lonk = hk.alto / 2, sx = wk.ancho / w1.ancho;
    const fy = y => topk + (y - top1) / lon1 * lonk, fx = x => x * sx;
    H = Object.assign({}, B, { alas: { x: 0, y: fy(B.alas.y) }, motor: Object.assign({}, B.motor, { y: B.motor.y + (hk.alto - hk.pivote[1]) / 2 - (h1.alto - h1.pivote[1]) / 2 }),
      ranuras: B.ranuras.map(r => Object.assign({}, r, { x: fx(r.x), y: fy(r.y) })), escudo: B.escudo && Object.assign({}, B.escudo, { y: fy(B.escudo.y), rx: B.escudo.rx * sx, ry: B.escudo.ry * lonk / lon1 }) });
  }
  const A = B.anclajes && B.anclajes[k + 1];   // naves de facción: ranuras laterales recolocadas por etapa donde su arte no llega
  if (A) H = Object.assign({}, H, { ranuras: H.ranuras.map(r => { const p = A[r.id.replace(/^(babor|estribor)/, '')]; return p ? Object.assign({}, r, { x: r.id[0] === 'b' ? -p[0] : p[0], y: p[1] }) : r; }) });
  return NV_H_CACHE[clave] = H;
}
// Pieza de la clase k si hay arte propio; si no, la del casco base.
function nvPz(c, id, k, ax, ay) { nvPieza(c, k && NVA.meta[id + '-c' + (k + 1)] ? id + '-c' + (k + 1) : id, ax, ay); }
// Una capa del cuerpo: 'alas' (lo que va detrás del motor) o 'casco' (lo de delante).
function nvCuerpo(c, casco, k, capa) {
  const H = nvHull(casco, nvRangoClase(k)), propio = k && NVA.meta[casco + '-casco-c' + (k + 1)];
  if (capa === 'alas') {
    if (k && !propio) for (let j = k; j >= 1; j--) {   // alas cada vez más anchas, una capa por clase
      c.save(); c.translate(H.alas.x, H.alas.y + 6 * j); c.scale(1 + 0.16 * j, 1 + 0.05 * j); nvPieza(c, casco + '-alas', 0, 0); c.restore();
    }
    nvPz(c, casco + '-alas', k, H.alas.x, H.alas.y);
    return;
  }
  if (k && !propio) {   // góndolas laterales: dos desde el destructor, cuatro en el acorazado
    const m = NVA.meta[casco + '-alas'], xs = [];
    if (k >= 2) xs.push([0.34, 0.5, 38]);
    if (k >= 3) xs.push([0.5, 0.42, 70]);
    for (const [fx, esc, dy] of xs) for (const s of [-1, 1]) {
      c.save(); c.translate(s * (m ? m.ancho / 2 : 200) * fx, H.alas.y + dy); c.scale(esc, esc); nvPieza(c, casco + '-casco', 0, 0); c.restore();
    }
  }
  nvPz(c, casco + '-casco', k, 0, 0);
}
// Semienvergadura de la nave según su clase (el hitbox sale de ella).
function nvRAncho(casco, rango) { const k = nvClase(rango, casco), m = NVA.meta[casco + '-alas' + (k && NVA.meta[casco + '-alas-c' + (k + 1)] ? '-c' + (k + 1) : '')]; return m ? m.ancho / 2 : 200; }

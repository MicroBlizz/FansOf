// Fans of Nova · Clases de nave: cada 10 rangos la nave evoluciona (caza → corbeta → destructor → acorazado) y cambia de forma, no solo de tamaño.
// Si existe el arte propio de una clase (ids «<casco>-casco-c2», «<casco>-alas-c2»… en arte/piezas.json) se usa; si no, se compone con piezas del casco base (alas más anchas y góndolas).
'use strict';
const NV_ETAPAS = [   // rango desde el que la nave es de esa clase (dato de diseño: cambiar aquí mueve todo)
  { desde: 1, nombre: 'Caza' }, { desde: 7, nombre: 'Corbeta' }, { desde: 13, nombre: 'Fragata' }, { desde: 19, nombre: 'Crucero pesado' }, { desde: 25, nombre: 'Acorazado' }
];
function nvClase(rango) { let k = 0; while (k + 1 < NV_ETAPAS.length && rango >= NV_ETAPAS[k + 1].desde) k++; return k; }
function nvRangoClase(k) { return NV_ETAPAS[k].desde; }
// Rango con el que empiezas a desplegar (la campaña podrá subirlo); el menú de naves enseña la nave de ese nivel.
function nvRangoInicial() { return 1; }
// Pieza de la clase k si hay arte propio; si no, la del casco base.
function nvPz(c, id, k, ax, ay) { nvPieza(c, k && NVA.meta[id + '-c' + (k + 1)] ? id + '-c' + (k + 1) : id, ax, ay); }
// Una capa del cuerpo: 'alas' (lo que va detrás del motor) o 'casco' (lo de delante).
function nvCuerpo(c, casco, k, capa) {
  const H = NOVA_PIEZAS.cascos[casco], propio = k && NVA.meta[casco + '-casco-c' + (k + 1)];
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

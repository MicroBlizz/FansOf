// Fans Of · /gestion → Paperwork → Calibrado: el DIBUJO, funciones puras que devuelven HTML y SVG (sin DOM, para poder probarlas en Node):
// las gráficas de dos líneas (las cifras de ahora y con el cambio) contra las horas de juego, las tablas de hitos, del final y de las
// fórmulas, y el formato de horas y números. Los colores son los de la serie 1 y 2 (variables --pwc-1 y --pwc-2 de calibrado.js). ADR 122.
'use strict';
const GESTION_PW_CALIBRADO = {};
GESTION_PW_CALIBRADO.dibujo = (() => {
  const W = 420, H = 180, M = { i: 42, d: 24, a: 10, b: 24 };   // en unidades del viewBox: a unos 400 px de ancho, el texto sale a su tamaño
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  // números cortos y en español: 1.234, 12,5 mil, 3,4 M
  function num(n) {
    if (!Number.isFinite(n)) return '—';
    const a = Math.abs(n), f = (x, d) => x.toLocaleString('es-ES', { maximumFractionDigits: d });
    if (a >= 1e9) return f(n / 1e9, 1) + ' mil M';
    if (a >= 1e6) return f(n / 1e6, 1) + ' M';
    if (a >= 1e4) return f(n / 1e3, 1) + ' mil';
    return f(n, a < 10 ? 2 : 0);
  }
  // segundos de reloj en horas (o días y horas pasadas las 48)
  function horas(s) {
    if (!Number.isFinite(s)) return '—';
    const h = s / 3600;
    if (h <= 48) return h.toLocaleString('es-ES', { maximumFractionDigits: 1 }) + ' h';
    return `${Math.floor(h / 24)} d ${Math.round(h % 24)} h`;
  }
  // marcas redondas del eje de 0 hasta cubrir max (unas n)
  function marcas(max, n = 4) {
    if (!(max > 0)) return [0];
    const paso0 = max / n, p = Math.pow(10, Math.floor(Math.log10(paso0))), r = paso0 / p;
    const paso = (r <= 1 ? 1 : r <= 2 ? 2 : r <= 5 ? 5 : 10) * p, fuera = [];
    for (let v = 0; fuera.length === 0 || fuera[fuera.length - 1] < max - paso * 1e-9; v += paso) fuera.push(+v.toPrecision(12));
    return fuera;
  }
  const marcasHoras = s => { const h = s / 3600, base = h <= 12 ? 1 : h <= 48 ? 6 : 24; return marcas(h / base, 6).map(v => v * base * 3600); };
  // la gráfica: series = [{ nombre, n (1 o 2), puntos: [[t, valor]…] }], todas sobre las mismas horas
  function grafica({ id, titulo, series, tMax }) {
    const yMax = Math.max(1, ...series.flatMap(s => s.puntos.map(p => p[1])));
    const ys = marcas(yMax), yTope = ys[ys.length - 1] || 1;
    const x = t => M.i + (t / tMax) * (W - M.i - M.d), y = v => H - M.b - (v / yTope) * (H - M.a - M.b);
    const rejilla = ys.map(v => `<line class="pwc-rej" x1="${M.i}" x2="${W - M.d}" y1="${y(v)}" y2="${y(v)}"/><text class="pwc-eje" x="${M.i - 6}" y="${y(v) + 4}" text-anchor="end">${num(v)}</text>`).join('');
    const ejeX = marcasHoras(tMax).map(t => `<text class="pwc-eje" x="${x(t)}" y="${H - 8}" text-anchor="middle">${horas(t)}</text>`).join('');
    const lineas = series.map(s => `<polyline class="pwc-l pwc-l${s.n}" points="${s.puntos.map(p => `${x(p[0]).toFixed(1)},${y(p[1]).toFixed(1)}`).join(' ')}"/>`).join('');
    return `<figure class="pwc-g"><figcaption>${esc(titulo)}</figcaption><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(titulo)}" data-g="${esc(id)}" data-tmax="${tMax}" data-ymax="${yTope}">`
      + `${rejilla}${ejeX}${lineas}<line class="pwc-cruz" x1="0" x2="0" y1="${M.a}" y2="${H - M.b}" visibility="hidden"/></svg></figure>`;
  }
  // de la x de la gráfica (en sus unidades) al índice del punto más cercano en el tiempo
  const tDeX = (px, tMax) => Math.max(0, Math.min(1, (px - M.i) / (W - M.i - M.d))) * tMax;
  function cercano(puntos, t) {
    let a = 0, b = puntos.length - 1;
    while (b - a > 1) { const m = (a + b) >> 1; if (puntos[m][0] < t) a = m; else b = m; }
    return Math.abs(puntos[a][0] - t) <= Math.abs(puntos[b][0] - t) ? a : b;
  }
  const xDeT = (t, tMax) => M.i + (t / tMax) * (W - M.i - M.d);
  const tabla = (cab, filas) => `<div class="tabla-caja"><table class="tabla"><thead><tr>${cab.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>`
    + `${filas.map(f => `<tr>${f.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const dif = (a, b) => (Number.isFinite(a) && Number.isFinite(b) && a > 0 ? `${b >= a ? '+' : ''}${Math.round((b / a - 1) * 100)} %` : '—');
  // cuándo cae cada nivel de la Trituradora, antes y con el cambio (con cuántas semillas llegan, si no llegan todas)
  function tablaHitos(base, cambiado, semillas) {
    const n = Math.max(base.trituradora.length, cambiado.trituradora.length), de = (l, k) => l.trituradora[k] || { t: NaN, llegan: 0 };
    const celda = h => horas(h.t) + (h.llegan && h.llegan < semillas ? ` (${h.llegan} de ${semillas})` : '');
    const filas = Array.from({ length: n }, (_, k) => [k + 1, celda(de(base, k)), celda(de(cambiado, k)), dif(de(base, k).t, de(cambiado, k).t)]);
    return filas.length ? tabla(['Nivel de la Trituradora', 'Ahora', 'Con el cambio', 'Diferencia'], filas) : '<div class="vacio">No se atasca ningún nivel en este tiempo.</div>';
  }
  const FINAL = [['trituradora', 'Niveles de la Trituradora'], ['plantaMax', 'Planta más honda'], ['despidos', 'Despidos'], ['meritos', 'Puntos de mérito'],
    ['paquetes', 'Paquetes del sindicato'], ['grapas', 'Grapas de oro sin gastar'], ['oro', 'Oro en la mano'], ['indemnizacion', 'Indemnización sin gastar']];
  const tablaFinal = (base, cambiado) => tabla(['Al acabar (mediana)', 'Ahora', 'Con el cambio', 'Diferencia'],
    FINAL.map(([k, nombre]) => [esc(nombre), num(base.fin[k]), num(cambiado.fin[k]), dif(base.fin[k], cambiado.fin[k])]));
  // un valor de fórmula: si cambia, «antes → después»
  const par = (a, b) => (a === b ? num(a) : `${num(a)} → <b>${num(b)}</b>`);
  function tablasFormulas({ base, cambiado }, nivel) {
    const T = tabla(['Nivel', 'Capacidad', 'Tragaderas', 'Grapas al atascar', 'Tope de nivel'], base.trituradora.map((f, k) => {
      const c = cambiado.trituradora[k];
      return [f.nivel, par(f.capacidad, c.capacidad), par(f.tragaderas, c.tragaderas), par(f.grapas, c.grapas), par(f.topeNivel, c.topeNivel)];
    }));
    const P = tabla(['Planta', 'Pide para la entrada', 'Vida del 2.º documento', 'Dureza'], base.plantas.map((f, k) => {
      const c = cambiado.plantas[k];
      return [f.planta, par(f.entrada, c.entrada), par(f.vida, c.vida), par(f.dureza, c.dureza)];
    }));
    const g = base.grapas, gc = cambiado.grapas, pq = base.paquete, pc = cambiado.paquete;
    const G = tabla(['Por día (sin bonos)', 'Valor'], [
      ['Paquetes del sindicato', par(g.paquetes, gc.paquetes)], ['Grapas de los paquetes', par(g.porPaquetes, gc.porPaquetes)],
      [`Grapas del expediente (nivel ${nivel})`, par(g.porExpediente, gc.porExpediente)], [`Grapas de atascar del 1 al ${nivel} (de una vez)`, par(g.porTrituradora, gc.porTrituradora)],
      ['Puntos de mérito por paquete (con garantía)', par(pq.conGarantia, pc.conGarantia)], ['Grapas para la tienda entera', par(base.costes.tiendaEntera, cambiado.costes.tiendaEntera)]]);
    return `<h3>Trituradora</h3>${T}<h3>Plantas</h3>${P}<h3>Grapas de oro y méritos</h3>${G}`;
  }
  return { W, num, horas, marcas, grafica, tDeX, xDeT, cercano, tablaHitos, tablaFinal, tablasFormulas, esc };
})();

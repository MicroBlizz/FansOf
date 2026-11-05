// Fans of Basement · El taller de tu mesa (solo pantalla, estilo Swipe): arriba, los materiales que tienes; debajo, las armas
// (tocar una abre su ficha para fabricarla o subirla de nivel) y las piezas de equipo de cada rareza (para fabricar las que te
// faltan). La ficha enseña lo que cuesta, en verde lo que tienes y en rojo lo que te falta. Las reglas, en taller.js.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const UI = B.ui, C = UI.C, T = UI.texto, V = () => B.vista;
  const NOMBRE = { tornillo: 'Tornillos', cable: 'Cables', chip: 'Chips', disco: 'Discos de oro' };
  UI.nombreMaterial = (t) => NOMBRE[t];
  const HUECO = { teclado: ['teclado', 3.2], auriculares: ['r-auriculares', 1.5], silla: ['r-silla', 1.5] };

  // la tira de materiales: icono y cuántos tienes de cada uno
  function materiales(g, AJ, p, x, y, w) {
    UI.pergamino(g, x, y, w, 56);
    const paso = (w - 20) / AJ.materiales.length;
    AJ.materiales.forEach((t, i) => {
      const cx = x + 10 + i * paso;
      V().pintaCosa(g, t, cx + 26, y + 28, null, 1.2);
      T(g, String(p.materiales[t] || 0), cx + 50, y + 29, 22, C.cafe, 'left', 0);
    });
  }

  function celdaArma(g, AJ, p, id, b) {
    const d = AJ.armas[id], nivel = p.armas[id] || 0;
    UI.cuadroRareza(g, b, nivel ? AJ.colorRareza[d.rareza] : '#3a2e48', (cx, cy) => V().pintaCosa(g, id, cx, cy, nivel ? null : { alfa: 0.6 }, 0.95), false);
    T(g, nivel ? String(nivel) : '+', b.x + b.w - 6, b.y + b.h - 10, 16, nivel ? '#ffffff' : C.oro, 'right', 3);
  }

  function celdaPieza(g, AJ, p, hueco, r, b) {
    const tiene = p.equipo.tiene[hueco + ':' + r];
    UI.cuadroRareza(g, b, tiene ? AJ.colorRareza[r] : '#3a2e48', (cx, cy) => V().pinta(g, HUECO[hueco][0], cx, cy, HUECO[hueco][1] * 0.75, tiene ? null : { alfa: 0.6 }), false);
    if (!tiene) T(g, '+', b.x + b.w - 6, b.y + b.h - 10, 16, C.oro, 'right', 3);
  }

  UI.pestanaTaller = function (g, W, H, AJ, p, botones) {
    const { y0, y1 } = UI.zonaMesa(H), x = 12, w = W - 24;
    materiales(g, AJ, p, x, y0, w);
    const armas = Object.keys(AJ.armas).filter((id) => AJ.armas[id].rareza), cols = 6, lado = Math.min(70, Math.floor((w - (cols - 1) * 8) / cols));
    const alto = Math.min(lado, Math.floor((y1 - y0 - 140) / 6) - 8);
    let y = y0 + 80;
    UI.franja(g, tr('ARMAS: fabrica o sube de nivel'), W / 2, y - 6, 16, w);
    armas.forEach((id, i) => {
      const b = { x: x + (i % cols) * (lado + 8) + (w - cols * lado - (cols - 1) * 8) / 2, y: y + 14 + Math.floor(i / cols) * (alto + 8), w: lado, h: alto, accion: 'taller', receta: { tipo: 'arma', id } };
      celdaArma(g, AJ, p, id, b); botones.push(b);
    });
    y += 14 + Math.ceil(armas.length / cols) * (alto + 8) + 20;
    UI.franja(g, tr('EQUIPO: fabrica la pieza que te falte'), W / 2, y - 6, 16, w);
    Object.keys(AJ.equipo).forEach((hueco, j) => AJ.rarezas.forEach((r, i) => {
      const b = { x: x + 60 + i * (lado + 26), y: y + 14 + j * (alto + 8), w: lado, h: alto, accion: 'taller', receta: { tipo: 'equipo', hueco, rareza: r } };
      if (i === 0) V().pinta(g, HUECO[hueco][0], x + 28, b.y + alto / 2, HUECO[hueco][1] * 0.6);
      celdaPieza(g, AJ, p, hueco, r, b); botones.push(b);
    }));
  };

  const nombreReceta = (AJ, r) => tr(r.tipo === 'arma' ? AJ.armas[r.id].nombre : AJ.equipo[r.hueco][r.rareza].nombre);
  const rarezaReceta = (AJ, r) => (r.tipo === 'arma' ? AJ.armas[r.id].rareza : r.rareza);

  // La ficha de una receta: qué es, qué hace, lo que cuesta y el botón de FABRICAR o MEJORAR (o por qué no se puede).
  UI.fichaTaller = function (g, W, H, AJ, p, r) {
    g.fillStyle = 'rgba(10,5,20,0.8)'; g.fillRect(0, 0, W, H);
    const rec = B.recetaTaller(AJ, p, r), x = 30, w = W - 60, y = H / 2 - 230, rz = rarezaReceta(AJ, r), botones = [];
    UI.pergamino(g, x, y, w, 460);
    if (r.tipo === 'arma') V().pintaCosa(g, r.id, W / 2, y + 66, null, 1.6); else V().pinta(g, HUECO[r.hueco][0], W / 2, y + 66, HUECO[r.hueco][1] * 1.3);
    UI.nombre(g, nombreReceta(AJ, r) + (r.tipo === 'arma' && p.armas[r.id] ? ' · ' + tr('Nv') + ' ' + p.armas[r.id] : ''), W / 2, y + 132, 28, w - 50, AJ.colorRareza[rz], 'center');
    T(g, UI.nombreRareza(rz), W / 2, y + 168, 16, C.gris, 'center', 0);
    const que = r.tipo === 'arma' ? UI.queHaceArma(r.id) : UI.describe(AJ.equipo[r.hueco][r.rareza].ef).join(' · ');
    UI.lineas(g, que, W / 2, y + 198, 17, w - 60, '#2e6a2a', 'center', 0, 20);
    const cerrar = { x: W / 2 + 10, y: y + 370, w: w / 2 - 36, h: 66, accion: 'cerrarTaller' };
    if (rec.ok) coste(g, AJ, p, rec.valor, x, y + 262, w, botones, { x: x + 26, y: y + 370, w: w / 2 - 36, h: 66, accion: 'usarTaller' });
    else UI.lineas(g, tr(rec.codigo === 'nivelMaximo' ? 'Ya está al nivel máximo' : 'Ya la tienes'), W / 2, y + 300, 22, w - 60, '#2e6a2a', 'center', 0);
    UI.boton(g, cerrar, 'azul', tr('CERRAR'), 26);
    return [...botones, cerrar, { x: 0, y: 0, w: W, h: H, accion: 'cerrarTaller' }];   // tocar fuera también cierra (va el último)
  };

  function coste(g, AJ, p, rec, x, y, w, botones, b) {
    const lista = Object.entries(rec.coste), paso = (w - 40) / lista.length, falta = B.faltaMaterial(p, rec.coste);
    lista.forEach(([t, n], i) => {
      const cx = x + 20 + paso * i + paso / 2;
      V().pintaCosa(g, t, cx, y + 20, null, 1.2);
      T(g, (p.materiales[t] || 0) + '/' + n, cx, y + 60, 19, falta[t] ? C.rojo : '#2e6a2a', 'center', 0);
    });
    const puede = !Object.keys(falta).length;
    UI.boton(g, b, puede ? 'verde' : 'apagado', tr(rec.accion === 'mejorar' ? 'MEJORAR' : 'FABRICAR'), 24);
    if (puede) botones.push(b);
  }
})(BAS);

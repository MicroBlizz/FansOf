// Fans of Basement · Los modos especiales en «¿DÓNDE BAJAS?» (solo pantalla): la tarjeta del DESAFÍO DEL DÍA (la misma bajada para
// todos hoy) y la del EVENTO DE LA SEMANA (con sus reglas), con el premio, tu mejor marca, el botón del ranking y BAJAR AQUÍ.
// Las reglas están en modos.js y los rankings en ranking.js.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const UI = B.ui, C = UI.C, T = UI.texto;

  function premio(AJ, M) {
    const [t, n] = Object.entries(M.premio.paquetes)[0];
    return tr('Premio: {n} {p} al llegar a la planta -{x} y subir a salvo', { n, p: tr(AJ.paquetes[t].nombre).toLowerCase(), x: M.premio.planta });
  }

  UI.tarjetaModo = function (g, W, H, AJ, p, modo) {
    const clave = modo === 'desafio' ? basClaveDia() : basClaveSemana(), ev = modo === 'evento' ? B.eventoDe(AJ, clave) : null, M = AJ.modos[modo];
    const x = 24, w = W - 48, y = 170, h = H - 300;
    UI.pergamino(g, x, y, w, h);
    UI.titulo(g, modo === 'desafio' ? tr('DESAFÍO DEL DÍA') : tr(ev.nombre).toUpperCase(), W / 2, y + 56, 30);
    UI.lineas(g, modo === 'desafio' ? tr('La misma bajada para todos hoy, desde Marketing: mismos bichos, muebles y sorpresas. ¿Quién llega más hondo?') : tr(ev.txt) + '. ' + tr('Desde Marketing, toda la semana.'),
      W / 2, y + 110, 19, w - 60, C.cafe, 'center', 0, 23);
    const hecho = p.premiados.includes(clave);
    UI.lineas(g, hecho ? tr('Premio cobrado: vuelve mañana') : premio(AJ, M), W / 2, y + 210, 17, w - 60, hecho ? '#2e6a2a' : '#c8901a', 'center', 0, 21);
    const mia = (SAVE.retosModo || {})[clave];
    T(g, mia ? tr('Tu mejor: planta -{n} · {b} bichos', { n: mia.planta, b: mia.bajas }) : tr('Todavía no lo has jugado'), W / 2, y + 290, 19, C.cafe, 'center', 0);
    const rk = { x: W / 2 - 110, y: y + 320, w: 220, h: 54, accion: 'verRanking', id: modo === 'desafio' ? 'hoy' : 'semana' };
    UI.boton(g, rk, 'azul', tr('VER RANKING'), 20);
    const bajar = { x: W / 2 + 8, y: H - 110, w: W / 2 - 28, h: 80, accion: 'bajarModo', id: modo }, cerrar = { x: 20, y: H - 104, w: W / 2 - 40, h: 70, accion: 'cerrarDep' };
    UI.boton(g, bajar, 'naranja', tr('BAJAR AQUÍ'), 32);
    UI.boton(g, cerrar, 'azul', tr('VOLVER'), 28);
    return [rk, bajar, cerrar];
  };
})(BAS);

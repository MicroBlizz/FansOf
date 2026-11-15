// Fans Of Paperwork · adaptador · DEV: los trucos de pruebas, en el panel DEV de core (UTILIDADES_JUEGO, sección «Fans Of Paperwork»),
// nada propio encima del juego (como Pets). Solo salen en desarrollo y en la alfa. Tocan la partida a mano para llegar rápido a lo que se
// quiere probar (el tiempo, el oro, los desbloqueos de la Trituradora, las plantas), y la guardan.
'use strict';
PW.dev = (() => {
  const P = () => PW.casos.partida;
  // aplica un truco, guarda y repinta; avisa con el texto dado
  function hecho(txt) { PW.casos.guarda(); PW.ui.sucio = true; toast(txt); }
  // la Trituradora en el nivel n, lista para otro intento (lo que abre cada nivel sale solo: dominio/desbloqueos.js)
  function trituradora(n) {
    const T = P().c.trituradora;
    Object.assign(T, { nivel: Math.max(0, Math.min(PW.AJ.trituradora.niveles, n)), atasco: 0, intento: 0, espera: 0, multi: 1 });
    hecho('Trituradora en el nivel ' + T.nivel);
  }
  // planta n de este turno, como si se hubiera bajado hasta ella
  function planta(n) {
    PW.rebuscar.ponPlanta(P(), PW.casos.bonos(), Math.max(1, n), Math.random, []);
    hecho('Planta −' + P().r.planta.n);
  }
  function expedientes(k) {
    const e = P();
    PW.DOCUMENTOS.forEach((d, i) => { if (PW.compras.vistoDocumento(e, i)) e.r.expedientes[i] += k; });
    e.r.caducados += k;
    hecho('+' + k + ' expedientes de cada tipo visto y caducados');
  }
  const SECCIONES = [
    ['Tiempo', [['x1', () => { PW.ui.velocidad = 1; toast('x1'); }], ['x10', () => { PW.ui.velocidad = 10; toast('x10'); }],
      ['x100', () => { PW.ui.velocidad = 100; toast('x100'); }], ['+1 h fuera', () => { PW.casos.tick(3600); hecho('+1 h'); }],
      ['+8 h fuera', () => { PW.casos.tick(8 * 3600); hecho('+8 h'); }]]],
    ['Recursos', [['+oro', () => { const r = P().r; r.oro += 1e3 + r.oro; hecho('Oro: ' + PW.txt.num(r.oro)); }],
      ['+100 expedientes', () => expedientes(100)], ['+10 000 expedientes', () => expedientes(1e4)],
      ['+3 cofres', () => { const o = P().r.objetos; o.cofre = Math.min(PW.AJ.cofre.guardaMax, (o.cofre || 0) + 3); hecho('Cofres: ' + o.cofre); }],
      ['+10 niveles', () => { P().r.nivel += 10; hecho('Nivel ' + P().r.nivel); }],
      ['+100 de Indemnización', () => { P().c.indemnizacion += 100; hecho('+100 de Indemnización'); }]]],
    ['Trituradora y desbloqueos', [['Lista ya', () => trituradora(P().c.trituradora.nivel)],
      ['Atascar un nivel', () => trituradora(P().c.trituradora.nivel + 1)], ['Abrirlo todo (nivel 4)', () => trituradora(Math.max(4, P().c.trituradora.nivel))],
      ['Volver al nivel 0', () => trituradora(0)]]],
    ['Plantas', [['Bajar 1', () => planta(P().r.planta.n + 1)], ['Bajar 10', () => planta(P().r.planta.n + 10)],
      ['A la Sala de servidores', () => planta(PW.AJ.planta.plantasPorZona + 1)], ['Al Almacén', () => planta(PW.AJ.planta.plantasPorZona * 2 + 1)]]],
  ];
  // la sección en el panel DEV de core: un título y una fila de botones por grupo
  function panel(c) {
    for (const [titulo, botones] of SECCIONES) {
      const p = document.createElement('p'), fila = document.createElement('div');
      p.textContent = titulo;
      fila.className = 'fila';
      for (const [txt, fn] of botones) {
        const b = document.createElement('button');
        Object.assign(b, { type: 'button', textContent: txt, onclick: fn });
        fila.append(b);
      }
      c.append(p, fila);
    }
  }
  return { panel };
})();
const UTILIDADES_JUEGO = [{ titulo: 'Fans Of Paperwork: trucos', pinta: c => PW.dev.panel(c) }];

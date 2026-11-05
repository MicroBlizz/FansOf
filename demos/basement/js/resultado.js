// Fans of Basement · Resultado de la bajada (solo pantalla, estilo Swipe): a salvo (cobras la caja, los paquetes y las propinas de
// los becarios) o desmayado (lo pierdes), en una ventana de pergamino con la planta más honda, los bichos, los becarios rescatados,
// los jefes vencidos y las monedas.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const UI = B.ui, C = UI.C, T = UI.texto;

  function filas(r, salvo) {
    const f = [[tr('Planta más baja'), '-' + r.planta], [tr('Bichos eliminados'), String(r.bajas)], [tr('Objetos en la caja'), String(r.objetos)]];
    if (r.rescatados) f.push([tr('Becarios rescatados'), String(r.rescatados)]);
    if (r.jefes) f.push([tr('Jefes vencidos'), String(r.jefes)]);
    const paq = (r.paquetes.normal || 0) + (r.paquetes.jefe || 0);
    if (paq) f.push([tr('Paquetes'), '+' + paq, '#c8901a']);
    const mat = Object.values(r.materiales || {}).reduce((s, n) => s + n, 0);
    if (mat) f.push([tr('Materiales'), '+' + mat, '#5a6478']);
    f.push([tr('Monedas'), '+' + r.monedas, salvo ? '#c8901a' : C.rojo]);
    return f;
  }

  // nuevos = los bichos que esta bajada añade al catálogo (con lo que pagan); aspecto = cómo iba vestido tu becario
  UI.resultado = function (g, W, H, t, r, record, nuevos, aspecto) {
    const salvo = r.como === 'ascensor', lista = filas(r, salvo), alto = 70 + lista.length * 46, y0 = H * 0.27;
    UI.fondoMenu(g, W, H, salvo ? 'fondo-vestibulo' : 'fondo-servidores');
    UI.titulo(g, salvo ? tr('¡A SALVO!') : tr('¡DESMAYADO!'), W / 2, H * 0.1, 64);
    UI.becario(g, B.AJ, aspecto, W / 2, H * 0.1 + 96, 1.5, { alfa: salvo ? 1 : 0.6 });
    UI.franja(g, salvo ? tr('El ascensor te ha subido con la caja') : tr('Sin café no hay quien trabaje: pierdes la caja'), W / 2, y0 - 34, 17, 500);
    UI.pergamino(g, 30, y0, W - 60, alto);
    lista.forEach(([a, b, color], i) => {
      const y = y0 + 52 + i * 46;
      T(g, a, 60, y, 22, C.cafe, 'left', 0);
      T(g, b, W - 60, y, 28, color || C.cafe, 'right', 0);
    });
    let y = y0 + alto + 44;
    if (r.final) { UI.titulo(g, tr('¡SERVIDOR ARREGLADO!'), W / 2, y, 36); y += 50; }
    else if (record && Math.floor(t * 3) % 2) { UI.titulo(g, tr('¡NUEVO RÉCORD!'), W / 2, y, 36); y += 50; }
    if (nuevos && nuevos.length) UI.franja(g, tr('Nuevo en el catálogo: {n}', { n: nuevos.map((x) => UI.nombreBicho(B.AJ, x.id)).join(', ') }) + ' · +' + nuevos.reduce((s, x) => s + x.monedas, 0), W / 2, y, 16, W - 30);
    const b = { x: W / 2 - 150, y: H - 130, w: 300, h: 90, accion: 'mesa' };
    UI.boton(g, b, 'naranja', tr('A MI MESA'), 40);
    return [b];
  };
})(BAS);

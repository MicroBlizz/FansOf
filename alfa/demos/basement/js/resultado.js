// Fans of Basement · Resultado de la bajada (solo pantalla): a salvo (cobras la caja, los paquetes y las propinas de los becarios)
// o desmayado (lo pierdes), con la planta más honda, los bichos, los becarios rescatados, los jefes vencidos y las monedas.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const UI = B.ui, C = UI.C, T = UI.texto;

  function filas(r, salvo) {
    const f = [[tr('Planta más baja'), '-' + r.planta], [tr('Bichos eliminados'), String(r.bajas)], [tr('Objetos en la caja'), String(r.objetos)]];
    if (r.rescatados) f.push([tr('Becarios rescatados'), String(r.rescatados)]);
    if (r.jefes) f.push([tr('Jefes vencidos'), String(r.jefes)]);
    const paq = (r.paquetes.normal || 0) + (r.paquetes.jefe || 0);
    if (paq) f.push([tr('Paquetes'), '+' + paq, C.amarillo]);
    f.push([tr('Monedas'), '+' + r.monedas, salvo ? C.amarillo : C.rojo]);
    return f;
  }

  UI.resultado = function (g, W, H, t, r, record) {
    UI.fondo(g, W, H, t * 0.3);
    const salvo = r.como === 'ascensor', lista = filas(r, salvo), alto = 30 + lista.length * 38, y0 = H * 0.24;
    T(g, salvo ? tr('¡A SALVO!') : tr('¡DESMAYADO!'), W / 2, H * 0.12, 42, salvo ? C.verde : C.rojo, 'center', true);
    T(g, salvo ? tr('El ascensor te ha subido con la caja') : tr('Sin café no hay quien trabaje: pierdes la caja'), W / 2, H * 0.12 + 40, 13, '#ffffff');
    UI.caja(g, 24, y0, W - 48, alto, 'rgba(22,22,22,0.55)', 14);
    lista.forEach(([a, b, color], i) => {
      const y = y0 + 32 + i * 38;
      T(g, a, 44, y, 16, '#ffffff', 'left');
      T(g, b, W - 44, y, 20, color || '#ffffff', 'right', true);
    });
    if (record && Math.floor(t * 3) % 2) T(g, tr('¡NUEVO RÉCORD!'), W / 2, y0 + alto + 26, 22, C.amarillo, 'center', true);
    const b = { x: W / 2 - 110, y: H - 110, w: 220, h: 64, accion: 'mesa' };
    UI.caja(g, b.x, b.y, b.w, b.h, C.naranja, 16);
    T(g, tr('A MI MESA'), W / 2, b.y + 35, 28, '#ffffff', 'center', true);
    return [b];
  };
})(BAS);

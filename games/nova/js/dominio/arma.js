// Fans Of Nova · NV.Arma: las cuentas de tus armas que no dependen de la pantalla: a qué ángulo llega cada cara, cuántas balas sale de cada
// disparo y cómo son (velocidad, tamaño, vida, perforación). `kf` es el factor de tamaño del rango de tu nave (nvFactor). Lo usa armas.js.
'use strict';
NV.Arma = (() => {
  // ¿Está (vx, vy) dentro del arco de la cara que mira hacia (dx, dy)? `arco` es medio arco en radianes; con 360º todo vale
  function enArco(vx, vy, dx, dy, d2, grados, arco) {
    if (grados >= 360) return true;
    const dot = (vx * dx + vy * dy) / Math.sqrt(d2 || 1);
    return Math.acos(Math.max(-1, Math.min(1, dot))) <= arco;
  }
  // Cuántas balas salen: la Railgun gemela, dos; el flak, 6 (10 con la Batería) más las de su variante; el lanzador, 1 más las de su variante
  function balas(portador, id, varN) {
    if (id === 'railgunGemela') return 2;
    if (portador === 'flak') return (id === 'bateriaFlak' ? 10 : 6) + varN;
    if (portador === 'lanzador') return 1 + varN;
    return 1;
  }
  // Velocidad de la bala: las balas también corren más cuanto mayor es la nave
  function velocidad(portador, kf) { return (portador === 'railgun' ? 900 : portador === 'flak' ? 430 : 270) * Math.pow(kf, 0.9); }
  function radio(portador, kf, tamBala) { return (portador === 'railgun' ? 4 : portador === 'flak' ? 3 : 4.5) * kf * tamBala; }
  // Cuánto vive: el flak, lo justo para llegar a su alcance; la railgun, casi un segundo; lo demás, 3 s
  function vida(portador, alcance, kf, tamRango, v) {
    if (portador === 'flak') return alcance * kf * tamRango / v + 0.1;
    if (portador === 'railgun') return 0.9 * Math.pow(kf, 0.1) * tamRango;
    return 3;
  }
  // A cuántos enemigos atraviesa
  function perfora(portador, varPerf) { return (portador === 'railgun' ? 3 : 1) + varPerf; }
  // El misil gira hacia (tx, ty) como mucho 3,5 rad/s, sin cambiar de velocidad
  function guia(b, tx, ty, dt) {
    const va = Math.atan2(b.vy, b.vx), na = Math.atan2(ty - b.y, tx - b.x);
    let d = na - va; while (d > Math.PI) d -= 6.283; while (d < -Math.PI) d += 6.283;
    const a = va + Math.max(-3.5 * dt, Math.min(3.5 * dt, d)), v = Math.hypot(b.vx, b.vy);
    b.vx = Math.cos(a) * v; b.vy = Math.sin(a) * v;
  }
  return { guia, enArco, balas, velocidad, radio, vida, perfora };
})();

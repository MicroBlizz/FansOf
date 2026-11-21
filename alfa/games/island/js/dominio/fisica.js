// Fans of Island · dominio/fisica: dónde está el suelo (sueloDe), las paredes (mueveX) y la caída (cae) sobre un nivel dado, y las
// constantes de la física (gravedad, salto, radios, nivel del mar). IS.creaFisica(nivel) devuelve las reglas. Puro: sin reloj ni pantalla.
'use strict';
{
  const T = IS.MEDIDAS.T;
  const MAR = -40;
  IS.FISICA = Object.freeze({ G: 1350, V_SALTO: 520, V_MAX: 135, R_J: 10, R_E: 12, MAR, Z_OCULTO: MAR - 40, Z_ASOMA: MAR - 7 });
  const G = IS.FISICA.G;
  IS.creaFisica = nivel => {
    const { COLS, NIV, PLAT } = nivel;
    const hayAgua = c => c < 0 || c >= COLS || NIV[c].s < 0;
    const arribaSuelo = c => (hayAgua(c) ? -Infinity : NIV[c].s * T);
    const arribaCol = c => (hayAgua(c) ? -Infinity : (NIV[c].s + NIV[c].pila.length) * T);
    function sueloDe(o, R) {   // la altura del suelo bajo un cuerpo de radio R: columnas con su pila y plataformas que ya están por debajo
      let s = -Infinity;
      const c0 = Math.floor((o.x - R + 1) / T), c1 = Math.floor((o.x + R - 1) / T);
      for (let c = c0; c <= c1; c++) s = Math.max(s, arribaCol(c));
      for (const p of PLAT) if (o.x + R > p.x0 && o.x - R < p.x1 && p.z <= o.z + 0.5) s = Math.max(s, p.z);
      return s;
    }
    function mueveX(o, dx, R) {   // devuelve true si choca con una pared
      if (!dx) return false;
      let nx = Math.max(R, Math.min(COLS * T - R, o.x + dx)), choca = nx !== o.x + dx;
      const c = Math.floor((dx > 0 ? nx + R - 0.01 : nx - R) / T);
      if (arribaCol(c) > o.z + 3) { nx = dx > 0 ? c * T - R : (c + 1) * T + R; choca = true; }
      o.x = nx; return choca;
    }
    function cae(o, dt, factor, R) {   // 'aire', 'aterriza' o 'suelo'
      const s = sueloDe(o, R);
      if (o.z > s || o.vz > 0) {
        o.vz -= G * factor * dt; o.z += o.vz * dt;
        if (o.vz <= 0 && o.z <= s) { o.z = s; o.vz = 0; return 'aterriza'; }
        return 'aire';
      }
      o.z = s; return 'suelo';
    }
    return { arribaSuelo, arribaCol, sueloDe, mueveX, cae };
  };
}

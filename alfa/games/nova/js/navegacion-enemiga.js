// Fans of Nova · Navegación de las naves enemigas con armas: vuelan solo hacia delante y giran con curva limitada (no hay vuelo lateral ni marcha atrás).
// Las de corto alcance hacen pasadas (te embisten, disparan y se pasan de largo antes de dar la vuelta); las de medio y largo alcance
// intentan mantener la distancia, dan vueltas a tu alrededor y, si las acosas, huyen en línea recta: con motores mejores las alcanzas.
'use strict';
const NV_VEL_E = 1.05, NV_VEL_RANGO_E = 0.015;   // las naves armadas van más rápidas que su ficha base, y un 1,5 % más por rango

// Estilo de vuelo según el alcance medio de sus armas (ponderado por puntos): corto, medio o largo. Se calcula una vez.
function nvEstiloE(S, e) {
  let a = 0, c = 0;
  for (const w of e.armas) { const p = NV_TAM_E[w.tam].c; a += nvAlcE(S, w) * p; c += p; }
  const f = (a / (c || 1)) / nvMediaPantalla(S)[0];
  return f < 0.42 ? 'corto' : f < 0.7 ? 'medio' : 'largo';
}
function nvVelE(e) { return e.d.vel * NV_VEL_E * (1 + NV_VEL_RANGO_E * (e.rango - 1)); }

// Un paso de vuelo: decide el rumbo deseado, gira hacia él con el límite de giro y avanza. ang = hacia ti.
function nvNavegaE(S, e, dt, ang, dist, lento) {
  const n = S.nave, hw = nvMediaPantalla(S)[0], alc = nvAlcMaxE(S, e);
  const st = e.nav || (e.nav = { est: 'ataque', t: 0, lado: Math.random() < 0.5 ? 1 : -1, fase: Math.random() * 6.28, cambio: 3 + Math.random() * 4, estilo: nvEstiloE(S, e) });
  if (e.proa === undefined) e.proa = e.rumbo !== undefined ? e.rumbo : ang;
  const corto = st.estilo === 'corto', amp = corto ? 0.18 : st.estilo === 'medio' ? 0.4 : 0.55;
  const bamb = Math.sin(S.t * (1.1 + st.fase * 0.1) + st.fase) * amp;   // zigzag: nunca te enfilan en línea recta
  let obj = ang, vm = 1;
  st.t -= dt;
  if ((st.cambio -= dt) <= 0) { st.cambio = 3 + Math.random() * 5; st.lado = -st.lado; }
  if (corto) {
    if (st.est === 'ataque') {
      obj = ang + bamb;
      if (dist < Math.max(e.r * 2.2, alc * 0.4)) { st.est = 'salida'; st.t = 1.1 + Math.random() * 1.3; }
    } else {   // se pasa de largo, sin poder frenar, y se abre en curva para dar la vuelta
      obj = e.proa + st.lado * 0.7; vm = 1.15;
      if (st.t <= 0) st.est = 'ataque';
    }
  } else {
    const ideal = alc * (st.estilo === 'largo' ? 0.85 : 0.7);
    if (dist > ideal * 1.15) obj = ang + bamb;                                      // acercarse
    else if (dist < ideal * 0.75) { obj = ang + Math.PI * 0.9 * st.lado + bamb; vm = 1.1; }   // alejarse: solo girando y huyendo hacia delante
    else { obj = ang + st.lado * 1.2 + bamb; vm = 0.9; }                             // dar vueltas a distancia
  }
  const giro = 3 / (1 + e.r / 50) * (lento < 1 ? 0.4 : 1);
  const da = Math.atan2(Math.sin(obj - e.proa), Math.cos(obj - e.proa));
  e.proa += Math.max(-giro * dt, Math.min(giro * dt, da));
  const v = nvVelE(e) * vm * lento;
  e.vx = Math.cos(e.proa) * v; e.vy = Math.sin(e.proa) * v;
  e.x += e.vx * dt; e.y += e.vy * dt;
}

// Fans of Rally · dominio · IA: lo que hacen los rivales de Microblizz. Miran un punto de la carretera por delante (más lejos cuanto más
// corren, y un poco a un lado: cada uno lleva su carril), giran hacia él y eligen la velocidad según la curva más cerrada que viene.
// `pericia` (0..1) es lo que se atreven; `goma` (-1..1) les hace aflojar si vas muy atrás o apretar si vas muy delante. Pura.
'use strict';
RA.IA = (() => {
  function curvaQueViene(pista, i, muestras) {
    let max = 0;
    for (let k = 0; k < muestras; k++) max = Math.max(max, Math.abs(pista.curv[(i + k) % pista.n]));
    return max;
  }
  function puntoObjetivo(pista, i, adelanto, carril) {
    const j = (i + adelanto) % pista.n, a = pista.ang[j] + Math.PI / 2, lado = carril * pista.ancho;
    return [pista.x[j] + Math.cos(a) * lado, pista.y[j] + Math.sin(a) * lado];
  }
  // c: el coche; f: su ficha; i: su muestra de la pista; r: AJUSTES.ia; yo: { pericia, carril, goma }
  function mandos(c, f, pista, i, r, yo) {
    const adelanto = Math.round((r.mira + Math.abs(c.vel) * r.miraPorVelocidad) / pista.paso);
    const [tx, ty] = puntoObjetivo(pista, i, adelanto, yo.carril);
    const giro = RA.limita(RA.difAngulo(c.ang, Math.atan2(ty - c.y, tx - c.x)) * 2.4, -1, 1);
    const curva = curvaQueViene(pista, i, Math.max(20, Math.round(Math.abs(c.vel) * 0.9 / pista.paso)));
    const quiere = Math.min(f.velocidadMax, Math.sqrt(r.curvaLateral / Math.max(curva, 1e-4))) * yo.pericia * (1 + yo.goma * r.goma);
    const gas = c.vel < quiere ? 1 : 0, freno = c.vel > quiere * 1.12 ? 0.6 : 0;
    return { giro, gas, freno };
  }
  return { mandos, curvaQueViene };
})();

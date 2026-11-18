// Fans of Merge · BICHOS: cómo se mueven y respiran el zorro y el cuervo. Andan a saltitos (dos por casilla) con su estirar y encoger,
// el zorro mira hacia donde va, el cuervo aletea cuando salta, y quietos respiran y de vez en cuando cambian de postura.
// Los fotogramas son dibujos de Yoshi (img/zorro-andar-1.png…); si uno aún no ha llegado se usa el dibujo base, con el mismo movimiento.
// El cuervo nunca se voltea: lleva la zanahoria en un ala y al voltearlo cambiaría de lado.
'use strict';
for (const k of ['zorro-andar-1', 'zorro-andar-2', 'zorro-salto', 'zorro-reposo-2', 'cuervo-vuela-1', 'cuervo-vuela-2', 'cuervo-reposo-2']) {
  const im = new Image(); im.decoding = 'async'; im.onload = () => { MG_IMG[k] = im; }; im.src = 'img/' + k + '.png?v=' + VERSION;
}
const mgFot = (k, base) => (MG_IMG[k] ? k : base);
// dibuja un bicho en (cx, cy) de lado `l`; A = su animación en curso (o null)
function mgPintaBicho(c, p, A, cx, cy, l, t) {
  const zorro = p.t === 'zorro', fase = t * 1.3 + p.id * 2.1;
  let fot = p.t, sx = 1, sy = 1, giro = 0;
  if (A && A.mueve) {
    const k = A.k;
    if (zorro) { fot = mgFot(Math.floor(k * 4) % 2 ? 'zorro-andar-2' : 'zorro-andar-1', 'zorro'); if (A.dx) p.mira = A.dx < 0 ? -1 : 1; }
    else fot = mgFot(Math.floor(t * 12) % 2 ? 'cuervo-vuela-2' : 'cuervo-vuela-1', 'cuervo');
    const bote = Math.abs(Math.sin(k * Math.PI * (A.salto ? 1 : 2)));   // en el suelo: se aplasta; en el aire: se estira
    sy = 0.88 + bote * 0.2; sx = 1.1 - bote * 0.14; giro = (A.dx || 0) * 0.08 * Math.sin(k * Math.PI);
  } else {
    sy = 1 + Math.sin(fase * 2.4) * 0.035; sx = 1 - Math.sin(fase * 2.4) * 0.025;   // respira
    if ((fase % 5) > 4) fot = mgFot(p.t + '-reposo-2', p.t);   // de vez en cuando, otra postura
  }
  c.save(); c.translate(cx, cy + l * 0.4); c.rotate(giro); c.scale(sx * (zorro ? (p.mira || 1) : 1), sy);
  mgDibujaPieza(c, fot, 0, -l * 0.4, l, mgK());
  c.restore();
}

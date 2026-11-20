// Fans of Pinball · adaptador · PARTÍCULAS: un grupo FIJO creado al empezar (200, AJUSTES.jugo.particulas) y reciclado; si se llena, se
// pisa la más vieja (MOVIL.md, apartado 3: nada de crear objetos en el bucle). Cada partícula es un recorte de un dibujo (piezas de la
// maceta rota, chispas de la diana encendida, papeles de la fotocopiadora…) que salta y cae; se pinta con drawImage, sin girar. Posiciones en unidades del mundo.
'use strict';
PB.creaParticulas = reglas => {
  const P = reglas.particulas, grupo = [];
  for (let i = 0; i < P.tope; i++) grupo.push({ vivo: false, x: 0, y: 0, vx: 0, vy: 0, t: 0, vida: 0, img: null, sx: 0, sy: 0, lado: 0, peso: 1 });
  let siguiente = 0, vivas = 0;
  // una partícula: recorte cuadrado (sx, sy, lado) del dibujo `img`, con velocidad y vida; peso 0 = flota (chispas)
  function una(img, sx, sy, lado, x, y, vx, vy, vida, peso) {
    const p = grupo[siguiente];
    siguiente = (siguiente + 1) % grupo.length;
    p.vivo = true; p.img = img; p.sx = sx; p.sy = sy; p.lado = lado; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.t = 0; p.vida = vida; p.peso = peso;
  }
  return {
    // n piezas de `img` que saltan desde (x, y) en abanico hacia arriba
    estalla(img, x, y, n, fuerza = 90, lado = 4, peso = 1) {
      for (let i = 0; i < n; i++) {
        const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.4, v = fuerza * (0.5 + Math.random() * 0.7);
        const sx = Math.floor(Math.random() * Math.max(1, img.width - lado)), sy = Math.floor(Math.random() * Math.max(1, img.height - lado));
        una(img, sx, sy, lado, x, y, Math.cos(ang) * v, Math.sin(ang) * v, P.vida * (0.7 + Math.random() * 0.6), peso);
      }
    },
    // n chispas en círculo (explosiones): sin gravedad
    anillo(img, x, y, n, fuerza = 120, lado = 3) {
      for (let i = 0; i < n; i++) {
        const ang = i / n * Math.PI * 2, sx = Math.floor(img.width / 2 - lado / 2), sy = Math.floor(img.height / 2 - lado / 2);
        una(img, sx, sy, lado, x, y, Math.cos(ang) * fuerza, Math.sin(ang) * fuerza, P.vida * 0.6, 0);
      }
    },
    paso(dt) {
      vivas = 0;
      for (const p of grupo) {
        if (!p.vivo) continue;
        p.t += dt;
        if (p.t >= p.vida) { p.vivo = false; continue; }
        p.vy += P.gravedad * p.peso * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        vivas++;
      }
    },
    // pinta a x1, como todo (el recorte es de un dibujo de la mesa); cam = esquina de la vista en px del lienzo; lx(x)/ly(y) del fondo
    pinta(ctx, cam, lx, ly) {
      for (const p of grupo) {
        if (!p.vivo) continue;
        const h = p.lado >> 1;
        ctx.drawImage(p.img, p.sx, p.sy, p.lado, p.lado, Math.round(lx(p.x) - cam.x) - h, Math.round(ly(p.y) - cam.y) - h, p.lado, p.lado);
      }
    },
    get vivas() { return vivas; },
    vacia() { for (const p of grupo) p.vivo = false; },
  };
};

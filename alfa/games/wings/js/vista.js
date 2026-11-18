// Fans of Wings · La vista: pone la cámara (desde arriba, de persecución, desde la cabina o dando vueltas al caza en los menús),
// dibuja el mundo y encima todo lo que vuela: tu caza con sus llamas y su estela, los enemigos, las balas, los misiles con su
// humo, los disparos enemigos, los premios en paracaídas y las explosiones. proyecta() dice en qué punto de la pantalla cae un
// punto del mundo, para el HUD (retícula, marcas de enemigos y flechas).
'use strict';
var WINGS = globalThis.WINGS || (globalThis.WINGS = {});
(function (A) {
  const GL = A.gl, V = GL.V, M = GL.M, MU = A.mundo, MOD = A.modelos, FX = A.efectos, hex = GL.hex;
  const VI = A.vista = { CAMARAS: ['arriba', 'persecucion', 'cabina'], cam: null, modo: 1, antes: 1, mezcla: 1, dir: [0, 0, -1], golpes: {}, pesoCabina: 0 };
  const FOV = [0.6, 1.05, 1.2], ARRIBA = [0, 1, 0];
  const estela = [[], []]; let relojEstela = 0;
  const COLOR_TIRO = { cafe: hex('#8a4a22'), caja: hex('#ffd23c'), carta: hex('#ff7ac8') };
  const COLOR_PREMIO = { misiles: hex('#9fe0ff'), bombas: hex('#ffe14a'), reparacion: hex('#5fe05f'), combustible: hex('#ff8a2a') };
  const BLANCO = [1, 1, 1], BALA = hex('#fff2a0');

  VI.reiniciar = function () { estela[0].length = 0; estela[1].length = 0; VI.golpes = {}; A.llamas.reiniciar(); };
  VI.cambiaCamara = function () { VI.antes = VI.modo; VI.modo = (VI.modo + 1) % 3; VI.mezcla = 0; return VI.CAMARAS[VI.modo]; };
  VI.ponCamara = function (i) { VI.modo = VI.antes = i; VI.mezcla = 1; };
  VI.evento = function (ev, t) { if (ev.tipo === 'impacto') VI.golpes[ev.id] = t; };

  // Los ejes de un caza del dominio, en coordenadas de dibujo.
  const ejesDe = (j) => ({ p: GL.R(j.pos), r: GL.R(j.r), u: GL.R(j.u), f: GL.R(j.f) });
  // Los de un enemigo, que solo tiene dirección: se le pone el techo hacia arriba y se inclina al virar.
  function ejesDeEnemigo(en) {
    const f = GL.R(en.dir || { x: 0, y: 0, z: 1 });
    let r = V.cruz(f, ARRIBA); r = V.largo(r) < 0.01 ? [1, 0, 0] : V.norma(r);
    return { p: GL.R(en.pos), r, u: V.cruz(r, f), f };
  }

  function camaraDe(modo, a, orbita) {
    if (orbita !== null) return { ojo: V.suma(a.p, [Math.cos(orbita) * 58, 15, Math.sin(orbita) * 58]), mira: a.p, up: ARRIBA, fov: 0.8 };
    if (modo === 0) return { ojo: [a.p[0], a.p[1] + 600, a.p[2] + 190], mira: a.p, up: ARRIBA, fov: FOV[0] };   // el doble de lejos que en la 0.1.4
    if (modo === 1) return { ojo: V.suma(V.resta(a.p, V.por(VI.dir, 82)), [0, 24, 0]), mira: V.suma(V.suma(a.p, V.por(a.f, 34)), [0, 6, 0]), up: V.norma(V.suma([0, 0.8, 0], V.por(a.u, 0.2))), fov: FOV[1] };
    const ojo = V.suma(a.p, V.por(a.u, 2));
    return { ojo, mira: V.suma(ojo, V.por(a.f, 20)), up: a.u, fov: FOV[2] };
  }
  function ponCamara(a, orbita, dt) {
    VI.dir = V.norma(V.mezcla(VI.dir, a.f, Math.min(1, dt * 4)));
    VI.mezcla = Math.min(1, VI.mezcla + dt / 0.8);
    const s = VI.mezcla * VI.mezcla * (3 - 2 * VI.mezcla), c0 = camaraDe(VI.antes, a, orbita), c1 = camaraDe(VI.modo, a, orbita);
    const ojo = V.mezcla(c0.ojo, c1.ojo, s), fov = c0.fov + (c1.fov - c0.fov) * s, asp = GL.W / GL.H;
    if (FX.temblor > 0) { ojo[0] += (Math.random() - 0.5) * FX.temblor * 0.12; ojo[1] += (Math.random() - 0.5) * FX.temblor * 0.12; }
    const vista = M.mira(ojo, V.mezcla(c0.mira, c1.mira, s), V.norma(V.mezcla(c0.up, c1.up, s)));
    VI.pesoCabina = orbita !== null ? 0 : VI.modo === 2 ? s : VI.antes === 2 ? 1 - s : 0;
    VI.cam = { ojo, ejes: vista, VP: M.mul(M.persp(fov, asp, 2, 12000), vista.m), fov, asp };
    return VI.cam;
  }

  // Un punto del mundo (coordenadas de dibujo) en la pantalla del HUD (ancho × 720). delante = false si queda detrás de la cámara.
  VI.proyecta = function (p, ancho) {
    const m = VI.cam.VP, w = m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15], k = 1 / Math.max(1e-6, Math.abs(w));
    const x = (m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12]) * k, y = (m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13]) * k;
    return { x: (x * 0.5 + 0.5) * ancho, y: (1 - (y * 0.5 + 0.5)) * 720, delante: w > 0, lejos: w };
  };
  // El mismo punto visto desde la cámara: x a la derecha, y arriba, z al frente (para las flechas de lo que queda fuera).
  VI.enCamara = function (p) { const d = V.resta(p, VI.cam.ojo), e = VI.cam.ejes, pe = (a) => a[0] * d[0] + a[1] * d[1] + a[2] * d[2]; return { x: pe(e.s), y: pe(e.u), z: pe(e.f) }; };

  // El tamaño al que algo pequeño se sigue viendo: nunca menos que una fracción de su distancia al ojo.
  const visible = (p, base, k) => Math.max(base, V.dist(p, VI.cam.ojo) * (k || 0.004));

  // El fuego de los reactores (llamas.js): el de los enemigos, recto; el tuyo sigue a las toberas y se dobla al girar.
  const LL = A.llamas;
  function llamasEnemigo(id, matriz, e, largo, t) {
    for (const q of MOD.medidas(id).toberas) LL.recta(M.punto(matriz, [q[0], q[1], q[2] - 0.6]), V.por(e.f, -1), largo, 0.9, t);
  }
  function llamasMias(esc, matriz, a) {
    const vel = V.por(a.f, esc.j.vel || 0), atras = V.por(a.f, -1);
    LL.gases(esc.gases, esc.dt);
    MOD.medidas(esc.cazaId).toberas.forEach((q, i) => LL.tobera(esc.cazaId + i, M.punto(matriz, [q[0], q[1], q[2] - 2.1]), atras, vel, esc.t, esc.dt));
  }

  function apuntaEstela(dt, matriz, id) {
    relojEstela += dt;
    if (relojEstela < 0.03) return;
    relojEstela = 0;
    const q = MOD.medidas(id).punta, der = [matriz[0], matriz[1], matriz[2]];
    estela[0].push({ p: M.punto(matriz, [-q[0], q[1], q[2]]), r: der }); estela[1].push({ p: M.punto(matriz, [q[0], q[1], q[2]]), r: der });
    for (const e of estela) if (e.length > 120) e.shift();
  }
  function estelaAlLote() {
    for (const e of estela) for (let i = 0; i + 1 < e.length; i++) {
      const a = e[i], b = e[i + 1], wa = visible(a.p, 0.08, 0.0026) * (0.2 + 0.8 * i / e.length), wb = visible(b.p, 0.08, 0.0026) * (0.2 + 0.8 * (i + 1) / e.length);
      GL.cuadro(V.suma(a.p, V.por(a.r, wa)), V.resta(a.p, V.por(a.r, wa)), V.resta(b.p, V.por(b.r, wb)), V.suma(b.p, V.por(b.r, wb)), BLANCO);
      GL.cuadro(V.suma(a.p, [0, wa, 0]), V.resta(a.p, [0, wa, 0]), V.resta(b.p, [0, wb, 0]), V.suma(b.p, [0, wb, 0]), BLANCO);
    }
  }

  function enemigos(a, t) {
    for (const en of (a.jefe ? a.enemigos.concat([a.jefe]) : a.enemigos)) {
      const e = ejesDeEnemigo(en), golpe = t - (VI.golpes[en.id] || -9) < 0.09, matriz = M.ejes(e.p, e.r, e.u, e.f);
      if (golpe) GL.tinte(2.4, 2.4, 2.4);
      GL.malla(MOD.enemigo[en.tipo], matriz);
      if (golpe) GL.tinte(1, 1, 1);
      llamasEnemigo(en.tipo, matriz, e, en.tipo === 'jefe' ? 6 : 3, t + en.id);
    }
  }

  // Balas, disparos enemigos, misiles (con su humo) y premios: todo cubitos que van al lote.
  function proyectiles(a, t) {
    for (const b of a.balas) { const p = GL.R(b.pos), tam = visible(p, 1.1, 0.004), d = V.por(V.norma(GL.R(b.v)), tam * 1.5); for (let i = 0; i < 4; i++) GL.cubo(V.resta(p, V.por(d, i)), tam * (1 - i * 0.12), i < 2 ? BALA : COLOR_PREMIO.combustible); }
    for (const s of a.tiros) { const p = GL.R(s.pos), tam = visible(p, 5, 0.012) * (1 + Math.sin(t * 20) * 0.15); GL.cubo(p, tam, COLOR_TIRO[s.clase] || BLANCO); GL.cubo(p, tam * 0.45, BLANCO); }
    for (const m of a.misiles) { const p = GL.R(m.pos), tam = visible(p, 1.6, 0.005), d = V.por(GL.R(m.dir), tam); GL.cubo(V.suma(p, d), tam, hex('#e63a2a')); GL.cubo(p, tam, BLANCO); GL.cubo(V.resta(p, d), tam, BLANCO); FX.humo(V.resta(p, V.por(d, 2)), tam * 1.6); }
    for (const pr of a.premios) premio(GL.R(pr.pos), COLOR_PREMIO[pr.tipo], t + pr.id);
  }
  function premio(p, col, t) {
    const tam = visible(p, 7, 0.016), sube = Math.sin(t * 3) * tam * 0.1;
    GL.cubo([p[0], p[1] + sube, p[2]], tam, col); GL.cubo([p[0], p[1] + sube, p[2]], tam * 0.5, BLANCO);
    for (let i = -2; i <= 2; i++) GL.cubo([p[0] + i * tam * 0.55, p[1] + sube + tam * (2.3 - Math.abs(i) * 0.3), p[2]], tam * 0.6, i % 2 ? BLANCO : hex('#ff8a2a'));   // el paracaídas
  }

  // Dibuja una imagen. esc = { j (caza del dominio), cazaId, aire (estado del aire o null), orbita (ángulo o null), dt, t, turbo }.
  VI.dibujar = function (esc) {
    const a = ejesDe(esc.j), cam = ponCamara(a, esc.orbita === undefined ? null : esc.orbita, esc.dt), matriz = M.ejes(a.p, a.r, a.u, a.f);
    apuntaEstela(esc.dt, matriz, esc.cazaId);
    const vistas = MU.dibujar(cam, esc.t);
    GL.malla(MOD.caza[esc.cazaId], M.varias(M.T(0, 1.4, 0), M.S(1, 0, 1), matriz), true);   // tu sombra en el mar
    MU.dibujarSolido(cam, vistas);
    if (esc.aire) enemigos(esc.aire, esc.t);
    if (VI.pesoCabina < 0.6) {
      GL.malla(MOD.caza[esc.cazaId], matriz);
      llamasMias(esc, matriz, a);
      estelaAlLote();
    }
    if (esc.aire) proyectiles(esc.aire, esc.t);
    FX.alLote();
    GL.conNiebla(false); GL.pintaLote(); LL.pintar(); GL.conNiebla(true);
  };
})(WINGS);

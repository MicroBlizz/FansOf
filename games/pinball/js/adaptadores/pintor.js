// Fans of Pinball · adaptador · PINTOR DE LA MESA: cada cuadro copia el trozo de fondo que ve la cámara y pinta encima, a x1 (una sola
// densidad de píxel) y en posiciones enteras, con drawImage de los lienzos de PB.preparaSprites, lo que trae la foto del dominio: el
// decorado grande (ascensor, tienda de Lola, fotocopiadora, rebotadores, máquinas de café), la boca de la rampa, dianas, rompibles,
// becarios, el jefe y sus cajas, proyectiles, palas, bolas (el ovillo girado, en su postura cómica si la hay, y la cápsula encima, sin
// girar, aplastada y estirada en el eje del choque) y partículas.
// PROHIBIDO aquí lo vectorial (arc, lineTo, stroke, curvas, degradados, texto): lo comprueba tests/pinball/unitarios/pintado.test.mjs.
// fillRect solo para destellos y barras (el borde del CAOS, la estela, el láser del jefe). Destellos y aplastes: grupos fijos de marcas.
'use strict';
PB.creaPintor = ({ sp, fondo, arte, jugo, mesa, lienzo, particulas, posturas }) => {
  const A = arte, lx = fondo.lx, ly = fondo.ly, img = sp.img, AP = A.aplaste;
  let ctx = null, cam = null, reloj = 0;
  // grupos fijos de marcas que caducan: destellos (golpe), aplastes (bola), explosiones y la fotocopiadora
  const marcas = n => Array.from({ length: n }, () => ({ x: 0, y: 0, r: 0, t: 0, ang: NaN }));
  const destellos = marcas(8), aplastes = marcas(4), explosiones = marcas(6), copias = marcas(1);
  function marca(lista, x, y, r, t) {
    let m = lista[0];
    for (const o of lista) if (o.t < m.t) m = o;
    m.x = x; m.y = y; m.r = r; m.t = t; m.ang = NaN;
  }
  // la marca viva más cercana a (x, y) dentro de r (o null), sin crear nada: corre en cada cuadro
  function cercana(lista, x, y, r) {
    for (let i = 0; i < lista.length; i++) {
      const m = lista[i];
      if (m.t > 0 && Math.abs(m.x - x) <= r + m.r && Math.abs(m.y - y) <= r + m.r) return m;
    }
    return null;
  }
  const cerca = (lista, x, y, r) => Boolean(cercana(lista, x, y, r));
  // un dibujo con su centro en (x, y) del mundo
  function pon(c, x, y) {
    ctx.drawImage(c, Math.round(lx(x) - cam.x - c.width / 2), Math.round(ly(y) - cam.y - c.height / 2));
  }
  // un dibujo con su esquina de arriba a la izquierda en (x, y) del mundo
  const esquina = (c, x, y) => ctx.drawImage(c, Math.round(lx(x) - cam.x), Math.round(ly(y) - cam.y));
  const parpadea = periodo => Math.floor(reloj / periodo) % 2 === 0;
  function ascensor(f) {
    const e = f.escalera, cx = (e.x0 + e.x1) / 2, c = e.abierta ? img.ascensorAbierto : img.ascensorCerrado;
    esquina(c, cx - c.width / 2, 0);
    if (e.abierta && parpadea(0.25)) { ctx.fillStyle = 'rgba(250, 217, 73, 0.3)'; ctx.fillRect(Math.round(lx(e.x0) - cam.x), Math.round(ly(e.fondo - 4) - cam.y), e.x1 - e.x0, 4); }
  }
  // la tienda: abierta (y con su luz que parpadea) si se puede entrar; con la persiana bajada si ya se usó o faltan fichas
  function tienda(f) {
    const t = f.tienda, c = !t.puede ? img.tiendaCerrada : (parpadea(0.4) ? sp.luz.tienda : img.tienda);
    esquina(c, (t.x0 + t.x1) / 2 - c.width / 2, t.fondo - c.height);
  }
  function fotocopiadora() {
    const fc = mesa.fotocopiadora, c = cerca(copias, fc.x, fc.y, 200) && parpadea(0.06) ? sp.luz.fotocopiadora : img.fotocopiadora;
    esquina(c, fc.x + fc.ancho / 2 - c.width / 2, fc.y);
  }
  function rebotadores(f) {
    mesa.rebotadores.forEach((r, i) => {
      const izq = r.lado === 'izquierdo', clave = izq ? 'rebotadorIzquierdo' : 'rebotadorDerecho', luz = f.rebotadores[i] && f.rebotadores[i].encendida;
      const c = luz ? sp.luz[clave] : img[clave], x0 = Math.min(r.a[0], r.c[0]), x1 = Math.max(r.a[0], r.c[0]);
      esquina(c, (x0 + x1) / 2 - c.width / 2, (r.a[1] + r.c[1]) / 2 - c.height / 2);
    });
  }
  function maquinas(f) {
    for (const m of f.maquinas) pon(m.encendida ? img.maquinaEncendida : img.maquina, m.x, m.y);
  }
  function rampa(f) {
    const r = f.rampa, luz = f.escalera.abierta && parpadea(0.2);
    pon(luz ? sp.rampaLuz : img.rampaEntrada, r.camino[0][0], r.y0 + 4);
  }
  function setas(f) {
    const c = A.cosas.seta;
    for (const s of f.setas) pon(cerca(destellos, s.x, s.y, s.r) ? img[c.encendida] : img[c.img], s.x, s.y);
  }
  function rompibles(f) {
    for (const o of f.rompibles) {
      const c = A.cosas[o.tipo], nombre = Array.isArray(c.img) ? c.img[Math.abs(o.id) % c.img.length] : c.img;
      pon(img[nombre], o.x, o.y);
    }
  }
  function enemigos(f) {
    for (const o of f.enemigos) {
      const e = sp.enemigos[o.tipo] || sp.enemigos.becario, golpe = cerca(destellos, o.x, o.y, o.r);
      pon(golpe ? e.golpe : (o.tipo === 'casco' && !(o.casco > 0) ? e.sinCasco : e.c), o.x, o.y - 2);
    }
  }
  function laser(j, f) {
    const p = f.palas.find(x => x.id === j.laser.pala);
    if (!p || !parpadea(0.08)) return;
    ctx.fillStyle = '#e5322d';
    const n = Math.ceil(Math.hypot(p.x - j.x, p.y - j.y) / 3);
    for (let i = 0; i <= n; i += 1) ctx.fillRect(Math.round(lx(j.x + (p.x - j.x) * i / n) - cam.x), Math.round(ly(j.y + (p.y - j.y) * i / n) - cam.y), 1, 1);
  }
  function jefe(f) {
    const j = f.jefe;
    if (!j || !j.vivo) return;
    for (const c of j.cajas) pon(cerca(destellos, c.x, c.y, c.r) ? sp.caja.golpe : sp.caja.c, c.x, c.y);
    const blanco = cerca(destellos, j.x, j.y, j.r) || (j.abierto && parpadea(0.15));
    pon(blanco ? sp.jefe.golpe : (j.rabia ? sp.jefe.rabia : sp.jefe.c), j.x, j.y);
    if (j.laser) laser(j, f);
  }
  function proyectiles(f) {
    for (const o of f.cafes) pon(sp.proyectiles.cafe, o.x, o.y);
    for (const o of f.cubitos) pon(sp.proyectiles.cubito, o.x, o.y);
    for (const o of f.bolsas) pon(sp.proyectiles.bolsa, o.x, o.y);
  }
  function cuadroPala(p, f) {
    const giros = sp.palas[p.id], rot = p.lado === 'derecha' ? p.angulo - Math.PI : p.angulo, l = giros.lista;
    const i = Math.max(0, Math.min(l.length - 1, Math.round((rot - l[0].a) / (l[l.length - 1].a - l[0].a) * (l.length - 1))));
    const aviso = f.jefe && f.jefe.laser && f.jefe.laser.pala === p.id && parpadea(0.12);
    const c = l[i];
    return p.congelada > 0 ? c.congelada : p.lenta > 0 ? c.lenta : aviso ? c.aviso : c.normal;
  }
  function palas(f) {
    for (const p of f.palas) pon(cuadroPala(p, f), p.x, p.y);
  }
  function estela(b) {
    if (!b.estela) return;
    ctx.fillStyle = parpadea(0.05) ? '#f88f2f' : '#fad949';
    for (const p of b.rastro) ctx.fillRect(Math.round(lx(p.x) - cam.x) - 2, Math.round(ly(p.y) - cam.y) - 2, 4, 4);
  }
  // la cápsula: aplastada y estirada en el eje del choque (del sitio del golpe hacia la bola) durante unos cuadros; si no, la normal
  function capsula(b) {
    const m = cercana(aplastes, b.x, b.y, b.r), paso = m ? Math.floor((AP.segundos * AP.cuadros.length - m.t) / AP.segundos) : -1;
    if (paso < 0 || paso >= AP.cuadros.length) return img.capsula;
    if (Number.isNaN(m.ang)) m.ang = Math.hypot(b.x - m.x, b.y - m.y) > 2 ? Math.atan2(b.y - m.y, b.x - m.x) : Math.atan2(b.vy, b.vx);
    const n = A.angulosAplaste, k = ((Math.round(m.ang / (Math.PI / n)) % n) + n) % n;
    return sp.aplastes[paso][k];
  }
  function bola(b) {
    if (b.enTienda) return;
    const postura = posturas.cual(b), propias = sp.posturas[b.criatura] || {};
    const giros = (postura && propias[postura]) || sp.ovillos[b.criatura] || sp.ovillos.crazybunny, n = giros.length;
    const i = ((Math.round(b.angulo / (2 * Math.PI) * n) % n) + n) % n;
    estela(b);
    ctx.globalAlpha = b.oculta ? 0.45 : 1;
    pon(giros[i], b.x, b.y);
    pon(capsula(b), b.x, b.y);
    ctx.globalAlpha = 1;
    if (b.dinamita && parpadea(0.1)) { ctx.fillStyle = '#e5322d'; ctx.fillRect(Math.round(lx(b.x) - cam.x) - 2, Math.round(ly(b.y - b.r) - cam.y) - 6, 4, 4); }
  }
  function destellosExplosion() {
    for (const m of explosiones) {
      if (m.t <= 0) continue;
      ctx.fillStyle = 'rgba(253, 254, 253, ' + Math.min(0.6, m.t * 4).toFixed(2) + ')';
      const w = m.r * 2;
      ctx.fillRect(Math.round(lx(m.x) - cam.x - w / 2), Math.round(ly(m.y) - cam.y - w / 2), w, w);
    }
  }
  function bordeCaos(f) {
    if (!f.caos.activo || !parpadea(0.12)) return;
    const b = jugo.caos.borde, w = lienzo.ancho, h = lienzo.alto;
    ctx.fillStyle = '#f88f2f';
    ctx.fillRect(0, 0, w, b); ctx.fillRect(0, h - b, w, b); ctx.fillRect(0, 0, b, h); ctx.fillRect(w - b, 0, b, h);
  }
  function caduca(dt) { for (const l of [destellos, aplastes, explosiones, copias]) for (const m of l) m.t -= dt; }
  function decorado(f) {
    ascensor(f); tienda(f); fotocopiadora(); rebotadores(f); rampa(f); maquinas(f);
  }
  return {
    // foto del dominio, esquina de la cámara (px del lienzo) y segundos desde el cuadro anterior
    pinta(f, camara, dt) {
      ctx = lienzo.ctx; cam = camara; reloj += dt;
      ctx.fillStyle = A.colorFondo;
      ctx.fillRect(0, 0, lienzo.ancho, lienzo.alto);
      ctx.drawImage(fondo.lienzo, -cam.x, -cam.y);
      decorado(f); setas(f); rompibles(f); enemigos(f); jefe(f); proyectiles(f); palas(f);
      for (const b of f.bolas) bola(b);
      particulas.pinta(ctx, cam, lx, ly);
      destellosExplosion(); bordeCaos(f);
      caduca(dt);
    },
    destella: (x, y) => marca(destellos, x, y, 2, jugo.destello),
    aplasta: (x, y) => marca(aplastes, x, y, 14, AP.segundos * AP.cuadros.length),
    explota: (x, y, r) => marca(explosiones, x, y, r, 0.15),
    fotocopia: () => marca(copias, mesa.fotocopiadora.x, mesa.fotocopiadora.y, 0, 0.5),
  };
};

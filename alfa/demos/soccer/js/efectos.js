// Fans of Soccer · Efectos: chispas, corte de súper tiro estilo anime (retrato del delantero cruzando la pantalla), repetición del
// gol a cámara lenta y lo que se ve del clima (racha de viento, apagón, aceite). Solo dibujo: no toca las reglas.
'use strict';
var SOCCER = globalThis.SOCCER || (globalThis.SOCCER = {});
(function (S) {
  const W = 1280, H = 720;
  const RETRATO = { animales: 'r-bunny', microblizz: 'r-ceo', nomuertos: 'r-necro', ciber: 'r-marine', phony: 'r-presidente' };
  const F = S.efectos = { lista: [], corte: null, fotos: [], viento: [] };

  // ---------- chispas ----------
  F.estallido = function (x, y, z, color, n) {
    const q = S.vista.P(x, y, z);
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.3, v = 120 + Math.random() * 380; F.lista.push({ x: q.x, y: q.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 150, v: 0.5 + Math.random() * 0.5, t: 3 + Math.random() * 5, color }); }
  };
  F.chispas = function (g, dt) {
    for (const c of F.lista) { c.x += c.vx * dt; c.y += c.vy * dt; c.vy += 400 * dt; c.v -= dt; }
    F.lista = F.lista.filter((c) => c.v > 0);
    for (const c of F.lista) { g.globalAlpha = Math.min(1, c.v * 2); g.fillStyle = c.color; g.fillRect(c.x - c.t / 2, c.y - c.t / 2, c.t, c.t); }
    g.globalAlpha = 1;
  };

  // ---------- corte de súper tiro ----------
  F.cortar = function (equipo) { F.corte = { equipo, t: 0, dura: 0.95 }; };
  F.enCorte = () => !!F.corte;

  function lineasVelocidad(g, color, t) {
    g.strokeStyle = color; g.lineWidth = 3;
    for (let i = 0; i < 26; i++) {
      const y = 200 + ((i * 53 + t * 900) % 320), x = ((i * 137 + t * 2600) % (W + 400)) - 200;
      g.globalAlpha = 0.35; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 160 + (i % 3) * 60, y); g.stroke();
    }
    g.globalAlpha = 1;
  }

  F.dibujarCorte = function (g, dt) {
    const c = F.corte;
    if (!c) return;
    c.t += dt;
    if (c.t >= c.dura) { F.corte = null; return; }
    const k = c.t / c.dura, entra = Math.min(1, c.t * 7), sale = k > 0.82 ? (k - 0.82) / 0.18 : 0;
    g.save();
    g.fillStyle = 'rgba(0,0,0,' + 0.45 * (1 - sale) + ')'; g.fillRect(0, 0, W, H);
    g.translate(0, 360); g.rotate(-0.12); g.translate(0, -360);
    g.fillStyle = c.equipo.color; g.globalAlpha = 1 - sale; g.fillRect(-100, 200 + (1 - entra) * 160, W + 200, 320 * entra);
    lineasVelocidad(g, '#fff', c.t);
    const im = S.vista.img[RETRATO[c.equipo.id]];
    if (im) { const x = -im.width + entra * (im.width + 120) + k * 60 + sale * 900; g.drawImage(im, x, 360 - im.height / 2, im.width, im.height); }
    g.restore();
    S.ui.texto(g, tr(c.equipo.nombreSuper), 820 + (1 - entra) * 500 - sale * 1400, 400, 34, '#fff');
  };

  // ---------- repetición del gol ----------
  const copiaJ = (j) => ({ id: j.id, eq: j.eq, sprite: j.sprite, puesto: j.puesto, x: j.x, y: j.y, mira: j.mira, mareo: j.mareo, ko: j.ko, corre: j.corre,
    barrida: j.barrida, empujon: j.empujon, vuelo: j.vuelo || 0, cargado: j.cargado, vida: j.vida, vidaMax: j.vidaMax });
  F.grabar = function (e) {
    const b = e.balon;
    F.fotos.push({ jugadores: e.jugadores.map(copiaJ), balon: { x: b.x, y: b.y, z: b.z, tiro: b.tiro ? { tipo: b.tiro.tipo, cargo: b.tiro.cargo } : null } });
    if (F.fotos.length > 150) F.fotos.shift();
  };
  // La repetición: las últimas fotos (unos 2 segundos antes del gol) a media velocidad.
  F.empezarRepeticion = function () { F.repe = { fotos: F.fotos.slice(-110), i: 0 }; F.fotos = []; };
  F.fotoRepeticion = function (e, dt) {
    const r = F.repe;
    if (!r) return null;
    r.i += dt * 30;
    const f = r.fotos[Math.floor(r.i)];
    if (!f) { F.repe = null; return null; }
    return Object.assign({}, e, f);
  };

  // ---------- clima ----------
  function racha(g, e, t) {
    const dir = e.clima.fuerza;
    if (F.viento.length < 40) F.viento.push({ x: Math.random() * W, y: 180 + Math.random() * 520, v: 900 + Math.random() * 700, l: 60 + Math.random() * 120 });
    g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2;
    for (const w of F.viento) {
      w.x += dir * w.v / 60; if (w.x > W + 200) w.x = -200; if (w.x < -200) w.x = W + 200;
      g.beginPath(); g.moveTo(w.x, w.y); g.lineTo(w.x - dir * w.l, w.y + Math.sin(t * 6 + w.y) * 4); g.stroke();
    }
  }

  // Apagón: todo a oscuras salvo un foco sobre el balón y las luces de los servidores.
  function apagon(g, e, t) {
    const q = S.vista.aPantalla(S.vista.P(e.balon.x, e.balon.y, 0)), parpadeo = Math.random() < 0.04 ? 0.35 : 0.8;
    const gr = g.createRadialGradient(q.x, q.y - 20, 40, q.x, q.y - 20, 300);
    gr.addColorStop(0, 'rgba(0,0,15,0)'); gr.addColorStop(1, 'rgba(0,0,15,' + parpadeo + ')');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 18; i++) { if ((Math.floor(t * 4) + i) % 3) continue; g.fillStyle = i % 2 ? '#3dff6a' : '#30b8ff'; g.fillRect((i * 71) % W, 60 + (i * 37) % 160, 6, 6); }
  }

  F.clima = function (g, e, t) {
    if (e.clima.tipo === 'racha') racha(g, e, t);
    else if (e.clima.tipo === 'apagon') apagon(g, e, t);
    else F.viento.length = 0;
  };

  F.avisoClima = { racha: '¡RACHA DE VIENTO!', apagon: '¡APAGÓN!', aceite: '¡FUGA DE ACEITE!' };
})(SOCCER);

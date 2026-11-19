// Fans of Asalto · ADAPTADORES · Lo que se ve en la BATALLA de los legendarios y los seres secretos (tarea #109): convierte sus eventos
// (dominio/batalla-legendarios.js, la lista está en su cabecera) en efectos y sonidos: meteoritos y cometas que caen del cielo, la lluvia
// de bellotas, el fuego en el suelo, la explosión del Juicio, la embestida, el brillo del invulnerable, el que revive, los señuelos y los
// minimapaches, y un cartel corto con el nombre del poder o de la carta que acaba de saltar. Dibujo provisional por código, en píxeles.
// pantalla-batalla.js le pasa cada evento (trata) y pinta-arena.js le pide lo que va en el suelo, el brillo de cada uno y lo de encima.
'use strict';
AS.leyendasBatalla = (() => {
  const fx = AS.fx, T = AS.tema, C = T.C, L = () => ASALTO.legendarios;
  // el nombre corto de cada habilidad única para su cartel (el largo es el del legendario)
  const HABILIDAD = { sombra: 'Sombra', abanico: 'Abanico', salto: 'Salto real', muralla: 'Muralla', bellotas: 'Mil bellotas', sinaviso: 'Sin aviso',
    guadana: 'Guadaña', enganos: 'Nueve engaños', fuego: 'Fuego', juicio: 'Juicio final', fortaleza: 'Fortaleza', embestida: 'Embestida',
    vidente: 'Visión', malojo: 'Mal de ojo', cometa: 'Cometa', chatarra: 'Chatarra' };
  const COLOR = { cumbre: '#c8901c', habilidad: '#8a1f24', carta: '#3f8ae8' };
  const S = { B: null, t: 0, carteles: [], caidas: [], ultimo: new Map() };
  const pos = (E, e) => E.P.aPantalla(e.x, e.y);
  const escala = E => E.P.W / 540;

  /* ---------- el cartel corto: el nombre de lo que salta, encima de quien lo hace (como mucho uno cada 2,5 s por héroe y poder) ---------- */
  function cartel(E, e, txt, tipo) {
    const clave = e.id + '|' + txt, antes = S.ultimo.get(clave);
    if (antes !== undefined && E.t - antes < 2.5) return;
    S.ultimo.set(clave, E.t);
    const s = pos(E, e), w = AS.texto.ancho(txt, 32) + 36, arriba = s.y - 120 > E.P.arena.y + 150;   // muy arriba, debajo de sus pies
    S.carteles.push({ x: Math.max(w / 2 + 4, Math.min(E.P.W - w / 2 - 4, s.x)), y: arriba ? s.y - 120 : s.y + 34, w, txt, col: COLOR[tipo], t0: E.t });
    if (S.carteles.length > 6) S.carteles.shift();
  }

  /* ---------- lo que cae del cielo: meteorito, cometa y bellotas ---------- */
  // cae en (x, y) de la pantalla; al llegar, `llega` hace la explosión
  function cae(E, x, y, forma, dura, llega, retraso) {
    S.caidas.push({ x, y, forma, t: -(retraso || 0), dura, llega });
  }
  function revienta(x, y, r, col, fuerza) {
    fx.onda(x, y - 10, r, col); fx.chispas(x, y - 20, 10 + fuerza * 6, col, 160 + fuerza * 40, true);
    fx.luz(x, y - 30, r * 1.6, [255, 170, 70], 0.4); fx.sacude(3 + fuerza * 3);
  }
  function meteorito(E, e) {
    const s = pos(E, e), r = e.radio * escala(E);
    cae(E, s.x, s.y, 'meteorito', 0.25, () => { revienta(s.x, s.y, r, '#ff8a2a', 2); AS.suena('cae'); });
  }
  function cometa(E, e) {
    const s = pos(E, e), r = e.radio * escala(E);
    AS.suena('magia');
    cae(E, s.x, s.y, 'cometa', 0.4, () => { revienta(s.x, s.y, r * 1.2, '#8fd0f8', 3); fx.fogonazo(0.45, '#cfefff'); fx.columna(s.x, s.y, [150, 220, 255], 300); AS.suena('cae'); });
  }
  function bellotas(E) {
    const lista = E.batalla.u.filter(u => u.lado === 'enemigo' && !u.muerta);
    lista.forEach((u, i) => { const s = pos(E, u); cae(E, s.x, s.y - 30, 'bellota', 0.25, () => fx.chispas(s.x, s.y - 40, 5, '#a06a3c', 120), i * 0.05); });
    AS.suena('flecha');
  }

  /* ---------- cada evento, hecho efecto ---------- */
  const EVENTO = {
    cumbre(E, e) { cartel(E, e, tr(L().cumbres[e.cual].nombre), 'cumbre'); },
    habilidad(E, e) { cartel(E, e, tr(HABILIDAD[e.hab] || e.hab), 'habilidad'); if (HAB[e.hab]) HAB[e.hab](E, e); },
    carta(E, e) { cartel(E, e, tr(L().cartas[e.carta].nombre), 'carta'); },
    meteorito, cometa, bellotas,
    revive(E, e) {
      const s = pos(E, e);
      fx.columna(s.x, s.y, [150, 255, 150], 260); fx.brasas(s.x, s.y - 30, 16, '#b8ff7a', 26); fx.numero(s.x, s.y - 140, tr('¡REVIVE!'), '#b8ff7a', 48);
      AS.suena('asciende');
    },
    invulnerable(E, e) { const s = pos(E, e); fx.onda(s.x, s.y - 40, 70, '#ffd23a'); fx.fogonazo(0.15, '#ffe9a0'); AS.suena('escudo'); },
    explota(E, e) {
      const s = pos(E, e), r = e.radio * escala(E);
      revienta(s.x, s.y, r, '#ffd23a', 4); fx.onda(s.x, s.y - 10, r * 0.6, '#ff5a3a'); fx.fogonazo(0.5, '#ffe9a0');
      cartel(E, e, tr(HABILIDAD.juicio), 'habilidad'); AS.suena('bomba');
    },
    fuego(E, e) { const s = pos(E, e); fx.chispas(s.x, s.y - 10, 10, '#ff8a2a', 140, true); },
    embestida(E, e) {
      const s = pos(E, e);
      for (let i = 0; i < 5; i++) fx.onda(s.x + 30 + i * 36, s.y - 30 - (i % 2) * 20, 40 + i * 6, '#fff3d6');
      fx.sacude(8); cartel(E, e, tr(HABILIDAD.embestida), 'habilidad'); AS.suena('carga');
    },
    senuelo(E, e) { const s = pos(E, e); fx.chispas(s.x, s.y - 40, 14, '#b9a77c', 90); fx.onda(s.x, s.y - 30, 40, '#ff7ab0'); },
    minimapache(E, e) { const s = pos(E, e); fx.chispas(s.x, s.y - 20, e.fin ? 8 : 12, e.fin ? '#b9a77c' : '#7a869e', 110); if (!e.fin) AS.suena('empuja'); },
  };
  // lo propio de algunas habilidades además de su cartel
  const HAB = {
    sombra(E, e) { const s = pos(E, e); fx.chispas(s.x, s.y - 40, 16, '#8a1f4a', 100); },
    abanico(E, e) { const s = pos(E, e); fx.onda(s.x + 20, s.y - 30, e.radio * escala(E), '#ffb04a'); },
    salto(E, e) { const a = E.batalla.u.find(u => u.id === e.a), s = pos(E, a || e); fx.onda(s.x, s.y - 10, 80, '#ffd23a'); fx.sacude(7); AS.suena('cae'); },
    muralla(E, e) { const s = pos(E, e); fx.onda(s.x, s.y - 40, 90, '#8fd0f8'); AS.suena('escudo'); },
    fortaleza(E) { for (const u of E.batalla.u) if (u.lado === 'heroe' && !u.muerta) { const s = pos(E, u); fx.onda(s.x, s.y - 40, 56, '#8fd0f8'); } AS.suena('escudo'); },
    vidente(E) { for (const u of E.batalla.u) if (u.lado === 'heroe' && !u.muerta) { const s = pos(E, u); fx.brasas(s.x, s.y - 30, 4, '#8fe07a', 16); } },
    sinaviso(E, e) { const a = E.batalla.u.find(u => u.id === e.a); if (a) { const s = pos(E, a); fx.onda(s.x, s.y - 40, 60, '#d8402f'); fx.sacude(5); } },
  };
  // un evento de la batalla: si es de los legendarios, lo hace efecto y devuelve true (la habilidad de clase la lleva pantalla-batalla.js)
  function trata(E, e) {
    if (!EVENTO[e.e] || (e.e === 'habilidad' && !e.hab)) return false;
    nueva(E);
    EVENTO[e.e](E, e);
    return true;
  }

  /* ---------- pintar ---------- */
  // el fuego en el suelo (B.fuegos): un charco naranja con llamas de píxeles que bailan
  function suelo(g, P, B, t) {
    for (const z of B.fuegos) {
      const s = P.aPantalla(z.x, z.y), r = z.radio * P.W / 540, a = Math.min(1, z.t / 0.5);
      g.globalAlpha = 0.35 * a; g.fillStyle = '#d8402f'; g.beginPath(); g.ellipse(s.x, s.y, r, r * 0.5, 0, 0, Math.PI * 2); g.fill();
      g.globalAlpha = a;
      for (let i = 0; i < 9; i++) {
        const k = i / 9 * Math.PI * 2, fx0 = Math.round(s.x + Math.cos(k) * r * 0.65), fy = Math.round(s.y + Math.sin(k) * r * 0.32), h = 8 + Math.round(Math.abs(Math.sin(t * 9 + i * 1.7)) * 12);
        g.fillStyle = '#ff8a2a'; g.fillRect(fx0 - 4, fy - h, 8, h); g.fillStyle = '#ffd23a'; g.fillRect(fx0 - 2, fy - Math.round(h * 0.6), 4, Math.round(h * 0.6));
      }
      g.globalAlpha = 1;
    }
  }
  // cómo de transparente se ve: los señuelos y el que está invisible (Sombra), a medias
  const transparencia = u => (u.senuelo ? 0.55 : u.invisible > 0 ? 0.4 : 1);
  // el brillo del invulnerable (Bastión): un aro de oro que late y cruces de luz alrededor
  function brillo(g, u, s, alto, t) {
    if (!(u.invul > 0)) return;
    const k = Math.abs(Math.sin(t * 10)), rx = 34 + Math.round(k * 4), cy = s.y - Math.round(alto * 0.45);
    g.strokeStyle = '#ffd23a'; g.lineWidth = 4; g.globalAlpha = 0.6 + k * 0.4;
    g.beginPath(); g.ellipse(s.x, cy, rx, Math.round(alto * 0.55), 0, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#fff3d6';
    for (let i = 0; i < 3; i++) { const a = t * 3 + i * 2.1, x = Math.round(s.x + Math.cos(a) * rx), y = Math.round(cy + Math.sin(a) * alto * 0.5); g.fillRect(x - 5, y - 1, 10, 3); g.fillRect(x - 1, y - 5, 3, 10); }
    g.globalAlpha = 1;
  }
  const FORMA = {
    meteorito: { col: ['#22140e', '#d8402f', '#ffb04a'], r: 14, estela: '#ff8a2a', alto: 360 },
    cometa: { col: ['#22140e', '#3f8ae8', '#cfefff'], r: 18, estela: '#8fd0f8', alto: 460 },
    bellota: { col: ['#22140e', '#7c4b2a', '#a06a3c'], r: 6, estela: null, alto: 260 },
  };
  function pintaCaida(g, c) {
    const F = FORMA[c.forma], k = Math.max(0, c.t / c.dura), x = Math.round(c.x - (1 - k) * F.alto * 0.35), y = Math.round(c.y - (1 - k) * F.alto), r = F.r;
    if (F.estela) for (let i = 1; i <= 4; i++) { g.globalAlpha = 0.7 - i * 0.15; g.fillStyle = F.estela; const e = r - i * 2; g.fillRect(x - i * 9 - e, y - i * 24 - e, e * 2, e * 2); }
    g.globalAlpha = 1;
    g.fillStyle = F.col[0]; g.fillRect(x - r - 2, y - r, r * 2 + 4, r * 2); g.fillRect(x - r, y - r - 2, r * 2, r * 2 + 4);
    g.fillStyle = F.col[1]; g.fillRect(x - r, y - r, r * 2, r * 2);
    g.fillStyle = F.col[2]; g.fillRect(x - r + 3, y - r + 3, Math.round(r * 0.8), Math.round(r * 0.8));
    if (F.estela) fx.luz(x, y, r * 6, c.forma === 'cometa' ? [150, 220, 255] : [255, 150, 60], 0.06);
  }
  function caidas(g, dt) {
    for (let i = S.caidas.length - 1; i >= 0; i--) {
      const c = S.caidas[i];
      c.t += dt;
      if (c.t >= c.dura) { S.caidas.splice(i, 1); c.llega(); continue; }
      if (c.t >= 0) pintaCaida(g, c);
    }
  }
  function carteles(g, t) {
    S.carteles = S.carteles.filter(c => t - c.t0 < 1.6);
    for (const c of S.carteles) {
      const k = t - c.t0, w = c.w, y = Math.round(c.y - k * 20);
      g.globalAlpha = k > 1.3 ? (1.6 - k) / 0.3 : Math.min(1, k / 0.1);
      T.cinta(g, Math.round(c.x - w / 2), y - 22, w, 46, c.col);
      AS.texto.pinta(g, c.txt, c.x, y, { col: C.crema, ancla: 'c' });
    }
    g.globalAlpha = 1;
  }
  // una batalla nueva empieza limpia (lo que quedara de la anterior se olvida)
  function nueva(E) {
    if (S.B === E.batalla) return;
    S.B = E.batalla; S.caidas.length = 0; S.carteles.length = 0; S.ultimo.clear(); S.t = E.t;
  }
  // lo de encima de las unidades: lo que cae del cielo y los carteles
  function encima(g, P, E) {
    nueva(E);
    const dt = Math.max(0, Math.min(0.05, E.t - S.t));
    S.t = E.t;
    caidas(g, dt); carteles(g, E.t);
  }
  return { trata, suelo, transparencia, brillo, encima, HABILIDAD };
})();

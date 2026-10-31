// Fans of Goose · Dibujo del mundo: el vacío de fondo (con niebla y losas lejanas que pasan despacio), el tablero, los charcos,
// las plumas, las ocas, el jugador, los disparos y las partículas. La cámara solo sube y baja (y tiembla en los golpes gordos).
'use strict';

let FONDO = null, VINETA = null;
function preparaFondo() {
  const W = PAN.W, H = PAN.H, k = PAN.k;
  FONDO = lienzo(W * k, H * k); let x = FONDO.getContext('2d'); x.scale(k, k);
  bandasVerticales(x, 0, W, H, ['#120a16', '#110b17', '#0f0b16', '#0d0c15', '#0b0d14', '#090b11', '#07080d', '#050608']);   // degradado en bandas (pixel)
  const r = azarSemilla(5); for (let i = 0; i < 70; i++) { x.globalAlpha = 0.2 + r() * 0.5; x.fillStyle = r() < 0.2 ? '#c9a0a0' : '#8f93a8'; x.fillRect(Math.round(r() * W), Math.round(r() * H), 1, 1); }
  x.globalAlpha = 1;
  VINETA = lienzo(W * k, H * k); x = VINETA.getContext('2d'); x.scale(k, k);
  x.setTransform(1, 0, 0, 1, 0, 0);   // la viñeta, en anillos de píxeles
  for (let j = 0; j < H * k; j += 2) for (let i = 0; i < W * k; i += 2) { const d = Math.hypot((i / k - W / 2) / (W * 0.62), (j / k - H * 0.56) / (H * 0.55)); const a = Math.floor(Math.max(0, Math.min(1, (d - 0.45) / 0.6)) * 5) / 5 * 0.72; if (a) { x.fillStyle = `rgba(0,0,0,${a})`; x.fillRect(i, j, 2, 2); } }
  hazSprite('sombra', 12, 5, (c, w, h) => { c.globalAlpha = 0.42; c.drawImage(discoLienzo(6, 2.5, '#000', 0), 0, 0, w, h); }, true);   // en píxeles (js/pixel.js)
  hazSprite('luz', 80, 80, (c, w, h) => { c.drawImage(brilloLienzo(40, '#ffc85a', 0.3), 0, 0, w, h); }, true);
}

function pintaVacio() {
  const J = JUEGO, W = PAN.W, H = PAN.H;
  G.drawImage(FONDO, 0, 0, W, H);
  // el color de la tierra en la que estás
  const B = biomaDe(J.casilla || 1); G.globalAlpha = 0.35; G.fillStyle = B.fondo; G.fillRect(0, 0, W, H); G.globalAlpha = 1;
  // losas lejanas que flotan (paralaje): dan profundidad al abismo
  const par = J.camY * 0.25;
  G.fillStyle = '#1a1220';
  for (let i = 0; i < 9; i++) {
    const y = ((i * 97 - par) % (H + 60) + H + 60) % (H + 60) - 30, x = (i * 53) % W, w = 20 + (i * 13) % 26;
    G.globalAlpha = 0.5; G.fillRect(x - w / 2, y, w, w * 0.6); G.globalAlpha = 0.25; G.fillStyle = '#2a1a2a'; G.fillRect(x - w / 2, y + w * 0.6, w, 3); G.fillStyle = '#1a1220';
  }
  G.globalAlpha = 1;
  // niebla que sube desde el fondo
  for (let i = 0; i < 6; i++) {
    const y = ((i * 131 - J.camY * 0.6 - J.t * 6) % (H + 80) + H + 80) % (H + 80) - 40;
    G.globalAlpha = 0.06; disco((i * 71 + J.t * 3) % (W + 60) - 30, y, 60, 14, biomaDe(J.casilla || 1).niebla);
  }
  G.globalAlpha = 1;
}

function pintaMundo() {
  const J = JUEGO, yo = J.yo, k = PAN.k;
  const tx = (Math.random() - 0.5) * FX.temblor, ty = (Math.random() - 0.5) * FX.temblor;
  G.setTransform(k, 0, 0, k, Math.round(tx * k), Math.round((ty - J.camY) * k));   // la cámara, a píxeles enteros: nada se emborrona
  pintaTablero();
  pintaEscenas();
  pintaFuegos();
  pintaArmasSuelo();
  // las plumas y cosas del suelo
  const pl = PLUMAS.lista;
  for (let i = 0; i < PLUMAS.n; i++) {
    const p = pl[i], b = Math.sin(J.t * 5 + i) * 1.2;
    if (p.tipo === 'xp') pinta(p.valor >= 5 ? 'xp3' : p.valor >= 2 ? 'xp2' : 'xp1', p.x, p.y + b);
    else if (p.tipo === 'cofre') { pinta('luz', p.x, p.y, false, false, 0.6); pinta('cofre', p.x, p.y + b); }
    else if (p.tipo === 'moneda') pinta('moneda', p.x, p.y + b, false, false, 0.8 + Math.abs(Math.sin(J.t * 6 + i)) * 0.2);
    else if (p.tipo === 'pollo') pinta('pollo', p.x, p.y + b);
    else if (p.tipo === 'iman') pinta('iman', p.x, p.y + b);
  }
  // sombras y ocas
  const l = ENE.lista;
  for (let i = 0; i < ENE.n; i++) { const e = l[i]; if (e.hp > 0 && !e.oculta) pinta('sombra', e.x, e.y + e.r * 0.9, false, false, e.r / 6); }
  for (let i = 0; i < ENE.n; i++) {
    const e = l[i]; if (e.hp <= 0 || e.oculta) continue;   // la oca minera bajo tierra no se ve (solo su polvo)
    const bob = e.caida > 0 ? -e.caida * 110 : e.tipo === 'albatros' || e.tipo === 'bandada' ? Math.sin(e.t * 9) * 2 - 3 : Math.abs(Math.sin(e.t * 10)) * -1.5;
    const spr = e.tipo === 'parca' ? fotogramaParca(e) : fotogramaEnemigo(e);
    const esc = e.tipo === 'bandada' ? 0.8 : e.tipo === 'jefe' ? 1 + Math.sin(e.t * 3) * 0.03 : e.tipo.startsWith('mj-') && !SPR[e.tipo] ? 1.5 : e.tipo === 'parca' && !SPR.parca ? 1.2 : 1;
    // un poco de estirar y encoger al andar (squash & stretch) y el golpe que los aplasta
    const sx = esc * (1 + (e.flash > 0 ? 0.18 : Math.sin(e.t * 12) * 0.03)), sy = esc * (1 - (e.flash > 0 ? 0.14 : Math.sin(e.t * 12) * 0.03));
    const tinte = !SPR[e.tipo] && TINTES[e.tipo];
    if (sx !== sy || tinte) { G.save(); G.translate(e.x, e.y + bob); G.scale(sx / esc, sy / esc); pinta(spr, 0, 0, e.vx < 0, e.flash > 0, esc); if (tinte) { G.globalCompositeOperation = 'source-atop'; const S = SPR[spr]; G.globalAlpha = 0.45; G.fillStyle = tinte; G.fillRect(-S.w * esc / 2, -S.h * esc / 2, S.w * esc, S.h * esc); G.globalAlpha = 1; G.globalCompositeOperation = 'source-over'; } G.restore(); }
    else pinta(spr, e.x, e.y + bob, e.vx < 0, e.flash > 0, esc);
    if (e.tipo === 'gorda' || e.tipo === 'armadura') barraVida(e.x, e.y - e.r - 4, 22, e.hp / e.hpMax, '#ff9b4d');
    if (e.tipo === 'parca') pintaParcaExtra(e);
  }
  // los rivales de la Carrera y el jugador
  pintaRivales();
  pintaJugador();
  pintaArmas();
  // balas enemigas
  const bl = BALAS.lista;
  for (let i = 0; i < BALAS.n; i++) { const b = bl[i]; pinta(b.spr, b.x, b.y, false, false, b.r / 3); }
  pintaEscenasEncima();
  pintaParticulas();
  pintaTextos();
  G.setTransform(k, 0, 0, k, 0, 0);
}
function pintaArmasSuelo() { pintaCharcos(); }   // lo que va pegado al suelo, debajo de todo (js/armas.js)

function pintaJugador() {
  const J = JUEGO, yo = J.yo;
  if (J.muerto > 0) return;
  let esc = 1, alfa = 1, dy = 0;
  if (J.caida > 0) { const k = J.caida / 0.55; esc = 0.2 + k * 0.8; alfa = k; dy = (1 - k) * 12; }
  if (J.salto > 0) { const k = Math.min(1, J.saltoT / 0.85); esc = 1 + Math.sin(k * Math.PI) * 0.7; dy = -Math.sin(k * Math.PI) * 26; }
  if (J.saltoParca > 0) { const k = 1 - J.saltoParca / 0.55; dy -= Math.sin(k * Math.PI) * 22; }
  pintaLuzFarol(yo.x, yo.y, 1.2 + Math.sin(J.t * 7) * 0.04);   // del color de la llama comprada (js/aspecto.js)
  if (J.caida <= 0) pinta('sombra', yo.x, yo.y + 8, false, false, 1.1 * (J.salto > 0 ? 0.6 : 1));
  if (J.invul > 0 && J.salto <= 0 && ((J.t * 18) | 0) % 2) alfa *= 0.35;
  const paso = yo.moviendo ? Math.abs(Math.sin(yo.anda)) * -1.6 : 0;
  // hacia dónde mira (con un margen, para que no tiemble al ir recto)
  if (yo.miraX > 0.25) yo.dir = 1; else if (yo.miraX < -0.25) yo.dir = -1;
  const dir = yo.dir || 1;
  const lunge = J.latigoT > 0 ? Math.sin(J.latigoT / 0.18 * Math.PI) * 3 : 0, retro = J.golpeT > 0 ? -Math.sin(J.golpeT / 0.25 * Math.PI) * 2 : 0;
  const x = yo.x + dir * (lunge + retro), y = yo.y + dy + paso;
  if (capasListas()) {
    const pose = J.golpeT > 0 && SPR['c-golpe'] ? 'c-golpe' : yo.moviendo && Math.sin(yo.anda) > 0 ? 'c-paso' : 'c-cuerpo';
    // el farolillo se balancea al andar y se va un poco hacia atrás al correr
    const balanceo = (yo.moviendo ? Math.sin(yo.anda * 0.5) * 0.35 - dir * 0.12 : Math.sin(J.t * 2) * 0.06) + (J.golpeT > 0 ? -dir * 0.5 : 0);
    const fp = pintaHeroeCapas(x, y, pose, dir, (J.pers || personaje()).capa, esc, alfa, J.golpeT > 0.18, balanceo, true);
    if (fp) { G.globalAlpha = 0.5 + Math.sin(J.t * 9) * 0.1; pintaLuzFarol(fp[0], fp[1], 0.5); G.globalAlpha = 1; }
  } else pinta('heroe', x, y, false, J.golpeT > 0.18, esc, alfa);
  // aura del Pozo y de la Posada
  if (invertido()) { G.globalAlpha = 0.7; for (let q = 0; q < 8; q++) arcoPixel(yo.x, yo.y, 13, J.t * 4 + q * 0.785, J.t * 4 + q * 0.785 + 0.4, 1.5, '#c9a0ff'); G.globalAlpha = 1; }
}

function barraVida(x, y, w, k, color) {
  G.fillStyle = '#120808'; G.fillRect(x - w / 2 - 1, y - 1, w + 2, 4);
  G.fillStyle = color; G.fillRect(x - w / 2, y, w * Math.max(0, k), 2);
}

// lo que va encima de todo: la viñeta, el destello, la vida baja y la flecha del derrumbe
function pintaEncima() {
  const J = JUEGO, W = PAN.W, H = PAN.H;
  pintaOscuridad();
  G.drawImage(VINETA, 0, 0, W, H);
  if (J.vida > 0 && J.vida < J.st.vidaMax * 0.3) { G.globalAlpha = 0.18 + Math.sin(J.t * 8) * 0.1; G.fillStyle = '#ff0000'; G.fillRect(0, 0, W, 4); G.fillRect(0, H - 4, W, 4); G.fillRect(0, 0, 4, H); G.fillRect(W - 4, 0, 4, H); G.globalAlpha = 1; }
  // el abismo por debajo: si se acerca, una franja roja abajo
  const dist = J.yD - J.yo.y;
  if (dist < PAN.H * 0.42 && !J.jefe) {
    const k = 1 - dist / (PAN.H * 0.42), y = J.yD - J.camY;
    const y0 = Math.min(H, y) - 30; for (let b = 0; b < 6; b++) { G.globalAlpha = (0.25 + k * 0.45) * (b + 1) / 6 * 0.8; G.fillStyle = '#ff3c14'; G.fillRect(0, y0 + b * 5, W, b < 5 ? 5 : H); } G.globalAlpha = 1;
    if (J.impaciente && ((J.t * 3) | 0) % 2) texto2(tr('¡AVANZA!'), W / 2, H - 22, 10, '#ff7a4d');
  }
  if (FX.destello > 0) { G.globalAlpha = Math.min(0.6, FX.destello); G.fillStyle = FX.colorDestello; G.fillRect(0, 0, W, H); G.globalAlpha = 1; }
}

// el fotograma de cada enemigo: su ciclo al ritmo de su velocidad (cada oca desfasada para que no anden todas a la vez)
const TINTES = { payaso: '#ff6b9b', nevada: '#dff2ff', minera: '#d9a020', 'mj-domador': '#c0302f', 'mj-yeti': '#eef6ff', 'mj-capataz': '#d9a020', rana: '#5fbf3a', cuervo: '#202030', antorcha: '#ff7a2a', armadura: '#8a9098', zombi: '#6b8a5a', 'mj-rana': '#3fbf4a', 'mj-cuervo': '#1a1420', 'mj-alcalde': '#c0402f', 'mj-caballero': '#3a3a44', parca: '#2a1040' };
const PROVISIONAL = { payaso: 'oca', nevada: 'oca', minera: 'oca', 'mj-domador': 'gorda', 'mj-yeti': 'gorda', 'mj-capataz': 'gorda', rana: 'oca', cuervo: 'albatros', antorcha: 'oca', armadura: 'gorda', zombi: 'oca', 'mj-rana': 'gorda', 'mj-cuervo': 'albatros', 'mj-alcalde': 'gorda', 'mj-caballero': 'gorda', parca: 'jefe' };
function fotogramaEnemigo(e) {
  if (!SPR[e.tipo] && PROVISIONAL[e.tipo]) return PROVISIONAL[e.tipo];
  const tipo = e.tipo === 'bandada' ? 'oca' : e.tipo;
  if (tipo === 'jefe' && (e.fase === 1 || e.fase === 2) && SPR['e-jefe-2']) return 'e-jefe-2';
  const c = CICLOS[tipo]; if (!c) return tipo;
  const ritmo = tipo === 'albatros' ? 9 : tipo === 'gorda' ? 5 : tipo === 'jefe' ? 2.5 : 9;
  const n = c[Math.floor((e.t + e.id * 0.37) * ritmo) % c.length];
  return SPR[n] ? n : tipo;
}

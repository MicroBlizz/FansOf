// Fans of Auto · EL MARCADOR, colocado como en el clásico de la primera PlayStation: el dinero arriba a la izquierda (es la
// puntuación), los martillos de baneo de los Moderadores arriba a la derecha, el respeto de las tres bandas a la izquierda, la
// vida y las vidas abajo a la izquierda, el arma abajo a la derecha y los avisos de misión en amarillo arriba en el centro.
// También los mandos táctiles del móvil, la oferta de la cabina o del Templo y los rótulos grandes (CANCELADO, BANEADO…).
'use strict';

const ORO = ORO_ROTULO, AZUL_ROTULO = ['#eaffff', '#7fb8e6', '#2a5fd0'];
const miles = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function pintaMarcador(g) {
  const j = S.jugadores[0], W = J.W, H = J.H;
  // dinero y multiplicador
  escribe(g, miles(j.dinero), 6, 4, { fuente: 'gorda', c: ['#ffffff', '#e8eeff', '#a9b8e6'], borde: TINTA });
  escribe(g, 'x' + j.mult, 8, 16, { c: j.mult > 1 ? ORO : '#d9d4c7', borde: TINTA });
  // los martillos de baneo
  for (let i = 0; i < 5; i++) {
    const on = i < j.buscado, spr = on ? SUELO.iconos.martillo : SUELO.iconos.martilloApagado;
    const y = on && j.visto > 0 && ((S.tick >> 3) & 1) ? 3 : 4;
    g.drawImage(spr, W - 26 - i * 13, y);
  }
  // el respeto de las bandas
  for (let z = 0; z < 3; z++) {
    const y = 34 + z * 13, ic = [SUELO.iconos.animales, SUELO.iconos.granizo, SUELO.iconos.extractores][z];
    g.drawImage(ic, 6, y);
    g.fillStyle = TINTA; g.fillRect(17, y + 2, 34, 6);
    const r = j.respeto[z], c = r < 25 ? '#e0302c' : r < 60 ? '#e9c46a' : ZONA_COLOR[z];
    g.fillStyle = c; g.fillRect(18, y + 3, Math.round(32 * r / 100), 4);
  }
  // vida y vidas
  g.fillStyle = TINTA; g.fillRect(6, H - 14, 44, 7);
  g.fillStyle = j.vida > 35 ? '#5cbf4a' : '#e0302c'; g.fillRect(7, H - 13, Math.round(42 * j.vida / 100), 5);
  for (let i = 0; i < Math.max(0, j.vidas); i++) g.drawImage(SUELO.iconos.vida, 54 + i * 10, H - 15);
  // el arma (a pie) o el coche (conduciendo)
  if (j.coche === null) { g.drawImage(SUELO.iconos.pistola, W - 48, H - 14); escribe(g, '∞', W - 30, H - 16, { fuente: 'gorda', c: '#ffffff', borde: TINTA }); }
  // la misión: el reloj
  if (S.mision) { const s = Math.ceil(S.mision.tiempo / 60), t = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); escribe(g, t, W / 2, 4, { fuente: 'gorda', c: s < 15 && ((S.tick >> 3) & 1) ? ROJO_ROTULO : ORO, borde: TINTA, alin: 'centro' }); }
  // el aviso de arriba (amarillo, como los avisos de misión de entonces)
  if (S.mensaje) {
    const lineas = envuelve(S.mensaje.texto, W - 60);
    const y0 = S.mision ? 18 : 6;
    g.fillStyle = 'rgba(14,16,22,0.75)'; g.fillRect(28, y0 - 2, W - 56, lineas.length * 10 + 4);
    lineas.forEach((l, i) => escribe(g, l, W / 2, y0 + i * 10, { c: '#ffd23c', borde: TINTA, alin: 'centro' }));
  }
  // el rótulo grande del centro
  if (S.rotulo) {
    const col = S.rotulo.color === 'rojo' ? ROJO_ROTULO : S.rotulo.color === 'azul' ? AZUL_ROTULO : ORO;
    const y = S.rotulo.t > 100 ? H / 2 - 20 + (S.rotulo.t - 100) : H / 2 - 20;
    escribe(g, S.rotulo.texto, W / 2, y, { esc: 2, c: col, borde: TINTA, alin: 'centro' });
  }
  if (MANDO.tactil || AJUSTES.mandosPc) pintaMandos(g);
  if (S.oferta) pintaOferta(g);
}

function pintaMandos(g) {
  const j = S.jugadores[0], G = geoMandos(), enCoche = j.coche !== null, k = AJUSTES.mandos || 1;
  // la palanca (donde se puso el dedo)
  if (MANDO.palanca.id !== null) {
    const P = MANDO.palanca, R = 22 * k;
    g.globalAlpha = 0.35; g.fillStyle = '#f4efe6'; g.beginPath(); g.arc(P.x0, P.y0, R, 0, 7); g.fill();
    g.globalAlpha = 0.8; g.beginPath(); g.arc(P.x0 + P.dx * R, P.y0 + P.dy * R, 9 * k, 0, 7); g.fill(); g.globalAlpha = 1;
  } else if (!enCoche || true) { g.globalAlpha = 0.18; g.fillStyle = '#f4efe6'; g.beginPath(); g.arc(34 * k, J.H - 34 * k, 22 * k, 0, 7); g.fill(); g.globalAlpha = 1; }
  const boton = (b, color, texto, on) => {
    g.globalAlpha = on ? 0.9 : 0.55; g.fillStyle = TINTA; g.beginPath(); g.arc(b.x, b.y, b.r + 1.5, 0, 7); g.fill();
    g.fillStyle = color; g.beginPath(); g.arc(b.x, b.y, b.r, 0, 7); g.fill(); g.globalAlpha = 1;
    escribe(g, texto, b.x, b.y - 4, { fuente: 'mini', c: TINTA, borde: null, sombra: null, alin: 'centro' });
  };
  boton(G.entrar, '#f28c28', enCoche ? 'SALIR' : 'ENTRAR', MANDO.pulsados.entrar);
  boton(G.accion, enCoche ? '#55585f' : '#2a8c86', enCoche ? 'FRENO' : 'TIRO', MANDO.pulsados.accion);
  if (enCoche) boton(G.claxon, '#e9c46a', 'PI', MANDO.pulsados.claxon);
  boton(G.pausa, '#d9d4c7', '||', false);
}

// la oferta: la cabina (una misión) o el Templo (guardar pagando)
function pintaOferta(g) {
  const o = S.oferta, W = J.W, H = J.H, w = Math.min(W - 20, 300), x = (W - w) / 2;
  const titulo = o.tipo === 'telefono' ? ZONA_NOMBRE[o.mision.banda] + ' · ' + o.mision.nombre : tr('Templo del Autoguardado');
  const texto = o.tipo === 'telefono' ? o.mision.texto : o.texto;
  const lineas = envuelve(texto, w - 16), h = 34 + lineas.length * 9 + 22, y = (H - h) / 2;
  g.fillStyle = 'rgba(14,16,22,0.92)'; g.fillRect(x, y, w, h);
  g.fillStyle = o.tipo === 'telefono' ? ZONA_COLOR[o.mision.banda] : '#b89a6a'; g.fillRect(x, y, w, 2);
  escribe(g, titulo, x + 8, y + 6, { c: ORO, borde: TINTA });
  lineas.forEach((l, i) => escribe(g, l, x + 8, y + 20 + i * 9, { fuente: 'mini', c: '#f4efe6', borde: null, sombra: TINTA }));
  const puede = o.tipo === 'telefono' || o.puede;
  const b1 = { x: x + 8, y: y + h - 18, w: w / 2 - 12, h: 13 }, b2 = { x: x + w / 2 + 4, y: y + h - 18, w: w / 2 - 12, h: 13 };
  g.fillStyle = puede ? '#f28c28' : '#55585f'; g.fillRect(b1.x, b1.y, b1.w, b1.h);
  g.fillStyle = '#d9d4c7'; g.fillRect(b2.x, b2.y, b2.w, b2.h);
  escribe(g, o.tipo === 'telefono' ? tr('ACEPTAR') : tr('DONAR Y GUARDAR'), b1.x + b1.w / 2, b1.y + 3, { fuente: 'mini', c: TINTA, borde: null, sombra: null, alin: 'centro' });
  escribe(g, o.tipo === 'telefono' ? tr('COLGAR') : tr('IRSE'), b2.x + b2.w / 2, b2.y + 3, { fuente: 'mini', c: TINTA, borde: null, sombra: null, alin: 'centro' });
  o.botones = { si: b1, no: b2 };
}
// qué ha pulsado el jugador en la oferta (toque o tecla)
function pasoOferta() {
  const o = S.oferta, t = MANDO.toque;
  const en = b => t && t.x >= b.x && t.x <= b.x + b.w && t.y >= b.y && t.y <= b.y + b.h;
  if (MANDO.pulso.ok || (o.botones && en(o.botones.si))) { aceptaOferta(); play('select'); }
  else if (MANDO.pulso.atras || (o.botones && en(o.botones.no))) { rechazaOferta(); play('deny'); }
  MANDO.pulso.ok = MANDO.pulso.atras = false;
}

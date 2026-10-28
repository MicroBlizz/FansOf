// Fans of Goose · El dado maldito: cada 15 s cae del cielo, rueda y su cara cambia las reglas un rato.
// Pares, bendición (2 Prisa, 4 Gigante, 6 Doble daño). Impares, maldición (1 Horda doble, 3 Patas de plomo, 5 Controles invertidos durante 5 s).
// La casilla «Dado» hace una Tirada de la suerte: siempre sale par.
'use strict';

const CARAS = {
  1: { nombre: 'HORDA DOBLE', desc: 'El doble de ocas', bueno: false, color: '#ff4d4d' },
  2: { nombre: 'PRISA', desc: 'Corres mucho más', bueno: true, color: '#6bf2ff' },
  3: { nombre: 'PATAS DE PLOMO', desc: 'Vas más lento', bueno: false, color: '#ff8a4d' },
  4: { nombre: 'GIGANTE', desc: 'Armas más grandes', bueno: true, color: '#7dff6b' },
  5: { nombre: 'CONTROLES AL REVÉS', desc: 'Cinco segundos de locura', bueno: false, color: '#c9a0ff' },
  6: { nombre: 'DOBLE DAÑO', desc: '¡Todo pega el doble!', bueno: true, color: '#ffd34d' },
};

function nuevoDado() { return { t: CFG.dado.primero, rodando: 0, cara: 1, efecto: 0, quedan: 0, viento: 0, mostrar: 0 }; }

function tiraDado(soloPares) {
  const D = JUEGO.dado;
  D.rodando = 1.3; D.cara = 0; D.soloPares = !!soloPares;
  SONIDO.dadoRueda();
}
function tiradaSuerte() { aviso(tr('¡TIRADA DE LA SUERTE!'), '#ffe9a8', 1.3); tiraDado(true); }

function avanzaDado(dt) {
  const J = JUEGO, D = J.dado;
  if (J.jefe) { if (D.efecto && D.quedan > 0) D.quedan -= dt; if (D.quedan <= 0) D.efecto = 0; return; }
  if (D.quedan > 0) { D.quedan -= dt; if (D.quedan <= 0) { D.efecto = 0; SONIDO.dadoFin(); } }
  if (D.mostrar > 0) D.mostrar -= dt;
  if (D.rodando > 0) {
    D.rodando -= dt;
    if ((J.cuadro % 4) === 0) SONIDO.dadoTic();
    if (D.rodando <= 0) {
      let c = 1 + ((Math.random() * 6) | 0);
      if (D.soloPares) c = 2 * (1 + ((Math.random() * 3) | 0));
      D.cara = c; D.efecto = c; D.quedan = c === 5 ? CFG.dado.invertido : CFG.dado.dura; D.mostrar = 2.2; D.viento = 0;
      const F = CARAS[c];
      aviso(tr(F.nombre), F.color, 1.8); aviso2(tr(F.desc));
      if (F.bueno) { destella(F.color, 0.35); SONIDO.dadoBueno(c === 6); if (c === 6) { tiembla(5); congela(0.12); anillo(J.yo.x, J.yo.y, 110, '#ffd34d', 0.6, 5); } }
      else { destella('#ff2d2d', 0.3); SONIDO.dadoMalo(); tiembla(3); }
      vibra(F.bueno ? 30 : [40, 30, 40]);
    }
    return;
  }
  D.t -= dt;
  if (D.t <= 0) { D.t = CFG.dado.cada; tiraDado(false); }
}

const invertido = () => JUEGO.dado.efecto === 5 && JUEGO.dado.quedan > 0;
const multiVel = () => (JUEGO.dado.efecto === 2 ? 1.45 : JUEGO.dado.efecto === 3 ? 0.68 : 1);

// el dado en pantalla: grande en el centro mientras rueda, pequeño en su esquina con la cuenta atrás de su efecto
function pintaDado() {
  const J = JUEGO, D = J.dado, W = PAN.W;
  if (D.rodando > 0) {
    const k = 1 - D.rodando / 1.3, y = 120 + Math.abs(Math.sin(k * 9)) * (1 - k) * -40, x = W / 2 + Math.sin(k * 5) * 30 * (1 - k);
    const cara = 1 + ((J.t * 18) | 0) % 6;
    G.globalAlpha = 0.5; G.fillStyle = '#000'; G.beginPath(); G.ellipse(x, 142, 14 * (0.6 + k * 0.4), 4, 0, 0, 6.283); G.fill(); G.globalAlpha = 1;
    pintaGirado('dadogrande' + cara, x, y, k * 14 * (1 - k * 0.7), 1);
    return;
  }
  if (D.mostrar > 0) { const k = Math.min(1, (2.2 - D.mostrar) * 6); pinta('dadogrande' + D.cara, W / 2, 120, false, false, 0.6 + k * 0.4 + Math.sin(J.t * 12) * 0.03 * (D.mostrar > 1.6 ? 1 : 0)); }
  // la esquina: el próximo dado o el efecto en marcha
  const x = W - 16, y = 46;
  if (D.efecto && D.quedan > 0) {
    pinta('dado' + D.efecto, x, y, false, false, 1.3);
    const F = CARAS[D.efecto], k = D.quedan / (D.efecto === 5 ? CFG.dado.invertido : CFG.dado.dura);
    G.strokeStyle = F.color; G.lineWidth = 2; G.beginPath(); G.arc(x, y, 12, -1.57, -1.57 + 6.283 * k); G.stroke();
  } else {
    G.globalAlpha = 0.85; pinta('dado' + (1 + ((J.t * 0.5) | 0) % 6), x, y, false, false, 1.1); G.globalAlpha = 1;
    G.font = '800 6px "Pixelify Sans", system-ui'; G.textAlign = 'center'; G.fillStyle = '#f1e6c8'; G.lineWidth = 2; G.strokeStyle = '#120808';
    const s = Math.ceil(D.t) + 's'; G.strokeText(s, x, y + 12); G.fillText(s, x, y + 12);
  }
}

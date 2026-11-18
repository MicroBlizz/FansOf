// Fans of Spy · ADAPTADORES · Los modelos, dibujados por código con las formas de gl/formas.js (el arte de verdad lo hará Yoshi
// cuando el prototipo guste): CrazyBunny de agente (conejo blanco, traje oscuro, gafas naranjas y la zanahoria en la mano derecha),
// el Becario (robot blanco con ojos de luz, acreditación y su café en la mano derecha), su patinete, la gorra del vigilante, la
// cabeza de una cámara, la caja de mudanza, el café abandonado y las marcas de «!» y «?». Todos miran hacia el norte (−z) y se
// apoyan en el suelo en y = 0. Los brazos y las piernas van aparte, con el origen en su articulación, para poder moverlos al andar.
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
(function (S) {
  const GL = S.gl, M = GL.M, F = S.formas;
  const BLANCO = '#f4f1ea', TRAJE = '#1c2233', NARANJA = '#ff8a2a', ROSA = '#ffb3c1', METAL = '#eef1f5', OSCURO = '#2a3146', NEGRO = '#11131c';
  const hace = (fn) => { const b = F.nueva(); fn(b); return GL.malla(F.datos(b)); };

  // Las dos orejas del conejo (también asoman por arriba de la caja de mudanza).
  function orejas(b, y) {
    for (const lado of [-1, 1]) {
      F.con(b, M.une(M.traslada(lado * 0.09, y, 0), M.rotaZ(-lado * 0.2), M.rotaX(0.1)), () => {
        F.esfera(b, { x: 0, y: 0.17, z: 0, rx: 0.055, ry: 0.19, rz: 0.04, color: BLANCO, lados: 8, pisos: 6 });
        F.caja(b, { x: 0, y: 0.05, z: -0.036, sx: 0.045, sy: 0.22, sz: 0.012, color: ROSA });
      });
    }
  }

  function agente() {
    const cuerpo = hace((b) => {
      F.esfera(b, { x: 0, y: 0.37, z: 0, rx: 0.17, ry: 0.19, rz: 0.15, color: TRAJE });
      F.cilindro(b, { x: 0, y: 0.26, z: 0, r: 0.168, r2: 0.172, h: 0.04, color: NARANJA });
      F.esfera(b, { x: 0, y: 0.67, z: 0, rx: 0.215, ry: 0.2, rz: 0.2, color: BLANCO });
      F.esfera(b, { x: 0, y: 0.62, z: -0.17, r: 0.075, color: BLANCO, lados: 8, pisos: 5 });
      F.esfera(b, { x: 0, y: 0.635, z: -0.24, r: 0.025, color: '#ff8fa3', lados: 6, pisos: 4 });
      F.cilindro(b, { x: 0, y: 0.655, z: 0, r: 0.213, h: 0.045, color: NEGRO });
      F.caja(b, { x: 0, y: 0.635, z: -0.168, sx: 0.33, sy: 0.085, sz: 0.1, color: '#ff7a1a', emi: 0.6 });
      F.esfera(b, { x: 0, y: 0.3, z: 0.165, r: 0.075, color: BLANCO, lados: 8, pisos: 5 });
      orejas(b, 0.82);
    });
    const brazo = (derecho) => hace((b) => {
      F.esfera(b, { x: 0, y: -0.1, z: 0, rx: 0.05, ry: 0.11, rz: 0.05, color: TRAJE, lados: 8, pisos: 5 });
      F.esfera(b, { x: 0, y: -0.21, z: 0, r: 0.05, color: BLANCO, lados: 8, pisos: 5 });
      if (!derecho) return;
      F.con(b, M.une(M.traslada(0, -0.21, -0.03), M.rotaX(-1.15)), () => {
        F.cilindro(b, { x: 0, y: 0, z: 0, r: 0.045, r2: 0, h: 0.24, color: NARANJA, lados: 8 });
        F.caja(b, { x: 0, y: -0.06, z: 0, sx: 0.07, sy: 0.07, sz: 0.025, color: '#3ddc84' });
      });
    });
    const pierna = () => hace((b) => {
      F.esfera(b, { x: 0, y: -0.08, z: 0, rx: 0.06, ry: 0.09, rz: 0.06, color: TRAJE, lados: 8, pisos: 5 });
      F.esfera(b, { x: 0, y: -0.165, z: -0.03, rx: 0.062, ry: 0.04, rz: 0.1, color: BLANCO, lados: 8, pisos: 5 });
    });
    return { cuerpo, brazoI: brazo(false), brazoD: brazo(true), pierna: pierna(), hombro: [0.2, 0.47], cadera: [0.085, 0.2] };
  }

  function becario() {
    const cuerpo = hace((b) => {
      F.cilindro(b, { x: 0, y: 0.2, z: 0, r: 0.16, r2: 0.13, h: 0.27, color: METAL });
      F.caja(b, { x: 0, y: 0.27, z: -0.135, sx: 0.14, sy: 0.1, sz: 0.03, color: '#1f6fd6', emi: 0.45 });
      F.caja(b, { x: 0.075, y: 0.3, z: -0.152, sx: 0.05, sy: 0.07, sz: 0.012, color: NARANJA });
      F.cilindro(b, { x: 0, y: 0.47, z: 0, r: 0.05, h: 0.04, color: OSCURO, lados: 8 });
      F.caja(b, { x: 0, y: 0.5, z: 0, sx: 0.36, sy: 0.27, sz: 0.3, color: METAL, arriba: [0.92, 0.92] });
      F.caja(b, { x: 0, y: 0.555, z: -0.142, sx: 0.3, sy: 0.14, sz: 0.04, color: '#0c1020' });
      F.cilindro(b, { x: 0, y: 0.77, z: 0, r: 0.012, h: 0.1, color: OSCURO, lados: 6 });
      // el brazo derecho, doblado hacia delante, con su taza de café (siempre en la mano derecha)
      F.con(b, M.une(M.traslada(0.2, 0.42, 0), M.rotaX(1.1)), () => F.cilindro(b, { x: 0, y: -0.2, z: 0, r: 0.035, h: 0.2, color: METAL, lados: 8 }));
      F.cilindro(b, { x: 0.2, y: 0.31, z: -0.2, r: 0.05, r2: 0.062, h: 0.11, color: BLANCO, lados: 10 });
      F.cilindro(b, { x: 0.2, y: 0.42, z: -0.2, r: 0.052, h: 0.012, color: '#6b3f1d', lados: 10 });
    });
    const ojos = hace((b) => {
      for (const lado of [-1, 1]) F.caja(b, { x: lado * 0.075, y: 0.595, z: -0.166, sx: 0.07, sy: 0.062, sz: 0.02, color: '#ffffff', emi: 1 });
      F.esfera(b, { x: 0, y: 0.9, z: 0, r: 0.042, color: '#ffffff', emi: 1, lados: 8, pisos: 5 });
    });
    const brazoI = hace((b) => {
      F.cilindro(b, { x: 0, y: -0.2, z: 0, r: 0.035, h: 0.2, color: METAL, lados: 8 });
      F.esfera(b, { x: 0, y: -0.21, z: 0, r: 0.045, color: OSCURO, lados: 8, pisos: 5 });
    });
    const pierna = hace((b) => {
      F.cilindro(b, { x: 0, y: -0.17, z: 0, r: 0.045, h: 0.17, color: OSCURO, lados: 8 });
      F.caja(b, { x: 0, y: -0.2, z: -0.02, sx: 0.1, sy: 0.045, sz: 0.16, color: OSCURO });
    });
    const patinete = hace((b) => {
      F.caja(b, { x: 0, y: 0.045, z: 0.02, sx: 0.16, sy: 0.03, sz: 0.56, color: NARANJA });
      for (const z of [-0.24, 0.28]) F.con(b, M.une(M.traslada(0, 0.045, z), M.rotaZ(Math.PI / 2)), () => F.cilindro(b, { x: 0, y: -0.025, z: 0, r: 0.045, h: 0.05, color: NEGRO, lados: 10 }));
      F.cilindro(b, { x: 0, y: 0.06, z: -0.24, r: 0.016, h: 0.6, color: '#c9d4f5', lados: 6 });
      F.con(b, M.une(M.traslada(0, 0.66, -0.24), M.rotaZ(Math.PI / 2)), () => F.cilindro(b, { x: 0, y: -0.16, z: 0, r: 0.016, h: 0.32, color: OSCURO, lados: 6 }));
    });
    const gorra = hace((b) => {
      F.caja(b, { x: 0, y: 0.765, z: 0, sx: 0.37, sy: 0.075, sz: 0.31, color: '#1b2a5c' });
      F.caja(b, { x: 0, y: 0.765, z: -0.2, sx: 0.3, sy: 0.02, sz: 0.11, color: '#1b2a5c' });
      F.caja(b, { x: 0, y: 0.785, z: -0.16, sx: 0.07, sy: 0.04, sz: 0.012, color: '#ffd23f', emi: 0.6 });
    });
    return { cuerpo, ojos, brazoI, pierna, patinete, gorra, hombro: [0.2, 0.42], cadera: [0.07, 0.2] };
  }

  // La cabeza de una cámara de vigilancia, con el origen en su enganche: mira hacia −z y un poco hacia abajo.
  const camara = () => hace((b) => {
    F.con(b, M.rotaX(-0.42), () => {
      F.caja(b, { x: 0, y: -0.075, z: -0.06, sx: 0.17, sy: 0.14, sz: 0.34, color: METAL });
      F.caja(b, { x: 0, y: -0.05, z: -0.24, sx: 0.1, sy: 0.09, sz: 0.03, color: '#0c1020' });
      F.caja(b, { x: 0.055, y: 0.03, z: -0.232, sx: 0.03, sy: 0.03, sz: 0.012, color: '#ff3b3b', emi: 1 });
    });
  });

  // La caja de mudanza (el agente va dentro) y, aparte, las orejas que le asoman por arriba.
  const caja = () => hace((b) => {
    F.caja(b, { x: 0, y: 0, z: 0, sx: 0.64, sy: 0.6, sz: 0.64, color: '#c9935a' });
    F.caja(b, { x: 0, y: 0.6, z: 0, sx: 0.13, sy: 0.006, sz: 0.65, color: '#ecd2a6' });
    F.caja(b, { x: 0, y: 0.25, z: 0.322, sx: 0.3, sy: 0.16, sz: 0.01, color: '#f4f1ea' });
    F.caja(b, { x: 0, y: 0.3, z: 0.33, sx: 0.2, sy: 0.03, sz: 0.01, color: '#d8343a' });
  });
  const cafe = () => hace((b) => {
    F.cilindro(b, { x: 0, y: 0, z: 0, r: 0.07, r2: 0.095, h: 0.17, color: BLANCO, lados: 10 });
    F.cilindro(b, { x: 0, y: 0.17, z: 0, r: 0.1, h: 0.02, color: '#6b3f1d', lados: 10 });
    F.caja(b, { x: 0, y: 0.06, z: -0.09, sx: 0.08, sy: 0.05, sz: 0.01, color: NARANJA });
  });
  // Las marcas que salen encima de un guardia: «!» (alerta) y «?» (sospecha). Blancas: el color lo pone el tinte.
  const exclama = () => hace((b) => {
    F.caja(b, { x: 0, y: 0.1, z: 0, sx: 0.09, sy: 0.24, sz: 0.09, color: '#ffffff', emi: 1, arriba: [1.25, 1.25] });
    F.caja(b, { x: 0, y: 0, z: 0, sx: 0.09, sy: 0.07, sz: 0.09, color: '#ffffff', emi: 1 });
  });
  const duda = () => hace((b) => {
    F.caja(b, { x: 0, y: 0.28, z: 0, sx: 0.2, sy: 0.06, sz: 0.07, color: '#ffffff', emi: 1 });
    F.caja(b, { x: 0.07, y: 0.19, z: 0, sx: 0.06, sy: 0.1, sz: 0.07, color: '#ffffff', emi: 1 });
    F.caja(b, { x: 0.03, y: 0.14, z: 0, sx: 0.13, sy: 0.06, sz: 0.07, color: '#ffffff', emi: 1 });
    F.caja(b, { x: 0, y: 0.09, z: 0, sx: 0.06, sy: 0.06, sz: 0.07, color: '#ffffff', emi: 1 });
    F.caja(b, { x: 0, y: 0, z: 0, sx: 0.06, sy: 0.06, sz: 0.07, color: '#ffffff', emi: 1 });
  });

  // Se hacen una vez, al arrancar (necesitan WebGL ya iniciado).
  S.modelos = { crear() { Object.assign(S.modelos, { agente: agente(), becario: becario(), camara: camara(), caja: caja(), cafe: cafe(), exclama: exclama(), duda: duda(), orejas: hace((b) => orejas(b, 0)),
    pelota: hace((b) => F.esfera(b, { x: 0, y: 0, z: 0, r: 0.08, color: '#ffd23f', emi: 1, lados: 8, pisos: 5 })) }); } };
})(SPY);

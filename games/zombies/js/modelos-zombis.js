// Fans of Zombies · LOS MODELOS DE LOS FANS ZOMBIFICADOS (pantalla): cajas low-poly como los de Ratkov (js/modelos.js), con los brazos
// estirados hacia ti. Uno por tipo de js/ajustes.js (zombis): fan, streamer (cascos y micro), speedrunner (cinta y cronómetro),
// ballena (enorme, de oro), bot (gris, con antena) y troll (con su maza). Se montan con montaPersonaje('z_' + tipo, false).
'use strict';
const ZB_PIEL = 0x9fb08a, ZB_PIEL2 = 0x7e9070;
function zbCuerpo(o, op) {
  const k = en(o, [0, 0, 0]), piel = op.piel || ZB_PIEL;
  k(0.6 * (op.ancho || 1), 0.66, 0.42, op.sudadera, 0, 0.92, 0, 0.12);          // la sudadera, algo encorvada hacia delante
  if (op.logo) k(0.22, 0.2, 0.02, op.logo, 0, 1.0, 0.24);
  k(0.18, 0.12, 0.02, 0x7a1a1a, 0.14, 0.8, 0.23);                                // una mancha
  for (const s of [-1, 1]) {                                                     // los brazos estirados hacia ti
    k(0.2, 0.62, 0.22, op.sudadera, s * 0.4 * (op.ancho || 1), 1.12, 0.3, Math.PI / 2 - 0.15 + s * 0.08);
    k(0.17, 0.18, 0.2, piel, s * 0.4 * (op.ancho || 1), 1.18, 0.68);
  }
  const c = en(o, [0, 1.56, 0.08]);
  c(0.56, 0.54, 0.52, piel, 0, 0, 0);
  c(0.6, 0.16, 0.56, op.pelo || 0x3a2e28, 0, 0.27, -0.02);
  c(0.13, 0.11, 0.04, 0xf4f0c8, -0.13, 0.04, 0.27); c(0.06, 0.06, 0.05, 0xc02020, -0.13, 0.04, 0.28);
  c(0.13, 0.11, 0.04, op.ojo2 || 0xf4f0c8, 0.13, 0.04, 0.27); c(0.06, 0.06, 0.05, op.pupila || 0xc02020, 0.13, 0.04, 0.28);
  c(0.28, 0.08, 0.04, 0x3a0a10, 0, -0.15, 0.27); c(0.06, 0.08, 0.04, 0xe8e4d0, 0.05, -0.12, 0.28);
  return c;
}
ENEMIGO_MODELO.z_fan = o => { zbCuerpo(o, { sudadera: 0x34548a, logo: 0x58c8ff }); return { pantalon: 0x2e3440 }; };
ENEMIGO_MODELO.z_streamer = o => {
  const c = zbCuerpo(o, { sudadera: 0x6a3a9a, logo: 0xff4b5c, pelo: 0x2a8a8a });
  c(0.66, 0.08, 0.1, NEGRO_C, 0, 0.3, 0); for (const s of [-1, 1]) c(0.1, 0.22, 0.22, NEGRO_C, s * 0.31, 0.02, 0);
  c(0.04, 0.04, 0.3, NEGRO_C, -0.3, -0.1, 0.16, 0, -0.5); c(0.08, 0.08, 0.08, 0xff4b5c, -0.22, -0.14, 0.32);
  return { pantalon: 0x22222a };
};
ENEMIGO_MODELO.z_speedrunner = o => {
  const c = zbCuerpo(o, { sudadera: 0xd84a3a, ancho: 0.85, pelo: 0xf9c531 });
  en(o, [0, 0, 0])(0.16, 0.16, 0.04, 0xf4f4f4, 0, 1.05, 0.25); c(0.62, 0.08, 0.58, 0xffffff, 0, 0.18, 0);
  return { pantalon: 0x1a1a22 };
};
ENEMIGO_MODELO.z_ballena = o => {
  zbCuerpo(o, { sudadera: 0xc8a030, ancho: 1.35, logo: 0xfff0a0, pelo: 0xe8e8e8 });
  const k = en(o, [0, 0, 0]); for (let i = 0; i < 5; i++) k(0.1, 0.08, 0.04, 0xffd84a, -0.24 + i * 0.12, 1.22 - Math.abs(i - 2) * 0.05, 0.25);
  k(0.32, 0.2, 0.1, 0x3a2a20, 0.46, 0.7, 0.1); k(0.2, 0.06, 0.12, 0x5ac85a, 0.46, 0.82, 0.1);
  return { pantalon: 0x3a3020, escala: 1.95, piernaAncha: true };
};
ENEMIGO_MODELO.z_bot = o => {
  const c = zbCuerpo(o, { sudadera: 0x8a8f99, piel: 0xb8bcc4, pelo: 0x6a6e78, ojo2: 0x39d5e8, pupila: 0x39d5e8 });
  c(0.04, 0.36, 0.04, NEGRO_C, 0.16, 0.44, 0); c(0.1, 0.1, 0.1, 0x39d5e8, 0.16, 0.64, 0);
  return { pantalon: 0x5a5e68 };
};
ENEMIGO_MODELO.z_troll = o => {
  const c = zbCuerpo(o, { sudadera: 0x4a6a3a, piel: ZB_PIEL2, pelo: 0x8a2a2a });
  c(0.16, 0.2, 0.18, ZB_PIEL2, 0, -0.04, 0.32);                                  // la nariz
  const k = en(o, [0, 0, 0]); k(0.12, 1.1, 0.12, 0x6a4a2a, 0.5, 1.2, 0.86, 0.6); k(0.3, 0.26, 0.3, 0x5a5e68, 0.5, 1.5, 1.3, 0.6);
  return { pantalon: 0x3a3e30, escala: 1.65 };
};
// EL CEO: traje caro, corbata, gafas de sol, maletín de monedas y una corona de diapositivas. Grande (el jefe de la torre)
ENEMIGO_MODELO.z_ceo = o => {
  const c = zbCuerpo(o, { sudadera: 0x1a1e2a, ancho: 1.2, piel: 0x8aa080, pelo: 0xd8d8d8 });
  const k = en(o, [0, 0, 0]);
  k(0.14, 0.5, 0.03, 0xc8282e, 0, 1.0, 0.24); k(0.62, 0.1, 0.46, 0xe8e4dc, 0, 1.22, 0.02);
  c(0.5, 0.1, 0.05, NEGRO_C, 0, 0.06, 0.28);
  k(0.6, 0.45, 0.18, 0x3a2a20, -0.55, 0.75, 0.2); k(0.3, 0.12, 0.2, 0xf9c531, -0.55, 1.0, 0.2);
  for (let i = 0; i < 5; i++) c(0.14, 0.2, 0.04, [0x58c8ff, 0xf9c531, 0xff4b5c][i % 3], -0.28 + i * 0.14, 0.44, 0, 0, 0, (i - 2) * 0.15);
  return { pantalon: 0x1a1e2a, escala: 2.7, piernaAncha: true };
};

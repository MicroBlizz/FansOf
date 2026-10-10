// Boceto 3D de Fans of Rumble · Lo especial de cada unidad (lo usa partida.js):
// - CrazyBunny: el Salto del CAOS, cae sobre el grupo enemigo más grande.
// - MeerCat: la curandera, va detrás de los suyos y cura al que más lo necesita.
// - MechaVaca: cuando el mecha revienta, la vaca sale y sigue peleando.
// - SurvivalBot (el jefe): golpes en área y «congelar», que deja quietas a tus unidades unos segundos.
'use strict';
import { SFX } from './voces.js';
import { FRASES } from './textos.js';

const elige = l => l[(Math.random() * l.length) | 0];
export const blanco = v => !v.quitado && v.estado !== 'cae' && v.estado !== 'muere';

/* ---------- CrazyBunny ---------- */
export function probarSalto(p, u) {
  let mejor = null, cuantos = 1;
  for (const v of p.unidades) {
    if (v.lado === u.lado || !blanco(v)) continue;
    const d = Math.hypot(v.x - u.x, v.z - u.z);
    if (d > 13 || d < 2.5) continue;
    let n = 0;
    for (const w of p.unidades) if (w.lado !== u.lado && blanco(w) && Math.hypot(w.x - v.x, w.z - v.z) < 4) n += w.tipo === 'survivalbot' ? 3 : 1;
    if (n > cuantos) { cuantos = n; mejor = v; }
  }
  if (!mejor) { u.saltoCd = 1; return false; }
  u.estado = 'salto'; u.estadoT = 0; u.saltoDura = 0.95; u.saltoCd = 8; u.ataque = -1;
  u.desde = [u.x, u.z]; u.hasta = [mejor.x, mejor.z];
  u.yaw = Math.atan2(mejor.x - u.x, mejor.z - u.z);
  p.hablar(u, elige(FRASES.bunny.salto));
  SFX.salto();
  p.fx.polvo(u.x, u.z, 6, 0xe6d6b0, 1.2);
  p.evento('salto', u);
  return true;
}
export function saltar(p, u) {
  const k = Math.min(1, u.estadoT / u.saltoDura);
  u.x = u.desde[0] + (u.hasta[0] - u.desde[0]) * k; u.z = u.desde[1] + (u.hasta[1] - u.desde[1]) * k;
  u.y = 4 * 6.5 * k * (1 - k) + p.suelo(u.x, u.z);
  u.mueve = 0;
  if (k < 1) return;
  u.estado = 'anda'; u.estadoT = 0; u.aplasta = 0.3; u.y = p.suelo(u.x, u.z);
  p.fx.anilloSuelo(u.x, u.z, 6, 0xff7a1a, 0.5); p.fx.anilloSuelo(u.x, u.z, 3.5, 0xffffff, 0.3);
  p.fx.polvo(u.x, u.z, 14, 0xe6d6b0, 1.8); p.fx.chispas(u.x, 1, u.z, 10, 0xffcb3d);
  p.fx.temblor(0.5); SFX.explosion(false); SFX.aterriza(true);
  for (const v of p.unidades) if (v.lado !== u.lado && blanco(v) && Math.hypot(v.x - u.x, v.z - u.z) < 4.5) p.herir(v, 60, u);
}

/* ---------- MeerCat: a quién seguir y a quién curar ---------- */
// devuelve el sitio al que ir, o null si no hay nadie de los suyos (entonces hace lo normal: pegar)
export function curandera(p, u, dt) {
  let herido = null, peor = 1, cerca = null, dc = 99;
  for (const v of p.unidades) {
    if (v === u || v.lado !== u.lado || !blanco(v) || v.tipo === 'meercat') continue;
    const d = Math.hypot(v.x - u.x, v.z - u.z), f = v.vida / v.max;
    if (d < 11 && f < 0.92 && f < peor) { peor = f; herido = v; }
    if (d < dc) { dc = d; cerca = v; }
  }
  u.curaCd -= dt;
  const v = herido || cerca;
  if (!v) return null;
  const d = Math.hypot(v.x - u.x, v.z - u.z);
  if (herido && d < u.d.curaAlcance && u.curaCd <= 0) {
    u.curaCd = u.d.curaCada;
    const cura = Math.min(u.d.cura, herido.max - herido.vida);
    herido.vida += cura;
    p.fx.numero(herido.x, herido.y + herido.def.alto * 0.9, herido.z, '+' + Math.round(cura), false, true);
    p.fx.chispas(herido.x, herido.y + herido.def.alto * 0.6, herido.z, 6, 0x7be04a);
    p.fx.anilloSuelo(herido.x, herido.z, 2.2, 0x7be04a, 0.4);
    u.ataque = 0;   // levanta el bastón
    SFX.cura();
    p.evento('cura', u);
  }
  // se queda un poco por detrás de a quien sigue (hacia su propio lado del campo)
  const atras = u.lado === 'p' ? 2.6 : -2.6;
  return [v.x, v.z + atras, d];
}

/* ---------- MechaVaca: la vaca sale del mecha ---------- */
export function expulsarVaca(p, u) {
  const vaca = p.soltar('vaca', u.x, u.z, u.lado, 0.1, false, { sinAnillo: true });
  if (!vaca) return;
  vaca.vy = 22; vaca.y = 2.5;   // sale disparada hacia arriba
  p.fx.explosion(u.x, 1.5, u.z, false); p.fx.trozos(u.x, 2, u.z, [0xff8fc8, 0xb84f86, 0x3b3d47], 12);
  p.fx.temblor(0.35); SFX.expulsa();
  p.hablar(vaca, '¡Muuu! ¡Aún no he terminado!', true);
  p.evento('vaca', vaca);
}

/* ---------- SurvivalBot: golpe en área y congelar ---------- */
export function jefe(p, u, dt) {
  u.congelaCd -= dt;
  if (u.congelaCd > 0 || u.estado !== 'anda') return;
  const cerca = p.unidades.filter(v => v.lado !== u.lado && blanco(v) && Math.hypot(v.x - u.x, v.z - u.z) < 8);
  if (cerca.length < 2) return;
  u.congelaCd = 9;
  for (const v of cerca) { v.congelado = 2.6; v.ataque = -1; }
  p.fx.anilloSuelo(u.x, u.z, 8, 0x7df3ff, 0.7); p.fx.anilloSuelo(u.x, u.z, 5, 0xffffff, 0.5);
  p.fx.chispas(u.x, 3, u.z, 14, 0xbff6ff); p.fx.temblor(0.3);
  SFX.congela();
  p.hablar(u, elige(FRASES.survivalbot.congela), true);
  p.evento('congela', u);
}
export function golpeJefe(p, u, o) {
  // pega a todo lo que hay alrededor de su objetivo
  const cx = o.x, cz = o.z;
  for (const v of p.unidades) if (v !== o && v.lado !== u.lado && blanco(v) && Math.hypot(v.x - cx, v.z - cz) < 3.2) p.herir(v, u.d.dano * 0.6, u);
  p.fx.anilloSuelo(cx, cz, 3.4, 0xff4b5c, 0.35); p.fx.polvo(cx, cz, 8, 0xe6d6b0, 1.4); p.fx.temblor(0.25);
  SFX.aterriza(true);
}

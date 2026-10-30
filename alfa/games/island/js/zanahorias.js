// Fans of Island · ZANAHORIAS DE PODER: qué tipos hay, cómo se recogen y el tiempo de cada transformación. Lo que hace cada poder está en
// poderes.js; las cifras (duración, alcance) aquí, en IS_ZANAHORIAS. Un personaje lleva como mucho un poder; al coger otra zanahoria lo cambia.
'use strict';
const IS_ZANAHORIAS = {
  dorada: { nombre: 'Zanahoria dorada', poder: 'escudo', tiempo: 20, color: '#ffcb3d', hoja: '#6fbf5a', texto: 'ESCUDO: un escudo de hilo aguanta un golpe de un becario. Si llevas a tu compañero encima, él también va protegido.' },
  roja: { nombre: 'Zanahoria roja', poder: 'fuego', tiempo: 14, color: '#ff5a3c', hoja: '#6fbf5a', texto: 'FUEGO: quema las barreras de hilo al tocarlas.' },
  verde: { nombre: 'Zanahoria verde', poder: 'brote', tiempo: 16, color: '#8fd36a', hoja: '#3f8f3a', texto: 'BROTE: en suelo de plastelina, el botón de acción hace crecer una planta que te sube.' },
  azul: { nombre: 'Zanahoria azul', poder: 'agua', tiempo: 14, color: '#5fb8ff', hoja: '#4fa06a', texto: 'AGUA: mantén la acción y rocías agua: disuelve las manchas de pintura y, sobre un compañero con FUEGO, hace vapor que os sube a los dos.' },
  morada: { nombre: 'Zanahoria morada', poder: 'iman', tiempo: 14, color: '#b57bff', hoja: '#5fbf6a', texto: 'IMÁN: mantén el botón de acción y tu compañero vuela hacia ti.' },
};
const isHumano = p => IS_P.humanos === 2 || p === IS_P.jugadores[0];   // el aliado de IA no se come las zanahorias: las decide la persona
function isCargaZanahorias(N) { return (N.zanahorias || []).map((z, i) => ({ ...z, id: i, w: 14, h: 20, cogida: false, fase: i * 1.3, reaparece: 0 })); }
function isZanahoriasActualiza(m, jugadores, dt) {
  for (const z of m.zanahorias) {
    if (z.cogida) { z.reaparece -= dt; if (z.reaparece <= 0) z.cogida = false; continue; }
    for (const p of jugadores) if (p.estado === 'normal' && !p.llevadoPor && isHumano(p) && isSolapa(p, z)) { isComeZanahoria(p, z); break; }
  }
}
function isComeZanahoria(p, z) {
  const Z = IS_ZANAHORIAS[z.t]; if (!Z) return;
  z.cogida = true; z.reaparece = 12;
  if (p.poder && p.poder.tipo !== Z.poder) isPoderFin(p);
  p.poder = { tipo: Z.poder, zanahoria: z.t, resto: Z.tiempo, total: Z.tiempo, t: 0 };
  p.anim.squash = 0.35; play('carrot');
  isAvisoPoder(Z);
}
function isPoderActualiza(p, inp, dt, m) {
  if (!p.poder) return;
  p.poder.resto -= dt; p.poder.t += dt;
  if (p.poder.resto <= 0) { isPoderFin(p); return; }
  const fn = IS_PODERES[p.poder.tipo]; if (fn) fn(p, inp, dt, m);
}
function isPoderFin(p) { if (p.poder) { const fn = IS_PODERES_FIN[p.poder.tipo]; if (fn) fn(p); p.poder = null; play('poof'); } }
function isAvisoPoder(Z) { IS_P.aviso = 4; IS_P.avisoTexto = tr(Z.texto); }
// Las ZANAHORIAS PEQUEÑAS: las de coleccionar, sin poder. En el nivel van en filas: {x, y, n, dx, dy} pone n seguidas desde (x, y) separadas
// dx, dy (por defecto 14 y 0); una sola es {x, y}. Las coge cualquiera de los dos; el marcador va en IS_P.cosecha / IS_P.cosechaTotal.
function isCargaPequenas(N) {
  const out = [];
  for (const f of N.pequenas || []) { const n = f.n || 1, dx = f.dx === undefined ? 14 : f.dx, dy = f.dy || 0; for (let i = 0; i < n; i++) out.push({ x: f.x + dx * i, y: f.y + dy * i, w: 8, h: 10, cogida: false, fase: out.length * 0.9 }); }
  return out;
}
function isPequenasActualiza(m, jugadores, dt) {
  for (const z of m.pequenas) {
    if (z.cogida) continue;
    for (const p of jugadores) if (p.estado === 'normal' && isSolapa(p, z)) {
      z.cogida = true; IS_P.cosecha++; play('blip');
      if (IS_P.cosecha === IS_P.cosechaTotal) { IS_P.aviso = 3; IS_P.avisoTexto = tr('¡Todas las zanahorias! Ahora, a la bandera.'); play('heal'); }
      break;
    }
  }
}

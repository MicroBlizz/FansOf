// Fans of Rouflage (prototipo) · EL CAMALEÓN BOT: tus compañeros cuando te escondes y tus presas cuando buscas. Cada uno elige un
// sitio, va hasta él, se pinta con más o menos maña y se congela. Si le aprietan mucho se pone nervioso: tiembla, suda y, los más
// torpes, salen corriendo a otro sitio (con la pintura del anterior, así que cantan más).
'use strict';

function cerebroCamaleon(e, mana) { e.bot = { estado: 'ir', mana, t: 0, camino: null, i: 0, atasco: 0, ax: e.x, ay: e.y, nervios: 0, huidas: 0, tPinta: 0 }; }
// dónde esconderse: lejos de los demás y, una de cada tres veces, pegado a una pared (pintado como el papel)
function eligeSitio(e, ocupados) {
  const salas = SALAS.filter(z => z.id !== 'rrhh');
  for (let n = 0; n < 30; n++) { const p = sitioLibre({ sala: pick(salas), lejosDe: ocupados, min: 130, pared: Math.random() < 0.32, intentos: 40 }); if (p) return p; }
  return sitioLibre({ lejosDe: ocupados, min: 60 }) || [e.x, e.y];
}
// sin andar: aparece en su sitio, ya pintado y congelado
function escondeYa(e) {
  if (e.sitio) { e.x = e.sitio[0]; e.y = e.sitio[1]; }
  e.vx = e.vy = 0; if (!e.pintado) { pintaBot(e, e.bot.mana); e.pintado = true; }
  congela(e); e.hielo = 1; e.bot.estado = 'quieto';
}
function huye(e) {
  const b = e.bot, p = sitioLibre({ lejosDe: J.cazadores.filter(h => !h.fuera).map(h => [h.x, h.y]), min: 280, intentos: 200 });
  if (!p) return;
  descongela(e); e.sitio = p; b.huidas++; b.nervios = 0; e.prisa = 1.06;
  if (ponRumbo(e, p[0], p[1])) { b.estado = 'huir'; fxTexto(e.x, e.y - 70, tr('¡Ay!'), '#fff6ea'); play('pop'); } else congela(e);
}

function piensaCamaleon(e, dt) {
  const b = e.bot; b.t += dt; if (e.fuera) return;
  switch (b.estado) {
    case 'ir':          // camino de su escondite
      if (!b.camino && !ponRumbo(e, e.sitio[0], e.sitio[1])) { escondeYa(e); break; }
      if (sigueCamino(e, dt)) { e.x = e.sitio[0]; e.y = e.sitio[1]; b.estado = 'pintar'; b.t = 0; b.tPinta = rand(1.8, 4); }
      break;
    case 'pintar':      // un rato salpicando pintura y luego, de golpe, pintado y congelado
      e.vx = e.vy = 0;
      if (Math.random() < dt * 10) fxGota(e.x + rand(-16, 16), e.y - rand(6, 46), cuentagotas(e.x + rand(-20, 20), e.y - rand(0, 50)));
      if (b.t > b.tPinta) { pintaBot(e, b.mana); e.pintado = true; congela(e); b.estado = 'quieto'; }
      break;
    case 'quieto': {
      const h = J.yo && J.yo.clase === 'cazador' ? J.yo : null;
      if (h) {            // contra ti: si le tienes un rato en la luz y cerca, se le nota
        const d = J.fase === 'caza' ? veCazador(h, e.x, e.y - 8) : 0;
        if (d && d < 100) {
          b.nervios += dt * (0.2 + (1 - b.mana) * 0.42);
          if (b.nervios > 0.4 && Math.random() < dt * 2.4) { e.tiembla = 0.24; fxSudor(e); }
          if (b.nervios >= 1 && b.huidas < 1 && b.mana < 0.7) huye(e);
        } else b.nervios = Math.max(0, b.nervios - dt * 0.25);
      } else {            // contra los becarios bot: si uno está a punto de pillarle, a veces sale corriendo
        let s = 0; for (const c of J.cazadores) if (c.bot && !c.fuera) s = Math.max(s, c.bot.sosp.get(e) || 0);
        if (s > 0.72 && b.huidas < 1 && Math.random() < dt * 1.6 * (1 - b.mana)) huye(e);
      }
      break;
    }
    case 'huir':
      if (sigueCamino(e, dt)) { e.prisa = 1; congela(e); b.estado = 'quieto'; }
      break;
    case 'pasea':       // en la pantalla de título: paseos sin prisa por la cafetería
      if (b.espera > 0) { b.espera -= dt; e.vx = e.vy = 0; break; }
      if (!b.camino) { const p = sitioLibre({ sala: zona('cafeteria'), intentos: 30 }); if (p) ponRumbo(e, p[0], p[1]); break; }
      e.prisa = 0.55; if (sigueCamino(e, dt)) { b.camino = null; b.espera = rand(0.6, 2.6); }
      break;
  }
}

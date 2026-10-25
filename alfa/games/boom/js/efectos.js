// Fans of Boom · EFECTOS: lo que solo es adorno de la partida. Explosiones, chispas, textos que suben, temblor de pantalla, y los sonidos
// que van con los sucesos de PARTIDA. Nada de esto cambia el resultado de la partida (la simulación no lo mira).
'use strict';
const EFECTOS = (() => {
  const FX = { bolas: [], chispas: [], textos: [], temblor: 0, cartel: null };
  const color = m => BOOM.equipos[m.equipo].color;
  function reinicia() { FX.bolas.length = FX.chispas.length = FX.textos.length = 0; FX.temblor = 0; FX.cartel = null; }
  function boom(x, y, r, tono, forma) {
    const ex = PROYECTIL_FORMAS.explosion[forma];
    FX.bolas.push({ x, y, r, t: 0, dur: 0.55, a: ex && ex[0], b: ex && ex[1] }); if (ex && !tono) tono = ex[2];
    for (let i = 0; i < 18 + r / 4; i++) {
      const a = Math.random() * 6.2832, v = 80 + Math.random() * 320;
      FX.chispas.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, t: 0, dur: 0.5 + Math.random() * 0.7, c: Array.isArray(tono) ? tono[Math.random() < 0.5 ? 0 : 1] : tono || (Math.random() < 0.5 ? '#ffcb3d' : '#ff7a1a'), s: 2 + Math.random() * 4 });
    }
    FX.temblor = Math.max(FX.temblor, Math.min(14, 3 + r / 8));
  }
  function texto(s, x, y, c, tam, dur) { FX.textos.push({ s, x, y, c: c || '#fff', tam: tam || 22, t: 0, dur: dur || 1.3 }); }

  // los sucesos de la partida -> efectos y sonidos
  function procesa(sucesos) {
    for (const s of sucesos) {
      if (s.t === 'disparo') { play('gun'); play('boom', 0.4); }
      else if (s.t === 'explosion') { boom(s.x, s.y, s.r, null, s.forma); play('boom'); }
      else if (s.t === 'fuera') { texto(tr('Fuera'), clamp(s.x, 40, BOOM.mundo.ancho - 40), clamp(s.y, 30, BOOM.mundo.alto - 40), '#cdb9ea', 22); play('womp'); }
      else if (s.t === 'dano') texto('-' + s.n, s.m.x, s.m.y - 60, s.bono ? '#ffcb3d' : '#ff4b5c', s.bono ? 34 : 26, 1.5);
      else if (s.t === 'bono') {
        play('levelup'); FX.cartel = { s: tr(s.bono === 'cielo' ? BOOM.altura.cieloTxt : BOOM.altura.altoTxt), frase: tr(s.frase), t: 0, dur: 2.2 };
      }
      else if (s.t === 'caida') { play('slam'); texto(tr(s.frase), s.m.x, s.m.y - 90, '#ffe9c6', 18, 2); }
      else if (s.t === 'muerte') { boom(s.m.x, s.m.y - 14, 70, color(s.m)); play('despido'); texto(tr('{n} fuera', { n: s.m.nombre }), s.m.x, s.m.y - 80, '#fff', 26, 2); }
      else if (s.t === 'tiempo') { play('womp'); texto(tr('Se acabó el tiempo'), s.m.x, s.m.y - 70, '#ffe9c6', 24, 1.6); }
      else if (s.t === 'evento') { play('summon'); texto(tr(s.ev.def.nombre) + '!', PINTAR.CAM.x + PINTAR.V.w / 2, PINTAR.CAM.y + 140, '#e9a6ff', 34, 2.4); }
      else if (s.t === 'objeto') { play('heal'); texto(tr(BOOM.objetos.lista[s.id].nombre), s.m.x, s.m.y - 80, '#9be58a', 22, 1.4); }
      else if (s.t === 'bungee') { play('blink'); texto(tr('¡Bungee!'), s.m.x, s.m.y - 80, '#9be58a', 26, 1.6); }
      else if (s.t === 'aterriza' && s.caida > 40) play('land');
    }
  }
  function avanza(dt) {
    for (const l of [FX.bolas, FX.textos]) for (let i = l.length - 1; i >= 0; i--) { l[i].t += dt; if (l[i].t >= l[i].dur) l.splice(i, 1); }
    for (let i = FX.chispas.length - 1; i >= 0; i--) {
      const s = FX.chispas[i]; s.t += dt; s.vy += 700 * dt; s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.t >= s.dur) FX.chispas.splice(i, 1);
    }
    FX.temblor = Math.max(0, FX.temblor - dt * 28);
    if (FX.cartel && (FX.cartel.t += dt) >= FX.cartel.dur) FX.cartel = null;
  }
  // se pintan en coordenadas del mundo (cx, cy = esquina de la cámara)
  function pinta(c, cx, cy) {
    for (const b of FX.bolas) {
      const k = b.t / b.dur, r = b.r * (0.5 + 0.7 * Math.sqrt(k));
      c.globalAlpha = 1 - k; c.fillStyle = b.a || '#fff3b0'; c.beginPath(); c.arc(b.x - cx, b.y - cy, r, 0, 6.2832); c.fill();
      c.fillStyle = b.b || '#ff9a2a'; c.beginPath(); c.arc(b.x - cx, b.y - cy, r * 0.72, 0, 6.2832); c.fill();
      c.lineWidth = 4; c.strokeStyle = OL; c.beginPath(); c.arc(b.x - cx, b.y - cy, r, 0, 6.2832); c.stroke();
    }
    for (const s of FX.chispas) { c.globalAlpha = 1 - s.t / s.dur; c.fillStyle = s.c; c.fillRect(s.x - cx - s.s / 2, s.y - cy - s.s / 2, s.s, s.s); }
    c.globalAlpha = 1;
    for (const t of FX.textos) {
      const k = t.t / t.dur; c.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
      PINTAR_TXT(c, t.s, t.x - cx, t.y - cy - k * 40, t.tam, t.c);
    }
    c.globalAlpha = 1;
  }
  return { FX, reinicia, procesa, avanza, pinta, boom, texto };
})();

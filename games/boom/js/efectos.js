// Fans of Boom · EFECTOS: lo que solo es adorno de la partida. Explosiones, chispas, textos que suben, temblor de pantalla, y los sonidos
// que van con los sucesos de PARTIDA. Nada de esto cambia el resultado de la partida (la simulación no lo mira).
'use strict';
const EFECTOS = (() => {
  const FX = { bolas: [], chispas: [], textos: [], temblor: 0, cartel: null };
  const color = m => BOOM.equipos[m.equipo].color;
  const GOLPE_SON = { rayo: 'plasma', trueno: 'zap', gato: 'slam', pie: 'slam', taladro: 'clank' };
  function reinicia() { FX.bolas.length = FX.chispas.length = FX.textos.length = 0; FX.temblor = 0; FX.cartel = null; }
  let palabraT = 0;
  function boom(x, y, r, movil, tono) {   // la explosión con el aspecto de la facción del móvil que la tira (estelas.js)
    const e = ESTELAS.de(movil);
    FX.bolas.push({ x, y, r, t: 0, dur: 0.55, col: tono ? ['#fff3b0', tono] : e.bola });
    for (let i = 0; i < (REDUCED ? 8 : 18 + r / 4); i++) {
      const a = Math.random() * 6.2832, v = 80 + Math.random() * 320;
      FX.chispas.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, t: 0, dur: 0.5 + Math.random() * 0.7, c: tono || e.trozos[i % e.trozos.length], s: 2 + Math.random() * 4, k: tono ? '' : e.k, giro: Math.random() * 6, vg: (Math.random() - 0.5) * 16 });
    }
    if (e.palabra && !tono && r >= 40 && palabraT <= 0) { palabraT = 0.8; texto(tr(e.palabra), x, y - r - 10, e.trozos[0], 24, 1.4); }
    FX.temblor = Math.max(FX.temblor, Math.min(14, 3 + r / 8));
  }
  function texto(s, x, y, c, tam, dur) { FX.textos.push({ s, x, y, c: c || '#fff', tam: tam || 22, t: 0, dur: dur || 1.3 }); }

  // los sucesos de la partida -> efectos y sonidos
  function procesa(sucesos) {
    for (const s of sucesos) {
      if (s.t === 'disparo') { play(ESTELAS.de(s.m.def.id).tiro || 'gun'); play('gun', 0.6); }
      else if (s.t === 'explosion') { boom(s.x, s.y, Math.max(s.c, s.r * 0.8), s.movil); play(GOLPE_SON[s.forma] || 'boom'); }
      else if (s.t === 'satelite') { play(s.gasta != null ? 'plasma' : 'blink'); if (s.gasta == null) texto(tr('Satélite {n}/{m}', { n: s.carga, m: BOOM.satelite.max }), PINTAR.CAM.x + PINTAR.V.w / 2, PINTAR.CAM.y + 110, '#7cf0ff', 22, 1.4); }
      else if (s.t === 'racimo' || s.t === 'parte') play('pop');
      else if (s.t === 'tren') { play('horn'); texto(tr('¡Hype Train!'), s.x, s.y - 50, '#ff4bd8', 26, 1.6); }
      else if (s.t === 'mina') play('clank');
      else if (s.t === 'glitch') { play('blink'); boom(s.x0, s.y0, 16, '', '#7cf0ff'); boom(s.x, s.y, 16, '', '#d84a3a'); texto(tr('¡Glitch!'), s.x, s.y - 30, '#7cf0ff', 22, 1.2); }
      else if (s.t === 'minaRota') { boom(s.x, s.y - 6, 18, '', '#ffcb3d'); play('poof'); }
      else if (s.t === 'minas') { play('go'); texto(tr('¡Acción! Los extras se mueven'), s.m.x, s.m.y - 90, '#ffcb3d', 22, 1.8); }
      else if (s.t === 'fuera') { texto(tr('Fuera'), clamp(s.x, 40, BOOM.mundo.ancho - 40), clamp(s.y, 30, BOOM.mundo.alto - 40), '#cdb9ea', 22); play('womp'); }
      else if (s.t === 'dano') texto('-' + s.n, s.m.x, s.m.y - 60, s.bono ? '#ffcb3d' : '#ff4b5c', s.bono ? 34 : 26, 1.5);
      else if (s.t === 'bono') {
        play('levelup'); FX.cartel = { s: tr(s.bono === 'cielo' ? BOOM.altura.cieloTxt : BOOM.altura.altoTxt), frase: tr(s.frase), t: 0, dur: 2.2 };
      }
      else if (s.t === 'caida') { play('slam'); texto(tr(s.frase), s.m.x, s.m.y - 90, '#ffe9c6', 18, 2); }
      else if (s.t === 'muerte') { boom(s.m.x, s.m.y - 14, 70, '', color(s.m)); play('despido'); texto(tr('{n} fuera', { n: s.m.nombre }), s.m.x, s.m.y - 80, '#fff', 26, 2); }
      else if (s.t === 'tiempo') { play('womp'); texto(tr('Se acabó el tiempo'), s.m.x, s.m.y - 70, '#ffe9c6', 24, 1.6); }
      else if (s.t === 'evento') { play('summon'); texto(tr(s.ev.def.nombre) + '!', PINTAR.CAM.x + PINTAR.V.w / 2, PINTAR.CAM.y + 140, '#e9a6ff', 34, 2.4); }
      else if (s.t === 'objeto') { play('heal'); texto(tr(BOOM.objetos.lista[s.id].nombre), s.m.x, s.m.y - 80, '#9be58a', 22, 1.4); }
      else if (s.t === 'acierto') { play('levelup'); texto(tr('¡Diana!'), s.m.x, s.m.y - 100, '#ffcb3d', 30, 1.6); }
      else if (s.t === 'bungee') { play('blink'); texto(tr('¡Bungee!'), s.m.x, s.m.y - 80, '#9be58a', 26, 1.6); }
      else if (s.t === 'aterriza' && s.caida > 40) play('land');
    }
  }
  function avanza(dt) {
    for (const l of [FX.bolas, FX.textos]) for (let i = l.length - 1; i >= 0; i--) { l[i].t += dt; if (l[i].t >= l[i].dur) l.splice(i, 1); }
    for (let i = FX.chispas.length - 1; i >= 0; i--) {
      const s = FX.chispas[i]; s.t += dt; s.vy += 700 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.giro += s.vg * dt;
      if (s.t >= s.dur) FX.chispas.splice(i, 1);
    }
    FX.temblor = Math.max(0, FX.temblor - dt * 28); palabraT -= dt;
    if (FX.cartel && (FX.cartel.t += dt) >= FX.cartel.dur) FX.cartel = null;
  }
  // se pintan en coordenadas del mundo (cx, cy = esquina de la cámara)
  function pinta(c, cx, cy) {
    for (const b of FX.bolas) {
      const k = b.t / b.dur, r = b.r * (0.5 + 0.7 * Math.sqrt(k));
      c.globalAlpha = 1 - k; c.fillStyle = b.col[0]; c.beginPath(); c.arc(b.x - cx, b.y - cy, r, 0, 6.2832); c.fill();
      c.fillStyle = b.col[1]; c.beginPath(); c.arc(b.x - cx, b.y - cy, r * 0.72, 0, 6.2832); c.fill();
      c.lineWidth = 4; c.strokeStyle = OL; c.beginPath(); c.arc(b.x - cx, b.y - cy, r, 0, 6.2832); c.stroke();
    }
    for (const s of FX.chispas) { c.globalAlpha = 1 - s.t / s.dur; ESTELAS.trozo(c, s.k, s.x - cx, s.y - cy, s.s, s.c, s.giro); }
    c.globalAlpha = 1;
    for (const t of FX.textos) {
      const k = t.t / t.dur; c.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
      PINTAR_TXT(c, t.s, t.x - cx, t.y - cy - k * 40, t.tam, t.c);
    }
    c.globalAlpha = 1;
  }
  return { FX, reinicia, procesa, avanza, pinta, boom, texto };
})();

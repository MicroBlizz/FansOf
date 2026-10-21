// Fans of Rouflage · EL CHAT (3 de 5): LOS BOTS TAMBIÉN HABLAN. Contra bots, los de tu bando mandan de vez en cuando una frase rápida que encaje con lo que
// pasa (chat-partida.js): un becario que se queda con una carta, otro que ve algo raro, un colado al que han visto, la risa cuando un becario falla… Poco
// (una cada 8 s como mucho, y no siempre), para que se note vivo sin molestar. En el PvP con huecos de la máquina, los bots los lleva el anfitrión: él decide
// qué dicen y lo manda como un `ch` con la plaza del bot (b); los demás solo se lo creen si viene del anfitrión y la plaza es de la máquina (chatRecibido).
'use strict';

const CHATB = { t: 0, mira: 0, foto: null, cola: [], cada: 8 };

function chatBotsEmpieza() { CHATB.t = 3; CHATB.mira = 0; CHATB.foto = null; CHATB.cola.length = 0; }
// cómo está todo ahora (para ver qué ha cambiado desde la última mirada)
function chatBotsFoto() {
  const f = { fase: J.fase, fuera: 0, balas: new Map(), estado: new Map(), peligro: J.peligro || 0, aciertos: new Map() };
  for (const k of J.camaleones) { if (k.fuera) f.fuera++; if (k.bot) f.estado.set(k, k.bot.estado); }
  for (const e of J.cazadores) { f.balas.set(e, e.balas); f.aciertos.set(e, e.pts ? e.pts.aciertos : 0); if (e.bot) f.estado.set(e, e.bot.estado); }
  return f;
}
// apunta una frase de un bot (con un pequeño retraso, como si escribiera), si toca y si nadie ha hablado hace poco
function chatBotDi(e, canal, i, prob, retraso = 0.6 + Math.random() * 1.2) {
  if (!e || CHATB.t > 0 || CHATB.cola.length || Math.random() > prob) return;
  CHATB.cola.push({ e, canal, i, en: retraso }); CHATB.t = CHATB.cada + Math.random() * 6;
}
const chatAzar = l => l.length ? l[Math.floor(Math.random() * l.length)] : null;

function chatBotsAvanza(dt) {
  if (!chatOn() || !J.yo || !['prep', 'cuenta', 'caza'].includes(J.fase) || J.pausa) return;
  CHATB.t -= dt;
  for (let k = CHATB.cola.length - 1; k >= 0; k--) {
    const q = CHATB.cola[k]; if ((q.en -= dt) > 0) continue;
    CHATB.cola.splice(k, 1);
    if (q.canal === 'f' ? !q.e.fuera : q.e.fuera) continue;
    if (J.pvp) rfpManda({ t: 'ch', f: q.i, x: Math.round(q.e.x), y: Math.round(q.e.y), b: q.e.slot });
    if (chatMeLlega(q.canal)) chatMuestra(q.e, q.canal, q.i, q.e.x, q.e.y, false);
  }
  if ((CHATB.mira -= dt) > 0) return;
  CHATB.mira = 0.25;
  const antes = CHATB.foto, ahora = CHATB.foto = chatBotsFoto(); if (!antes) return;
  const mio = chatCanalDe(J.yo);
  if (J.pvp) {      // el anfitrión, por los dos bandos (si en ese bando hay alguna persona que lo lea)
    const hay = c => RFP.slots.some(sl => sl.humano && sl.ente && !RFP.ido[sl.s] && chatCanalDe(sl.ente) === c);
    if (hay('b')) chatBotsBecarios(antes, ahora);
    if (hay('c') || hay('f')) chatBotsColados(antes, ahora);
    return;
  }
  if (mio === 'b') chatBotsBecarios(antes, ahora); else if (mio === 'c') chatBotsColados(antes, ahora); else chatBotsFantasmas(antes, ahora);
}

// los becarios de la máquina, cuando tú eres becario
function chatBotsBecarios(a, b) {
  const mios = J.cazadores.filter(e => e.bot && !e.fuera && e !== J.yo && !e.humano && !e.remoto); if (!mios.length) return;
  if (a.fase !== 'caza' && b.fase === 'caza') return chatBotDi(chatAzar(mios), 'b', 5, 0.45, 2 + Math.random() * 2);      // Vamos juntos
  if (b.fase !== 'caza') return;
  for (const e of mios) {
    const ba = a.balas.get(e), bb = e.balas, acierto = (e.pts ? e.pts.aciertos : 0) > (a.aciertos.get(e) || 0);
    if (bb === 1 && ba > 1) return chatBotDi(e, 'b', 3, 0.75);      // Me quedo sin cartas
    if (bb < ba && !acierto) return chatBotDi(e, 'b', 7, 0.35);      // Ups, era una planta
    const ea = a.estado.get(e), eb = e.bot.estado;
    if (eb === 'apunta' && ea !== 'apunta') return chatBotDi(e, 'b', 0, 0.3, 0.2);      // ¡Aquí hay uno! (deja la marca donde está)
    if (eb === 'investiga' && ea !== 'investiga' && ea !== 'apunta') return chatBotDi(e, 'b', 4, 0.22);      // ¡Ha silbado!
  }
  if (b.fuera > a.fuera) return chatBotDi(chatAzar(mios), 'b', 6, 0.5);      // ¡Bien hecho!
  if (Math.random() < 0.004) chatBotDi(chatAzar(mios), 'b', 2, 0.5);      // de vez en cuando: Esta sala, limpia
}
// los colados de la máquina, cuando tú eres colado (y sigues vivo)
function chatBotsColados(a, b) {
  const mios = J.camaleones.filter(k => k.bot && !k.fuera && k !== J.yo && !k.humano && !k.remoto); if (!mios.length) return;
  if (a.fase !== 'caza' && b.fase === 'caza') return chatBotDi(chatAzar(mios), 'c', 3, 0.35, 3 + Math.random() * 3);      // Aquí estoy bien
  if (b.fase !== 'caza') return;
  for (const k of mios) {
    if (k.bot.estado === 'huir' && a.estado.get(k) !== 'huir') return chatBotDi(k, 'c', Math.random() < 0.6 ? 4 : 5, 0.55, 0.3);      // Me han visto / Voy a moverme
  }
  if (b.fuera > a.fuera) return chatBotDi(chatAzar(mios), 'c', 0, 0.45);      // ¡Cuidado, viene uno!
  if (!J.pvp && b.peligro > 0.75 && a.peligro <= 0.75) return chatBotDi(chatAzar(mios), 'c', 2, 0.3, 0.3);      // ¡Corre! (te están viendo a ti)
  for (const e of J.cazadores) {
    if (e.balas < (a.balas.get(e) || 0) && (e.pts ? e.pts.aciertos : 0) === (a.aciertos.get(e) || 0)) return chatBotDi(chatAzar(mios), 'c', 7, 0.35);      // un becario falla: Jajaja
  }
}
// despedido: los colados de la máquina que también han caído se quejan contigo
function chatBotsFantasmas(a, b) {
  if (b.fuera <= a.fuera) return;
  const caido = J.camaleones.filter(k => k.bot && k.fuera && k !== J.yo).sort((x, y) => (y.tDespido || 0) - (x.tDespido || 0))[0];
  chatBotDi(caido, 'f', chatAzar([0, 2, 7, 3]), 0.6, 1.2);
}
// cuando tú hablas, a veces un bot te contesta (solo a algunas frases, y no siempre)
function chatBotsOyen(canal, i) {
  if (J.pvp) return;
  const mios = canal === 'b' ? J.cazadores.filter(e => e.bot && !e.fuera) : canal === 'c' ? J.camaleones.filter(k => k.bot && !k.fuera) : [];
  const resp = { b: { 5: 5, 7: 6 }, c: { 1: 3, 7: 7, 0: 5 } }[canal];      // Vamos juntos → Vamos juntos · Ups, era una planta → ¡Bien hecho! (con retintín) · Escóndete → Aquí estoy bien…
  if (resp && resp[i] != null) { CHATB.t = 0; CHATB.cola.length = 0; chatBotDi(chatAzar(mios), canal, resp[i], 0.4, 1.4 + Math.random()); }
}

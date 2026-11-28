// Fans of Pop · RAID, las voces (aplicación, tarea 448, nodo n4): CUÁNDO habla el chat falso y cuándo el jefe CEO, para que acompañen sin agobiar.
// · El chat comenta lo que pasa (con su probabilidad) y, si no pasa nada, suelta algo cada 5 a 10 s; nunca dos líneas en menos de `pausaChat` s.
// · El CEO dice algo de su humor cada 9 a 14 s y reacciona a los sucesos; entre dos frases suyas pasan al menos `pausaCeo` s, salvo las forzadas
//   (cambia de humor, le tocas).
// Sin reloj: avanza(dt) cuenta el tiempo. Puertos: azar(), tr(texto), di(frase) y escribe({ nombre, color, texto, iconos }) (los del HUD).
// Depende de PP_RAID_CHAT y PP_RAID_CEO.
'use strict';
const PP_RAID_VOCES = (() => {
  function crea({ azar, tr, di, escribe }, { pausaChat = 1.4, pausaCeo = 4.5 } = {}) {
    const e = { chatT: 1.5, chatFrio: 0, recientes: [], ceoT: 3, ceoFrio: 0, ultima: null };

    // una línea del chat de un tipo, con probabilidad `prob`; devuelve si salió
    function chat(tipo, prob = 1) {
      if (e.chatFrio > 0 || azar() > prob) return false;
      const m = PP_RAID_CHAT.elige(tipo, azar, e.recientes);
      if (!m) return false;
      e.recientes = PP_RAID_CHAT.recuerda(e.recientes, m.texto);
      e.chatFrio = pausaChat;
      e.chatT = PP_RAID_CHAT.esperaOcio(azar);
      escribe({ nombre: m.nombre, color: m.color, texto: tr(m.texto), iconos: PP_RAID_CHAT.adornos(azar) });
      return true;
    }
    // el CEO dice algo de un momento (un humor o un suceso); `forzar` se salta la pausa y la probabilidad
    function ceo(momento, forzar = false, prob = 1) {
      if (!forzar && (e.ceoFrio > 0 || azar() > prob)) return false;
      const f = PP_RAID_CEO.frase(momento, azar, e.ultima);
      if (!f) return false;
      e.ultima = f;
      e.ceoFrio = pausaCeo;
      e.ceoT = 9 + azar() * 5;
      di(tr(f));
      return true;
    }
    // pasa el tiempo: si toca, el chat suelta algo y el CEO dice una de su humor
    function avanza(dt, humor) {
      e.chatFrio = Math.max(0, e.chatFrio - dt);
      e.ceoFrio = Math.max(0, e.ceoFrio - dt);
      e.chatT -= dt;
      e.ceoT -= dt;
      if (e.chatT <= 0) chat(azar() < 0.25 ? 'ceo' : 'ocio');
      if (e.ceoT <= 0) ceo(humor);
    }
    return Object.freeze({ chat, ceo, avanza });
  }
  return Object.freeze({ crea });
})();
if (typeof module !== 'undefined') module.exports = PP_RAID_VOCES;

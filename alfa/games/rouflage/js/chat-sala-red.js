// Fans of Rouflage · EL CHAT (4 de 5): LA RED DEL CHAT DE LA SALA DE ESPERA. Con servidor: rouflage_pvp_chat_mandar, rouflage_pvp_chat_leer y
// rouflage_pvp_chat_reportar (servidor/66-rouflage-chat.sql y 76-rouflage-chat-sin-texto.sql: solo habla quien está en la sala, con pausa y tope, y SOLO
// con frases rápidas: el texto escrito se quitó). En ?pvp=local (pestañas del mismo navegador) va por un BroadcastChannel, sin servidor, con los mismos
// límites copiados aquí, para poder probarlo. Cada red: mandar(null, frase) → { id, frase } · leer(desde) → { sala, mensajes } · reportar(id, texto).
'use strict';

const CHATRED = (() => {
  // ---------- con servidor ----------
  const servidor = {
    mandar: (_texto, frase) => RFRED.rpc('rouflage_pvp_chat_mandar', { p_frase: frase }),
    leer: desde => RFRED.rpc('rouflage_pvp_chat_leer', { p_desde: desde || 0 }),
    reportar: (id, texto) => RFRED.rpc('rouflage_pvp_chat_reportar', { p_id: id, p_texto: texto || null }),
    cerrar() { /* nada que cerrar */ },
  };
  // ---------- pruebas entre pestañas: cada una guarda lo que oye; los límites, como el servidor ----------
  const L = { bc: null, clave: '', lista: [], mios: [] };
  const yoDe = () => { const i = RFP.info, j = i && (i.jugadores || []).find(x => x.yo); return j || { orden: 0, nombre: 'Pestaña' }; };
  const abre = () => {
    const i = RFP.info, clave = i ? (i.codigo || 'publica') : '';
    if (L.clave === clave && L.bc) return;
    if (L.bc) try { L.bc.close(); } catch (_) { /* ya cerrado */ }
    L.clave = clave; L.lista = []; L.bc = new BroadcastChannel('rf-pvp-chat-' + clave);
    L.bc.onmessage = e => { const m = e.data; if (m && m.id && !L.lista.some(x => x.id === m.id)) L.lista.push(Object.assign({}, m, { yo: false })); };
  };
  const local = {
    mandar(_texto, frase) {
      abre();
      const ahora = Date.now(); L.mios = L.mios.filter(t => ahora - t < 60000);
      if (L.mios.length && ahora - L.mios[L.mios.length - 1] < 1500) return Promise.reject(new Error('chat_espera'));
      if (L.mios.length >= 20) return Promise.reject(new Error('chat_tope'));
      if (!((frase >= 0 && frase <= 15) || (frase >= 100 && typeof PEG_CHAT !== 'undefined' && PEG_CHAT[frase]))) return Promise.reject(new Error('chat_no_valido'));
      L.mios.push(ahora);
      const yo = yoDe(), m = { id: ahora * 100 + Math.floor(Math.random() * 100), orden: yo.orden, nombre: yo.nombre, q: yo.nombre, frase };
      L.lista.push(Object.assign({ yo: true }, m)); L.bc.postMessage(m);
      return Promise.resolve({ id: m.id, frase: m.frase });
    },
    leer(desde) { abre(); return Promise.resolve({ sala: L.clave, mensajes: L.lista.filter(m => m.id > (desde || 0)).slice(-40) }); },
    reportar(id, texto) {
      const m = L.lista.find(x => x.id === id); if (!m || m.yo) return Promise.reject(new Error('mensaje_no_valido'));
      try { const r = JSON.parse(localStorage.getItem('rf-pruebas-chat-reportes') || '[]'); r.push({ id, texto: texto || null, mensaje: m, cuando: new Date().toISOString() }); localStorage.setItem('rf-pruebas-chat-reportes', JSON.stringify(r.slice(-50))); } catch (_) { /* sin guardar */ }
      return Promise.resolve({ ok: true });
    },
    cerrar() { if (L.bc) try { L.bc.close(); } catch (_) { /* ya cerrado */ } L.bc = null; L.clave = ''; L.lista = []; },
  };
  return { get red() { return RFRED.esLocal() ? local : servidor; } };
})();

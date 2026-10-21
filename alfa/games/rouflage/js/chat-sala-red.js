// Fans of Rouflage · EL CHAT (4 de 5): LA RED DEL CHAT DE LA SALA DE ESPERA. Con servidor: rouflage_pvp_chat_mandar, rouflage_pvp_chat_leer y
// rouflage_pvp_chat_reportar (servidor/66-rouflage-chat.sql: solo escribe quien está en la sala, con pausa y tope, y el filtro tapa con ★ palabrotas y datos
// de contacto). En ?pvp=local (pestañas del mismo navegador) va por un BroadcastChannel, sin servidor, con el mismo filtro y los mismos límites copiados
// aquí (chatLimpio), para poder probarlo. Cada red: mandar(texto, frase) → { id, texto, frase } · leer(desde) → { sala, mensajes } · reportar(id, texto).
'use strict';

// ---------- el filtro, copiado de _rf_chat_limpio (66-rouflage-chat.sql) para las pruebas sin servidor ----------
const CHAT_FEAS = ['puta', 'puto', 'mierda', 'joder', 'jodete', 'polla', 'verga', 'cabron', 'gilipoll', 'pendej', 'maricon', 'marica', 'zorra', 'follar', 'cojon',
  'nazi', 'hitler', 'negrata', 'sudaca', 'retrasad', 'subnormal', 'violar', 'violador', 'pedofil', 'fuck', 'shit', 'bitch', 'cunt', 'whore', 'slut', 'rape', 'porn', 'nigg', 'fagg',
  'http', 'www', 'gmail', 'hotmail', 'whatsapp', 'telegram', 'discord',
  'hijoput', 'imbecil', 'idiota', 'capullo', 'mamon', 'culo', 'tetas', 'pene', 'vagina', 'sexo', 'sexy', 'xxx', 'matate', 'suicid', 'asshole', 'bastard', 'dick', 'pussy', 'kys',
  'wasap', 'guasap', 'watsap', 'instagram', 'snapchat', 'tiktok', 'outlook', 'yahoo', 'skype', 'onlyfans', 'facebook'];
const CHAT_BUENAS = ['computa', 'computo', 'disputa', 'disputo', 'reputa', 'imputa', 'imputo', 'diputa', 'amputa', 'deputa', 'trape', 'grape', 'drape', 'scrape', 'rapea', 'raper',
  'calcul', 'vehicul', 'articul', 'ridicul', 'circul', 'curricul', 'muscul', 'matricul', 'pelicul', 'particul', 'cubicul', 'vincul', 'espectacul', 'obstacul', 'tentacul',
  'minuscul', 'mayuscul', 'crepuscul', 'oracul', 'fascicul', 'shitake', 'scunthorpe', 'night', 'knight'];
const CHAT_REDES = ['insta', 'ig', 'tg', 'wsp', 'wpp', 'wasa', 'snap', 'tlf', 'telf', 'telefono', 'teléfono'];
function chatMala(p) {
  const de = 'áéíóúüñàèìòù0134578@$', a = 'aeiouunaeiouoieastbas';
  let n = [...String(p || '').toLowerCase()].map(ch => { const i = de.indexOf(ch); return i < 0 ? ch : a[i]; }).join('').replace(/[^a-z]/g, '');
  if (!n) return false;
  for (const s of CHAT_BUENAS) n = n.split(s).join('');
  const nc = n.replace(/(.)\1+/g, '$1');
  return CHAT_FEAS.some(w => (/(.)\1/.test(w) ? n : nc).includes(w));
}
function chatLimpio(p) {
  let t = String(p || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
  if (!t) return '';
  t = t.replace(/\+?\d([\s.()-]*\d){6,}/g, '★★★');
  const ws = t.split(' '), marca = ws.map(w => (/@/.test(w) && w.length > 2) || /(https?:|www\.|[a-z0-9-]\.(com|es|net|org|gg|io|me|ly|tv|xyz|app|link|co|info|eu|cat)([^a-z]|$))/i.test(w)
    || w.replace(/\D/g, '').length >= 6 || CHAT_REDES.includes(w.toLowerCase().replace(/[^a-záéíóúüñ]/g, '')) || chatMala(w));
  const corto = w => { const l = w.replace(/[^\p{L}\p{N}]/gu, '').length; return l >= 1 && l <= 2; };
  for (let i = 0; i < ws.length;) {
    if (!corto(ws[i])) { i++; continue; }
    let j = i, run = ''; while (j < ws.length && corto(ws[j])) run += ws[j++];
    if (j - i >= 2 && chatMala(run)) for (let k = i; k < j; k++) marca[k] = true;
    i = j;
  }
  return ws.map((w, i) => (marca[i] ? '★'.repeat(Math.max(3, Math.min([...w].length, 6))) : w)).join(' ');
}

const CHATRED = (() => {
  // ---------- con servidor ----------
  const servidor = {
    mandar: (texto, frase) => RFRED.rpc('rouflage_pvp_chat_mandar', frase != null ? { p_frase: frase } : { p_texto: texto }),
    leer: desde => RFRED.rpc('rouflage_pvp_chat_leer', { p_desde: desde || 0 }),
    reportar: (id, texto) => RFRED.rpc('rouflage_pvp_chat_reportar', { p_id: id, p_texto: texto || null }),
    cerrar() { /* nada que cerrar */ },
  };
  // ---------- pruebas entre pestañas: cada una guarda lo que oye; los límites y el filtro, como el servidor ----------
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
    mandar(texto, frase) {
      abre();
      const ahora = Date.now(); L.mios = L.mios.filter(t => ahora - t < 60000);
      if (L.mios.length && ahora - L.mios[L.mios.length - 1] < 1500) return Promise.reject(new Error('chat_espera'));
      if (L.mios.length >= 20) return Promise.reject(new Error('chat_tope'));
      if (frase == null && !String(texto || '').trim()) return Promise.reject(new Error('chat_no_valido'));
      L.mios.push(ahora);
      const yo = yoDe(), m = { id: ahora * 100 + Math.floor(Math.random() * 100), orden: yo.orden, nombre: yo.nombre, q: yo.nombre, texto: frase != null ? null : chatLimpio(texto), frase: frase != null ? frase : null };
      L.lista.push(Object.assign({ yo: true }, m)); L.bc.postMessage(m);
      return Promise.resolve({ id: m.id, texto: m.texto, frase: m.frase });
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

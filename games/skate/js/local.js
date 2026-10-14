// Fans of Skate · la partida guardada: cartera (oro y talentos), campaña y sonido en un solo objeto, que core sube a la nube (cuenta.js).
// Las versiones anteriores guardaban cartera y campaña en dos claves sueltas: se recogen la primera vez.
'use strict';
const SK_SAVE = (() => {
  const leer = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const s = leer(SAVE_KEY); if (s && s.cartera) return s;
  return { cartera: leer('sk-cartera-v1') || { oro: 0, compras: [] }, campana: leer('sk-campana-v1') || { hechos: {}, dif: 'n' }, muted: false, vol: 1, mus: 1 };
})();
function skGuarda() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SK_SAVE)); } catch (e) { /* sin almacenamiento: se juega igual */ } CUENTA.cambio(); }
function skCartera() { return SK_SAVE.cartera; }
function skGuardaCartera(w) { SK_SAVE.cartera = w; skGuarda(); }
function skCampLeer() { return SK_SAVE.campana; }
function skCampGuarda(c) { SK_SAVE.campana = c; skGuarda(); }
